#!/bin/bash
# Start Chromium in Kiosk Mode for Robo Face

# Disable screen blanking and power management
xset s off
xset -dpms
xset s noblank

# Hide cursor
unclutter -idle 0 &

# Wait for server to be ready
until curl -s http://localhost:3000/api/health > /dev/null; do
    echo "Waiting for robo-face server..."
    sleep 1
done

echo "Starting Chromium kiosk mode..."

# Start Chromium in kiosk mode
chromium-browser \
    --kiosk \
    --noerrdialogs \
    --disable-infobars \
    --no-first-run \
    --disable-session-crashed-bubble \
    --disable-features=TranslateUI \
    --disable-component-update \
    --disable-background-networking \
    --disable-sync \
    --disable-translate \
    --disable-backing-store-limit \
    --enable-features=OverlayScrollbar \
    --disable-pinch \
    --overscroll-history-navigation=0 \
    --enable-accelerated-2d-canvas \
    --enable-gpu-rasterization \
    --force-color-profile=srgb \
    --check-for-update-interval=31536000 \
    "http://localhost:3000?production=true"
