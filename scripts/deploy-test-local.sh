#!/usr/bin/env bash
set -euo pipefail

SERVER_HOST="${SERVER_HOST:-144.24.142.36}"
SERVER_USER="${SERVER_USER:-ubuntu}"
SSH_KEY="${SSH_KEY:-$HOME/.ssh/ssh-key-2025-02-17.key}"
SERVER_DIR="${SERVER_DIR:-/var/www/html/test.mahbub.dev}"
BACKUP_FILE="${BACKUP_FILE:-/var/www/html/backups/test.mahbub.dev-last.tar.gz}"
APP_NAME="${APP_NAME:-my-app-5010}"
APP_PORT="${APP_PORT:-5010}"
PUBLIC_BASE_URL="${PUBLIC_BASE_URL:-https://test.mahbub.dev}"
ARTIFACT="${ARTIFACT:-/tmp/test-mahbub-dev-build.tar.gz}"
REMOTE_ARTIFACT="${REMOTE_ARTIFACT:-/tmp/test-mahbub-dev-build.tar.gz}"
REMOTE_NODE_PATH="${REMOTE_NODE_PATH:-/home/ubuntu/.nvm/versions/node/v22.14.0/bin}"

log() {
  printf '\n[%s] %s\n' "$(date '+%H:%M:%S')" "$*"
}

log "Checking SSH key"
test -f "$SSH_KEY"
chmod 600 "$SSH_KEY"

log "Building locally"
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
  "SERVER_DIR='$SERVER_DIR' BACKUP_FILE='$BACKUP_FILE' APP_NAME='$APP_NAME' APP_PORT='$APP_PORT' PUBLIC_BASE_URL='$PUBLIC_BASE_URL' REMOTE_ARTIFACT='$REMOTE_ARTIFACT' REMOTE_NODE_PATH='$REMOTE_NODE_PATH' bash -s" <<'REMOTE'
set -euo pipefail

export PATH="$REMOTE_NODE_PATH:$HOME/.local/bin:/usr/local/bin:/usr/bin:/bin:$PATH"
command -v node >/dev/null
command -v pm2 >/dev/null

test -d "$SERVER_DIR"
cd "$SERVER_DIR"

mkdir -p "$(dirname "$BACKUP_FILE")"
TMP_BACKUP="/tmp/test.mahbub.dev-backup-$$.tar.gz"
rm -f "$TMP_BACKUP"

# Keep exactly one backup: the previous deployed version only.
if tar --exclude=node_modules --exclude='.next/cache' -czf "$TMP_BACKUP" \
  .next public package.json next.config.js db.json scripts 2>/tmp/test-mahbub-dev-backup-warn.log; then
  mv "$TMP_BACKUP" "$BACKUP_FILE"
else
  rm -f "$TMP_BACKUP"
  echo "warning: backup step failed; continuing because existing deployment may not have all files yet" >&2
fi
find "$(dirname "$BACKUP_FILE")" -maxdepth 1 -type f \
  \( -name 'test.mahbub.dev-before-*.tar.gz' -o -name 'test-mahbub-dev-before-*.tar.gz' \) \
  ! -name "$(basename "$BACKUP_FILE")" -delete

rm -rf .next public scripts/updatePortfolioContent.js db.json package.json next.config.js
tar -xzf "$REMOTE_ARTIFACT" -C "$SERVER_DIR"

# Uses existing server-side .env/.env.production values; no secrets are uploaded.
node scripts/updatePortfolioContent.js

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

log "Deployment complete: $PUBLIC_BASE_URL"
