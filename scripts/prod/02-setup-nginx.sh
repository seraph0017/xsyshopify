#!/usr/bin/env bash

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
# shellcheck source=./lib.sh
source "$SCRIPT_DIR/lib.sh"

require_root
[[ -n "${DOMAIN:-}" ]] || die "DOMAIN is required, for example store.example.com"
[[ -n "${EMAIL:-}" ]] || die "EMAIL is required for Let's Encrypt notices"
[[ "$DOMAIN" =~ ^[A-Za-z0-9.-]+$ && "$DOMAIN" != .* && "$DOMAIN" != *. ]] \
  || die "DOMAIN must be a hostname without a scheme, port, or path"

for command_name in certbot nginx systemctl sed; do
  require_command "$command_name"
done
acquire_deploy_lock

CONF_FILE="$NGINX_CONF"
WEBROOT="${ACME_WEBROOT:-/var/www/tideform-acme}"
CERT_DIR="/etc/letsencrypt/live/$DOMAIN"
ACTIVE_COLOR=blue

install -d -m 0755 "$WEBROOT" "$(dirname "$CONF_FILE")"
install -d -m 0750 "$BACKUP_DIR"

if [[ -f "$CONF_FILE" ]] && grep -q '^# active-color:' "$CONF_FILE"; then
  ACTIVE_COLOR="$(active_color_from_nginx "$CONF_FILE")"
fi
ACTIVE_PORT="$(port_for_color "$ACTIVE_COLOR")"

if [[ -f "$CONF_FILE" ]]; then
  backup="$BACKUP_DIR/tideform.conf.pre-tls.$(date -u '+%Y%m%dT%H%M%SZ')"
  cp "$CONF_FILE" "$backup"
  log "backed up the existing Nginx config to $backup"
fi

DEFAULT_SITE=/etc/nginx/sites-enabled/default
DEFAULT_SITE_DISABLED=0
DEFAULT_SITE_BACKUP=""
if [[ -e "$DEFAULT_SITE" || -L "$DEFAULT_SITE" ]]; then
  DEFAULT_SITE_BACKUP="$BACKUP_DIR/nginx-default-site.$(date -u '+%Y%m%dT%H%M%SZ')"
  cp -a "$DEFAULT_SITE" "$DEFAULT_SITE_BACKUP"
  rm -f "$DEFAULT_SITE"
  DEFAULT_SITE_DISABLED=1
  log "disabled the distribution default Nginx site; backup: $DEFAULT_SITE_BACKUP"
fi

restore_nginx_config() {
  local rollback_file="$1" existed="$2"
  if [[ "$existed" == "1" ]]; then
    cp "$rollback_file" "$CONF_FILE"
  else
    rm -f "$CONF_FILE"
  fi
  if [[ "$DEFAULT_SITE_DISABLED" == "1" && ! -e "$DEFAULT_SITE" && ! -L "$DEFAULT_SITE" ]]; then
    cp -a "$DEFAULT_SITE_BACKUP" "$DEFAULT_SITE"
  fi
  nginx -t >/dev/null 2>&1 && systemctl reload nginx >/dev/null 2>&1 || true
}

install_nginx_config() {
  local candidate="$1" rollback_file existed=0
  rollback_file="$(mktemp "$BACKUP_DIR/.nginx-rollback.XXXXXX")"
  if [[ -f "$CONF_FILE" ]]; then
    cp "$CONF_FILE" "$rollback_file"
    existed=1
  fi

  install -m 0644 "$candidate" "$CONF_FILE"
  if ! nginx -t || ! systemctl reload nginx; then
    restore_nginx_config "$rollback_file" "$existed"
    rm -f "$rollback_file"
    return 1
  fi
  rm -f "$rollback_file"
}

if [[ ! -s "$CERT_DIR/fullchain.pem" || ! -s "$CERT_DIR/privkey.pem" ]]; then
  log "installing the temporary HTTP challenge site"
  http_candidate="$(mktemp "$BACKUP_DIR/.http-challenge.XXXXXX")"
  cat > "$http_candidate" <<EOF
server {
    listen 80;
    listen [::]:80;
    server_name $DOMAIN;

    location ^~ /.well-known/acme-challenge/ {
        root $WEBROOT;
        default_type text/plain;
    }

    location / {
        return 404;
    }
}
EOF
  install_nginx_config "$http_candidate" \
    || die "temporary HTTP challenge config failed; the previous Nginx config was restored"
  rm -f "$http_candidate"

  log "requesting the Let's Encrypt certificate"
  if ! certbot certonly --webroot \
    --webroot-path "$WEBROOT" \
    --domain "$DOMAIN" \
    --email "$EMAIL" \
    --agree-tos \
    --non-interactive; then
    cat >&2 <<EOF
Certificate request failed. The HTTP challenge config remains at $CONF_FILE.
Check DNS and public TCP 80, then inspect:
  certbot certificates
  journalctl -u nginx --since '-15 minutes'
EOF
    exit 1
  fi
else
  log "reusing the existing certificate in $CERT_DIR without interrupting HTTPS"
fi

TEMPLATE="$SCRIPT_DIR/nginx/tideform.conf.template"
[[ -f "$TEMPLATE" ]] || die "Nginx template not found: $TEMPLATE"
production_candidate="$(mktemp "$BACKUP_DIR/.production-nginx.XXXXXX")"
sed \
  -e "s|__DOMAIN__|$DOMAIN|g" \
  -e "s|__CERT_DIR__|$CERT_DIR|g" \
  -e "s|__ACME_WEBROOT__|$WEBROOT|g" \
  -e "s|__ACTIVE_COLOR__|$ACTIVE_COLOR|g" \
  -e "s|__ACTIVE_PORT__|$ACTIVE_PORT|g" \
  "$TEMPLATE" > "$production_candidate"

log "installing the production TLS reverse proxy for $ACTIVE_COLOR on $ACTIVE_PORT"
install_nginx_config "$production_candidate" \
  || die "production Nginx config failed; the previous config was restored"
rm -f "$production_candidate"

renewal_hook_dir=/etc/letsencrypt/renewal-hooks/deploy
install -d -m 0755 "$renewal_hook_dir"
cat > "$renewal_hook_dir/tideform-reload-nginx" <<'EOF'
#!/usr/bin/env bash
set -euo pipefail
nginx -t
systemctl reload nginx
EOF
chmod 0755 "$renewal_hook_dir/tideform-reload-nginx"

timer_units="$(systemctl list-unit-files --type=timer --no-legend | awk '{print $1}')"
if grep -Fxq certbot-renew.timer <<< "$timer_units"; then
  systemctl enable --now certbot-renew.timer
elif grep -Fxq certbot.timer <<< "$timer_units"; then
  systemctl enable --now certbot.timer
else
  cat > /etc/cron.d/tideform-certbot-renew <<'EOF'
17 3 * * * root certbot renew --quiet
EOF
fi

cat <<EOF
Nginx and TLS setup complete for https://$DOMAIN.
The active deployment remains $ACTIVE_COLOR on 127.0.0.1:$ACTIVE_PORT.
Run 03-deploy-first.sh only for an empty host; use 04-deploy-blue-green.sh afterward.
EOF
