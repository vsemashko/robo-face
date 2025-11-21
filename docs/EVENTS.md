# Event Types Guide

This document describes all event types supported by Robo-Face and how they map to animation states.

## Event Structure

All events follow this basic structure:

```json
{
  "type": "event.type",
  "duration": 3000,
  "metadata": {}
}
```

## Event Categories

### 1. Emotion Events

Direct control over character emotions. These are the simplest way to trigger animations.

#### Format
```json
{
  "type": "emotion",
  "value": "<emotion_name>",
  "duration": 3000
}
```

#### Available Emotions

| Emotion | Visual | Use Case |
|---------|--------|----------|
| `idle` | Calm, neutral face | Default resting state |
| `happy` | Smiling, bright | Success, completion, positive feedback |
| `thinking` | Moving eyes, processing | Loading, computing, working |
| `alert` | Wide eyes, pulsing | Warnings, notifications, attention needed |
| `sad` | Droopy features | Errors, failures, negative events |
| `surprised` | Very wide eyes | Unexpected events, discoveries |
| `sleeping` | Closed eyes, ZZZ | Idle timeout, nighttime, shutdown |

#### Examples

```bash
# Show happy emotion for 5 seconds
curl -X POST http://localhost:3000/api/event \
  -H "Content-Type: application/json" \
  -d '{"type":"emotion","value":"happy","duration":5000}'

# Show thinking state (default 3 seconds)
curl -X POST http://localhost:3000/api/event \
  -H "Content-Type: application/json" \
  -d '{"type":"emotion","value":"thinking"}'
```

---

### 2. System Events

Events related to system operations and status.

| Event Type | State | Duration | Description |
|------------|-------|----------|-------------|
| `system.boot` | happy | 5000ms | System has started up |
| `system.shutdown` | sleeping | 3000ms | System is shutting down |
| `system.error` | sad | 5000ms | System error occurred |
| `system.update` | thinking | 4000ms | System is updating |

#### Examples

```bash
# System boot complete
curl -X POST http://localhost:3000/api/event \
  -H "Content-Type: application/json" \
  -d '{"type":"system.boot"}'

# System error
curl -X POST http://localhost:3000/api/event \
  -H "Content-Type: application/json" \
  -d '{"type":"system.error","metadata":{"error":"Connection failed"}}'
```

#### Use Cases

**Boot Sequence:**
```bash
# Run on Raspberry Pi startup
curl -X POST http://localhost:3000/api/event \
  -d '{"type":"system.boot"}'
```

**Error Handling:**
```python
try:
    # ... some operation
except Exception as e:
    requests.post('http://localhost:3000/api/event',
        json={'type': 'system.error', 'metadata': {'error': str(e)}})
```

---

### 3. Time-based Events

Events triggered by time or schedules.

| Event Type | State | Duration | Description |
|------------|-------|----------|-------------|
| `time.hourly` | idle | 2000ms | Hourly check-in |
| `time.morning` | happy | 4000ms | Morning greeting (7-9 AM) |
| `time.evening` | sleeping | 3000ms | Evening wind-down (9-11 PM) |
| `time.idle` | sleeping | 10000ms | No activity timeout |

#### Examples

```bash
# Morning greeting
curl -X POST http://localhost:3000/api/event \
  -H "Content-Type: application/json" \
  -d '{"type":"time.morning"}'

# Idle timeout
curl -X POST http://localhost:3000/api/event \
  -H "Content-Type: application/json" \
  -d '{"type":"time.idle","duration":15000}'
```

#### Scheduling Examples

**Cron job for morning greeting:**
```cron
# Run at 7:00 AM every day
0 7 * * * curl -X POST http://localhost:3000/api/event -H "Content-Type: application/json" -d '{"type":"time.morning"}'
```

**Idle timeout in Python:**
```python
import time
import requests

last_activity = time.time()
IDLE_TIMEOUT = 300  # 5 minutes

while True:
    if time.time() - last_activity > IDLE_TIMEOUT:
        requests.post('http://localhost:3000/api/event',
            json={'type': 'time.idle'})
        last_activity = time.time()
    time.sleep(10)
```

---

### 4. Notification Events

