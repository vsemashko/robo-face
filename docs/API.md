# API Documentation

Robo-Face provides both REST API and WebSocket interfaces for controlling animations and monitoring state.

## Base URL

```
http://localhost:3000
```

For WebSocket connections:
```
ws://localhost:3000
```

---

## REST API Endpoints

### Health Check

Check if the server is running and get basic status information.

**Endpoint:** `GET /api/health`

**Response:**
```json
{
  "status": "ok",
  "uptime": 123.456,
  "clients": 2,
  "currentState": "idle"
}
```

**Fields:**
- `status` - Server status (always "ok" if responding)
- `uptime` - Server uptime in seconds
- `clients` - Number of connected WebSocket clients
- `currentState` - Current animation state

**Example:**
```bash
curl http://localhost:3000/api/health
```

---

### Get Current State

Get the current animation state.

**Endpoint:** `GET /api/state`

**Response:**
```json
{
  "state": "idle",
  "uptime": 123.456
}
```

**Example:**
```bash
curl http://localhost:3000/api/state
```

---

### Get Available Animations

List all available animation states.

**Endpoint:** `GET /api/animations`

**Response:**
```json
["idle", "happy", "thinking", "alert", "sad", "surprised", "sleeping"]
```

**Example:**
```bash
curl http://localhost:3000/api/animations
```

---

### Trigger Event/Animation

Trigger an animation by sending an event.

**Endpoint:** `POST /api/event`

**Content-Type:** `application/json`

**Request Body:**

#### Basic Emotion Trigger
```json
{
  "type": "emotion",
  "value": "happy",
  "duration": 3000
}
```

#### Direct State Trigger
```json
{
  "type": "custom",
  "state": "thinking",
  "duration": 5000
}
```

#### System Event
```json
{
  "type": "system.boot"
}
```

**Parameters:**
- `type` (required) - Event type (see Event Types section)
- `value` (optional) - Emotion name for emotion type events
- `state` (optional) - Direct state override
- `duration` (optional) - Animation duration in milliseconds (default: 3000)
- `metadata` (optional) - Additional metadata object

**Response (Success):**
```json
{
  "success": true,
  "result": {
    "type": "animation",
    "state": "happy",
    "duration": 3000,
    "interrupted": true
  }
}
```

**Response (Queued):**
```json
{
  "success": true,
  "result": {
    "type": "queued",
    "state": "happy",
    "queuePosition": 1,
    "queueSize": 2
  }
}
```

**Response (Error):**
```json
{
  "error": "Event type is required"
}
```

**Examples:**

Trigger happy emotion:
```bash
curl -X POST http://localhost:3000/api/event \
  -H "Content-Type: application/json" \
  -d '{"type":"emotion","value":"happy","duration":5000}'
```

Trigger system boot event:
```bash
curl -X POST http://localhost:3000/api/event \
  -H "Content-Type: application/json" \
  -d '{"type":"system.boot"}'
```

Trigger alert:
```bash
curl -X POST http://localhost:3000/api/event \
  -H "Content-Type: application/json" \
  -d '{"type":"notification.alert","duration":8000}'
```

---

## WebSocket API

### Connection

Connect to the WebSocket server:

```javascript
const ws = new WebSocket('ws://localhost:3000');
```

### Events from Server

#### Connection Established
When connected, you'll immediately receive the current state:

```json
{
  "type": "state",
  "state": "idle"
}
```

#### State Change
When the animation state changes:

```json
{
  "type": "stateChange",
  "state": "happy",
  "timestamp": 1637012345678
}
```

#### Animation Event
When an animation is triggered:

```json
{
  "type": "animation",
  "state": "happy",
  "duration": 3000,
  "interrupted": true
}
```

#### Error
If an error occurs:

```json
{
  "type": "error",
  "message": "Invalid state"
}
```

### Sending Events to Server

Send events using the same format as the REST API:

```javascript
ws.send(JSON.stringify({
  type: 'emotion',
  value: 'happy',
  duration: 3000
}));
```

### Complete Example

```javascript
const ws = new WebSocket('ws://localhost:3000');

// Connection opened
ws.addEventListener('open', (event) => {
  console.log('Connected to Robo-Face');
});

// Listen for messages
ws.addEventListener('message', (event) => {
  const data = JSON.parse(event.data);
  console.log('Received:', data);

  if (data.type === 'stateChange') {
    console.log('State changed to:', data.state);
  }
});

// Send emotion
function triggerEmotion(emotion, duration = 3000) {
  ws.send(JSON.stringify({
    type: 'emotion',
    value: emotion,
    duration: duration
  }));
}

// Use it
triggerEmotion('happy', 5000);
```

---

## Event Types

### Emotion Events

Direct emotion triggers:

```json
{
  "type": "emotion",
  "value": "idle|happy|thinking|alert|sad|surprised|sleeping",
  "duration": 3000
}
```

