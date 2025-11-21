# Animated Character Faces - Raspberry Pi Deployment Plan

## 1. Project Overview

### Vision
Deploy an interactive animated character display system on Raspberry Pi with a small screen, starting with a "robo-face" character that reacts to events with smooth animations.

### Key Requirements
- Run on Raspberry Pi (3B+ or 4 recommended)
- Display on small screen (3.5" - 7" touchscreen)
- Animated character faces with emotional reactions
- Event-driven animations
- Low resource consumption
- Easy maintenance and extensibility
- Support for multiple character types (future)

---

## 2. Technology Stack

### Recommended Architecture: Web-Based Application

**Primary Stack:**
```
Frontend: Vanilla JavaScript + HTML5 Canvas
Backend: Node.js (Express)
Display: Chromium in Kiosk Mode
Communication: WebSocket + MQTT (optional)
```

### Technology Rationale

#### Frontend
- **HTML5 Canvas 2D API**
  - Excellent performance on RPi
  - Hardware-accelerated rendering
  - Easy to implement sprite-based animations
  - Good balance of power and simplicity
  - **Alternative**: WebGL for more complex 3D effects (if RPi 4)

- **Vanilla JavaScript (or Preact)**
  - Minimal overhead
  - Fast load times
  - Direct DOM/Canvas control
  - Avoid React/Vue overhead on limited resources

#### Backend
- **Node.js + Express**
  - Lightweight and fast
  - Great ecosystem for IoT
  - Easy WebSocket integration
  - Simple REST API
  - **Alternative**: Python + Flask (if integrating with GPIO/sensors)

#### Animation Strategy
1. **Sprite Sheet Animations** (Primary)
   - Pre-rendered frames
   - Very performant
   - Easy to create and update

2. **Canvas-based Vector Animations** (Secondary)
   - Programmatic animations
   - Smaller file sizes
   - Good for simple geometric shapes

3. **Lottie JSON Animations** (Optional)
   - Complex animations from After Effects
   - Use lightweight lottie-web player
   - Only if RPi 4 with sufficient RAM

#### Communication
- **WebSocket** for real-time events
- **MQTT** (Mosquitto) for IoT integration
- **REST API** for external triggers
- **GPIO Integration** (via Node.js gpio library or Python)

#### Display
- **Chromium Browser in Kiosk Mode**
  - Full-screen, no chrome
  - Hardware acceleration enabled
  - Auto-start on boot
  - Reliable and mature

---

## 3. System Architecture

```
┌─────────────────────────────────────────┐
│         Raspberry Pi Device              │
│                                          │
│  ┌────────────────────────────────────┐ │
│  │   Chromium (Kiosk Mode)            │ │
│  │   ┌──────────────────────────────┐ │ │
│  │   │  Frontend Application        │ │ │
│  │   │  - Canvas Renderer           │ │ │
│  │   │  - Animation Engine          │ │ │
│  │   │  - Event Handler             │ │ │
│  │   │  - WebSocket Client          │ │ │
│  │   └──────────────────────────────┘ │ │
│  └────────────────────────────────────┘ │
│           ↕ (WebSocket/HTTP)             │
│  ┌────────────────────────────────────┐ │
│  │   Node.js Backend                  │ │
│  │   - Express Server                 │ │
│  │   - WebSocket Server               │ │
│  │   - Event Manager                  │ │
│  │   - MQTT Client (optional)         │ │
│  │   - GPIO Handler (optional)        │ │
│  └────────────────────────────────────┘ │
│           ↕ (MQTT/GPIO/API)              │
│  ┌────────────────────────────────────┐ │
│  │   External Event Sources           │ │
│  │   - MQTT Broker                    │ │
│  │   - Sensors (GPIO)                 │ │
│  │   - Network APIs                   │ │
│  │   - Timers/Schedulers              │ │
│  └────────────────────────────────────┘ │
└─────────────────────────────────────────┘
```

