#!/usr/bin/env bash
set -Eeuo pipefail

ROOT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/.." && pwd)"
SERVER_HOST="${SERVER_HOST:-130.110.118.150}"
SSH_USER="${SSH_USER:-ubuntu}"
SSH_PORT="${SSH_PORT:-22}"
SSH_KEY="${SSH_KEY:-}"
APP_DOMAIN="${APP_DOMAIN:-130.110.118.150.sslip.io}"
WHATSAPP_NUMBER="${VITE_WHATSAPP_NUMBER:-9647740080310}"
REMOTE_TARGET="${SSH_USER}@${SERVER_HOST}"

fail() {
  printf 'ERROR: %s\n' "$*" >&2
  exit 1
}

[[ "$SERVER_HOST" =~ ^[A-Za-z0-9.-]+$ ]] || fail 'SERVER_HOST must be an IPv4 address or DNS name.'
[[ "$SSH_USER" =~ ^[A-Za-z_][A-Za-z0-9_-]*$ ]] || fail 'SSH_USER contains unsupported characters.'
[[ "$SSH_PORT" =~ ^[0-9]+$ ]] && (( SSH_PORT > 0 && SSH_PORT < 65536 )) || fail 'SSH_PORT is invalid.'
[[ "$APP_DOMAIN" =~ ^[A-Za-z0-9.-]+$ && "$APP_DOMAIN" != *..* ]] || fail 'APP_DOMAIN is invalid.'
[[ "$WHATSAPP_NUMBER" =~ ^[0-9]{8,15}$ ]] || fail 'VITE_WHATSAPP_NUMBER must contain 8 to 15 digits.'

command -v ssh >/dev/null || fail 'OpenSSH client is required.'
command -v scp >/dev/null || fail 'OpenSSH scp is required.'
command -v tar >/dev/null || fail 'tar is required.'
command -v npm >/dev/null || fail 'npm is required.'

SSH_OPTIONS=(-p "$SSH_PORT" -o BatchMode=yes -o ConnectTimeout=10)
SCP_OPTIONS=(-P "$SSH_PORT" -o BatchMode=yes -o ConnectTimeout=10)
if [[ -n "$SSH_KEY" ]]; then
  [[ -r "$SSH_KEY" ]] || fail "SSH_KEY is not readable: $SSH_KEY"
  KEY_MODE="$(stat -c '%a' -- "$SSH_KEY")"
  [[ "$KEY_MODE" == 600 ]] || fail "SSH key must have mode 600 (run chmod 600 on the key file)."
  SSH_OPTIONS+=(-i "$SSH_KEY")
  SCP_OPTIONS+=(-i "$SSH_KEY")
fi

ADMIN_PHONE="${ADMIN_PHONE:-}"
ADMIN_PASSWORD="${ADMIN_PASSWORD:-}"
GEMINI_API_KEY="${GEMINI_API_KEY:-}"
if [[ -z "$ADMIN_PHONE" ]]; then
  read -r -p 'Admin phone (international digits): ' ADMIN_PHONE
fi
if [[ -z "$ADMIN_PASSWORD" ]]; then
  read -r -s -p 'Admin password (12-128 safe characters): ' ADMIN_PASSWORD
  printf '\n'
fi
if [[ -z "$GEMINI_API_KEY" ]]; then
  read -r -s -p 'Gemini API key (optional, Enter to skip): ' GEMINI_API_KEY
  printf '\n'
