#!/bin/bash
# Robo-Face Installation Script for Raspberry Pi

set -e

echo "🤖 Installing Robo-Face on Raspberry Pi..."
echo ""

# Check if running on Raspberry Pi
if ! grep -q "Raspberry Pi" /proc/cpuinfo 2>/dev/null && ! grep -q "BCM" /proc/cpuinfo 2>/dev/null; then
    echo "⚠️  Warning: This doesn't appear to be a Raspberry Pi"
    read -p "Continue anyway? (y/N) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

# Update system
echo "📦 Updating system packages..."
sudo apt update

# Install dependencies
echo "📦 Installing dependencies..."
sudo apt install -y \
    nodejs \
    npm \
    chromium-browser \
    unclutter \
    xdotool \
    x11-xserver-utils \
    git \
    curl

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 16 ]; then
    echo "⚠️  Node.js version is too old. Installing Node.js 18..."
    curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
    sudo apt install -y nodejs
fi

echo "✓ Node.js version: $(node -v)"
echo "✓ NPM version: $(npm -v)"

# Install project dependencies
echo "📦 Installing project dependencies..."
cd /home/pi/robo-face
npm install --production

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    echo "📝 Creating .env file..."
    cp .env.example .env
fi

# Make scripts executable
echo "🔧 Setting up scripts..."
chmod +x deployment/scripts/*.sh

# Install systemd services
echo "🔧 Installing systemd services..."
sudo cp deployment/systemd/robo-face.service /etc/systemd/system/
sudo cp deployment/systemd/chromium-kiosk.service /etc/systemd/system/

# Update service file paths if not in /home/pi
CURRENT_DIR=$(pwd)
if [ "$CURRENT_DIR" != "/home/pi/robo-face" ]; then
    echo "⚠️  Updating service paths to: $CURRENT_DIR"
    sudo sed -i "s|/home/pi/robo-face|$CURRENT_DIR|g" /etc/systemd/system/robo-face.service
    sudo sed -i "s|/home/pi/robo-face|$CURRENT_DIR|g" /etc/systemd/system/chromium-kiosk.service
fi

# Reload systemd
sudo systemctl daemon-reload

# Enable services
echo "🔧 Enabling services..."
sudo systemctl enable robo-face.service
sudo systemctl enable chromium-kiosk.service

# Configure boot to desktop with auto-login
echo "🔧 Configuring auto-login..."
sudo raspi-config nonint do_boot_behaviour B4 2>/dev/null || echo "Note: Auto-login configuration skipped"

# Disable screen blanking in lightdm (if exists)
if [ -f /etc/lightdm/lightdm.conf ]; then
    echo "🔧 Configuring lightdm..."
    sudo bash -c 'cat >> /etc/lightdm/lightdm.conf <<EOF

[Seat:*]
xserver-command=X -s 0 -dpms
EOF'
fi

# Configure GPU memory (if not already set)
if ! grep -q "gpu_mem=256" /boot/config.txt; then
    echo "🔧 Configuring GPU memory..."
    echo "gpu_mem=256" | sudo tee -a /boot/config.txt
fi

# Start services
echo "🚀 Starting services..."
sudo systemctl start robo-face.service

# Wait a moment
sleep 2

# Check service status
if systemctl is-active --quiet robo-face.service; then
    echo "✓ Robo-Face backend is running"
else
    echo "⚠️  Robo-Face backend failed to start"
    sudo systemctl status robo-face.service
fi

echo ""
echo "✅ Installation complete!"
echo ""
echo "📋 Next steps:"
echo "   1. Reboot your Raspberry Pi: sudo reboot"
echo "   2. The system will auto-start in kiosk mode"
echo ""
echo "🔧 Useful commands:"
echo "   Check status:     sudo systemctl status robo-face"
echo "   View logs:        sudo journalctl -u robo-face -f"
echo "   Restart backend:  sudo systemctl restart robo-face"
echo "   Restart display:  sudo systemctl restart chromium-kiosk"
echo "   Test in browser:  http://localhost:3000"
echo ""
echo "📡 API endpoints:"
echo "   Health check:     curl http://localhost:3000/api/health"
echo "   Trigger emotion:  curl -X POST http://localhost:3000/api/event \\"
echo "                          -H 'Content-Type: application/json' \\"
echo "                          -d '{\"type\":\"emotion\",\"value\":\"happy\"}'"
echo ""
