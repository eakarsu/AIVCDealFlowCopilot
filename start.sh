#!/usr/bin/env bash
set -euo pipefail
project_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
[[ -f "$project_dir/.env" ]] || { echo 'Missing .env; copy .env.example and provide real secrets.' >&2; exit 1; }
set -a
source "$project_dir/.env"
set +a
[[ -d "$project_dir/backend/node_modules" && -d "$project_dir/frontend/node_modules" ]] || { echo 'Dependencies are missing; install them explicitly before starting.' >&2; exit 1; }
BACKEND_PORT="${BACKEND_PORT:?BACKEND_PORT is required}"; FRONTEND_PORT="${FRONTEND_PORT:?FRONTEND_PORT is required}"
[[ -n "${DATABASE_URL:-}" ]] || { echo 'DATABASE_URL is required.' >&2; exit 1; }
JWT_SECRET_VALUE="${JWT_SECRET:-}"; [[ "${#JWT_SECRET_VALUE}" -ge 32 ]] || { echo 'JWT_SECRET must contain at least 32 characters.' >&2; exit 1; }
if [[ -z "${ALLOWED_ORIGINS:-}" ]]; then if [[ "${NODE_ENV:-}" == test ]]; then export ALLOWED_ORIGINS="http://127.0.0.1:$FRONTEND_PORT"; else echo 'ALLOWED_ORIGINS is required.' >&2; exit 1; fi; fi
for port in "$BACKEND_PORT" "$FRONTEND_PORT"; do if lsof -nP -iTCP:"$port" -sTCP:LISTEN >/dev/null 2>&1; then echo "Port $port is occupied; no process was terminated." >&2; exit 1; fi; done
(cd "$project_dir/backend" && BACKEND_PORT="$BACKEND_PORT" npm start) & backend_pid=$!
(cd "$project_dir/frontend" && PORT="$FRONTEND_PORT" REACT_APP_API_URL="http://127.0.0.1:$BACKEND_PORT/api" BROWSER=none npm start) & frontend_pid=$!
cleanup(){ kill "$backend_pid" "$frontend_pid" 2>/dev/null || true; wait "$backend_pid" "$frontend_pid" 2>/dev/null || true; }
trap cleanup INT TERM EXIT
wait "$backend_pid" "$frontend_pid"
