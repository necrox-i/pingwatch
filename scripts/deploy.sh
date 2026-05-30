#!/bin/bash
set -euo pipefail

# ── Colours ───────────────────────────────────────────────────────────────────
RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'
CYAN='\033[0;36m'; BOLD='\033[1m'; RESET='\033[0m'

info()    { echo -e "${CYAN}[deploy]${RESET} $*"; }
success() { echo -e "${GREEN}[deploy]${RESET} $*"; }
warn()    { echo -e "${YELLOW}[deploy]${RESET} $*"; }
error()   { echo -e "${RED}[deploy]${RESET} $*" >&2; }

# ── Root check ────────────────────────────────────────────────────────────────
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(dirname "$SCRIPT_DIR")"
cd "$ROOT_DIR"

# ── .env check ────────────────────────────────────────────────────────────────
if [[ ! -f .env ]]; then
  error ".env not found. Copy .env.example and fill in values."
  exit 1
fi

# ── Deploy ────────────────────────────────────────────────────────────────────
echo -e "\n${BOLD}PingWatch Deploy${RESET}"
echo "────────────────────────────────"

info "Building images..."
docker compose build --no-cache

info "Restarting stack..."
docker compose up -d --build --remove-orphans

info "Waiting for backend health check..."
RETRIES=10
until docker compose exec backend wget -qO- http://localhost:5000/health &>/dev/null; do
  RETRIES=$((RETRIES - 1))
  if [[ $RETRIES -eq 0 ]]; then
    error "Backend did not become healthy in time."
    docker compose logs backend --tail=20
    exit 1
  fi
  warn "Not ready yet — retrying in 3s... ($RETRIES attempts left)"
  sleep 3
done

echo "────────────────────────────────"
success "Deploy complete."
success "Frontend → http://localhost:3000"
success "Backend  → http://localhost:5000/health"