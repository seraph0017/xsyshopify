#!/usr/bin/env bash

set -euo pipefail

DEPLOY_ROOT="${DEPLOY_ROOT:-/opt/tideform}"
ENV_FILE="${ENV_FILE:-$DEPLOY_ROOT/config/tideform.env}"
REGISTRY_AUTH_FILE="${REGISTRY_AUTH_FILE:-$DEPLOY_ROOT/config/registry-auth.json}"
NGINX_CONF="${NGINX_CONF:-/etc/nginx/conf.d/tideform.conf}"
BACKUP_DIR="${BACKUP_DIR:-$DEPLOY_ROOT/backup}"
DEPLOY_LOG="${DEPLOY_LOG:-$DEPLOY_ROOT/deploy-log.tsv}"
MEMORY_LIMIT="${MEMORY_LIMIT:-1g}"
CPU_LIMIT="${CPU_LIMIT:-1.0}"
HEALTH_TIMEOUT_SECONDS="${HEALTH_TIMEOUT_SECONDS:-60}"
DRAIN_SECONDS="${DRAIN_SECONDS:-10}"
DEPLOY_LOCK_FILE="${DEPLOY_LOCK_FILE:-/run/lock/tideform-deploy.lock}"

log() {
  printf '[%s] %s\n' "$(date '+%Y-%m-%d %H:%M:%S')" "$*"
}

die() {
  printf '[error] %s\n' "$*" >&2
  exit 1
}

require_root() {
  [[ "$(id -u)" -eq 0 ]] || die "run this script as root or with sudo"
}

require_command() {
  command -v "$1" >/dev/null 2>&1 || die "required command not found: $1"
}

validate_deployment_timings() {
  [[ "$HEALTH_TIMEOUT_SECONDS" =~ ^[0-9]+$ ]] \
    && ((HEALTH_TIMEOUT_SECONDS >= 1 && HEALTH_TIMEOUT_SECONDS <= 600)) \
    || die "HEALTH_TIMEOUT_SECONDS must be an integer from 1 to 600"
  [[ "$DRAIN_SECONDS" =~ ^[0-9]+$ ]] \
    && ((DRAIN_SECONDS <= 300)) \
    || die "DRAIN_SECONDS must be an integer from 0 to 300"
}

acquire_deploy_lock() {
  require_command flock
  mkdir -p "$(dirname "$DEPLOY_LOCK_FILE")"
  exec 9>"$DEPLOY_LOCK_FILE"
  flock -n 9 || die "another TIDEFORM setup, deployment, or rollback is running"
}

other_color() {
  case "${1:-}" in
    blue) printf 'green\n' ;;
    green) printf 'blue\n' ;;
    *) printf 'deployment color must be blue or green\n' >&2; return 1 ;;
  esac
}

port_for_color() {
  case "${1:-}" in
    blue) printf '3101\n' ;;
    green) printf '3102\n' ;;
    *) printf 'deployment color must be blue or green\n' >&2; return 1 ;;
  esac
}

validate_image_ref() {
  local image="${1:-}"
  local final_component tag

  [[ -n "$image" ]] || { printf 'IMAGE is required\n' >&2; return 1; }
  if [[ "$image" =~ @sha256:[a-f0-9]{64}$ ]]; then
    return 0
  fi

  final_component="${image##*/}"
  [[ "$final_component" == *:* ]] || {
    printf 'IMAGE must use an explicit tag or sha256 digest\n' >&2
    return 1
  }
  tag="${final_component##*:}"
  [[ "$tag" != "latest" ]] || {
    printf 'IMAGE tag latest is not allowed\n' >&2
    return 1
  }
  [[ "$tag" =~ ^[A-Za-z0-9_][A-Za-z0-9_.-]{0,127}$ ]] || {
    printf 'IMAGE tag is invalid\n' >&2
    return 1
  }
}

require_digest_for_production() {
  local image="$1" mode
  mode="$(site_mode_from_env)"
  if [[ "$mode" == "production" && ! "$image" =~ @sha256:[a-f0-9]{64}$ ]]; then
    die "production deployments require IMAGE pinned by @sha256 digest"
  fi
}

require_verified_signature_for_production() {
  local image="$1" mode verified_digest image_digest
  mode="$(site_mode_from_env)"
  [[ "$mode" == "production" ]] || return 0

  verified_digest="$(read_env_value SIGNATURE_VERIFIED_DIGEST "$ENV_FILE")"
  image_digest="${image##*@}"
  [[ "$verified_digest" =~ ^sha256:[a-f0-9]{64}$ ]] \
    || die "production requires SIGNATURE_VERIFIED_DIGEST from cosign verify"
  [[ "$verified_digest" == "$image_digest" ]] \
    || die "verified signature digest does not match the production IMAGE digest"
}

active_color_from_nginx() {
  local file="${1:-$NGINX_CONF}"
  local value count

  [[ -f "$file" ]] || { printf 'Nginx config not found: %s\n' "$file" >&2; return 1; }
  value="$(sed -n -E 's/^# active-color: (blue|green)$/\1/p' "$file")"
  count="$(printf '%s\n' "$value" | sed '/^$/d' | wc -l | tr -d ' ')"
  [[ "$count" == "1" && ( "$value" == "blue" || "$value" == "green" ) ]] || {
    printf 'Nginx config must contain exactly one valid active-color marker\n' >&2
    return 1
  }
  printf '%s\n' "$value"
}

read_env_value() {
  local key="$1" file="${2:-$ENV_FILE}"
  sed -n -E "s/^${key}=(.*)$/\\1/p" "$file" | tail -n 1
}

