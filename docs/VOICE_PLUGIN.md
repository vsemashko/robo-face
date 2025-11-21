# Voice Conversation Plugin

Complete guide to the voice conversation plugin for Robo-Face.

## Overview

The voice plugin adds LLM-powered voice conversation capabilities to all characters. Each character has its own personality and voice settings, creating unique conversational experiences.

## Features

- 🎤 **Speech Recognition**: Web Speech API for voice input
- 🤖 **LLM Integration**: OpenAI GPT, Anthropic Claude, or local Ollama
- 🗣️ **Text-to-Speech**: Natural voice responses with character-specific voices
- 🎭 **Character Personalities**: Each character has unique personality and speaking style
- 😊 **Emotion Detection**: Automatically triggers emotions based on conversation context
- 💬 **Conversation History**: Maintains context across multiple interactions
- 🔌 **Plugin Architecture**: Easy to enable/disable without affecting core functionality

---

## Quick Start

### 1. Enable Voice Plugin

Edit `.env`:
```bash
# Enable voice plugin
VOICE_ENABLED=true

# Choose LLM provider (openai, anthropic, or ollama)
VOICE_LLM_PROVIDER=openai

# Add API key for your provider
OPENAI_API_KEY=your-api-key-here
```

### 2. Install Dependencies

```bash
npm install  # axios is required for API calls
```

### 3. Start Server

```bash
npm start
```

### 4. Use Voice Chat

1. Open `http://localhost:3000`
2. Click "🎤 Push to Talk" button in bottom-right
3. Speak your message
4. Character will respond with voice and emotions!

---

## Configuration

### Environment Variables

#### Required (if voice enabled)
```bash
VOICE_ENABLED=true                    # Enable/disable voice plugin
VOICE_LLM_PROVIDER=openai            # LLM provider (openai|anthropic|ollama)
```

#### OpenAI Configuration
```bash
OPENAI_API_KEY=sk-...                # Your OpenAI API key
OPENAI_MODEL=gpt-3.5-turbo           # Model to use (gpt-3.5-turbo, gpt-4, etc.)
```

#### Anthropic Claude Configuration
```bash
ANTHROPIC_API_KEY=sk-ant-...         # Your Anthropic API key
ANTHROPIC_MODEL=claude-3-haiku-20240307  # Model to use
```

#### Ollama (Local LLM) Configuration
```bash
OLLAMA_BASE_URL=http://localhost:11434  # Ollama server URL
OLLAMA_MODEL=llama2                      # Model name (llama2, mistral, etc.)
```

#### Optional Settings
```bash
VOICE_HISTORY_LENGTH=10              # Number of messages to keep in history
```

---

## LLM Providers

### Option 1: OpenAI (Cloud)

**Best for**: Production use, high quality responses

**Setup:**
1. Get API key from https://platform.openai.com/api-keys
2. Add to `.env`: `OPENAI_API_KEY=sk-...`
3. Set provider: `VOICE_LLM_PROVIDER=openai`

**Cost**: ~$0.002 per conversation (gpt-3.5-turbo)

**Models:**
- `gpt-3.5-turbo` - Fast, cheap, good quality (recommended)
- `gpt-4` - Best quality, slower, more expensive
- `gpt-4-turbo` - Good balance

### Option 2: Anthropic Claude (Cloud)

**Best for**: Natural, personality-rich responses

**Setup:**
1. Get API key from https://console.anthropic.com/
2. Add to `.env`: `ANTHROPIC_API_KEY=sk-ant-...`
3. Set provider: `VOICE_LLM_PROVIDER=anthropic`

**Cost**: ~$0.001 per conversation (Claude Haiku)

**Models:**
- `claude-3-haiku-20240307` - Fast, cheap (recommended)
- `claude-3-sonnet-20240229` - Better quality
- `claude-3-opus-20240229` - Best quality

### Option 3: Ollama (Local)

**Best for**: Privacy, offline use, no API costs

