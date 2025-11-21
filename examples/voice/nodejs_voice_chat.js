#!/usr/bin/env node
/**
 * Node.js Voice Chat Example
 *
 * This example shows how to interact with the Robo-Face voice API
 * using Node.js. It demonstrates both programmatic usage and
 * building a custom voice assistant.
 *
 * Requirements:
 *   npm install axios readline
 *
 * Usage:
 *   node nodejs_voice_chat.js
 *   node nodejs_voice_chat.js --examples
 */

const axios = require('axios');
const readline = require('readline');

// Configuration
const BASE_URL = process.env.ROBO_FACE_URL || 'http://localhost:3000';
const DEFAULT_CHARACTER = 'robo-face';
const SESSION_ID = 'nodejs-session';

/**
 * Voice API Client
 */
class VoiceClient {
  constructor(baseUrl = BASE_URL) {
    this.baseUrl = baseUrl;
    this.axios = axios.create({
      baseURL: baseUrl,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }

  /**
   * Send a chat message
   */
  async chat(text, character = DEFAULT_CHARACTER, sessionId = SESSION_ID) {
    try {
      const response = await this.axios.post('/api/voice/chat', {
        text,
        character,
        sessionId
      });
      return response.data;
    } catch (error) {
      throw new Error(`Chat failed: ${error.message}`);
    }
  }

  /**
   * Clear conversation history
   */
  async clearHistory(sessionId = SESSION_ID) {
    try {
      await this.axios.post('/api/voice/clear', { sessionId });
      return true;
    } catch (error) {
      throw new Error(`Clear history failed: ${error.message}`);
    }
  }

  /**
   * Get conversation history
   */
  async getHistory(sessionId = SESSION_ID) {
    try {
      const response = await this.axios.get(`/api/voice/history/${sessionId}`);
      return response.data.history;
    } catch (error) {
      throw new Error(`Get history failed: ${error.message}`);
    }
  }

  /**
   * Check if voice is enabled
   */
  async isVoiceEnabled() {
    try {
      const response = await this.axios.get('/api/health');
      return response.data.voiceEnabled || false;
    } catch (error) {
      return false;
    }
  }

  /**
   * Trigger an emotion
   */
  async triggerEmotion(emotion, duration = 5000) {
    try {
      await this.axios.post('/api/event', {
        type: 'emotion',
        value: emotion,
        duration
      });
      return true;
    } catch (error) {
      throw new Error(`Trigger emotion failed: ${error.message}`);
    }
  }
}

/**
 * Interactive chat mode
 */
async function interactiveMode(client) {
  console.log('🤖 Robo-Face Voice Chat (Node.js)');
  console.log(`Server: ${BASE_URL}`);
  console.log(`Session: ${SESSION_ID}`);
  console.log('\nCommands:');
  console.log('  /clear - Clear conversation history');
  console.log('  /history - Show conversation history');
  console.log('  /character <name> - Switch character');
  console.log('  /emotion <name> - Trigger emotion');
  console.log('  /quit - Exit');
  console.log('\nType your message and press Enter:\n');

  let currentCharacter = DEFAULT_CHARACTER;

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    prompt: 'You: '
  });

  rl.prompt();

  rl.on('line', async (line) => {
    const input = line.trim();

    if (!input) {
      rl.prompt();
      return;
    }

    // Handle commands
    if (input.startsWith('/')) {
      const [cmd, ...args] = input.split(' ');

      try {
        switch (cmd) {
          case '/quit':
            console.log('Goodbye!');
            rl.close();
            return;

          case '/clear':
            await client.clearHistory();
            console.log('✓ Conversation history cleared\n');
            break;

          case '/history':
            const history = await client.getHistory();
            console.log('\n--- Conversation History ---');
            history.forEach(msg => {
              const role = msg.role === 'user' ? 'You' : currentCharacter;
              console.log(`${role}: ${msg.content}`);
            });
            console.log('----------------------------\n');
            break;

          case '/character':
            if (args.length > 0) {
              currentCharacter = args[0];
              console.log(`✓ Switched to ${currentCharacter}\n`);
            } else {
              console.log('Usage: /character <name>\n');
            }
            break;

          case '/emotion':
            if (args.length > 0) {
              await client.triggerEmotion(args[0]);
              console.log(`✓ Triggered emotion: ${args[0]}\n`);
            } else {
              console.log('Usage: /emotion <name>\n');
            }
            break;

          default:
            console.log(`Unknown command: ${cmd}\n`);
        }
      } catch (error) {
        console.error(`Error: ${error.message}\n`);
      }

      rl.prompt();
      return;
    }

    // Send message
    try {
      const response = await client.chat(input, currentCharacter);
      console.log(`${currentCharacter}: ${response.text}`);
      console.log(`[Emotion: ${response.emotion}]\n`);
    } catch (error) {
      console.error(`Error: ${error.message}\n`);
    }

    rl.prompt();
  });

