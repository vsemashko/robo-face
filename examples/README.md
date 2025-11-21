# Examples

This directory contains integration examples for Robo-Face in various languages and scenarios.

## Quick Start

Make sure the Robo-Face server is running:

```bash
cd ../
npm start
```

## Python Examples

### Prerequisites

```bash
pip3 install requests psutil RPi.GPIO
```

### trigger_emotion.py

Simple emotion trigger via REST API.

**Usage:**
```bash
python3 python/trigger_emotion.py happy 5000
python3 python/trigger_emotion.py thinking
```

**Arguments:**
- `emotion` - One of: idle, happy, thinking, alert, sad, surprised, sleeping
- `duration` - Optional duration in milliseconds (default: 3000)

---

### system_monitor.py

Monitors system resources (CPU, memory) and triggers appropriate emotions based on usage.

**Usage:**
```bash
python3 python/system_monitor.py
```

**Behavior:**
- CPU/Memory > 80%/90%: **alert** (red)
- CPU/Memory > 60%/70%: **thinking** (orange)
- CPU/Memory < 10%/30%: **sleeping** (gray)
- Otherwise: **idle** (blue)

Press `Ctrl+C` to stop monitoring.

---

### gpio_sensors.py

Integrates with Raspberry Pi GPIO sensors (motion sensor, button).

**Wiring:**
- Motion sensor: GPIO 17
- Button: GPIO 27
- LED indicator: GPIO 22

**Usage:**
```bash
# On Raspberry Pi
sudo python3 python/gpio_sensors.py

# Simulation mode (no GPIO)
python3 python/gpio_sensors.py
```

**Events:**
- Motion detected → **surprised** emotion
- Button pressed → **happy** emotion

---

## Bash Examples

### emotion_demo.sh

Cycles through all emotions to demonstrate the character.

**Usage:**
```bash
chmod +x bash/emotion_demo.sh
./bash/emotion_demo.sh
```

Shows each emotion for 5 seconds with descriptions.

---

## Node.js Examples

### websocket_client.js

WebSocket client that demonstrates real-time communication.

**Usage:**
```bash
cd nodejs
node websocket_client.js
```

**Features:**
- Auto-reconnect on disconnect
- Cycles through emotions every 6 seconds
- Logs all state changes
- Graceful shutdown on Ctrl+C

**Programmatic usage:**
```javascript
const RoboFaceClient = require('./examples/nodejs/websocket_client');

const client = new RoboFaceClient('ws://localhost:3000');
client.connect();

// Trigger emotions
client.triggerEmotion('happy', 5000);
client.triggerEvent('notification.alert');
```

---

## MQTT Examples

### Prerequisites

Install MQTT broker and clients:

```bash
sudo apt install mosquitto mosquitto-clients
```

Enable MQTT in `.env`:
```bash
MQTT_ENABLED=true
MQTT_BROKER=mqtt://localhost:1883
```

### publish_emotions.sh

Publishes emotions via MQTT.

**Usage:**
```bash
chmod +x mqtt/publish_emotions.sh
./mqtt/publish_emotions.sh
```

**Manual publishing:**
```bash
# Trigger happy emotion
mosquitto_pub -h localhost -t "robo-face/event" \
    -m '{"type":"emotion","value":"happy","duration":5000}'

# Trigger system boot
mosquitto_pub -h localhost -t "robo-face/event" \
    -m '{"type":"system.boot"}'

# Simple emotion (just text)
mosquitto_pub -h localhost -t "robo-face/event" -m "happy"
```

**Subscribe to status updates:**
```bash
# Monitor status
mosquitto_sub -h localhost -t "robo-face/status" -v

# Monitor all robo-face topics
mosquitto_sub -h localhost -t "robo-face/#" -v
```

**Send commands:**
```bash
# Request status
mosquitto_pub -h localhost -t "robo-face/command" \
    -m '{"command":"status"}'

# Get queue status
mosquitto_pub -h localhost -t "robo-face/command" \
    -m '{"command":"queue"}'

# Clear queue
mosquitto_pub -h localhost -t "robo-face/command" \
    -m '{"command":"clear_queue"}'
```

---

## Integration Patterns

### Pattern 1: System Event Monitor

Monitor system events and trigger appropriate animations:

```python
import subprocess

def on_deploy_complete():
    trigger_emotion('happy')

def on_deploy_failed():
    trigger_emotion('sad')

def on_backup_start():
    trigger_emotion('thinking')
```

