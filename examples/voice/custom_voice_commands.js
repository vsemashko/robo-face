#!/usr/bin/env node
/**
 * Custom Voice Commands Example
 *
 * This example demonstrates building a custom voice command system
 * on top of the Robo-Face voice plugin. It shows how to:
 * - Define custom voice commands
 * - Parse user intent
 * - Trigger specific actions
 * - Combine voice with emotions and animations
 *
 * Requirements:
 *   npm install axios
 *
 * Usage:
 *   node custom_voice_commands.js
 */

const axios = require('axios');

// Configuration
const BASE_URL = process.env.ROBO_FACE_URL || 'http://localhost:3000';
const CHARACTER = 'robo-face';

/**
 * Custom Voice Command System
 */
class VoiceCommandSystem {
  constructor(baseUrl = BASE_URL, character = CHARACTER) {
    this.baseUrl = baseUrl;
    this.character = character;
    this.axios = axios.create({
      baseURL: baseUrl,
      timeout: 30000,
      headers: { 'Content-Type': 'application/json' }
    });

    // Define custom commands
    this.commands = this.defineCommands();
  }

  /**
   * Define custom voice commands
   */
  defineCommands() {
    return {
      // Greeting commands
      greeting: {
        patterns: ['hello', 'hi', 'hey', 'greetings'],
        action: async () => {
          await this.triggerEmotion('happy', 3000);
          return await this.chat("Hello! It's great to see you!");
        }
      },

      // Status check
      status: {
        patterns: ['status', 'how are you', 'are you ok', 'systems'],
        action: async () => {
          const health = await this.getHealth();
          await this.triggerEmotion('thinking', 2000);
          return await this.chat(
            `Let me check my systems. All systems are operational! ` +
            `I'm connected to ${health.clients} client(s) and have been ` +
            `running for ${Math.floor(health.uptime)} seconds.`
          );
        }
      },

      // Emotion triggers
      happy: {
        patterns: ['make happy', 'be happy', 'smile', 'cheer up'],
        action: async () => {
          await this.triggerEmotion('happy', 5000);
          return await this.chat("I'm feeling happy now! 😊");
        }
      },

      excited: {
        patterns: ['get excited', 'be excited', 'celebrate'],
        action: async () => {
          await this.triggerEmotion('excited', 5000);
          return await this.chat("This is so exciting! Let's celebrate! 🎉");
        }
      },

      thinking: {
        patterns: ['think', 'analyze', 'process', 'compute'],
        action: async () => {
          await this.triggerEmotion('thinking', 5000);
          return await this.chat("Let me think about that... 🤔");
        }
      },

      // Time and date
      time: {
        patterns: ['what time', 'time is it', 'current time'],
        action: async () => {
          const now = new Date();
          const timeStr = now.toLocaleTimeString();
          await this.triggerEmotion('alert', 2000);
          return { text: `The current time is ${timeStr}` };
        }
      },

      date: {
        patterns: ['what date', 'what day', 'today'],
        action: async () => {
          const now = new Date();
          const dateStr = now.toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          });
          await this.triggerEmotion('alert', 2000);
          return { text: `Today is ${dateStr}` };
        }
      },

      // Animation control
      sleep: {
        patterns: ['go to sleep', 'sleep mode', 'rest'],
        action: async () => {
          await this.triggerEmotion('sleeping', 10000);
          return { text: "Going into sleep mode... Zzz... 😴" };
        }
      },

      wake: {
        patterns: ['wake up', 'wake', 'awake'],
        action: async () => {
          await this.triggerEmotion('surprised', 2000);
          return await this.chat("I'm awake! What did I miss?");
        }
      },

      // Character switching
      'switch-cat': {
        patterns: ['become cat', 'cat mode', 'meow'],
        action: async () => {
          this.character = 'cat-face';
          await this.triggerEmotion('excited', 3000);
          return await this.chat("Nya~ I'm a cat now! 🐱");
        }
      },

      'switch-pixel': {
        patterns: ['become pixel', 'retro mode', '8-bit'],
        action: async () => {
          this.character = 'pixel-friend';
          await this.triggerEmotion('excited', 3000);
          return await this.chat("Level up! Pixel mode activated! 👾");
        }
      },

      'switch-robo': {
        patterns: ['become robot', 'robot mode', 'robo'],
        action: async () => {
          this.character = 'robo-face';
          await this.triggerEmotion('alert', 2000);
          return await this.chat("Robot mode engaged! Systems online! 🤖");
        }
      },

