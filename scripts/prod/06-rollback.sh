#!/usr/bin/env bash

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
# shellcheck source=./lib.sh
source "$SCRIPT_DIR/lib.sh"

require_root
for command_name in podman curl nginx systemctl sed; do
  require_command "$command_name"
done
require_env_file
validate_deployment_timings
acquire_deploy_lock

active="$(active_color_from_nginx "$NGINX_CONF")"
previous="$(other_color "$active")"
active_port="$(port_for_color "$active")"
previous_port="$(port_for_color "$previous")"
active_name="$(container_name_for_color "$active")"
previous_name="$(container_name_for_color "$previous")"

stop_rollback_candidate() {
  set_container_restart_policy "$previous_name" no >/dev/null 2>&1 || true
  podman stop --time 10 "$previous_name" >/dev/null 2>&1 || true
}

podman ps -a --format '{{.Names}}' | grep -Fxq "$previous_name" \
  || die "rollback container not found: $previous_name"
mode="$(site_mode_from_container "$previous_name")"
expected_origin="$(site_url_from_container "$previous_name")"
set_container_restart_policy "$previous_name" no \
  || die "rollback container restart policy could not be prepared; traffic remains on $active"
podman start "$previous_name" >/dev/null
rollback_smoke_args=(--base-url "http://127.0.0.1:$previous_port" --mode "$mode")
[[ "$mode" == "production" ]] && rollback_smoke_args+=(--expected-origin "$expected_origin")
if ! wait_for_health "$previous" \
  || ! "$SCRIPT_DIR/05-smoke-test.sh" "${rollback_smoke_args[@]}"; then
  stop_rollback_candidate
  die "rollback container failed validation; traffic remains on $active"
fi
if ! set_container_restart_policy "$previous_name" always; then
  stop_rollback_candidate
  die "rollback container restart policy could not be activated; traffic remains on $active"
fi

if ! mkdir -p "$BACKUP_DIR"; then
  stop_rollback_candidate
  die "rollback backup directory could not be created; traffic remains on $active"
fi
backup="$BACKUP_DIR/tideform.conf.rollback.$(date -u '+%Y%m%dT%H%M%SZ').$active"
if ! cp "$NGINX_CONF" "$backup"; then
  stop_rollback_candidate
  die "rollback Nginx config could not be backed up; traffic remains on $active"
fi
if ! sed -i -E \
  -e "s/^# active-color: $active$/# active-color: $previous/" \
  -e "s|(server[[:space:]]+127\\.0\\.0\\.1:)$active_port([[:space:]])|\\1$previous_port\\2|" \
  "$NGINX_CONF"; then
  cp "$backup" "$NGINX_CONF" >/dev/null 2>&1 || true
  stop_rollback_candidate
  die "rollback Nginx config could not be updated; traffic remains on $active"
fi

if ! nginx -t || ! systemctl reload nginx; then
  cp "$backup" "$NGINX_CONF" >/dev/null 2>&1 || true
  nginx -t >/dev/null 2>&1 && systemctl reload nginx >/dev/null 2>&1 || true
  stop_rollback_candidate
  die "rollback Nginx switch failed; restored $backup"
fi

public_base_url="$(read_env_value PUBLIC_BASE_URL "$ENV_FILE")"
if [[ -n "$public_base_url" ]]; then
  public_smoke_args=(--base-url "$public_base_url" --mode "$mode")
  [[ "$mode" == "production" ]] && public_smoke_args+=(--expected-origin "$expected_origin")
  if ! "$SCRIPT_DIR/05-smoke-test.sh" "${public_smoke_args[@]}"; then
    cp "$backup" "$NGINX_CONF" >/dev/null 2>&1 || true
    nginx -t >/dev/null 2>&1 && systemctl reload nginx >/dev/null 2>&1 || true
    stop_rollback_candidate
    die "public rollback smoke test failed; traffic restored to $active"
  fi
fi

set_container_restart_policy "$active_name" no \
  || die "traffic rolled back, but failed to disable reboot restart for $active_name"
image="$(podman inspect --format '{{.ImageName}}' "$previous_name" 2>/dev/null || echo unknown)"
image_id="$(podman inspect --format '{{.Image}}' "$previous_name" 2>/dev/null || echo unknown)"
record_deployment rollback "$image" "$active" "$previous" "$image_id"
log "traffic rolled back to $previous; draining $active for ${DRAIN_SECONDS}s"
sleep "$DRAIN_SECONDS"
stop_container_if_running "$active_name" 30
log "rollback complete: $previous_name is active on 127.0.0.1:$previous_port"