**Setup:**
1. Install Ollama: https://ollama.ai/
2. Pull a model: `ollama pull llama2`
3. Start Ollama: `ollama serve`
4. Set in `.env`: `VOICE_LLM_PROVIDER=ollama`

**Cost**: Free (runs on your hardware)

**Models:**
- `llama2` - General purpose (recommended)
- `mistral` - Fast and capable
- `phi` - Smaller, faster

---

## Character Personalities

### 🤖 Robo-Face

**Personality:**
- Formal, technical manner
- Warm and helpful
- Uses technical terms
- References "circuits" and "systems"

**Voice Settings:**
- Pitch: 1.0 (normal)
- Rate: 1.1 (slightly fast)

**Example Conversation:**
```
You: "Hello! How are you?"
Robo-Face: "Greetings! My systems are functioning optimally today.
How may I assist you?"
```

### 🐱 Cat-Face

**Personality:**
- Cute and playful
- Warm and affectionate
- Sometimes mischievous
- Occasional "nya~" or "meow"

**Voice Settings:**
- Pitch: 1.3 (higher)
- Rate: 1.0 (normal)

**Example Conversation:**
```
You: "Hello! How are you?"
Cat-Face: "Nya~ Hello there! I'm feeling pawsitively wonderful today!
Want to play? 🐾"
```

### 👾 Pixel-Friend

**Personality:**
- Nostalgic and retro
- Energetic and fun
- Uses gaming terminology
- References 8-bit era

**Voice Settings:**
- Pitch: 1.1 (slightly higher)
- Rate: 1.2 (fast)

**Example Conversation:**
```
You: "Hello! How are you?"
Pixel-Friend: "Level up! Player one has entered! I'm running at 60 FPS
and ready for action! Achievement unlocked: New Friend! ✨"
```

---

## API Endpoints

### POST /api/voice/chat

Process voice input and get LLM response.

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

### POST /api/voice/clear

Clear conversation history for a session.

**Request:**
```json
{
  "sessionId": "session-123"
}
```

**Response:**
```json
{
  "success": true
}
```

### GET /api/voice/history/:sessionId

Get conversation history.

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

## Emotion Detection

The plugin automatically detects emotions from conversation context:

| Emotion | Keywords |
|---------|----------|
| **happy** | happy, joy, excited, great, wonderful, amazing, love |
| **sad** | sad, sorry, unfortunate, disappointed, unhappy |
| **angry** | angry, furious, annoyed, frustrated, upset |
| **confused** | confused, uncertain, not sure, maybe, hmm |
| **excited** | excited, awesome, incredible, fantastic, wow |
| **curious** | wonder, interesting, curious, why, how, what |
| **loving** | love, care, affection, adore, cherish |
| **scared** | scary, afraid, worried, concerned, nervous |
| **surprised** | surprised, unexpected, oh, wow, really |
| **bored** | bored, meh, whatever, boring |
| **thinking** | think, consider, ponder, analyze, process |

---

## Frontend Integration

### Basic Usage

```javascript
// Voice client is automatically initialized
const voice = window.app.voiceClient;

// Start listening
voice.startListening();

// Stop listening
voice.stopListening();

// Speak text directly
voice.speak("Hello! I'm Robo-Face!");

// Change character
voice.setCharacter('cat-face');

// Clear history
await voice.clearHistory();
```

### Custom Integration

```javascript
const voice = new VoiceClient();

// Set callbacks
voice.onTranscript = (text) => {
  console.log('You said:', text);
};

voice.onResponse = (response) => {
  console.log('Character said:', response.text);
  console.log('Emotion:', response.emotion);
};

voice.onError = (error) => {
  console.error('Voice error:', error);
};

voice.onListeningChange = (isListening) => {
  console.log('Listening:', isListening);
};

// Check if enabled
const enabled = await voice.checkVoiceEnabled();
if (enabled) {
  voice.startListening();
}
```

---

## Browser Compatibility

| Browser | Speech Recognition | Text-to-Speech |
|---------|-------------------|----------------|
| Chrome | ✅ Yes | ✅ Yes |
| Edge | ✅ Yes | ✅ Yes |
| Safari | ⚠️ Limited | ✅ Yes |
| Firefox | ❌ No | ✅ Yes |