---

## 4. Character Animation System

### Robo-Face Animation States

#### Core Emotional States
1. **Idle** - Default calm state
2. **Happy** - Positive events
3. **Thinking** - Processing
4. **Alert** - Notifications/warnings
5. **Sad** - Errors/failures
6. **Surprised** - Unexpected events
7. **Sleeping** - Inactive period

#### Animation Components
- Eyes (movement, blinking, size changes)
- Mouth (shapes for emotions)
- Antenna/ears (indicating activity)
- Body glow/color (mood indication)
- Particle effects (reactions)

#### Transition System
```javascript
// State machine for smooth transitions
idle → thinking → happy
idle → alert → idle
idle → sleeping (after timeout)
any → surprised → previous_state
```

---

## 5. Project Structure

```
robo-face/
├── frontend/
│   ├── index.html              # Main display page
│   ├── css/
│   │   └── styles.css          # Minimal styling
│   ├── js/
│   │   ├── main.js             # Application entry
│   │   ├── renderer.js         # Canvas rendering
│   │   ├── animator.js         # Animation engine
│   │   ├── character.js        # Character state machine
│   │   └── websocket-client.js # Real-time communication
│   └── assets/
│       ├── sprites/            # Sprite sheets
│       ├── animations/         # Animation configs
│       └── sounds/             # Optional audio feedback
│
├── backend/
│   ├── server.js               # Express + WebSocket server
│   ├── event-manager.js        # Event handling logic
│   ├── mqtt-client.js          # MQTT integration
│   ├── gpio-handler.js         # Hardware integration
│   └── config/
│       └── events.json         # Event-to-animation mapping
│
├── deployment/
│   ├── install.sh              # Setup script
│   ├── systemd/                # Service files
│   │   ├── robo-face.service
│   │   └── chromium-kiosk.service
│   ├── config/
│   │   └── default.env         # Configuration
│   └── scripts/
│       ├── start-kiosk.sh
│       └── setup-autostart.sh
│
├── docs/
│   ├── API.md                  # API documentation
│   ├── EVENTS.md               # Event types
│   └── ANIMATIONS.md           # Animation guide
│
├── package.json
├── README.md
└── DEPLOYMENT_PLAN.md          # This file
```

---

## 6. Implementation Phases

### Phase 1: Foundation (Week 1)
**Goal:** Basic infrastructure and display

- [ ] Set up project structure
- [ ] Create basic Node.js server with Express
- [ ] Implement WebSocket communication
- [ ] Create HTML5 Canvas display page
- [ ] Implement basic rendering engine
- [ ] Test on Raspberry Pi

**Deliverable:** Static robo-face displayed in Chromium kiosk mode

### Phase 2: Animation Engine (Week 2)
**Goal:** Implement core animation system

- [ ] Design robo-face character sprites/vectors
- [ ] Implement sprite sheet loader
- [ ] Create animation state machine
- [ ] Implement frame-based animation player
- [ ] Add smooth transitions between states
- [ ] Create configuration system for animations

**Deliverable:** Robo-face with 3-4 basic emotions

### Phase 3: Event System (Week 3)
**Goal:** Reactive behavior

- [ ] Implement event manager backend
- [ ] Create event-to-animation mapping
- [ ] Add WebSocket event triggers
- [ ] Implement REST API for external triggers
- [ ] Create event queue and priority system
- [ ] Add animation interruption/queuing logic

**Deliverable:** Face reacts to external events

### Phase 4: Integration & Polish (Week 4)
**Goal:** Production-ready system

- [ ] MQTT integration (optional)
- [ ] GPIO sensor integration (optional)
- [ ] Add sound effects (optional)
- [ ] Performance optimization
- [ ] Create deployment scripts
- [ ] Write documentation
- [ ] Set up auto-start and monitoring

**Deliverable:** Production-ready deployment

