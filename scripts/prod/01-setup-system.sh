#!/usr/bin/env bash

set -euo pipefail

log() {
  printf '[%s] %s\n' "$(date '+%Y-%m-%d %H:%M:%S')" "$*"
}

die() {
  printf '[error] %s\n' "$*" >&2
  exit 1
}

[[ "$(id -u)" -eq 0 ]] || die "run this script as root or with sudo"

machine_arch="$(uname -m)"
[[ "$machine_arch" == "x86_64" ]] \
  || die "this release publishes linux/amd64 only; unsupported host architecture: $machine_arch"

if command -v apt-get >/dev/null 2>&1; then
  log "installing production dependencies with apt-get"
  export DEBIAN_FRONTEND=noninteractive
  apt-get update
  apt-get install -y --no-install-recommends \
    ca-certificates certbot curl dnsutils jq logrotate nginx podman util-linux
elif command -v dnf >/dev/null 2>&1; then
  log "installing production dependencies with dnf"
  # Rocky Linux keeps Certbot in EPEL. Enabling CRB satisfies EPEL dependencies.
  if [[ -r /etc/os-release ]]; then
    # shellcheck disable=SC1091
    source /etc/os-release
  fi
  if [[ "${ID:-}" == "rocky" || "${ID:-}" == "almalinux" ]]; then
    dnf install -y dnf-plugins-core epel-release
    dnf config-manager --set-enabled crb
  else
    dnf install -y epel-release
  fi
  dnf install -y \
    bind-utils ca-certificates certbot curl jq logrotate nginx podman policycoreutils util-linux
else
  die "supported package manager not found; expected apt-get or dnf"
fi

log "creating application directories"
install -d -m 0755 /opt/tideform
install -d -m 0700 /opt/tideform/config
install -d -m 0750 /opt/tideform/backup /opt/tideform/scripts
chmod 700 /opt/tideform/config

if systemctl is-active --quiet firewalld 2>/dev/null; then
  log "allowing HTTP and HTTPS through firewalld"
  firewall-cmd --permanent --add-service=http
  firewall-cmd --permanent --add-service=https
  firewall-cmd --reload
elif command -v ufw >/dev/null 2>&1 && ufw status 2>/dev/null | grep -q '^Status: active'; then
  log "allowing HTTP and HTTPS through ufw"
  ufw allow 80/tcp
  ufw allow 443/tcp
  ufw reload
else
  [[ "${ALLOW_NO_HOST_FIREWALL:-0}" == "1" ]] || die \
    "no active host firewall detected; verify the cloud firewall, then rerun with ALLOW_NO_HOST_FIREWALL=1"
  log "continuing with the operator-confirmed cloud firewall; only TCP 80/443 may be public"
fi

systemctl enable --now nginx

if systemctl list-unit-files --type=service --no-legend \
  | awk '{print $1}' | grep -Fxq podman-restart.service; then
  systemctl enable podman-restart.service
else
  die "podman-restart.service is missing; reboot recovery cannot be guaranteed"
fi

if command -v getenforce >/dev/null 2>&1 && [[ "$(getenforce)" != "Disabled" ]]; then
  log "allowing Nginx to connect to the loopback Podman upstream under SELinux"
  setsebool -P httpd_can_network_connect 1
fi

cat <<'EOF'
System initialization complete.

Next:
  1. Allow inbound TCP 80 and 443 in the cloud firewall. Do not expose 3101 or 3102.
  2. Create /opt/tideform/config/tideform.env and set its mode to 600.
  3. Run 02-setup-nginx.sh with DOMAIN and EMAIL.
EOF
