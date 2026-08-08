#!/usr/bin/env bash

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
# shellcheck source=./lib.sh
source "$SCRIPT_DIR/lib.sh"

IMAGE="${1:-${IMAGE:-}}"
validate_image_ref "$IMAGE" || exit 2
require_root
require_command podman
require_command curl
require_env_file
require_digest_for_production "$IMAGE"
require_verified_signature_for_production "$IMAGE"
validate_deployment_timings
acquire_deploy_lock
[[ -f "$NGINX_CONF" ]] || die "Nginx config not found: $NGINX_CONF; run 02-setup-nginx.sh first"

color="$(active_color_from_nginx "$NGINX_CONF")"
port="$(port_for_color "$color")"
name="$(container_name_for_color "$color")"
mode="$(site_mode_from_env)"
expected_origin="$(read_env_value SITE_URL "$ENV_FILE")"

container_exists "$name" \
  && die "$name already exists; use 04-deploy-blue-green.sh for subsequent releases"

log "pulling $IMAGE"
pull_image "$IMAGE"
image_id="$(podman image inspect --format '{{.Id}}' "$IMAGE")"
validate_image_publication_contract "$image_id"
start_container "$color" "$image_id"

if ! wait_for_health "$color"; then
  podman rm -f "$name" >/dev/null 2>&1 || true
  die "$name did not pass health checks; Nginx was not changed"
fi

smoke_args=(--base-url "http://127.0.0.1:$port" --mode "$mode")
[[ "$mode" == "production" ]] && smoke_args+=(--expected-origin "$expected_origin")
if ! "$SCRIPT_DIR/05-smoke-test.sh" "${smoke_args[@]}"; then
  podman rm -f "$name" >/dev/null 2>&1 || true
  die "$name failed smoke tests; Nginx was not changed"
fi

record_deployment first "$IMAGE" none "$color" "$image_id"
log "first deployment is ready: $name on 127.0.0.1:$port"
log "verify the public URL, then use 04-deploy-blue-green.sh for later releases"
