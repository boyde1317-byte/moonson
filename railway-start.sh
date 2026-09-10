#!/bin/bash
# ── Railway startup script ──
# All config is driven by environment variables — no config.json needed.
# Set your env vars in the Railway dashboard (or .env file for local dev).

set -e

echo "[railway] Starting Moonson..."

# ── Ensure directories exist ──
mkdir -p /app/state /app/database

# ── Check required env var ──
if [ -z "$BOT_NUMBER" ]; then
    echo "[railway] ERROR: BOT_NUMBER is not set!"
    echo "[railway] Set it in the Railway Variables tab."
    exit 1
fi

echo "[railway] Bot number: $BOT_NUMBER"
echo "[railway] Launching Moonson..."
exec node index.js
