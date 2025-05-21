#!/bin/sh
set -e  # Exit immediately if a command exits with non-zero status
LOCKFILE="/tmp/deploy.lock"
LIVE_DIR="/srv/personal-site"
TMP_DIR="/srv/personal-site-tmp"
REPO="git@github.com:ccorbett0116/personal-site.git"
CURRENT_COMMIT_FILE="$LIVE_DIR/.deployed-commit"
PACKAGE_HASH_FILE="$LIVE_DIR/.package-hash"

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

# Calculate hash of package.json and package-lock.json
PACKAGE_HASH=$(md5sum package.json package-lock.json 2>/dev/null | md5sum | cut -d' ' -f1)
DEPS_CHANGED=0

# Check if dependencies have changed or if this is first deploy
if [ ! -f "$PACKAGE_HASH_FILE" ] || [ "$PACKAGE_HASH" != "$(cat "$PACKAGE_HASH_FILE")" ]; then
    echo "[DEPLOY] Dependencies changed, will need to update."
    DEPS_CHANGED=1
else
    echo "[DEPLOY] Dependencies unchanged, will reuse node_modules."
fi

# Properly reuse node_modules if available and dependencies haven't changed
if [ -d "$LIVE_DIR/node_modules" ] && [ "$DEPS_CHANGED" -eq 0 ]; then
    echo "[DEPLOY] Copying existing node_modules..."
    mkdir -p "$TMP_DIR/node_modules"
    cp -al "$LIVE_DIR/node_modules/." "$TMP_DIR/node_modules/"
fi

# Only install dependencies if they've changed
if [ "$DEPS_CHANGED" -eq 1 ]; then
    echo "[DEPLOY] Installing dependencies using npm ci..."
    if npm ci --prefer-offline --no-audit; then
        echo "[DEPLOY] Dependencies installed successfully."
    else
        echo "[DEPLOY] npm ci failed, attempting fallback with npm install..."
        npm install || exit 1
    fi
    
    # Store new package hash for future reference
    echo "$PACKAGE_HASH" > "$TMP_DIR/.package-hash"
fi

echo "[DEPLOY] Building project..."
npm run build || exit 1

echo "[DEPLOY] Preparing to swap into live directory..."
# Create live directory if it doesn't exist
if [ ! -d "$LIVE_DIR" ]; then
    mkdir -p "$LIVE_DIR"
fi

# Move the built project to live directory with rsync
# Keep node_modules from being deleted
echo "[DEPLOY] Syncing to live directory..."
rsync -a --delete --exclude='node_modules' "$TMP_DIR/" "$LIVE_DIR/"

# Handle node_modules separately if dependencies changed
if [ "$DEPS_CHANGED" -eq 1 ]; then
    echo "[DEPLOY] Updating live node_modules..."
    # Save and restore any .bin symlinks that might get corrupted on partial copy
    if [ -d "$LIVE_DIR/node_modules/.bin" ]; then
        rm -rf "$LIVE_DIR/node_modules/.bin"
    fi
    
    # Use rsync for node_modules to efficiently copy only changed files
    rsync -a "$TMP_DIR/node_modules/" "$LIVE_DIR/node_modules/"
    
    # Copy the new package hash file
    cp "$TMP_DIR/.package-hash" "$PACKAGE_HASH_FILE"
fi

# Record the deployed commit
echo "$LATEST_COMMIT" > "$CURRENT_COMMIT_FILE"

echo "[DEPLOY] Reloading PM2..."
cd "$LIVE_DIR"
if pm2 list | grep -q "personal-site"; then
    pm2 reload personal-site
else
    pm2 start npm --name personal-site -- start
fi

echo "[DEPLOY] Cleanup..."
rm -rf "$TMP_DIR"
echo "[DEPLOY] ✅ Done"
