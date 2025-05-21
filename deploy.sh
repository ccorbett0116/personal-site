#!/bin/sh
set -e  # Exit immediately if a command exits with non-zero status
LOCKFILE="/tmp/deploy.lock"
LIVE_DIR="/srv/personal-site"
TMP_DIR="/srv/personal-site-tmp"
REPO="git@github.com:ccorbett0116/personal-site.git"
CURRENT_COMMIT_FILE="$LIVE_DIR/.deployed-commit"
PACKAGE_HASH_FILE="$LIVE_DIR/.package-hash"

# Function to print timestamped logs
log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] [DEPLOY] $1"
}

# Prevent overlapping runs
if [ -e "$LOCKFILE" ]; then
    if ! pgrep -f deploy.sh > /dev/null; then
        log "Stale lockfile found — removing."
        rm -f "$LOCKFILE"
    else
        log "Already running, exiting."
        exit 1
    fi
fi
trap 'rm -f "$LOCKFILE"' EXIT
touch "$LOCKFILE"

mkdir -p /srv
log "Cloning repo to temp dir..."
rm -rf "$TMP_DIR"
git clone "$REPO" "$TMP_DIR" || exit 1
cd "$TMP_DIR" || exit 1
LATEST_COMMIT=$(git rev-parse HEAD)

# Skip if no changes
if [ -f "$CURRENT_COMMIT_FILE" ] && [ "$LATEST_COMMIT" = "$(cat "$CURRENT_COMMIT_FILE")" ]; then
    log "No changes since last deploy ($LATEST_COMMIT). Skipping."
    exit 0
fi

# Calculate hash of package.json and package-lock.json
PACKAGE_HASH=$(md5sum package.json package-lock.json 2>/dev/null | md5sum | cut -d' ' -f1)
DEPS_CHANGED=1

# Check if dependencies have changed
if [ -f "$PACKAGE_HASH_FILE" ] && [ "$PACKAGE_HASH" = "$(cat "$PACKAGE_HASH_FILE")" ]; then
    log "Dependencies unchanged, skipping npm install."
    DEPS_CHANGED=0
fi

# Reuse node_modules if available
if [ -d "$LIVE_DIR/node_modules" ]; then
    log "Reusing existing node_modules..."
    mkdir -p "$TMP_DIR/node_modules"
    ln -sf "$LIVE_DIR/node_modules/"* "$TMP_DIR/node_modules/"
fi

# Only install dependencies if they've changed
if [ "$DEPS_CHANGED" -eq 1 ]; then
    log "Dependencies changed. Installing using npm ci..."
    if npm ci --prefer-offline --no-audit; then
        log "Dependencies installed successfully."
    else
        log "npm ci failed, attempting fallback with npm install..."
        npm install || exit 1
    fi
    
    # Store package hash for future reference
    echo "$PACKAGE_HASH" > "$TMP_DIR/.package-hash"
fi

log "Building project..."
npm run build || exit 1

log "Swapping into live directory..."
# Only sync necessary files, not node_modules
if [ ! -d "$LIVE_DIR" ]; then
    mkdir -p "$LIVE_DIR"
fi

# Preserve node_modules directory
if [ ! -d "$LIVE_DIR/node_modules" ] && [ -d "$TMP_DIR/node_modules" ]; then
    mkdir -p "$LIVE_DIR/node_modules"
    cp -a "$TMP_DIR/node_modules/." "$LIVE_DIR/node_modules/"
fi

# Sync everything except node_modules
rsync -a --delete --exclude='node_modules' "$TMP_DIR/" "$LIVE_DIR/"

# Copy .package-hash if it exists
if [ -f "$TMP_DIR/.package-hash" ]; then
    cp "$TMP_DIR/.package-hash" "$PACKAGE_HASH_FILE"
fi

echo "$LATEST_COMMIT" > "$CURRENT_COMMIT_FILE"

log "Reloading PM2..."
cd "$LIVE_DIR"
if pm2 list | grep -q "personal-site"; then
    pm2 reload personal-site
else
    pm2 start npm --name personal-site -- start
fi

log "Cleanup..."
rm -rf "$TMP_DIR"
log "✅ Done"