Events for user notifications and alerts.

| Event Type | State | Duration | Description |
|------------|-------|----------|-------------|
| `notification.message` | happy | 3000ms | New message received |
| `notification.alert` | alert | 5000ms | Important alert/warning |

#### Examples

```bash
# New message
curl -X POST http://localhost:3000/api/event \
  -H "Content-Type: application/json" \
  -d '{"type":"notification.message","metadata":{"from":"John"}}'

# Alert notification
curl -X POST http://localhost:3000/api/event \
  -H "Content-Type: application/json" \
  -d '{"type":"notification.alert","metadata":{"message":"Temperature high!"}}'
```

#### Integration Examples

**Email notification:**
```python
def on_new_email(sender, subject):
    requests.post('http://localhost:3000/api/event',
        json={
            'type': 'notification.message',
            'metadata': {'from': sender, 'subject': subject}
        })
```

**Slack webhook:**
```javascript
slackBot.on('message', (message) => {
  axios.post('http://localhost:3000/api/event', {
    type: 'notification.message',
    metadata: { from: message.user }
  });
});
```

---

### 5. Sensor Events

Events from physical sensors (GPIO, etc.).

| Event Type | State | Duration | Description |
|------------|-------|----------|-------------|
| `sensor.motion` | surprised | 2000ms | Motion detected |
| `sensor.button` | happy | 2000ms | Button pressed |
| `sensor.temperature` | varies | 3000ms | Temperature reading |
| `sensor.light` | varies | 3000ms | Light level change |

#### Examples

```bash
# Motion detected
curl -X POST http://localhost:3000/api/event \
  -H "Content-Type: application/json" \
  -d '{"type":"sensor.motion"}'

# Button pressed
curl -X POST http://localhost:3000/api/event \
  -H "Content-Type: application/json" \
  -d '{"type":"sensor.button","metadata":{"button":"red"}}'
```

#### GPIO Integration (Python)

```python
import RPi.GPIO as GPIO
import requests

MOTION_PIN = 17
API_URL = 'http://localhost:3000/api/event'

GPIO.setmode(GPIO.BCM)
GPIO.setup(MOTION_PIN, GPIO.IN)

def motion_detected(channel):
    requests.post(API_URL,
        json={'type': 'sensor.motion'})

GPIO.add_event_detect(MOTION_PIN, GPIO.RISING,
    callback=motion_detected, bouncetime=2000)

print("Monitoring for motion...")
try:
    while True:
        time.sleep(1)
except KeyboardInterrupt:
    GPIO.cleanup()
```

---

### 6. Custom/API Events

Generic events for custom integrations.

| Event Type | State | Duration | Description |
|------------|-------|----------|-------------|
| `api.trigger` | thinking | 3000ms | Generic API call |
| `custom.*` | varies | 3000ms | Custom event types |

#### Examples

```bash
# Generic trigger
curl -X POST http://localhost:3000/api/event \
  -H "Content-Type: application/json" \
  -d '{"type":"api.trigger"}'

# Custom event with direct state
curl -X POST http://localhost:3000/api/event \
  -H "Content-Type: application/json" \
  -d '{"type":"custom","state":"happy","duration":4000}'
```

---

## Event Priority & Queuing

### Priority Levels

Events map to animation states, which have priorities:

| Priority | States | Behavior |
|----------|--------|----------|
| 0-2 (Low) | idle, sleeping | Easily interrupted |
| 3-5 (Medium) | thinking, happy, sad | Normal priority |
| 7-8 (High) | surprised, alert | Interrupt most states |

### Interruption Rules

1. **Interruptible states** (most states) can be interrupted by same or higher priority
2. **Non-interruptible states** (alert) require significantly higher priority
3. **Queued events** wait in priority order (max 10 in queue)

### Queue Behavior

```javascript
// High priority - interrupts immediately
{type: 'notification.alert'}  // Priority 8

// Medium priority - may queue
{type: 'emotion', value: 'happy'}  // Priority 5

// Low priority - likely queued or dropped
{type: 'time.idle'}  // Priority 1
```

---

## Creating Custom Events

### Option 1: Add to Configuration

Edit `backend/config/events.json`:

