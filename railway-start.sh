#!/bin/bash
# ── Railway startup script ──
# Creates config.json from config.example.json if missing
# Secrets and per-deployment values come from environment variables (.env / Railway vars)
# Environment variables override config.json at runtime (see index.js)

set -e

echo "[railway] Starting Moonson deployment..."

# ── Ensure directories exist ──
mkdir -p /app/state /app/database

# ── Create config.json from example if missing ──
if [ ! -f /app/config.json ]; then
    echo "[railway] Creating config.json from config.example.json..."
    cp /app/config.example.json /app/config.json
    echo "[railway] Safe defaults loaded. Override with env vars: BOT_NUMBER, OWNER_NUMBER, GROUP_LINK, CHANNEL_LINK, PTERO_PANEL_URL, PTERO_API_KEY"
fi

# ── Start the bot ──
echo "[railway] Launching Moonson..."
exec node index.js
