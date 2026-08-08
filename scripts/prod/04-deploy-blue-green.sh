#!/usr/bin/env bash

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
# shellcheck source=./lib.sh
source "$SCRIPT_DIR/lib.sh"

IMAGE="${1:-${IMAGE:-}}"
validate_image_ref "$IMAGE" || exit 2
require_root
for command_name in podman curl nginx systemctl sed; do
  require_command "$command_name"
done
require_env_file
require_digest_for_production "$IMAGE"
require_verified_signature_for_production "$IMAGE"
validate_deployment_timings
acquire_deploy_lock

active="$(active_color_from_nginx "$NGINX_CONF")"
candidate="$(other_color "$active")"
active_port="$(port_for_color "$active")"
candidate_port="$(port_for_color "$candidate")"
active_name="$(container_name_for_color "$active")"
candidate_name="$(container_name_for_color "$candidate")"
mode="$(site_mode_from_env)"
expected_origin="$(read_env_value SITE_URL "$ENV_FILE")"

podman ps --format '{{.Names}}' | grep -Fxq "$active_name" \
  || die "active container is not running: $active_name"

log "pulling candidate image $IMAGE"
pull_image "$IMAGE"
image_id="$(podman image inspect --format '{{.Id}}' "$IMAGE")"
validate_image_publication_contract "$image_id"
start_container "$candidate" "$image_id"

if ! wait_for_health "$candidate"; then
  podman rm -f "$candidate_name" >/dev/null 2>&1 || true
  die "$candidate_name did not pass health checks; active traffic remains on $active"
fi
candidate_smoke_args=(--base-url "http://127.0.0.1:$candidate_port" --mode "$mode")
[[ "$mode" == "production" ]] && candidate_smoke_args+=(--expected-origin "$expected_origin")
if ! "$SCRIPT_DIR/05-smoke-test.sh" "${candidate_smoke_args[@]}"; then
  podman rm -f "$candidate_name" >/dev/null 2>&1 || true
  die "$candidate_name failed smoke tests; active traffic remains on $active"
fi

mkdir -p "$BACKUP_DIR"
backup="$BACKUP_DIR/tideform.conf.$(date -u '+%Y%m%dT%H%M%SZ').$active"
cp "$NGINX_CONF" "$backup"

restore_nginx() {
  cp "$backup" "$NGINX_CONF"
  nginx -t >/dev/null 2>&1 && systemctl reload nginx >/dev/null 2>&1 || true
}

sed -i -E \
  -e "s/^# active-color: $active$/# active-color: $candidate/" \
  -e "s|(server[[:space:]]+127\\.0\\.0\\.1:)$active_port([[:space:]])|\\1$candidate_port\\2|" \
  "$NGINX_CONF"

if [[ "$(active_color_from_nginx "$NGINX_CONF")" != "$candidate" ]] \
  || ! grep -Eq "server[[:space:]]+127\\.0\\.0\\.1:$candidate_port[[:space:]]" "$NGINX_CONF" \
  || ! nginx -t; then
  restore_nginx
  podman rm -f "$candidate_name" >/dev/null 2>&1 || true
  die "Nginx candidate config failed validation; restored $backup"
fi

if ! systemctl reload nginx; then
  restore_nginx
  podman rm -f "$candidate_name" >/dev/null 2>&1 || true
  die "Nginx reload failed; restored $backup"
fi

public_base_url="$(read_env_value PUBLIC_BASE_URL "$ENV_FILE")"
if [[ -n "$public_base_url" ]]; then
  public_smoke_args=(--base-url "$public_base_url" --mode "$mode")
  [[ "$mode" == "production" ]] && public_smoke_args+=(--expected-origin "$expected_origin")
  if ! "$SCRIPT_DIR/05-smoke-test.sh" "${public_smoke_args[@]}"; then
    restore_nginx
    podman rm -f "$candidate_name" >/dev/null 2>&1 || true
    die "public smoke test failed; traffic restored to $active"
  fi
fi

set_container_restart_policy "$active_name" no \
  || die "traffic switched, but failed to disable reboot restart for $active_name"
log "traffic switched to $candidate; draining $active for ${DRAIN_SECONDS}s"
record_deployment blue-green "$IMAGE" "$active" "$candidate" "$image_id"
sleep "$DRAIN_SECONDS"
stop_container_if_running "$active_name" 30

log "deployment complete: $candidate_name is active on 127.0.0.1:$candidate_port"
log "rollback: $SCRIPT_DIR/06-rollback.sh"
log "after the observation window, remove the stopped container: podman rm $active_name"
