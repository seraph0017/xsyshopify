#!/usr/bin/env bash

set -euo pipefail

BASE_URL="${BASE_URL:-}"
SITE_MODE="${SITE_MODE:-prototype}"
EXPECTED_ORIGIN="${EXPECTED_ORIGIN:-}"

while [[ "$#" -gt 0 ]]; do
  case "$1" in
    --base-url)
      [[ "$#" -ge 2 ]] || { echo "--base-url requires a value" >&2; exit 2; }
      BASE_URL="$2"
      shift 2
      ;;
    --mode)
      [[ "$#" -ge 2 ]] || { echo "--mode requires a value" >&2; exit 2; }
      SITE_MODE="$2"
      shift 2
      ;;
    --expected-origin)
      [[ "$#" -ge 2 ]] || { echo "--expected-origin requires a value" >&2; exit 2; }
      EXPECTED_ORIGIN="$2"
      shift 2
      ;;
    --help|-h)
      echo "Usage: $0 --base-url URL --mode prototype|production [--expected-origin HTTPS_ORIGIN]"
      exit 0
      ;;
    *)
      echo "unknown argument: $1" >&2
      exit 2
      ;;
  esac
done

[[ "$SITE_MODE" == "prototype" || "$SITE_MODE" == "production" ]] || {
  echo "--mode must be prototype or production" >&2
  exit 2
}
[[ -n "$BASE_URL" ]] || { echo "--base-url is required" >&2; exit 2; }
if [[ "$SITE_MODE" == "production" ]]; then
  [[ "$EXPECTED_ORIGIN" == https://* && "$EXPECTED_ORIGIN" != */ ]] || {
    echo "production requires --expected-origin as an HTTPS origin without a trailing slash" >&2
    exit 2
  }
fi
command -v curl >/dev/null 2>&1 || { echo "curl is required" >&2; exit 1; }

tmp_dir="$(mktemp -d)"
trap 'rm -rf "$tmp_dir"' EXIT

fetch() {
  local path="$1" output="$2"
  curl --fail --silent --show-error --location --max-time 15 "$BASE_URL$path" --output "$output"
}

fetch "/api/health" "$tmp_dir/health.json"
grep -Eq '"status"[[:space:]]*:[[:space:]]*"ok"' "$tmp_dir/health.json"

for route in / /products /rfq; do
  filename="$(printf '%s' "$route" | tr '/?' '__')"
  fetch "$route" "$tmp_dir/page-$filename.html"
done

fetch "/robots.txt" "$tmp_dir/robots.txt"
fetch "/sitemap.xml" "$tmp_dir/sitemap.xml"

if [[ "$SITE_MODE" == "prototype" ]]; then
  grep -Eqi "<meta[^>]+name=['\"]robots['\"][^>]+content=['\"][^'\"]*noindex[^'\"]*follow" "$tmp_dir/page-_.html"
  ! grep -Eq '^Sitemap:' "$tmp_dir/robots.txt"
  ! grep -Eq '<url>' "$tmp_dir/sitemap.xml"
else
  ! grep -Eqi "<meta[^>]+name=['\"]robots['\"][^>]+content=['\"][^'\"]*noindex" "$tmp_dir/page-_.html"
  grep -Fxq "Sitemap: $EXPECTED_ORIGIN/sitemap.xml" "$tmp_dir/robots.txt"
  grep -Fq "<loc>$EXPECTED_ORIGIN/" "$tmp_dir/sitemap.xml"
  grep -Fq "<link rel=\"canonical\" href=\"$EXPECTED_ORIGIN/\"" "$tmp_dir/page-_.html"
fi

printf 'smoke test passed: %s (%s)\n' "$BASE_URL" "$SITE_MODE"
