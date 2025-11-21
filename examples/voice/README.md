# Voice Integration Examples

This directory contains examples showing how to integrate with the Robo-Face voice conversation plugin from various languages and platforms.

## Prerequisites

1. **Enable Voice Plugin**: Edit `.env` file:
   ```bash
   VOICE_ENABLED=true
   VOICE_LLM_PROVIDER=openai  # or anthropic, ollama
   OPENAI_API_KEY=your-api-key-here
   ```

2. **Start Server**:
   ```bash
   npm install
   npm start
   ```

3. **Verify Voice is Enabled**:
   ```bash
   curl http://localhost:3000/api/health
   # Should show "voiceEnabled": true
   ```

---

## Examples

### 1. Python Voice Chat (`python_voice_chat.py`)

Interactive voice chat client in Python.

**Features:**
- Interactive conversation mode
- Conversation history management
- Character switching
- Example conversations

**Requirements:**
```bash
pip install requests
```

**Usage:**
```bash
# Interactive mode
python python_voice_chat.py

# Run examples
python python_voice_chat.py --examples

# Show help
python python_voice_chat.py --help
```

**Interactive Commands:**
- `/clear` - Clear conversation history
- `/history` - Show conversation history
- `/character <name>` - Switch character (robo-face, cat-face, pixel-friend)
- `/quit` - Exit

**Example:**
```python
from python_voice_chat import chat

# Send a message
response = chat("Hello! How are you?", character="robo-face")
print(response['text'])  # Character's response
print(response['emotion'])  # Detected emotion
```

---

### 2. Node.js Voice Chat (`nodejs_voice_chat.js`)

Programmatic voice integration for Node.js applications.

**Features:**
- VoiceClient class for easy integration
- Interactive and programmatic modes
- Multi-turn conversations
- Voice assistant demo

**Requirements:**
```bash
npm install axios readline
```

**Usage:**
```bash
# Interactive mode
node nodejs_voice_chat.js

# Run examples
node nodejs_voice_chat.js --examples

# Voice assistant demo
node nodejs_voice_chat.js --assistant

# Show help
node nodejs_voice_chat.js --help
```

**As a Module:**
```javascript
const { VoiceClient } = require('./nodejs_voice_chat');

const client = new VoiceClient();

// Send a message
const response = await client.chat('Hello!', 'cat-face');
console.log(response.text);

// Clear history
await client.clearHistory();

// Get conversation history
const history = await client.getHistory();
```

---

### 3. MQTT Voice Trigger (`mqtt_voice_trigger.py`)

Bridge between MQTT and voice API for IoT integrations.

**Features:**
- MQTT → Voice API bridge
- Publishes responses to MQTT topics
- Publishes emotion changes
- Test mode for quick testing

**Requirements:**
```bash
pip install paho-mqtt requests
```

**Enable MQTT** (optional, in `.env`):
```bash
MQTT_ENABLED=true
MQTT_BROKER=mqtt://localhost:1883
```

**Usage:**
```bash
# Start bridge
python mqtt_voice_trigger.py

# Send test messages
python mqtt_voice_trigger.py --test

# Listen to responses
python mqtt_voice_trigger.py --listen

# Show help
python mqtt_voice_trigger.py --help
```

**MQTT Topics:**

- **Command Topic** (`robo-face/voice/command`):
  ```json
  {
    "text": "Hello, how are you?",
    "character": "robo-face",
    "sessionId": "mqtt-session"
  }
  ```

- **Response Topic** (`robo-face/voice/response`):
  ```json
  {
    "text": "Greetings! My systems are functioning optimally.",
    "character": "robo-face",
    "emotion": "happy",
    "timestamp": 1234567890.123
  }
  ```

- **Emotion Topic** (`robo-face/voice/emotion`):
  ```json
  {
    "emotion": "happy",
    "character": "robo-face",
    "timestamp": 1234567890.123
  }
  ```

**Example Integration:**
```python
import paho.mqtt.client as mqtt
import json

client = mqtt.Client()
client.connect("localhost", 1883, 60)

# Send voice command
message = {
    "text": "Tell me a joke",
    "character": "pixel-friend"
}
client.publish("robo-face/voice/command", json.dumps(message))
```

---

### 4. Custom Voice Commands (`custom_voice_commands.js`)

Build a custom voice command system with specific triggers.

**Features:**
- Pattern-based command matching
- Custom command actions
- Emotion triggers
- Character switching
- Time/date commands
- Help system

**Requirements:**
```bash
npm install axios
```

**Usage:**
```bash
# Interactive mode
node custom_voice_commands.js

# Automated demo
node custom_voice_commands.js --auto

# Show help
node custom_voice_commands.js --help
```