### Phase 5: Enhancement (Future)
- [ ] Additional character faces
- [ ] Web-based configuration UI
- [ ] Animation editor
- [ ] Data logging and analytics
- [ ] Voice synthesis integration
- [ ] Camera-based reactions

---

## 7. Raspberry Pi Setup

### Hardware Requirements

**Minimum:**
- Raspberry Pi 3B+
- 16GB microSD card (Class 10)
- 3.5" - 7" display (SPI or HDMI)
- 5V 2.5A power supply

**Recommended:**
- Raspberry Pi 4 (2GB+ RAM)
- 32GB microSD card
- Official 7" touchscreen
- 5V 3A power supply
- Heatsink/fan for continuous operation

### OS Configuration

**Operating System:**
- Raspberry Pi OS Lite (64-bit) for RPi 4
- Raspberry Pi OS Lite (32-bit) for RPi 3B+

**Initial Setup:**
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install required packages
sudo apt install -y \
    chromium-browser \
    unclutter \
    xdotool \
    nodejs \
    npm \
    git

# Install Node.js 18+ (if needed)
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Optional: Install MQTT broker
sudo apt install -y mosquitto mosquitto-clients
```

### Display Configuration

**For Official 7" Touchscreen:**
```bash
# Edit /boot/config.txt
sudo nano /boot/config.txt

# Add/uncomment:
lcd_rotate=2              # Rotate if needed (0,1,2,3)
disable_overscan=1
```

**For HDMI Displays:**
```bash
# Set resolution in /boot/config.txt
hdmi_group=2
hdmi_mode=87
hdmi_cvt=1024 600 60 6 0 0 0  # Custom resolution
```

### Performance Tuning

**GPU Memory:**
```bash
# /boot/config.txt
gpu_mem=256               # Allocate more GPU memory
```

**Chromium Flags:**
```bash
chromium-browser \
  --kiosk \
  --noerrdialogs \
  --disable-infobars \
  --no-first-run \
  --enable-features=OverlayScrollbar \
  --disable-pinch \
  --overscroll-history-navigation=0 \
  --enable-accelerated-2d-canvas \
  --enable-gpu-rasterization \
  --force-color-profile=srgb \
  http://localhost:3000
```

---

## 8. Auto-Start Configuration

### systemd Service for Backend

**File:** `/etc/systemd/system/robo-face.service`
```ini
[Unit]
Description=Robo Face Backend Server
After=network.target

[Service]
Type=simple
User=pi
WorkingDirectory=/home/pi/robo-face
ExecStart=/usr/bin/node backend/server.js
Restart=always
RestartSec=10
Environment=NODE_ENV=production
Environment=PORT=3000

[Install]
WantedBy=multi-user.target
```

### systemd Service for Kiosk Display

**File:** `/etc/systemd/system/chromium-kiosk.service`
```ini
[Unit]
Description=Chromium Kiosk Display
After=robo-face.service
Requires=robo-face.service

[Service]
Type=simple
User=pi
Environment=DISPLAY=:0
Environment=XAUTHORITY=/home/pi/.Xauthority
ExecStart=/home/pi/robo-face/deployment/scripts/start-kiosk.sh
Restart=always
RestartSec=10

[Install]
WantedBy=graphical.target
```

### Enable Services
```bash
sudo systemctl daemon-reload
sudo systemctl enable robo-face.service
sudo systemctl enable chromium-kiosk.service
sudo systemctl start robo-face.service
sudo systemctl start chromium-kiosk.service
```

---

## 9. Event Types & Triggers

### Built-in Event Categories

1. **System Events**
   - `system.boot` - Device starts
   - `system.shutdown` - Device shutting down
   - `system.error` - System error occurred
   - `system.update` - Update available

2. **Time-based Events**
   - `time.hourly` - Every hour
   - `time.morning` - Morning greeting
   - `time.evening` - Evening greeting
   - `time.idle` - No activity detected

3. **Custom Events**
   - `notification.message` - New message received
   - `notification.alert` - Alert/warning
   - `sensor.motion` - Motion detected
   - `sensor.button` - Button pressed
   - `api.trigger` - External API call

### Event API Examples

**REST API:**
```bash
# Trigger happy emotion
curl -X POST http://localhost:3000/api/event \
  -H "Content-Type: application/json" \
  -d '{"type": "emotion", "value": "happy", "duration": 5000}'

