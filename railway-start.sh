#!/bin/bash
# ── Railway startup script ──
# Creates config.json from CONFIG_JSON env var, or falls back to config.example.json
# Also ensures state/ and database/ directories exist

set -e

echo "[railway] Starting Moonson deployment..."

# ── Ensure directories exist ──
mkdir -p /app/state /app/database

# ── Create config.json ──
if [ -n "$CONFIG_JSON" ]; then
    echo "[railway] Creating config.json from CONFIG_JSON env var..."
    echo "$CONFIG_JSON" > /app/config.json
elif [ -f /app/config.json ]; then
    echo "[railway] Using existing config.json..."
else
    echo "[railway] No CONFIG_JSON set — copying from config.example.json..."
    cp /app/config.example.json /app/config.json
    echo "[railway] WARNING: Using example config. Set CONFIG_JSON env var for production."
fi

# ── Start the bot ──
echo "[railway] Launching Moonson..."
exec node index.js
