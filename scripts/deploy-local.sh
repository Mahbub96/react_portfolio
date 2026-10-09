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

Runtime secrets are read on the server from $SERVER_DIR/.env.runtime
(chmod 600, never in git, never touched by deploys). Required keys:
  JWT_SECRET, ADMIN_PASSWORD_HASH, MONGODB_URI, SITE_ENV
SITE_ENV must be "production" on mahbub.dev and "test" everywhere else.
See env.example.
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
    EXPECTED_SITE_ENV="production"
    ;;
  test.mahbub.dev)
    # Keep the current PM2 name/port so old test processes are replaced cleanly.
    DEFAULT_APP_NAME="my-app-5010"
    DEFAULT_APP_PORT="5010"
    EXPECTED_SITE_ENV="test"
    ;;
  *)
    DEFAULT_APP_NAME="$DOMAIN"
    DEFAULT_APP_PORT=""
    EXPECTED_SITE_ENV="test"
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

log "Checking server runtime secrets ($SERVER_DIR/.env.runtime)"
# Fails before anything is built or replaced. Only key names are checked;
# values never leave the server.
ssh -i "$SSH_KEY" -o BatchMode=yes "$SERVER_USER@$SERVER_HOST" \
  "SERVER_DIR='$SERVER_DIR' EXPECTED_SITE_ENV='$EXPECTED_SITE_ENV' bash -s" <<'PRECHECK'
set -euo pipefail
env_file="$SERVER_DIR/.env.runtime"
if [[ ! -f "$env_file" ]]; then
  echo "missing $env_file (see env.example)" >&2
  exit 1
fi
missing=()
for key in JWT_SECRET ADMIN_PASSWORD_HASH MONGODB_URI SITE_ENV; do
  grep -qE "^(export )?$key=.+" "$env_file" || missing+=("$key")
done
if (( ${#missing[@]} )); then
  echo "missing keys in $env_file: ${missing[*]}" >&2
  exit 1
fi
site_env="$(set -a; . "$env_file"; printf '%s' "$SITE_ENV")"
if [[ "$site_env" != "$EXPECTED_SITE_ENV" ]]; then
  echo "SITE_ENV is '$site_env' but this domain needs '$EXPECTED_SITE_ENV'" >&2
  exit 1
fi
jwt_len="$(set -a; . "$env_file"; printf '%s' "$JWT_SECRET" | wc -c | tr -d ' ')"
if (( jwt_len < 32 )); then
  echo "JWT_SECRET must be at least 32 characters" >&2
  exit 1
fi
echo "runtime secrets OK"
# AI writing assist is optional: warn, never fail.
if ! grep -qE "^(export )?NVIDIA_API_KEY=.+" "$env_file"; then
  echo "note: NVIDIA_API_KEY not set; AI suggestions stay off"
else
  rules="$(set -a; . "$env_file"; printf '%s' "${AI_RULES_FILE:-}")"
  if [[ -n "$rules" && ! -r "$rules" ]]; then
    echo "warning: AI_RULES_FILE ($rules) is not readable; built-in rules will be used"
  fi
fi
PRECHECK

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
  "UPDATE_CONTENT='${UPDATE_CONTENT:-0}' DOMAIN='$DOMAIN' DOMAIN_SLUG='$DOMAIN_SLUG' SERVER_DIR='$SERVER_DIR' BACKUP_FILE='$BACKUP_FILE' APP_NAME='$APP_NAME' APP_PORT='$APP_PORT' PUBLIC_BASE_URL='$PUBLIC_BASE_URL' REMOTE_ARTIFACT='$REMOTE_ARTIFACT' REMOTE_NODE_PATH='$REMOTE_NODE_PATH' bash -s" <<'REMOTE'
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

# Runtime secrets for this environment (see env.example). Exported so both
# the optional content sync and the PM2 process see them; real environment
# variables take precedence over the .env files bundled in the build.
set -a
. "$SERVER_DIR/.env.runtime"
set +a

# Database content sync is OPT-IN (UPDATE_CONTENT=1): it upserts db.json into
# the MongoDB configured in the server-side .env, i.e. a data write on that
# environment. A normal code deploy must never modify data.
if [[ "$UPDATE_CONTENT" == "1" ]]; then
  echo "UPDATE_CONTENT=1: syncing portfolio content into MongoDB"
  NODE_ENV=production node scripts/updatePortfolioContent.js
else
  echo "Skipping database content sync (set UPDATE_CONTENT=1 to enable)"
fi

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
# PM2 returns before Next is listening; wait up to ~60s for it to come up.
ssh -i "$SSH_KEY" -o BatchMode=yes "$SERVER_USER@$SERVER_HOST" \
  "for i in \$(seq 1 30); do curl -fsSI --max-time 15 http://127.0.0.1:$APP_PORT/ | grep -i '^HTTP/' && exit 0; sleep 2; done; echo 'app did not become ready on port $APP_PORT' >&2; exit 1"

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

log "Verifying blog and live SEO routes"
# /blog/feed.xml and /blog/sitemap.xml are served by Next (posts are live);
# /sitemap.xml is the static index pointing at them. A non-200 here usually
# means nginx shadows the path with a file-only location.
for path in /blog/ /blog/feed.xml /blog/sitemap.xml /sitemap.xml /sitemap-pages.xml; do
  code="$(curl -s -o /dev/null -w '%{http_code}' --max-time 20 -A 'Mozilla/5.0' "$PUBLIC_BASE_URL$path")"
  printf '  %s %s\n' "$code" "$path"
  [[ "$code" == "200" ]] || { echo "expected 200 for $path" >&2; exit 1; }
done
curl -fsSL --max-time 20 -A 'Mozilla/5.0' "$PUBLIC_BASE_URL/blog/feed.xml" | grep -q '<rss'
curl -fsSL --max-time 20 -A 'Mozilla/5.0' "$PUBLIC_BASE_URL/sitemap.xml" | grep -q 'blog/sitemap.xml'

log "Verifying single rolling backup"
ssh -i "$SSH_KEY" -o BatchMode=yes "$SERVER_USER@$SERVER_HOST" \
  "test -f '$BACKUP_FILE' && count=\$(find \"\$(dirname '$BACKUP_FILE')\" -maxdepth 1 -type f -name '$(basename "$BACKUP_FILE")' | wc -l) && test \"\$count\" -eq 1 && printf '%s\n' '$BACKUP_FILE'"

log "Deployment complete: $PUBLIC_BASE_URL"