```json
{
  "mappings": {
    "custom.celebrate": {
      "state": "happy",
      "duration": 8000,
      "description": "Celebration event"
    }
  }
}
```

Then trigger:
```bash
curl -X POST http://localhost:3000/api/event \
  -d '{"type":"custom.celebrate"}'
```

### Option 2: Direct State Control

```bash
curl -X POST http://localhost:3000/api/event \
  -H "Content-Type: application/json" \
  -d '{
    "type": "custom",
    "state": "surprised",
    "duration": 2000
  }'
```

---

## Event Metadata

All events can include optional metadata:

```json
{
  "type": "notification.message",
  "duration": 3000,
  "metadata": {
    "source": "slack",
    "user": "john@example.com",
    "message": "Deploy complete!",
    "timestamp": 1637012345
  }
}
```

Metadata is stored but not currently used by animations. It's useful for:
- Logging and debugging
- Future feature extensions
- External monitoring

---

## Best Practices

### 1. Choose Appropriate Durations

```bash
# Quick feedback
{"type":"sensor.button","duration":1000}

# Normal notification
{"type":"notification.message","duration":3000}

# Important alert
{"type":"notification.alert","duration":8000}
```

### 2. Use Specific Event Types

❌ **Don't:**
```json
{"type":"emotion","value":"happy"}
```

✅ **Do:**
```json
{"type":"notification.message"}
```

This makes your intent clear and easier to debug.

### 3. Include Metadata

```json
{
  "type": "system.error",
  "metadata": {
    "service": "database",
    "error": "Connection timeout",
    "timestamp": "2023-11-21T12:00:00Z"
  }
}
```

### 4. Handle Queue Drops

If sending frequent events, monitor for drops:

```python
response = requests.post('http://localhost:3000/api/event',
    json={'type': 'sensor.motion'})

result = response.json()
if result.get('result', {}).get('type') == 'dropped':
    print("Event was dropped - queue full!")
```

---

## Integration Patterns

### Pattern 1: Monitoring Service

```python
# Monitor system health
while True:
    cpu = get_cpu_usage()

    if cpu > 80:
        trigger_event('notification.alert')
    elif cpu > 60:
        trigger_event('emotion', 'thinking')
    else:
        trigger_event('emotion', 'idle')

    time.sleep(30)
```

### Pattern 2: Event Aggregator

```python
# Aggregate multiple sources
class EventAggregator:
    def __init__(self):
        self.last_event = None
        self.debounce_time = 2.0

    def trigger(self, event_type):
        now = time.time()
        if (self.last_event and
            now - self.last_event < self.debounce_time):
            return  # Debounce

        requests.post('http://localhost:3000/api/event',
            json={'type': event_type})
        self.last_event = now
```

### Pattern 3: State Machine

```python
class DeviceMonitor:
    states = {
        'booting': 'system.boot',
        'running': 'emotion.idle',
        'working': 'emotion.thinking',
        'error': 'system.error'
    }

    def set_state(self, state):
        event = self.states.get(state)
        if event:
            trigger_event(event)
```

---

## Troubleshooting

### Event not triggering animation

1. **Check event type is valid**
   ```bash
   curl http://localhost:3000/api/animations
   ```

2. **Check priority** - Lower priority may be queued

3. **Check logs**
   ```bash
   sudo journalctl -u robo-face -f
   ```

### Events being dropped

- **Reduce frequency** of events
- **Increase queue size** in `.env`: `EVENT_QUEUE_SIZE=20`
- **Use higher priority events** for important notifications

### Wrong animation playing

- **Check event mapping** in `backend/config/events.json`
- **Use direct state control** for debugging

---

## Future Event Types

Planned for future versions:

- `weather.*` - Weather-based reactions
- `calendar.*` - Calendar event reminders
- `voice.*` - Voice command integration
- `mqtt.*` - MQTT topic subscriptions
- `gpio.*` - Direct GPIO events

---

## See Also

- [API Documentation](API.md) - Complete API reference
- [Animation Guide](ANIMATIONS.md) - Creating custom animations
- [Deployment Plan](../DEPLOYMENT_PLAN.md) - Architecture details
