#!/usr/bin/env bash
set -Eeuo pipefail

SERVER_IP="${SERVER_IP:-130.110.118.150}"
APP_DOMAIN="${APP_DOMAIN:-al-munqith.online}"
SERVER_HOST="${SERVER_HOST:-$SERVER_IP}"
SSH_USER="${SSH_USER:-ubuntu}"
SSH_PORT="${SSH_PORT:-22}"
SSH_KEY="${SSH_KEY:-}"
: "${CLOUDFLARE_API_TOKEN:?Set CLOUDFLARE_API_TOKEN in the environment (never commit it).}"
: "${CLOUDFLARE_ZONE_ID:?Set CLOUDFLARE_ZONE_ID for al-munqith.online.}"

fail() {
  printf 'ERROR: %s\n' "$*" >&2
  exit 1
}

[[ "$SERVER_IP" =~ ^[0-9.]+$ ]] || fail 'SERVER_IP must be an IPv4 address.'
python3 - "$SERVER_IP" <<'PY' || fail 'SERVER_IP is not a valid IPv4 address.'
import ipaddress
import sys
ipaddress.IPv4Address(sys.argv[1])
PY
[[ "$APP_DOMAIN" =~ ^[A-Za-z0-9.-]+$ && "$APP_DOMAIN" != *..* ]] || fail 'APP_DOMAIN is invalid.'
[[ "$SSH_USER" =~ ^[A-Za-z_][A-Za-z0-9_-]*$ ]] || fail 'SSH_USER contains unsupported characters.'
[[ "$SSH_PORT" =~ ^[0-9]+$ ]] && (( SSH_PORT > 0 && SSH_PORT < 65536 )) || fail 'SSH_PORT is invalid.'

command -v curl >/dev/null || fail 'curl is required.'
command -v python3 >/dev/null || fail 'python3 is required.'
command -v ssh >/dev/null || fail 'OpenSSH client is required.'

SSH_OPTIONS=(-p "$SSH_PORT" -o BatchMode=yes -o ConnectTimeout=10)
if [[ -n "$SSH_KEY" ]]; then
  [[ -r "$SSH_KEY" ]] || fail "SSH_KEY is not readable: $SSH_KEY"
  [[ "$(stat -c '%a' -- "$SSH_KEY")" == 600 ]] || fail 'SSH key must have mode 600.'
  SSH_OPTIONS+=(-i "$SSH_KEY")
fi
REMOTE_TARGET="${SSH_USER}@${SERVER_HOST}"
API_ROOT="https://api.cloudflare.com/client/v4/zones/$CLOUDFLARE_ZONE_ID"
AUTH_HEADER="Authorization: Bearer $CLOUDFLARE_API_TOKEN"
ZONE_NAME="$(
  curl --fail --silent --show-error -H "$AUTH_HEADER" "$API_ROOT" \
  | python3 -c 'import json,sys; d=json.load(sys.stdin); assert d.get("success"), d.get("errors"); print(d["result"]["name"])'
)"
[[ "$ZONE_NAME" == "$APP_DOMAIN" ]] || fail "Cloudflare zone $CLOUDFLARE_ZONE_ID is for $ZONE_NAME, not $APP_DOMAIN."

upsert_dns_record() {
  local record_type="$1" record_name="$2" record_content="$3" existing_id payload
  existing_id="$(
    curl --fail --silent --show-error --get \
      -H "$AUTH_HEADER" \
      "$API_ROOT/dns_records" \
      --data-urlencode "type=$record_type" \
      --data-urlencode "name=$record_name" \
    | python3 -c 'import json,sys; d=json.load(sys.stdin); assert d.get("success"), d.get("errors"); print(d["result"][0]["id"] if d.get("result") else "")'
  )"
  payload="$(python3 - "$record_type" "$record_name" "$record_content" <<'PY'
import json
import sys
print(json.dumps({
    "type": sys.argv[1],
    "name": sys.argv[2],
    "content": sys.argv[3],
    "ttl": 1,
    "proxied": True,
}))
PY
)"
  if [[ -n "$existing_id" ]]; then
    curl --fail --silent --show-error \
      -X PUT -H "$AUTH_HEADER" -H 'Content-Type: application/json' \
      --data "$payload" "$API_ROOT/dns_records/$existing_id" \
      | python3 -c 'import json,sys; d=json.load(sys.stdin); assert d.get("success"), d.get("errors")'
  else
    curl --fail --silent --show-error \
      -X POST -H "$AUTH_HEADER" -H 'Content-Type: application/json' \
      --data "$payload" "$API_ROOT/dns_records" \
      | python3 -c 'import json,sys; d=json.load(sys.stdin); assert d.get("success"), d.get("errors")'
  fi
}

printf 'Updating Cloudflare DNS records for %s...\n' "$APP_DOMAIN"
upsert_dns_record A "$APP_DOMAIN" "$SERVER_IP"
upsert_dns_record CNAME "www.$APP_DOMAIN" "$APP_DOMAIN"
curl --fail --silent --show-error \
  -X PATCH -H "$AUTH_HEADER" -H 'Content-Type: application/json' \
  --data '{"value":"strict"}' "$API_ROOT/settings/ssl" \
  | python3 -c 'import json,sys; d=json.load(sys.stdin); assert d.get("success"), d.get("errors")'

ssh "${SSH_OPTIONS[@]}" "$REMOTE_TARGET" \
  "sudo cp -a /etc/caddy/Caddyfile /etc/caddy/Caddyfile.pre-domain-change-\$(date -u +%Y%m%dT%H%M%SZ) && sudo sed -i '/^# BEGIN ALMONQITH\$/,/^# END ALMONQITH\$/d' /etc/caddy/Caddyfile"
ssh "${SSH_OPTIONS[@]}" "$REMOTE_TARGET" "sudo tee -a /etc/caddy/Caddyfile >/dev/null" <<EOF
# BEGIN ALMONQITH
$APP_DOMAIN, www.$APP_DOMAIN {
  encode gzip zstd
  reverse_proxy 127.0.0.1:3000
}
# END ALMONQITH
EOF
ssh "${SSH_OPTIONS[@]}" "$REMOTE_TARGET" \
  "sudo caddy validate --config /etc/caddy/Caddyfile && sudo systemctl reload caddy && sudo sed -i 's#^APP_URL=.*#APP_URL=https://$APP_DOMAIN#' /etc/almonqith/app.env && sudo systemctl restart almonqith"

unset CLOUDFLARE_API_TOKEN AUTH_HEADER
printf 'Cloudflare DNS and Caddy are configured for https://%s and https://www.%s\n' "$APP_DOMAIN" "$APP_DOMAIN"
printf 'Allow time for DNS propagation and the TLS certificate to become active.\n'
printf 'The Cloudflare token needs Zone:Read, DNS:Edit, and Zone Settings:Edit for this zone only.\n'