### Pattern 2: Cron Job Integration

Add to crontab:

```cron
# Morning greeting at 7 AM
0 7 * * * curl -X POST http://localhost:3000/api/event -H "Content-Type: application/json" -d '{"type":"time.morning"}'

# Evening wind-down at 10 PM
0 22 * * * curl -X POST http://localhost:3000/api/event -H "Content-Type: application/json" -d '{"type":"time.evening"}'

# Hourly check-in
0 * * * * curl -X POST http://localhost:3000/api/event -H "Content-Type: application/json" -d '{"type":"time.hourly"}'
```

### Pattern 3: Home Automation (Home Assistant)

```yaml
# configuration.yaml
automation:
  - alias: "Robo-Face Motion Alert"
    trigger:
      platform: state
      entity_id: binary_sensor.motion
      to: 'on'
    action:
      service: rest_command.roboface_motion

rest_command:
  roboface_motion:
    url: 'http://localhost:3000/api/event'
    method: POST
    payload: '{"type":"sensor.motion"}'
    content_type: 'application/json'
```

### Pattern 4: Docker Container Monitor

```bash
#!/bin/bash
# Monitor Docker containers and trigger alerts

while true; do
    # Check for failed containers
    failed=$(docker ps -a -f "status=exited" --format "{{.ID}}" | wc -l)

    if [ $failed -gt 0 ]; then
        curl -X POST http://localhost:3000/api/event \
            -H "Content-Type: application/json" \
            -d '{"type":"notification.alert"}'
    else
        curl -X POST http://localhost:3000/api/event \
            -H "Content-Type: application/json" \
            -d '{"type":"emotion","value":"idle"}'
    fi

    sleep 60
done
```

### Pattern 5: Webhook Receiver

```python
from flask import Flask, request
import requests

app = Flask(__name__)
ROBOFACE_API = 'http://localhost:3000/api/event'

@app.route('/webhook', methods=['POST'])
def webhook():
    data = request.json

    # Map webhook events to emotions
    emotion_map = {
        'build.success': 'happy',
        'build.failed': 'sad',
        'deploy.started': 'thinking',
        'alert.critical': 'alert'
    }

    event_type = data.get('event')
    emotion = emotion_map.get(event_type, 'idle')

    requests.post(ROBOFACE_API,
        json={'type': 'emotion', 'value': emotion})

    return {'status': 'ok'}

if __name__ == '__main__':
    app.run(port=5000)
```

---

## Testing Tips

### 1. Test Single Emotion

```bash
curl -X POST http://localhost:3000/api/event \
    -H "Content-Type: application/json" \
    -d '{"type":"emotion","value":"happy","duration":3000}'
```

### 2. Check Server Health

```bash
curl http://localhost:3000/api/health
```

### 3. View Available Animations

```bash
curl http://localhost:3000/api/animations
```

### 4. Monitor Logs

```bash
# Local development
npm start

# On Raspberry Pi (systemd)
sudo journalctl -u robo-face -f
```

---

## Troubleshooting

### Connection Refused

**Problem:** Cannot connect to API

**Solution:**
```bash
# Check if server is running
curl http://localhost:3000/api/health

# Start server
npm start

# Check port
netstat -tlnp | grep 3000
```

### MQTT Not Working

**Problem:** MQTT events not triggering

**Solution:**
1. Check `.env` file: `MQTT_ENABLED=true`
2. Verify broker is running: `sudo systemctl status mosquitto`
3. Test connection: `mosquitto_pub -h localhost -t test -m "hello"`
4. Check logs: `sudo journalctl -u robo-face -f`

### GPIO Permissions

**Problem:** GPIO access denied

**Solution:**
```bash
# Run with sudo
sudo python3 gpio_sensors.py

# Or add user to gpio group
sudo usermod -a -G gpio $USER
```

---

## Next Steps

- Customize animations in `frontend/js/character.js`
- Add new event mappings in `backend/config/events.json`
- Create your own integration scripts
- See [API Documentation](../docs/API.md) for more details

---

## Contributing Examples

Have a useful integration? Add it here!

1. Create example file in appropriate directory
2. Add documentation to this README
3. Test on Raspberry Pi if possible
4. Submit PR

---

## See Also

- [API Documentation](../docs/API.md)
- [Events Guide](../docs/EVENTS.md)
- [Animation Guide](../docs/ANIMATIONS.md)
- [Main README](../README.md)