### System Events

| Event Type | Target State | Description |
|------------|--------------|-------------|
| `system.boot` | happy | System startup |
| `system.shutdown` | sleeping | System shutdown |
| `system.error` | sad | System error |
| `system.update` | thinking | System update |

### Time Events

| Event Type | Target State | Description |
|------------|--------------|-------------|
| `time.hourly` | idle | Hourly check-in |
| `time.morning` | happy | Morning greeting |
| `time.evening` | sleeping | Evening wind-down |
| `time.idle` | sleeping | Idle timeout |

### Notification Events

| Event Type | Target State | Description |
|------------|--------------|-------------|
| `notification.message` | happy | New message |
| `notification.alert` | alert | Alert/warning |

### Sensor Events

| Event Type | Target State | Description |
|------------|--------------|-------------|
| `sensor.motion` | surprised | Motion detected |
| `sensor.button` | happy | Button pressed |

### Custom Events

| Event Type | Target State | Description |
|------------|--------------|-------------|
| `api.trigger` | thinking | Generic API trigger |

---

## Animation States

| State | Color | Description | Priority |
|-------|-------|-------------|----------|
| `idle` | Blue (#4A90E2) | Default calm state | 0 |
| `happy` | Green (#7ED321) | Positive emotions | 5 |
| `thinking` | Orange (#F5A623) | Processing/working | 3 |
| `alert` | Yellow (#F8E71C) | Warning/important | 8 |
| `sad` | Red (#D0021B) | Error/negative | 4 |
| `surprised` | Purple (#BD10E0) | Unexpected event | 7 |
| `sleeping` | Gray (#4A4A4A) | Inactive/resting | 1 |

---

## Priority System

Animations have priorities that determine if they can interrupt the current state:

- **High Priority** (7-8): `alert`, `surprised` - Can interrupt most states
- **Medium Priority** (3-5): `happy`, `sad`, `thinking` - Normal priority
- **Low Priority** (0-2): `idle`, `sleeping` - Can be easily interrupted

**Rules:**
- Higher priority animations interrupt lower priority ones
- Non-interruptible states (like `alert`) require much higher priority to interrupt
- If an animation can't interrupt, it gets queued (max 10 in queue)

---

## Rate Limiting

Currently, there is no rate limiting implemented. Consider implementing your own rate limiting on the client side if needed.

---

## Error Handling

### Common Errors

**400 Bad Request**
```json
{
  "error": "Event type is required"
}
```

**500 Internal Server Error**
```json
{
  "error": "Unable to map event type \"unknown\" to a state"
}
```

### WebSocket Errors

WebSocket connections will automatically attempt to reconnect with exponential backoff (up to 10 attempts).

---

## Integration Examples

### Python

```python
import requests
import json

# Trigger emotion
response = requests.post('http://localhost:3000/api/event',
    headers={'Content-Type': 'application/json'},
    data=json.dumps({
        'type': 'emotion',
        'value': 'happy',
        'duration': 5000
    })
)

print(response.json())
```

### Node.js

```javascript
const axios = require('axios');

// Trigger emotion
axios.post('http://localhost:3000/api/event', {
  type: 'emotion',
  value: 'happy',
  duration: 5000
})
.then(response => {
  console.log(response.data);
})
.catch(error => {
  console.error('Error:', error.message);
});
```

### Bash/cURL

```bash
#!/bin/bash

# Trigger happy emotion
curl -X POST http://localhost:3000/api/event \
  -H "Content-Type: application/json" \
  -d '{"type":"emotion","value":"happy","duration":5000}'

# Trigger system boot
curl -X POST http://localhost:3000/api/event \
  -H "Content-Type: application/json" \
  -d '{"type":"system.boot"}'
```

---

## Security Considerations

The API currently has no authentication. If exposing to a network:

1. Run behind a reverse proxy with authentication
2. Use firewall rules to restrict access
3. Implement rate limiting
4. Consider using HTTPS/WSS for encrypted communication

---

## Performance Tips

1. **Use WebSocket** for frequent updates instead of polling REST API
2. **Batch events** if sending multiple in quick succession
3. **Set appropriate durations** - Longer durations reduce state changes
4. **Monitor queue size** - If events are being queued frequently, reduce frequency

---

## Troubleshooting

### Server not responding
```bash
# Check if server is running
sudo systemctl status robo-face

# Check logs
sudo journalctl -u robo-face -f

# Test connection
curl http://localhost:3000/api/health
```

### WebSocket connection fails
```bash
# Check if port 3000 is listening
netstat -tlnp | grep 3000

# Check firewall
sudo ufw status
```

### Animation not changing
- Check current state with `/api/state`
- Verify priority - lower priority events may be queued
- Check logs for errors

---

## Support

For issues and questions, see the main [README.md](../README.md) and [DEPLOYMENT_PLAN.md](../DEPLOYMENT_PLAN.md).