require_env_file() {
  local mode
  [[ -f "$ENV_FILE" ]] || die "environment file not found: $ENV_FILE"
  mode="$(stat -c '%a' "$ENV_FILE" 2>/dev/null || stat -f '%Lp' "$ENV_FILE")"
  [[ "$mode" == "600" ]] || die "$ENV_FILE permissions must be 600, found $mode"
}

pull_image() {
  local image="$1" mode

  if [[ -f "$REGISTRY_AUTH_FILE" ]]; then
    mode="$(stat -c '%a' "$REGISTRY_AUTH_FILE" 2>/dev/null || stat -f '%Lp' "$REGISTRY_AUTH_FILE")"
    [[ "$mode" == "600" ]] || die "$REGISTRY_AUTH_FILE permissions must be 600, found $mode"
    podman pull --authfile "$REGISTRY_AUTH_FILE" "$image"
  else
    podman pull "$image"
  fi
}

image_label() {
  local image="$1" key="$2" value
  value="$(podman image inspect --format "{{ index .Labels \"$key\" }}" "$image")"
  [[ "$value" == "<no value>" ]] && value=""
  printf '%s\n' "$value"
}

validate_image_publication_contract() {
  local image="$1" env_key label_key default expected actual

  while IFS='|' read -r env_key label_key default; do
    expected="$(read_env_value "$env_key" "$ENV_FILE")"
    [[ -n "$expected" ]] || expected="$default"
    actual="$(image_label "$image" "$label_key")"
    [[ "$actual" == "$expected" ]] || die \
      "publication setting mismatch for $env_key: image='$actual' runtime='$expected'"
  done <<'EOF'
SITE_MODE|io.tideform.site-mode|prototype
SITE_URL|io.tideform.site-url|
APPROVED_PRODUCTION_DOMAIN|io.tideform.approved-production-domain|
SITE_EVIDENCE_GATE|io.tideform.site-evidence-gate|
NEXT_PUBLIC_SITE_URL|io.tideform.next-public-site-url|
EOF
}

container_name_for_color() {
  printf 'tideform-%s\n' "$1"
}

container_exists() {
  podman ps -a --format '{{.Names}}' | grep -Fxq "$1"
}

container_is_running() {
  podman ps --format '{{.Names}}' | grep -Fxq "$1"
}

container_label() {
  local name="$1" key="$2" value
  value="$(podman inspect --format "{{ index .Config.Labels \"$key\" }}" "$name")"
  [[ "$value" == "<no value>" ]] && value=""
  printf '%s\n' "$value"
}

site_mode_from_container() {
  local mode
  mode="$(container_label "$1" io.tideform.site-mode)"
  [[ "$mode" == "prototype" || "$mode" == "production" ]] \
    || die "container $1 has no valid io.tideform.site-mode label"
  printf '%s\n' "$mode"
}

site_url_from_container() {
  container_label "$1" io.tideform.site-url
}

remove_container_if_present() {
  local name="$1"
  if podman ps -a --format '{{.Names}}' | grep -Fxq "$name"; then
    podman rm -f "$name" >/dev/null
  fi
}

stop_container_if_running() {
  local name="$1" timeout="${2:-30}"
  if container_is_running "$name"; then
    podman stop --time "$timeout" "$name" >/dev/null \
      || log "warning: traffic is switched, but $name could not be stopped"
  else
    log "old container $name is already stopped; no cleanup needed"
  fi
}

set_container_restart_policy() {
  local name="$1" policy="$2"
  [[ "$policy" == "always" || "$policy" == "no" ]] \
    || die "restart policy must be always or no"
  podman update --restart="$policy" "$name" >/dev/null
}

start_container() {
  local color="$1" image="$2"
  local name port
  name="$(container_name_for_color "$color")"
  port="$(port_for_color "$color")"

  remove_container_if_present "$name"
  log "starting $name on 127.0.0.1:$port from $image"
  podman run -d --name "$name" \
    --restart=always \
    -p "127.0.0.1:$port:3000" \
    --env-file "$ENV_FILE" \
    --read-only \
    --tmpfs /tmp:rw,noexec,nosuid,size=64m \
    --tmpfs /app/.next/cache:rw,noexec,nosuid,size=128m \
    --security-opt=no-new-privileges \
    --cap-drop=ALL \
    --pids-limit=256 \
    --memory="$MEMORY_LIMIT" \
    --memory-swap="$MEMORY_LIMIT" \
    --cpus="$CPU_LIMIT" \
    --log-driver=k8s-file \
    --log-opt max-size=20m \
    "$image" >/dev/null
}

wait_for_health() {
  local color="$1"
  local port name attempt
  port="$(port_for_color "$color")"
  name="$(container_name_for_color "$color")"

  log "waiting up to ${HEALTH_TIMEOUT_SECONDS}s for $name"
  for ((attempt = 1; attempt <= HEALTH_TIMEOUT_SECONDS; attempt++)); do
    if curl --fail --silent --show-error --max-time 3 "http://127.0.0.1:$port/api/health" \
      | grep -Eq '"status"[[:space:]]*:[[:space:]]*"ok"'; then
      log "$name is healthy"
      return 0
    fi
    sleep 1
  done

  podman logs --tail 100 "$name" >&2 || true
  return 1
}

site_mode_from_env() {
  local mode
  mode="$(read_env_value SITE_MODE "$ENV_FILE")"
  printf '%s\n' "${mode:-prototype}"
}

record_deployment() {
  local action="$1" image="$2" from_color="$3" to_color="$4" image_id="$5"
  mkdir -p "$(dirname "$DEPLOY_LOG")"
  printf '%s\t%s\t%s\t%s\t%s\t%s\n' \
    "$(date -u '+%Y-%m-%dT%H:%M:%SZ')" "$action" "$image" "$image_id" "$from_color" "$to_color" \
    >> "$DEPLOY_LOG"
}