# Trigger with custom animation
curl -X POST http://localhost:3000/api/event \
  -H "Content-Type: application/json" \
  -d '{"type": "custom", "animation": "celebration"}'
```

**WebSocket:**
```javascript
const ws = new WebSocket('ws://localhost:3000');
ws.send(JSON.stringify({
  type: 'emotion',
  value: 'thinking',
  duration: 3000
}));
```

**MQTT:**
```bash
mosquitto_pub -t "robo-face/event" \
  -m '{"type": "emotion", "value": "alert"}'
```

---

## 10. Resource Optimization

### Performance Best Practices

1. **Canvas Optimization**
   - Use requestAnimationFrame for smooth 60fps
   - Limit canvas size to display resolution
   - Use offscreen canvas for sprite preparation
   - Implement dirty rectangle rendering (only update changed areas)

2. **Memory Management**
   - Preload and cache sprite sheets
   - Limit animation queue size
   - Clear unused resources
   - Use object pooling for particles

3. **Network Optimization**
   - Use WebSocket for real-time (not polling)
   - Compress assets with gzip
   - Lazy load non-essential resources
   - Cache static assets aggressively

4. **CPU Usage**
   - Throttle animation updates if behind
   - Use CSS transforms when possible (GPU accelerated)
   - Debounce frequent events
   - Sleep/reduce FPS when idle

### Monitoring
```bash
# CPU/Memory monitoring
htop

# Process monitoring
ps aux | grep node
ps aux | grep chromium

# Temperature monitoring
vcgencmd measure_temp

# Check service status
sudo systemctl status robo-face
sudo systemctl status chromium-kiosk
```

---

## 11. Development Workflow

### Local Development
```bash
# Clone repository
git clone <repo-url>
cd robo-face

# Install dependencies
npm install

# Run development server (with hot reload)
npm run dev

# Test in local browser
open http://localhost:3000
```

### Testing on Raspberry Pi
```bash
# Deploy to RPi
rsync -avz --exclude node_modules \
  robo-face/ pi@raspberrypi.local:~/robo-face/

# SSH into RPi
ssh pi@raspberrypi.local

# Install and restart
cd ~/robo-face
npm install --production
sudo systemctl restart robo-face
```

### Remote Development
- Use VS Code Remote SSH extension
- Direct development on RPi
- Test on actual hardware immediately

---

## 12. Extensibility & Maintenance

### Adding New Characters
1. Create new sprite sheets in `frontend/assets/sprites/`
2. Define animation states in `frontend/assets/animations/`
3. Register character in `frontend/js/character.js`
4. Update configuration to select character

### Adding New Events
1. Define event type in `backend/config/events.json`
2. Map event to animation state
3. Add trigger source (API/MQTT/GPIO)
4. Document in `docs/EVENTS.md`

### Updating Animations
1. Design new sprites/animations
2. Export as sprite sheet or JSON
3. Update animation configuration
4. Test transitions
5. Deploy updated assets

### Configuration Management
Use environment variables and JSON configs:
```bash
# .env file
PORT=3000
MQTT_ENABLED=true
MQTT_BROKER=mqtt://localhost:1883
GPIO_ENABLED=false
LOG_LEVEL=info
CHARACTER=robo-face
```

---

## 13. Security Considerations

### Network Security
- Run backend on localhost only (no external access)
- Use authentication for API endpoints (if exposed)
- Implement rate limiting
- Validate all event inputs

### System Security
- Run services as non-root user (pi)
- Keep system updated regularly
- Disable unused services
- Use firewall (ufw) if network exposed

### Updates
```bash
# Update application
cd ~/robo-face
git pull
npm install --production
sudo systemctl restart robo-face