**Built-in Commands:**
- **Greetings**: "hello", "hi", "hey"
- **Status**: "status", "how are you"
- **Emotions**: "be happy", "get excited", "think"
- **Time/Date**: "what time", "what date"
- **Sleep/Wake**: "go to sleep", "wake up"
- **Character Switch**: "cat mode", "pixel mode", "robot mode"
- **Help**: "help", "what can you do"

**Extending:**
```javascript
const { VoiceCommandSystem } = require('./custom_voice_commands');

const system = new VoiceCommandSystem();

// Add custom command
system.commands.dance = {
  patterns: ['dance', 'boogie', 'groove'],
  action: async () => {
    await system.triggerEmotion('excited', 5000);
    return { text: "Let's dance! 💃🕺" };
  }
};

// Process input
const response = await system.processInput("Let's dance!");
```

---

## Integration Patterns

### Pattern 1: Simple Question & Answer

```bash
# REST API
curl -X POST http://localhost:3000/api/voice/chat \
  -H "Content-Type: application/json" \
  -d '{
    "text": "What is the weather like?",
    "character": "robo-face"
  }'
```

### Pattern 2: Contextual Conversation

```javascript
// Keep same sessionId for context
await client.chat("My name is Alice", "cat-face", "session-1");
await client.chat("What is my name?", "cat-face", "session-1");
// Response will remember "Alice"
```

### Pattern 3: IoT Sensor Trigger

```python
# When sensor detects motion
if motion_detected:
    response = chat(
        "Someone is at the door!",
        character="robo-face",
        session_id="security"
    )
    # Character will respond and show emotion
```

### Pattern 4: Scheduled Announcements

```javascript
// Daily greeting
setInterval(async () => {
  const now = new Date();
  if (now.getHours() === 9 && now.getMinutes() === 0) {
    await client.chat("Good morning! Time to start the day!", "pixel-friend");
  }
}, 60000); // Check every minute
```

### Pattern 5: Multi-Character Dialogue

```python
# Robo-Face asks a question
r1 = chat("What do you think about games?", "robo-face", "dialogue")

# Cat-Face responds
r2 = chat("I love playing! Nya~", "cat-face", "dialogue")

# Pixel-Friend joins
r3 = chat("Games are awesome! Let's play!", "pixel-friend", "dialogue")
```

---

## API Reference

### Voice Chat Endpoint

**POST** `/api/voice/chat`

**Request:**
```json
{
  "text": "Hello, how are you?",
  "character": "robo-face",
  "sessionId": "optional-session-id"
}
```

**Response:**
```json
{
  "text": "Greetings! My systems are functioning optimally.",
  "emotion": "happy",
  "character": "robo-face",
  "voiceSettings": {
    "pitch": 1.0,
    "rate": 1.1
  }
}
```

### Clear History

**POST** `/api/voice/clear`

**Request:**
```json
{
  "sessionId": "session-123"
}
```

### Get History

**GET** `/api/voice/history/:sessionId`

**Response:**
```json
{
  "history": [
    { "role": "user", "content": "Hello" },
    { "role": "assistant", "content": "Hi there!" }
  ]
}
```

---

## Characters

### 🤖 Robo-Face
- **Personality**: Technical, formal, helpful
- **Voice**: Pitch 1.0, Rate 1.1
- **Best for**: Technical questions, status updates

### 🐱 Cat-Face
- **Personality**: Playful, affectionate, cute
- **Voice**: Pitch 1.3, Rate 1.0
- **Best for**: Fun conversations, emotional support

### 👾 Pixel-Friend
- **Personality**: Retro, energetic, gaming-focused
- **Voice**: Pitch 1.1, Rate 1.2
- **Best for**: Nostalgia, gaming topics

---

## Troubleshooting

### Voice not working

```bash
# Check if voice is enabled
curl http://localhost:3000/api/health | jq '.voiceEnabled'

# Should return: true
```

If false:
1. Check `.env` has `VOICE_ENABLED=true`
2. Check API key is set
3. Restart server: `npm start`

### API errors

```bash
# Check server logs
npm start

# Look for voice plugin initialization message:
# "✓ Voice plugin enabled (provider: openai)"
```

### MQTT not working

```bash
# Check MQTT broker is running
mosquitto -v

# Test MQTT connection
mosquitto_sub -t "robo-face/voice/#" -v
```

---

## Best Practices

1. **Use Session IDs**: Group related conversations with the same sessionId
2. **Clear History**: Clear history periodically to prevent context overflow
3. **Error Handling**: Always handle API errors gracefully
4. **Rate Limiting**: Don't send requests too frequently (respect API limits)
5. **Character Selection**: Choose character based on use case

---

## See Also

- [Voice Plugin Documentation](../../docs/VOICE_PLUGIN.md)
- [API Documentation](../../docs/API.md)
- [Main README](../../README.md)
