#!/bin/sh

LOCKFILE="/tmp/deploy.lock"
LIVE_DIR="/srv/personal-site"
TMP_DIR="/srv/personal-site-tmp"
REPO="git@github.com:ccorbett0116/personal-site.git"
CURRENT_COMMIT_FILE="$LIVE_DIR/.deployed-commit"

# Prevent overlapping runs
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

mkdir -p /srv

echo "[DEPLOY] Cloning repo to temp dir..."
rm -rf "$TMP_DIR"
git clone "$REPO" "$TMP_DIR" || exit 1

cd "$TMP_DIR" || exit 1

LATEST_COMMIT=$(git rev-parse HEAD)

# Skip if no changes
if [ -f "$CURRENT_COMMIT_FILE" ] && [ "$LATEST_COMMIT" = "$(cat "$CURRENT_COMMIT_FILE")" ]; then
    echo "[DEPLOY] No changes since last deploy ($LATEST_COMMIT). Skipping."
    exit 0
fi

echo "[DEPLOY] Reusing node_modules if available..."
if [ -d "$LIVE_DIR/node_modules" ]; then
    cp -r "$LIVE_DIR/node_modules" "$TMP_DIR/node_modules"
fi

echo "[DEPLOY] Installing dependencies using npm ci..."
if npm ci --prefer-offline --no-audit; then
    echo "[DEPLOY] Dependencies installed successfully."
else
    echo "[DEPLOY] npm ci failed, attempting fallback with npm install..."
    npm install || exit 1
fi

echo "[DEPLOY] Building project..."
npm run build || exit 1

echo "[DEPLOY] Swapping into live directory..."
rsync -a --delete "$TMP_DIR"/ "$LIVE_DIR"/

echo "$LATEST_COMMIT" > "$CURRENT_COMMIT_FILE"

cd "$LIVE_DIR"

echo "[DEPLOY] Reloading PM2..."
pm2 reload personal-site || pm2 start npm --name personal-site -- start

echo "[DEPLOY] Cleanup..."
rm -rf "$TMP_DIR"

echo "[DEPLOY] ✅ Done"