fi
[[ "$ADMIN_PHONE" =~ ^[+]?[0-9]{8,18}$ ]] || fail 'ADMIN_PHONE must contain 8 to 18 digits, optionally prefixed by +.'
[[ "$ADMIN_PASSWORD" =~ ^[A-Za-z0-9_@#%+=:.,!?-]{12,128}$ ]] || fail 'ADMIN_PASSWORD must contain 12-128 letters, digits, or _@#%+=:.,!?-.'
[[ -z "$GEMINI_API_KEY" || "$GEMINI_API_KEY" =~ ^[A-Za-z0-9_-]{1,512}$ ]] || fail 'GEMINI_API_KEY contains unsupported characters.'

ssh "${SSH_OPTIONS[@]}" "$REMOTE_TARGET" true || fail 'SSH preflight failed. Check network access, the SSH key, and known_hosts; no host-key checks are bypassed.'

SECRET_FILE="$(mktemp)"
ARCHIVE_FILE="$(mktemp --suffix=.tar.gz)"
REMOTE_DIR=''
cleanup() {
  rm -f -- "$SECRET_FILE" "$ARCHIVE_FILE"
  if [[ -n "$REMOTE_DIR" ]]; then
    ssh "${SSH_OPTIONS[@]}" "$REMOTE_TARGET" "rm -rf -- '$REMOTE_DIR'" >/dev/null 2>&1 || true
  fi
}
trap cleanup EXIT
chmod 600 "$SECRET_FILE"
printf 'ADMIN_PHONE=%s\nADMIN_PASSWORD=%s\nGEMINI_API_KEY=%s\n' \
  "$ADMIN_PHONE" "$ADMIN_PASSWORD" "$GEMINI_API_KEY" >"$SECRET_FILE"
unset ADMIN_PASSWORD GEMINI_API_KEY

printf 'Building the application locally...\n'
(cd "$ROOT_DIR" && VITE_WHATSAPP_NUMBER="$WHATSAPP_NUMBER" npm run build)

tar -czf "$ARCHIVE_FILE" \
  --exclude='./.git' \
  --exclude='./node_modules' \
  --exclude='./.secrets' \
  --exclude='./.ssh' \
  --exclude='./.env*' \
  --exclude='*.key' \
  --exclude='*.pem' \
  --exclude='*.p12' \
  --exclude='*.pfx' \
  -C "$ROOT_DIR" .

REMOTE_DIR="$(ssh "${SSH_OPTIONS[@]}" "$REMOTE_TARGET" 'mktemp -d /tmp/almonqith-deploy.XXXXXX')"
scp "${SCP_OPTIONS[@]}" "$ARCHIVE_FILE" "$REMOTE_TARGET:$REMOTE_DIR/release.tar.gz"
scp "${SCP_OPTIONS[@]}" "$SECRET_FILE" "$REMOTE_TARGET:$REMOTE_DIR/secret.env"

ssh "${SSH_OPTIONS[@]}" "$REMOTE_TARGET" "bash -s -- '$APP_DOMAIN' '$REMOTE_DIR'" <<'REMOTE'
set -Eeuo pipefail
APP_DOMAIN="$1"
REMOTE_DIR="$2"
[[ "$REMOTE_DIR" =~ ^/tmp/almonqith-deploy\.[A-Za-z0-9]+$ ]] || { echo 'Invalid temporary deployment directory.' >&2; exit 1; }

sudo apt-get update
sudo apt-get install -y ca-certificates curl gnupg postgresql postgresql-contrib
sudo install -d -m 0755 /etc/apt/keyrings

curl -fsSL https://deb.nodesource.com/gpgkey/nodesource-repo.gpg.key \
  | sudo gpg --dearmor --yes -o /etc/apt/keyrings/nodesource.gpg
echo 'deb [signed-by=/etc/apt/keyrings/nodesource.gpg] https://deb.nodesource.com/node_24.x nodistro main' \
  | sudo tee /etc/apt/sources.list.d/nodesource.list >/dev/null

curl -fsSL https://dl.cloudsmith.io/public/caddy/stable/gpg.key \
  | sudo gpg --dearmor --yes -o /etc/apt/keyrings/caddy-stable.gpg
curl -fsSL https://dl.cloudsmith.io/public/caddy/stable/debian.deb.txt \
  | sudo tee /etc/apt/sources.list.d/caddy-stable.list >/dev/null
sudo apt-get update
sudo apt-get install -y nodejs caddy
node -e "if (Number(process.versions.node.split('.')[0]) < 24) process.exit(1)" \
  || { echo 'Node.js 24 or newer is required.' >&2; exit 1; }

APP_ROOT="$HOME/apps/almonqith"
RELEASE_ID="$(date -u +%Y%m%dT%H%M%SZ)"
RELEASE_DIR="$APP_ROOT/releases/$RELEASE_ID"
PREVIOUS_RELEASE="$(readlink -f "$APP_ROOT/current" 2>/dev/null || true)"
sudo install -d -m 0750 -o "$USER" -g "$USER" "$APP_ROOT/releases" "$RELEASE_DIR"
tar -xzf "$REMOTE_DIR/release.tar.gz" -C "$RELEASE_DIR"
if [[ ! -f "$RELEASE_DIR/package-lock.json" ]]; then
  echo 'Deployment archive is missing package-lock.json.' >&2
  exit 1
fi

sudo systemctl enable --now postgresql
DB_PASSWORD="$(openssl rand -hex 32)"
sudo -u postgres psql -v ON_ERROR_STOP=1 -v app_password="$DB_PASSWORD" <<'SQL'
DO $$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'almonqith_app') THEN
    CREATE ROLE almonqith_app LOGIN;
  END IF;
END
$$;
ALTER ROLE almonqith_app WITH LOGIN PASSWORD :'app_password';
SQL
if ! sudo -u postgres psql -tAc "SELECT 1 FROM pg_database WHERE datname = 'almonqith'" | grep -qx 1; then
  sudo -u postgres createdb --owner=almonqith_app almonqith
else
  sudo install -d -m 0700 -o postgres -g postgres /var/backups/almonqith
  sudo -u postgres pg_dump -Fc -f "/var/backups/almonqith/predeploy-$(date -u +%Y%m%dT%H%M%SZ).dump" almonqith
fi
sudo -u postgres psql -d almonqith -v ON_ERROR_STOP=1 -f "$RELEASE_DIR/database/schema.sql"
sudo -u postgres psql -d almonqith -v ON_ERROR_STOP=1 \
  -c 'GRANT CONNECT ON DATABASE almonqith TO almonqith_app' \
  -c 'GRANT USAGE ON SCHEMA public TO almonqith_app' \
  -c 'GRANT SELECT, INSERT, UPDATE ON TABLE orders TO almonqith_app'

cd "$RELEASE_DIR"
npm ci --omit=dev
ln -sfn "$RELEASE_DIR" "$APP_ROOT/current"

sudo install -d -m 0750 -o root -g "$USER" /etc/almonqith
sudo install -m 0600 -o "$USER" -g "$USER" "$REMOTE_DIR/secret.env" /tmp/almonqith-secret.env
set -a
. /tmp/almonqith-secret.env
set +a
SESSION_SECRET="$(openssl rand -hex 32)"
DATABASE_URL="postgresql://almonqith_app:$DB_PASSWORD@127.0.0.1:5432/almonqith"
ENV_FILE="$(mktemp)"
chmod 600 "$ENV_FILE"
cat >"$ENV_FILE" <<EOF
NODE_ENV=production
PORT=3000
ADMIN_PHONE=$ADMIN_PHONE
ADMIN_PASSWORD=$ADMIN_PASSWORD
SESSION_SECRET=$SESSION_SECRET
GEMINI_API_KEY=$GEMINI_API_KEY
DATABASE_URL=$DATABASE_URL
APP_URL=https://$APP_DOMAIN
EOF
sudo install -m 0640 -o root -g "$USER" "$ENV_FILE" /etc/almonqith/app.env
rm -f -- "$ENV_FILE" /tmp/almonqith-secret.env
unset ADMIN_PHONE ADMIN_PASSWORD GEMINI_API_KEY DB_PASSWORD SESSION_SECRET DATABASE_URL

if [[ -f /etc/systemd/system/almonqith.service ]]; then
  sudo cp -a /etc/systemd/system/almonqith.service \
    "/etc/systemd/system/almonqith.service.pre-almonqith-$RELEASE_ID"
fi
sudo tee /etc/systemd/system/almonqith.service >/dev/null <<EOF
[Unit]
Description=Almonqith application server
After=network.target postgresql.service
Requires=postgresql.service

[Service]
Type=simple
User=$USER
Group=$USER
WorkingDirectory=$APP_ROOT/current
EnvironmentFile=/etc/almonqith/app.env
ExecStart=/usr/bin/node $APP_ROOT/current/server.ts
Restart=always
RestartSec=5
NoNewPrivileges=true
PrivateTmp=true

[Install]
WantedBy=multi-user.target
EOF

if [[ -f /etc/caddy/Caddyfile ]]; then
  sudo cp -a /etc/caddy/Caddyfile "/etc/caddy/Caddyfile.pre-almonqith-$RELEASE_ID"
else
  sudo install -m 0644 /dev/null /etc/caddy/Caddyfile
fi
sudo sed -i '/^# BEGIN ALMONQITH$/,/^# END ALMONQITH$/d' /etc/caddy/Caddyfile
sudo tee -a /etc/caddy/Caddyfile >/dev/null <<EOF
# BEGIN ALMONQITH
$APP_DOMAIN {
  encode gzip zstd
  reverse_proxy 127.0.0.1:3000
}
# END ALMONQITH
EOF
sudo caddy validate --config /etc/caddy/Caddyfile
sudo systemctl daemon-reload
sudo systemctl enable --now caddy
sudo systemctl enable --now almonqith

sudo install -d -m 0700 -o postgres -g postgres /var/backups/almonqith
sudo tee /usr/local/sbin/almonqith-db-backup >/dev/null <<'BACKUP'
#!/usr/bin/env bash
set -Eeuo pipefail
umask 077
backup_dir=/var/backups/almonqith
pg_dump -Fc -f "$backup_dir/almonqith-$(date -u +%Y%m%dT%H%M%SZ).dump" almonqith
find "$backup_dir" -maxdepth 1 -type f -name '*.dump' -mtime +14 -delete
BACKUP
sudo chmod 0750 /usr/local/sbin/almonqith-db-backup
sudo tee /etc/systemd/system/almonqith-db-backup.service >/dev/null <<'BACKUPSERVICE'
[Unit]
Description=Create a compressed PostgreSQL backup for Almonqith
Requires=postgresql.service
After=postgresql.service

[Service]
Type=oneshot
User=postgres
Group=postgres
ExecStart=/usr/local/sbin/almonqith-db-backup
BACKUPSERVICE
sudo tee /etc/systemd/system/almonqith-db-backup.timer >/dev/null <<'BACKUPTIMER'
[Unit]
Description=Daily Almonqith database backup

[Timer]
OnCalendar=daily
Persistent=true

[Install]
WantedBy=timers.target
BACKUPTIMER
sudo systemctl daemon-reload
sudo systemctl enable --now almonqith-db-backup.timer
sudo systemctl start almonqith-db-backup.service

if command -v ufw >/dev/null && sudo ufw status | grep -q 'Status: active'; then
  sudo ufw allow 80/tcp
  sudo ufw allow 443/tcp
fi

for attempt in $(seq 1 30); do
  if curl --fail --silent http://127.0.0.1:3000/api/health >/dev/null; then
    break
  fi
  sleep 2
done
if ! curl --fail --silent http://127.0.0.1:3000/api/health; then
  if [[ -n "$PREVIOUS_RELEASE" && -d "$PREVIOUS_RELEASE" ]]; then
    ln -sfn "$PREVIOUS_RELEASE" "$APP_ROOT/current"
    sudo systemctl restart almonqith
  fi
  sudo journalctl -u almonqith -n 40 --no-pager
  echo 'Deployment health check failed; the previous application release was restored when available.' >&2
  exit 1
fi
printf '\nApplication deployment completed for https://%s\n' "$APP_DOMAIN"
printf 'Ensure the cloud firewall allows inbound TCP ports 80 and 443.\n'
printf 'Wayl payment remains disabled until its official API and webhook are configured.\n'
REMOTE

printf '\nPublic URL: https://%s\n' "$APP_DOMAIN"
printf 'Daily PostgreSQL backups are retained on the server for 14 days.\n'
printf 'The requested SSH server was not modified outside the named application, PostgreSQL, Caddy, and backup services.\n'
