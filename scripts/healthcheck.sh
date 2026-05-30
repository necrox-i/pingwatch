#!/bin/bash
set -euo pipefail

# ── Colours ───────────────────────────────────────────────────────────────────
RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'
CYAN='\033[0;36m'; BOLD='\033[1m'; RESET='\033[0m'

BACKEND_URL="${BACKEND_URL:-http://localhost:5000}"
FRONTEND_URL="${FRONTEND_URL:-http://localhost:3000}"

FAILED=0

check() {
  local name="$1" url="$2"
  local result
  result=$(curl -o /dev/null -s -w "%{http_code} %{time_total}" --max-time 5 "$url" || echo "000 0")

  local code time
  code=$(echo "$result" | awk '{print $1}')
  time=$(echo "$result" | awk '{print $2}')
  local ms
  ms=$(echo "$time * 1000" | bc | xargs printf "%.0f")

  if [[ "$code" =~ ^2 ]]; then
    echo -e "  ${GREEN}✓${RESET} ${BOLD}${name}${RESET} — ${code} in ${ms}ms"
  else
    echo -e "  ${RED}✗${RESET} ${BOLD}${name}${RESET} — ${code} (${url})"
    FAILED=1
  fi
}

echo -e "\n${CYAN}${BOLD}PingWatch Health Check${RESET}"
echo "────────────────────────────────"

check "Backend  /health" "${BACKEND_URL}/health"
check "Frontend /"       "${FRONTEND_URL}/"

# Backend detail
echo ""
echo -e "${CYAN}Backend status:${RESET}"
curl -s "${BACKEND_URL}/health" | sed 's/,/\n/g; s/[{}]//g' | sed 's/"//g' | sed 's/^/  /'

echo "────────────────────────────────"

if [[ $FAILED -eq 0 ]]; then
  echo -e "${GREEN}All checks passed.${RESET}\n"
  exit 0
else
  echo -e "${RED}One or more checks failed.${RESET}\n"
  exit 1
fi