**Note**: For full voice support, use Chrome or Edge.

---

## Privacy & Security

### Data Handling

- **OpenAI/Anthropic**: Voice data sent to cloud APIs
- **Ollama**: Everything stays local, no cloud transmission
- **Conversation History**: Stored in server memory only
- **No Permanent Storage**: History cleared on server restart

### Best Practices

1. **Use Ollama** for privacy-sensitive deployments
2. **Don't share API keys** in public repositories
3. **Set appropriate rate limits** if publicly accessible
4. **Clear history** after sensitive conversations
5. **Use environment variables** for API keys

---

## Troubleshooting

### Voice button not appearing
- Check `.env`: `VOICE_ENABLED=true`
- Restart server after changing `.env`
- Check browser console for errors

### "Speech Recognition not supported"
- Use Chrome or Edge browser
- Check microphone permissions
- Try HTTPS (required by some browsers)

### LLM not responding
- Check API key is correct
- Verify internet connection (OpenAI/Anthropic)
- Check Ollama is running (local)
- View server logs: `npm start`

### Wrong emotion detected
- Emotion detection is keyword-based
- You can disable by not using `this.eventManager` in voice-plugin.js
- Or customize keywords in `emotionKeywords` object

### No voice output (TTS)
- Check browser audio permissions
- Verify speakers/headphones connected
- Try different browser
- Check browser TTS settings

---

## Advanced Customization

### Adding New Character Personality

Edit `backend/voice-plugin.js`:

```javascript
loadPersonalities() {
  return {
    // ... existing characters
    'my-character': {
      systemPrompt: `You are My-Character, a unique personality.
      You speak in a specific manner...
      Keep responses brief (1-3 sentences).`,
      traits: ['trait1', 'trait2'],
      voicePitch: 1.0,
      voiceRate: 1.0
    }
  };
}
```

### Custom Emotion Keywords

Edit `backend/voice-plugin.js`:

```javascript
this.emotionKeywords = {
  happy: ['happy', 'joy', 'yay', 'awesome'],
  // Add more...
  my_emotion: ['keyword1', 'keyword2']
};
```

### Change Voice Settings

Edit `frontend/js/voice-client.js`:

```javascript
this.voiceSettings = {
  'robo-face': { pitch: 0.8, rate: 1.3 }, // Deeper, faster
  // ... etc
};
```

---

## Performance Tips

1. **Use gpt-3.5-turbo** (fastest, cheapest)
2. **Set VOICE_HISTORY_LENGTH=5** for faster responses
3. **Use Ollama with smaller models** (phi, mistral)
4. **Limit max_tokens** in voice-plugin.js (currently 150)
5. **Add response caching** for common questions

---

## Cost Estimates

### Per 1000 Conversations

| Provider | Model | Cost |
|----------|-------|------|
| OpenAI | gpt-3.5-turbo | ~$2 |
| OpenAI | gpt-4 | ~$30 |
| Anthropic | Claude Haiku | ~$1 |
| Anthropic | Claude Sonnet | ~$15 |
| Ollama | Any | $0 |

---

## Examples

See `examples/voice/` directory for:
- Python integration
- Node.js integration
- MQTT voice triggers
- Custom voice commands

---

## Future Enhancements

Planned features:
- [ ] Wake word detection ("Hey Robo-Face")
- [ ] Multi-language support
- [ ] Voice activity detection (continuous listening)
- [ ] Conversation export/import
- [ ] Custom voice models
- [ ] Sentiment analysis
- [ ] Voice command shortcuts

---

## Support

For issues or questions:
1. Check [Troubleshooting](#troubleshooting) section
2. See [API Documentation](API.md)
3. Check server logs
4. Review browser console

---

## See Also

- [Main README](../README.md)
- [API Documentation](API.md)
- [Events Guide](EVENTS.md)
- [Deployment Plan](../DEPLOYMENT_PLAN.md)