# Update system
sudo apt update && sudo apt upgrade -y
sudo reboot
```

---

## 14. Troubleshooting

### Common Issues

**Display not showing:**
```bash
# Check if X server is running
echo $DISPLAY

# Check Chromium process
ps aux | grep chromium

# Restart display service
sudo systemctl restart chromium-kiosk
```

**Backend not responding:**
```bash
# Check service status
sudo systemctl status robo-face

# View logs
sudo journalctl -u robo-face -f

# Restart service
sudo systemctl restart robo-face
```

**Performance issues:**
```bash
# Check CPU usage
top

# Check memory
free -h

# Check temperature
vcgencmd measure_temp

# Reduce animation complexity or FPS
```

**Network issues:**
```bash
# Check if server is listening
netstat -tlnp | grep 3000

# Test WebSocket
wscat -c ws://localhost:3000
```

---

## 15. Cost Estimate

### Hardware (One-time)
- Raspberry Pi 4 (2GB): $45
- Official 7" Touchscreen: $75
- MicroSD 32GB: $10
- Power Supply: $10
- Case: $15
- **Total: ~$155**

### Budget Option
- Raspberry Pi 3B+: $35
- 3.5" SPI Display: $25
- **Total: ~$80**

### Ongoing Costs
- Electricity: <$5/year (2-3W continuous)
- Maintenance: Minimal (SD card replacement every 2-3 years)

---

## 16. Success Metrics

### Performance Targets
- Boot to display: <30 seconds
- Animation FPS: 30-60fps consistently
- Event response time: <100ms
- Memory usage: <500MB total
- CPU usage: <50% average

### Reliability Targets
- Uptime: >99.5%
- Crash recovery: Automatic restart <30s
- Update deployment: <5 minutes

---

## 17. Next Steps

### Immediate Actions
1. ✅ Review and approve this plan
2. Set up development environment
3. Initialize project structure
4. Acquire Raspberry Pi hardware (if needed)
5. Begin Phase 1 implementation

### Questions to Address
- [ ] Specific display size and resolution?
- [ ] Primary event sources (sensors, APIs, manual)?
- [ ] Audio feedback required?
- [ ] Multiple character support priority?
- [ ] Network connectivity (WiFi/Ethernet)?
- [ ] Budget constraints?

---

## 18. Resources & References

### Documentation
- [Raspberry Pi Official Docs](https://www.raspberrypi.org/documentation/)
- [HTML5 Canvas Tutorial](https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API)
- [Node.js on Raspberry Pi](https://nodejs.org/en/download/package-manager/)
- [WebSocket API](https://developer.mozilla.org/en-US/docs/Web/API/WebSocket)

### Tools
- [Piskel](https://www.piskelapp.com/) - Pixel art sprite editor
- [Aseprite](https://www.aseprite.org/) - Professional sprite editor
- [Lottie](https://airbnb.io/lottie/) - Animation library
- [MQTT.js](https://github.com/mqttjs/MQTT.js) - MQTT client

### Community
- r/raspberry_pi - Raspberry Pi community
- Node.js Discord - Node.js support
- RPi Forums - Hardware specific questions

---

## Conclusion

This plan provides a robust, maintainable, and performant solution for deploying animated character faces on Raspberry Pi. The web-based architecture offers excellent balance between ease of development and performance, while the modular design ensures easy extensibility for future enhancements.

**Key Advantages:**
- ✅ Low resource usage
- ✅ Easy to maintain and update
- ✅ Flexible event system
- ✅ Standard web technologies
- ✅ Good performance on RPi
- ✅ Cost-effective deployment
- ✅ Easy to extend with new characters

The phased implementation approach allows for incremental development and testing, ensuring a solid foundation before adding advanced features.