      // Help command
      help: {
        patterns: ['help', 'what can you do', 'commands', 'capabilities'],
        action: async () => {
          await this.triggerEmotion('thinking', 2000);
          return {
            text: `I can respond to various commands like:\n` +
                  `- Greetings (hello, hi)\n` +
                  `- Status checks (status, how are you)\n` +
                  `- Emotions (be happy, get excited, think)\n` +
                  `- Time/Date (what time, what date)\n` +
                  `- Sleep/Wake (go to sleep, wake up)\n` +
                  `- Character switching (cat mode, pixel mode)\n` +
                  `Try saying any of these!`
          };
        }
      }
    };
  }

  /**
   * Process voice input and check for commands
   */
  async processInput(input) {
    const lowerInput = input.toLowerCase();

    // Check if input matches any command pattern
    for (const [name, command] of Object.entries(this.commands)) {
      for (const pattern of command.patterns) {
        if (lowerInput.includes(pattern)) {
          console.log(`✓ Matched command: ${name}`);
          return await command.action();
        }
      }
    }

    // No command matched, use normal LLM chat
    return await this.chat(input);
  }

  /**
   * Send chat message to API
   */
  async chat(text) {
    try {
      const response = await this.axios.post('/api/voice/chat', {
        text,
        character: this.character,
        sessionId: 'custom-commands'
      });
      return response.data;
    } catch (error) {
      console.error(`Chat error: ${error.message}`);
      return null;
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
      console.log(`✓ Triggered emotion: ${emotion}`);
    } catch (error) {
      console.error(`Emotion trigger error: ${error.message}`);
    }
  }

  /**
   * Get health status
   */
  async getHealth() {
    try {
      const response = await this.axios.get('/api/health');
      return response.data;
    } catch (error) {
      console.error(`Health check error: ${error.message}`);
      return {};
    }
  }

  /**
   * Clear conversation history
   */
  async clearHistory() {
    try {
      await this.axios.post('/api/voice/clear', {
        sessionId: 'custom-commands'
      });
      console.log('✓ History cleared');
    } catch (error) {
      console.error(`Clear history error: ${error.message}`);
    }
  }
}

/**
 * Interactive demo
 */
async function interactiveDemo() {
  const system = new VoiceCommandSystem();
  const readline = require('readline');

  console.log('🎤 Custom Voice Command System');
  console.log('===============================\n');
  console.log('Try these commands:');
  console.log('  - Hello');
  console.log('  - Status check');
  console.log('  - Make me happy');
  console.log('  - What time is it?');
  console.log('  - Go to sleep');
  console.log('  - Cat mode');
  console.log('  - Help');
  console.log('\nType /quit to exit\n');

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    prompt: 'You: '
  });

  rl.prompt();

  rl.on('line', async (line) => {
    const input = line.trim();

    if (input === '/quit') {
      console.log('Goodbye!');
      rl.close();
      return;
    }

    if (!input) {
      rl.prompt();
      return;
    }

    try {
      const response = await system.processInput(input);

      if (response) {
        console.log(`${system.character}: ${response.text}`);
        if (response.emotion) {
          console.log(`[Emotion: ${response.emotion}]`);
        }
        console.log();
      }
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
 * Automated demo
 */
async function automatedDemo() {
  const system = new VoiceCommandSystem();

  console.log('🎤 Automated Voice Command Demo\n');

  const testInputs = [
    'Hello there!',
    'What time is it?',
    'Make me happy!',
    'Status check please',
    'Get excited!',
    'Switch to cat mode',
    'Meow!',
    'What can you do?',
    'Go to sleep',
  ];

  console.log('Running test commands...\n');

  for (const input of testInputs) {
    console.log(`\n🗣️  You: ${input}`);

    const response = await system.processInput(input);

    if (response) {
      console.log(`💬 ${system.character}: ${response.text}`);
      if (response.emotion) {
        console.log(`😊 Emotion: ${response.emotion}`);
      }
    }

    // Pause between commands
    await new Promise(resolve => setTimeout(resolve, 2000));
  }

  console.log('\n✓ Demo completed!\n');
}

/**
 * Main entry point
 */
async function main() {
  const args = process.argv.slice(2);

  if (args.includes('--auto')) {
    await automatedDemo();
  } else if (args.includes('--help')) {
    console.log('Usage:');
    console.log('  node custom_voice_commands.js       # Interactive mode');
    console.log('  node custom_voice_commands.js --auto  # Automated demo');
    console.log('  node custom_voice_commands.js --help  # Show this help');
  } else {
    await interactiveDemo();
  }
}

// Run if called directly
if (require.main === module) {
  main().catch(error => {
    console.error(`Fatal error: ${error.message}`);
    process.exit(1);
  });
}

// Export for use as module
module.exports = { VoiceCommandSystem };
