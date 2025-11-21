#!/usr/bin/env node
/**
 * WebSocket Client Example
 * Demonstrates real-time communication with Robo-Face
 */

const WebSocket = require('ws');

const WS_URL = process.env.WS_URL || 'ws://localhost:3000';

class RoboFaceClient {
  constructor(url) {
    this.url = url;
    this.ws = null;
    this.reconnectDelay = 1000;
    this.maxReconnectDelay = 30000;
  }

  connect() {
    console.log(`Connecting to ${this.url}...`);

    this.ws = new WebSocket(this.url);

    this.ws.on('open', () => {
      console.log('✓ Connected to Robo-Face');
      this.reconnectDelay = 1000;

      // Example: Trigger happy emotion after connecting
      this.triggerEmotion('happy', 3000);
    });

    this.ws.on('message', (data) => {
      try {
        const message = JSON.parse(data);
        this.handleMessage(message);
      } catch (error) {
        console.error('Error parsing message:', error);
      }
    });

    this.ws.on('close', () => {
      console.log('✗ Disconnected from Robo-Face');
      this.reconnect();
    });

    this.ws.on('error', (error) => {
      console.error('WebSocket error:', error.message);
    });
  }

  reconnect() {
    console.log(`Reconnecting in ${this.reconnectDelay}ms...`);

    setTimeout(() => {
      this.reconnectDelay = Math.min(this.reconnectDelay * 2, this.maxReconnectDelay);
      this.connect();
    }, this.reconnectDelay);
  }

  handleMessage(message) {
    console.log('← Received:', message);

    switch (message.type) {
      case 'state':
        console.log(`   Current state: ${message.state}`);
        break;

      case 'stateChange':
        console.log(`   State changed to: ${message.state}`);
        break;

      case 'animation':
        console.log(`   Animation: ${message.state} (${message.duration}ms)`);
        break;

      case 'error':
        console.error(`   Error: ${message.message}`);
        break;
    }
  }

  triggerEmotion(emotion, duration = 3000) {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      console.log('⚠ Not connected');
      return;
    }

    const message = {
      type: 'emotion',
      value: emotion,
      duration: duration
    };

    console.log('→ Sending:', message);
    this.ws.send(JSON.stringify(message));
  }

  triggerEvent(eventType, data = {}) {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      console.log('⚠ Not connected');
      return;
    }

    const message = {
      type: eventType,
      ...data
    };

    console.log('→ Sending:', message);
    this.ws.send(JSON.stringify(message));
  }

  close() {
    if (this.ws) {
      this.ws.close();
    }
  }
}

// Example usage
function main() {
  console.log('WebSocket Client Example');
  console.log('========================\n');

  const client = new RoboFaceClient(WS_URL);
  client.connect();

  // Example: Trigger different emotions every 5 seconds
  const emotions = ['idle', 'happy', 'thinking', 'alert', 'sad', 'surprised', 'sleeping'];
  let index = 0;

  const interval = setInterval(() => {
    const emotion = emotions[index % emotions.length];
    console.log(`\nTriggering: ${emotion}`);
    client.triggerEmotion(emotion, 4000);
    index++;
  }, 6000);

  // Cleanup on exit
  process.on('SIGINT', () => {
    console.log('\n\nShutting down...');
    clearInterval(interval);
    client.triggerEmotion('sleeping', 2000);
    setTimeout(() => {
      client.close();
      process.exit(0);
    }, 2500);
  });
}

if (require.main === module) {
  main();
}

module.exports = RoboFaceClient;
