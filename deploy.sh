#!/bin/sh
set -e

# Configuration
LOCKFILE="/tmp/deploy.lock"
LIVE_DIR="/srv/personal-site"
TMP_DIR="/srv/personal-site-tmp"
REPO="git@github.com:ccorbett0116/personal-site.git"
CURRENT_COMMIT_FILE="$LIVE_DIR/.deployed-commit"
PACKAGE_HASH_FILE="$LIVE_DIR/.package-hash"

# Logging function with timestamps
log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1"
}

# Time tracking
start_time=$(date +%s)

# Prevent overlapping runs
if [ -e "$LOCKFILE" ]; then
    if ! pgrep -f deploy.sh > /dev/null; then
        log "Stale lockfile found - removing"
        rm -f "$LOCKFILE"
    else
        log "Deployment already running - exiting"
        exit 1
    fi
fi
trap 'rm -f "$LOCKFILE"; log "Lockfile removed"' EXIT
touch "$LOCKFILE"

mkdir -p /srv

log "Starting deployment process"

# Clone repository
log "Cloning repository to temporary directory"
rm -rf "$TMP_DIR"
git clone "$REPO" "$TMP_DIR" || { log "Git clone failed"; exit 1; }
cd "$TMP_DIR" || { log "Failed to enter temp directory"; exit 1; }

LATEST_COMMIT=$(git rev-parse HEAD)
log "Latest commit: $LATEST_COMMIT"

# Check for changes
if [ -f "$CURRENT_COMMIT_FILE" ] && [ "$LATEST_COMMIT" = "$(cat "$CURRENT_COMMIT_FILE")" ]; then
    log "No changes since last deploy - exiting"
    exit 0
fi

# Dependency management
log "Checking for dependency changes"
PACKAGE_HASH=$(md5sum package.json package-lock.json 2>/dev/null | md5sum | cut -d' ' -f1)
echo "$PACKAGE_HASH" > "$TMP_DIR/.package-hash"  # Store new hash immediately

DEPS_CHANGED=1
if [ -f "$PACKAGE_HASH_FILE" ]; then
    if [ "$PACKAGE_HASH" = "$(cat "$PACKAGE_HASH_FILE")" ]; then
        DEPS_CHANGED=0
        log "Dependencies unchanged - will reuse node_modules"
    else
        log "Dependencies changed - will update"
    fi
else
    log "No previous package hash found - fresh install required"
fi

# Reuse node_modules if possible
if [ -d "$LIVE_DIR/node_modules" ] && [ "$DEPS_CHANGED" -eq 0 ]; then
    log "Copying existing node_modules"
    mkdir -p "$TMP_DIR/node_modules"
    cp -al "$LIVE_DIR/node_modules/." "$TMP_DIR/node_modules/"
fi

# Install dependencies if needed
if [ "$DEPS_CHANGED" -eq 1 ]; then
    log "Installing dependencies"
    INSTALL_START=$(date +%s)
    
    if npm ci --prefer-offline --no-audit; then
        INSTALL_TIME=$(( $(date +%s) - $INSTALL_START ))
        log "Dependencies installed successfully in ${INSTALL_TIME}s"
    else
        log "npm ci failed - attempting fallback with npm install"
        npm install || { log "Dependency installation failed"; exit 1; }
        INSTALL_TIME=$(( $(date +%s) - $INSTALL_START ))
        log "Fallback installation completed in ${INSTALL_TIME}s"
    fi
fi

# Build project
log "Building project"
BUILD_START=$(date +%s)
npm run build || { log "Build failed"; exit 1; }
BUILD_TIME=$(( $(date +%s) - $BUILD_START ))
log "Build completed in ${BUILD_TIME}s"

# Deploy to live directory
log "Preparing live directory"
mkdir -p "$LIVE_DIR"

log "Syncing files to live directory"
RSYNC_START=$(date +%s)
rsync -a --delete --exclude='node_modules' "$TMP_DIR/" "$LIVE_DIR/"
RSYNC_TIME=$(( $(date +%s) - $RSYNC_START ))
log "File sync completed in ${RSYNC_TIME}s"

# Update node_modules if needed
if [ "$DEPS_CHANGED" -eq 1 ]; then
    log "Updating live node_modules"
    MODULES_START=$(date +%s)
    
    if [ -d "$LIVE_DIR/node_modules/.bin" ]; then
        rm -rf "$LIVE_DIR/node_modules/.bin"
    fi
    
    rsync -a "$TMP_DIR/node_modules/" "$LIVE_DIR/node_modules/"
    cp "$TMP_DIR/.package-hash" "$PACKAGE_HASH_FILE"
    
    MODULES_TIME=$(( $(date +%s) - $MODULES_START ))
    log "node_modules updated in ${MODULES_TIME}s"
fi

# Update deployed commit
echo "$LATEST_COMMIT" > "$CURRENT_COMMIT_FILE"
log "Deployed commit updated to $LATEST_COMMIT"

# PM2 process management
log "Managing PM2 process"
cd "$LIVE_DIR"
if pm2 list | grep -q "personal-site"; then
    log "Reloading existing PM2 process"
    pm2 reload personal-site
else
    log "Starting new PM2 process"
    pm2 start npm --name personal-site -- start
fi

# Cleanup
log "Cleaning up temporary files"
rm -rf "$TMP_DIR"

# Final stats
end_time=$(date +%s)
total_time=$(( end_time - start_time ))
log "✅ Deployment completed successfully in ${total_time} seconds"
