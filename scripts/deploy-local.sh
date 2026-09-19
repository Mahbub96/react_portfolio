#!/usr/bin/env bash
set -euo pipefail

usage() {
  cat <<'USAGE'
Usage:
  bash scripts/deploy-local.sh <domain>

Examples:
  pnpm deploy:test          # deploys test.mahbub.dev
  pnpm deploy:prod          # deploys mahbub.dev
  pnpm deploy:domain -- mahbub.dev
  pnpm deploy:domain -- test.mahbub.dev

Optional overrides:
  SERVER_HOST=144.24.142.36
  SERVER_USER=ubuntu
  SSH_KEY=$HOME/.ssh/ssh-key-2025-02-17.key
  SERVER_DIR=/var/www/html/<domain>
  BACKUP_FILE=/var/www/html/backups/<domain>-last.tar.gz
  APP_NAME=<pm2-app-name>
  APP_PORT=<port>
  PUBLIC_BASE_URL=https://<domain>
  ARTIFACT=/tmp/<domain-slug>-build.tar.gz
  REMOTE_ARTIFACT=/tmp/<domain-slug>-build.tar.gz
USAGE
}

if [[ "${1:-}" == "--" ]]; then
  shift
fi

if [[ "${1:-}" == "-h" || "${1:-}" == "--help" ]]; then
  usage
  exit 0
fi

if [[ $# -gt 1 ]]; then
  echo "Unexpected extra argument(s): ${*:2}" >&2
  usage >&2
  exit 2
fi

raw_domain="${1:-${DOMAIN:-test.mahbub.dev}}"
raw_domain="${raw_domain#https://}"
raw_domain="${raw_domain#http://}"
DOMAIN="${raw_domain%%/*}"

if [[ ! "$DOMAIN" =~ ^[A-Za-z0-9.-]+$ ]]; then
  echo "Invalid domain: $DOMAIN" >&2
  exit 2
fi

DOMAIN_SLUG="${DOMAIN//./-}"
SERVER_HOST="${SERVER_HOST:-144.24.142.36}"
SERVER_USER="${SERVER_USER:-ubuntu}"
SSH_KEY="${SSH_KEY:-$HOME/.ssh/ssh-key-2025-02-17.key}"
SERVER_DIR="${SERVER_DIR:-/var/www/html/$DOMAIN}"
BACKUP_FILE="${BACKUP_FILE:-/var/www/html/backups/$DOMAIN-last.tar.gz}"
PUBLIC_BASE_URL="${PUBLIC_BASE_URL:-https://$DOMAIN}"
ARTIFACT="${ARTIFACT:-/tmp/$DOMAIN_SLUG-build.tar.gz}"
REMOTE_ARTIFACT="${REMOTE_ARTIFACT:-/tmp/$DOMAIN_SLUG-build.tar.gz}"
REMOTE_NODE_PATH="${REMOTE_NODE_PATH:-/home/ubuntu/.nvm/versions/node/v22.14.0/bin}"

case "$DOMAIN" in
  mahbub.dev)
    DEFAULT_APP_NAME="mahbub.dev"
    DEFAULT_APP_PORT="3000"
    ;;
  test.mahbub.dev)
    # Keep the current PM2 name/port so old test processes are replaced cleanly.
    DEFAULT_APP_NAME="my-app-5010"
    DEFAULT_APP_PORT="5010"
    ;;
  *)
    DEFAULT_APP_NAME="$DOMAIN"
    DEFAULT_APP_PORT=""
    ;;
esac

APP_NAME="${APP_NAME:-$DEFAULT_APP_NAME}"
APP_PORT="${APP_PORT:-$DEFAULT_APP_PORT}"
if [[ -z "$APP_PORT" ]]; then
  echo "APP_PORT is required for unknown domain '$DOMAIN'" >&2
  exit 2
fi

log() {
  printf '\n[%s] %s\n' "$(date '+%H:%M:%S')" "$*"
}

log "Deploy target"
printf '  domain: %s\n  public URL: %s\n  server dir: %s\n  app: %s\n  port: %s\n  backup: %s\n' \
  "$DOMAIN" "$PUBLIC_BASE_URL" "$SERVER_DIR" "$APP_NAME" "$APP_PORT" "$BACKUP_FILE"

log "Checking SSH key"
test -f "$SSH_KEY"
chmod 600 "$SSH_KEY"

log "Building locally"
rm -rf .next
pnpm build

log "Creating artifact: $ARTIFACT"
rm -f "$ARTIFACT"
COPYFILE_DISABLE=1 tar --no-xattrs --exclude='.next/cache' -czf "$ARTIFACT" \
  .next \
  public \
  package.json \
  next.config.js \
  db.json \
  scripts/updatePortfolioContent.js