  rl.on('close', () => {
    process.exit(0);
  });
}

/**
 * Run example conversations
 */
async function runExamples(client) {
  console.log('🤖 Running Example Conversations\n');

  try {
    // Example 1: Single conversation
    console.log('--- Example 1: Basic Conversation ---');
    const response1 = await client.chat('Hello! Tell me about yourself.', 'robo-face');
    console.log(`You: Hello! Tell me about yourself.`);
    console.log(`Robo-Face: ${response1.text}`);
    console.log(`Emotion: ${response1.emotion}\n`);

    // Example 2: Conversation with context
    console.log('--- Example 2: Contextual Conversation ---');
    await client.clearHistory('example-session');

    const response2a = await client.chat('What is your favorite color?', 'cat-face', 'example-session');
    console.log(`You: What is your favorite color?`);
    console.log(`Cat-Face: ${response2a.text}\n`);

    const response2b = await client.chat('Why do you like that color?', 'cat-face', 'example-session');
    console.log(`You: Why do you like that color?`);
    console.log(`Cat-Face: ${response2b.text}\n`);

    // Example 3: Emotion-driven conversation
    console.log('--- Example 3: Emotion-Driven Conversation ---');
    const response3 = await client.chat('I have great news!', 'pixel-friend');
    console.log(`You: I have great news!`);
    console.log(`Pixel-Friend: ${response3.text}`);
    console.log(`Emotion: ${response3.emotion}`);

    // The emotion will be automatically triggered on the display
    console.log(`(Character display shows "${response3.emotion}" emotion)\n`);

    // Example 4: Multi-turn conversation
    console.log('--- Example 4: Multi-Turn Conversation ---');
    await client.clearHistory('multi-turn');

    const questions = [
      "What do you like to do for fun?",
      "That sounds interesting! Can you tell me more?",
      "Thanks for sharing!"
    ];

    for (const question of questions) {
      const response = await client.chat(question, 'robo-face', 'multi-turn');
      console.log(`You: ${question}`);
      console.log(`Robo-Face: ${response.text}\n`);
      await new Promise(resolve => setTimeout(resolve, 1000)); // Pause between messages
    }

    console.log('✓ Examples completed!\n');

  } catch (error) {
    console.error(`Error running examples: ${error.message}`);
  }
}

/**
 * Build a simple voice assistant
 */
async function voiceAssistant(client) {
  console.log('🤖 Voice Assistant Demo\n');
  console.log('This demonstrates building a custom voice assistant');
  console.log('that can handle specific commands and queries.\n');

  const commands = [
    "What time is it?",
    "Tell me a joke",
    "How's the weather?",
    "What can you do?"
  ];

  try {
    await client.clearHistory('assistant');

    console.log('Processing commands...\n');

    for (const command of commands) {
      console.log(`Command: ${command}`);
      const response = await client.chat(command, 'robo-face', 'assistant');
      console.log(`Response: ${response.text}`);
      console.log(`Emotion: ${response.emotion}\n`);

      await new Promise(resolve => setTimeout(resolve, 500));
    }

    console.log('✓ Assistant demo completed!\n');

  } catch (error) {
    console.error(`Error running assistant: ${error.message}`);
  }
}

/**
 * Main entry point
 */
async function main() {
  const client = new VoiceClient();

  // Check if voice is enabled
  const voiceEnabled = await client.isVoiceEnabled();

  if (!voiceEnabled) {
    console.error('❌ Error: Voice plugin is not enabled on the server\n');
    console.error('To enable voice:');
    console.error('1. Edit .env file');
    console.error('2. Set VOICE_ENABLED=true');
    console.error('3. Set VOICE_LLM_PROVIDER=openai (or anthropic/ollama)');
    console.error('4. Add your API key');
    console.error('5. Restart the server');
    process.exit(1);
  }

  console.log('✓ Voice plugin is enabled\n');

  // Parse command line arguments
  const args = process.argv.slice(2);

  if (args.includes('--examples')) {
    await runExamples(client);
  } else if (args.includes('--assistant')) {
    await voiceAssistant(client);
  } else if (args.includes('--help')) {
    console.log('Usage:');
    console.log('  node nodejs_voice_chat.js              # Interactive mode');
    console.log('  node nodejs_voice_chat.js --examples   # Run examples');
    console.log('  node nodejs_voice_chat.js --assistant  # Voice assistant demo');
    console.log('  node nodejs_voice_chat.js --help       # Show this help');
  } else {
    await interactiveMode(client);
  }
}

// Run main function
if (require.main === module) {
  main().catch(error => {
    console.error(`Fatal error: ${error.message}`);
    process.exit(1);
  });
}

// Export client for use as module
module.exports = { VoiceClient };
