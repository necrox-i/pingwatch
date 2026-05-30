#!/bin/bash
set -euo pipefail

# ── Colours ───────────────────────────────────────────────────────────────────
RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'
CYAN='\033[0;36m'; BOLD='\033[1m'; RESET='\033[0m'

info()    { echo -e "${CYAN}[cleanup]${RESET} $*"; }
success() { echo -e "${GREEN}[cleanup]${RESET} $*"; }
warn()    { echo -e "${YELLOW}[cleanup]${RESET} $*"; }

echo -e "\n${BOLD}PingWatch Cleanup${RESET}"
echo "────────────────────────────────"

# Disk usage before
BEFORE=$(docker system df --format "{{.Size}}" 2>/dev/null | head -1 || echo "unknown")
info "Disk usage before: ${BEFORE}"

# Stopped containers
info "Removing stopped containers..."
CONTAINERS=$(docker container prune -f --filter "label=com.docker.compose.project=pingwatch" 2>&1)
echo "  $CONTAINERS"

# Dangling images (untagged layers from old builds)
info "Removing dangling images..."
IMAGES=$(docker image prune -f 2>&1)
echo "  $IMAGES"

# Unused networks
info "Removing unused networks..."
NETWORKS=$(docker network prune -f 2>&1)
echo "  $NETWORKS"

# Disk usage after
AFTER=$(docker system df --format "{{.Size}}" 2>/dev/null | head -1 || echo "unknown")
info "Disk usage after:  ${AFTER}"

echo "────────────────────────────────"
success "Cleanup complete."

# Warn if pingwatch containers are still running (don't touch them)
RUNNING=$(docker ps --filter "name=pingwatch" --format "{{.Names}}" | tr '\n' ' ')
if [[ -n "$RUNNING" ]]; then
  warn "Running containers untouched: ${RUNNING}"
fi