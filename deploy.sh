#!/bin/sh

LOCKFILE="/tmp/deploy.lock"
REPO_DIR="/srv/personal-site"
TMP_DIR="/srv/personal-site-tmp"
REPO="git@github.com:ccorbett0116/personal-site.git"
CURRENT_COMMIT_FILE="$REPO_DIR/.deployed-commit"
CURRENT_LOCK_HASH_FILE="$REPO_DIR/.deployed-lockhash"

# Lock
if [ -e "$LOCKFILE" ]; then
    if ! pgrep -f deploy.sh > /dev/null; then
        echo "[DEPLOY] Stale lockfile found — removing."
        rm -f "$LOCKFILE"
    else
        echo "[DEPLOY] Already running, exiting."
        exit 1
    fi
fi
trap 'rm -f "$LOCKFILE"' EXIT
touch "$LOCKFILE"

echo "[DEPLOY] Cloning repo..."
rm -rf "$TMP_DIR"
git clone --depth=1 "$REPO" "$TMP_DIR" || exit 1

cd "$TMP_DIR" || exit 1
LATEST_COMMIT=$(git rev-parse HEAD)

# Exit early if commit hasn't changed
if [ -f "$CURRENT_COMMIT_FILE" ] && [ "$LATEST_COMMIT" = "$(cat "$CURRENT_COMMIT_FILE")" ]; then
    echo "[DEPLOY] No changes since last deploy ($LATEST_COMMIT). Skipping."
    exit 0
fi

# Check if dependencies changed
LOCK_HASH=$(sha256sum package-lock.json | awk '{ print $1 }')
NEED_INSTALL=true
if [ -f "$CURRENT_LOCK_HASH_FILE" ] && [ "$LOCK_HASH" = "$(cat "$CURRENT_LOCK_HASH_FILE")" ]; then
    echo "[DEPLOY] Dependencies unchanged, skipping npm ci"
    NEED_INSTALL=false
fi

# Copy existing node_modules if possible
if $NEED_INSTALL && [ -d "$REPO_DIR/node_modules" ]; then
    echo "[DEPLOY] Copying node_modules cache"
    cp -r "$REPO_DIR/node_modules" "$TMP_DIR/node_modules"
fi

# Install only if needed
if $NEED_INSTALL; then
    echo "[DEPLOY] Installing dependencies..."
    npm ci --prefer-offline --no-audit || npm install || exit 1
    echo "$LOCK_HASH" > "$CURRENT_LOCK_HASH_FILE"
fi

echo "[DEPLOY] Building project..."
npm run build || exit 1

echo "[DEPLOY] Deploying to live directory..."
rsync -a --delete "$TMP_DIR"/ "$REPO_DIR"/

echo "$LATEST_COMMIT" > "$CURRENT_COMMIT_FILE"

cd "$REPO_DIR"

echo "[DEPLOY] Reloading PM2..."
pm2 reload personal-site || pm2 start npm --name personal-site -- start

echo "[DEPLOY] Cleaning up temp..."
rm -rf "$TMP_DIR"

echo "[DEPLOY] ✅ Done"
