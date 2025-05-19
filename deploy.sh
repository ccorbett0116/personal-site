#!/bin/sh

LOCKFILE="/tmp/deploy.lock"
REPO_DIR="/srv/personal-site"
TMP_DIR="/srv/personal-site-tmp"
NODE_CACHE_DIR="/srv/personal-site-node-cache"
REPO_URL="git@github.com:ccorbett0116/personal-site.git"
CURRENT_COMMIT_FILE="$REPO_DIR/.deployed-commit"
CURRENT_LOCK_HASH_FILE="$REPO_DIR/.deployed-lockhash"

# Lock
if [ -e "$LOCKFILE" ]; then
    if ! pgrep -f deploy.sh > /dev/null; then
        echo "[DEPLOY] Stale lockfile found — removing."
        rm -f "$LOCKFILE"
    else
        echo "[DEPLOY] Already running. Exiting."
        exit 1
    fi
fi
trap 'rm -f "$LOCKFILE"' EXIT
touch "$LOCKFILE"

# Clone once if needed
if [ ! -d "$REPO_DIR/.git" ]; then
    echo "[DEPLOY] Cloning repo for first time..."
    git clone "$REPO_URL" "$REPO_DIR" || exit 1
fi

cd "$REPO_DIR" || exit 1

# Fetch and reset
echo "[DEPLOY] Fetching latest code..."
git fetch origin main || exit 1
git reset --hard origin/main || exit 1

LATEST_COMMIT=$(git rev-parse HEAD)

# Skip if already deployed
if [ -f "$CURRENT_COMMIT_FILE" ] && [ "$LATEST_COMMIT" = "$(cat "$CURRENT_COMMIT_FILE")" ]; then
    echo "[DEPLOY] No changes since last deploy ($LATEST_COMMIT). Skipping."
    exit 0
fi

# Prepare staging dir
echo "[DEPLOY] Preparing temp staging directory..."
rm -rf "$TMP_DIR"
cp -r "$REPO_DIR" "$TMP_DIR"
cd "$TMP_DIR" || exit 1

# Check lockfile hash
LOCK_HASH=$(sha256sum pnpm-lock.yaml | awk '{print $1}')
NEED_INSTALL=true
if [ -f "$CURRENT_LOCK_HASH_FILE" ] && [ "$LOCK_HASH" = "$(cat "$CURRENT_LOCK_HASH_FILE")" ]; then
    echo "[DEPLOY] Lockfile unchanged — skipping pnpm install"
    NEED_INSTALL=false
fi

# Restore node_modules from cache if needed
if $NEED_INSTALL && [ -d "$NODE_CACHE_DIR" ]; then
    echo "[DEPLOY] Restoring node_modules cache"
    cp -r "$NODE_CACHE_DIR" "$TMP_DIR/node_modules"
fi

# Install dependencies
if $NEED_INSTALL; then
    echo "[DEPLOY] Installing dependencies with pnpm..."
    pnpm install --frozen-lockfile || exit 1
    echo "$LOCK_HASH" > "$CURRENT_LOCK_HASH_FILE"
    cp -r "$TMP_DIR/node_modules" "$NODE_CACHE_DIR"
fi

# Build safely
echo "[DEPLOY] Building project..."
pnpm run build || exit 1

# Deploy to live dir
echo "[DEPLOY] Deploying to live directory..."
rsync -a --delete "$TMP_DIR"/ "$REPO_DIR"/
echo "$LATEST_COMMIT" > "$CURRENT_COMMIT_FILE"

cd "$REPO_DIR"

echo "[DEPLOY] Reloading PM2..."
pm2 reload personal-site || pm2 start pnpm --name personal-site -- start

echo "[DEPLOY] Cleaning up..."
rm -rf "$TMP_DIR"

echo "[DEPLOY] ✅ Done"