ls -lh "$ARTIFACT"

log "Uploading artifact to $SERVER_HOST"
scp -i "$SSH_KEY" -o BatchMode=yes "$ARTIFACT" "$SERVER_USER@$SERVER_HOST:$REMOTE_ARTIFACT"

log "Deploying on server with single rolling backup"
ssh -i "$SSH_KEY" -o BatchMode=yes "$SERVER_USER@$SERVER_HOST" \
  "DOMAIN='$DOMAIN' DOMAIN_SLUG='$DOMAIN_SLUG' SERVER_DIR='$SERVER_DIR' BACKUP_FILE='$BACKUP_FILE' APP_NAME='$APP_NAME' APP_PORT='$APP_PORT' PUBLIC_BASE_URL='$PUBLIC_BASE_URL' REMOTE_ARTIFACT='$REMOTE_ARTIFACT' REMOTE_NODE_PATH='$REMOTE_NODE_PATH' bash -s" <<'REMOTE'
set -euo pipefail

export PATH="$REMOTE_NODE_PATH:$HOME/.local/bin:/usr/local/bin:/usr/bin:/bin:$PATH"
command -v node >/dev/null
command -v pm2 >/dev/null

test -d "$SERVER_DIR"
cd "$SERVER_DIR"

mkdir -p "$(dirname "$BACKUP_FILE")"
TMP_BACKUP="/tmp/$DOMAIN_SLUG-backup-$$.tar.gz"
rm -f "$TMP_BACKUP"

# Keep exactly one backup: the previous deployed version only.
if tar --exclude=node_modules --exclude='.next/cache' -czf "$TMP_BACKUP" \
  .next public package.json next.config.js db.json scripts 2>"/tmp/$DOMAIN_SLUG-backup-warn.log"; then
  mv "$TMP_BACKUP" "$BACKUP_FILE"
else
  rm -f "$TMP_BACKUP"
  echo "warning: backup step failed; continuing because existing deployment may not have all files yet" >&2
fi
find "$(dirname "$BACKUP_FILE")" -maxdepth 1 -type f \
  \( -name "$DOMAIN-before-*.tar.gz" -o -name "$DOMAIN_SLUG-before-*.tar.gz" \) \
  ! -name "$(basename "$BACKUP_FILE")" -delete

rm -rf .next public scripts/updatePortfolioContent.js db.json package.json next.config.js
tar -xzf "$REMOTE_ARTIFACT" -C "$SERVER_DIR"

# Uses existing server-side .env/.env.production values; no secrets are uploaded.
NODE_ENV=production node scripts/updatePortfolioContent.js

pm2 stop "$APP_NAME" || true
pm2 delete "$APP_NAME" || true
PORT="$APP_PORT" NODE_ENV=production NEXT_PUBLIC_BASE_URL="$PUBLIC_BASE_URL" \
  pm2 start "$SERVER_DIR/.next/standalone/server.js" \
    --name "$APP_NAME" \
    --cwd "$SERVER_DIR/.next/standalone" \
    --update-env
pm2 save
pm2 list --no-color
REMOTE

log "Verifying server localhost"
ssh -i "$SSH_KEY" -o BatchMode=yes "$SERVER_USER@$SERVER_HOST" \
  "curl -fsSI --max-time 15 http://127.0.0.1:$APP_PORT/ | grep -i '^HTTP/'"

log "Verifying public URL"
curl -fsSI --max-time 20 "$PUBLIC_BASE_URL/" | grep -i '^HTTP/'

log "Verifying rendered content"
html_file="$(mktemp)"
trap 'rm -f "$html_file"' EXIT
curl -fsSL --max-time 20 -A 'Mozilla/5.0' "$PUBLIC_BASE_URL/" > "$html_file"
grep -q 'Software Engineer' "$html_file"
grep -q 'Brotecs' "$html_file"
grep -q '3.70' "$html_file"
! grep -q 'Bootstarp' "$html_file"
! grep -q 'No Actions Available' "$html_file"
! grep -q 'Stitel' "$html_file"

log "Verifying single rolling backup"
ssh -i "$SSH_KEY" -o BatchMode=yes "$SERVER_USER@$SERVER_HOST" \
  "test -f '$BACKUP_FILE' && count=\$(find \"\$(dirname '$BACKUP_FILE')\" -maxdepth 1 -type f -name '$(basename "$BACKUP_FILE")' | wc -l) && test \"\$count\" -eq 1 && printf '%s\n' '$BACKUP_FILE'"

log "Deployment complete: $PUBLIC_BASE_URL"
