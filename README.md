# 🤖 Robo-Face

Animated character display system for Raspberry Pi with small screens. Features an interactive robo-face that reacts to events with smooth, expressive animations.

## Features

- **7 Emotional States**: Idle, Happy, Thinking, Alert, Sad, Surprised, Sleeping
- **Real-time Animations**: Smooth 30fps canvas-based rendering
- **Event-driven**: Responds to WebSocket, REST API, and MQTT events
- **Optimized for RPi**: Low resource usage, hardware-accelerated
- **Auto-start Kiosk**: Boots directly into full-screen display
- **Easy Maintenance**: Web-based architecture, simple deployment

## Quick Start

### Development

```bash
# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Start development server
npm start

# Open browser
open http://localhost:3000
```

### Raspberry Pi Deployment

```bash
# Clone repository
git clone <repo-url>
cd robo-face

# Run installation script
chmod +x deployment/install.sh
./deployment/install.sh

# Reboot
sudo reboot
```

## API Usage

### Trigger Emotions

```bash
# REST API
curl -X POST http://localhost:3000/api/event \
  -H "Content-Type: application/json" \
  -d '{"type":"emotion","value":"happy","duration":5000}'

# Available emotions: idle, happy, thinking, alert, sad, surprised, sleeping
```

### WebSocket

```javascript
const ws = new WebSocket('ws://localhost:3000');
ws.send(JSON.stringify({
  type: 'emotion',
  value: 'happy',
  duration: 3000
}));
```

## Project Structure

```
robo-face/
├── frontend/           # HTML5 Canvas frontend
│   ├── index.html      # Main display page
│   ├── css/            # Styles
│   └── js/             # JavaScript modules
├── backend/            # Node.js backend
│   ├── server.js       # Express + WebSocket server
│   ├── event-manager.js # Event handling
│   └── config/         # Configuration files
├── deployment/         # Deployment scripts
│   ├── install.sh      # Main installation script
│   ├── systemd/        # Service files
│   └── scripts/        # Helper scripts
└── DEPLOYMENT_PLAN.md  # Detailed deployment guide
```

## Requirements

### Hardware
- Raspberry Pi 3B+ or 4 (recommended)
- 3.5" - 7" display (SPI or HDMI)
- 16GB+ microSD card
- 5V 2.5A+ power supply

### Software
- Raspberry Pi OS (Lite or Desktop)
- Node.js 16+
- Chromium browser

## Documentation

- [Deployment Plan](DEPLOYMENT_PLAN.md) - Comprehensive deployment guide
- [API Documentation](docs/API.md) - API endpoints and usage
- [Event Types](docs/EVENTS.md) - Available event types
- [Animation Guide](docs/ANIMATIONS.md) - Creating custom animations

## Tech Stack

- **Frontend**: Vanilla JavaScript + HTML5 Canvas
- **Backend**: Node.js + Express + WebSocket
- **Display**: Chromium in Kiosk Mode
- **Services**: systemd

## Management Commands

```bash
# Check status
sudo systemctl status robo-face
sudo systemctl status chromium-kiosk

# View logs
sudo journalctl -u robo-face -f

# Restart services
sudo systemctl restart robo-face
sudo systemctl restart chromium-kiosk

# Stop services
sudo systemctl stop robo-face
sudo systemctl stop chromium-kiosk
```

## Performance

- **Target**: 30-60 FPS
- **Memory**: <500MB total
- **CPU**: <50% average on RPi 3B+
- **Boot time**: <30 seconds to display

## Contributing

See [DEPLOYMENT_PLAN.md](DEPLOYMENT_PLAN.md) for development workflow and guidelines.

## License

MIT