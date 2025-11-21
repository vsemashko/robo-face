const mqtt = require('mqtt');

/**
 * MQTT Client for Robo-Face
 * Allows triggering animations via MQTT messages
 */
class MqttClient {
  constructor(eventManager) {
    this.eventManager = eventManager;
    this.client = null;
    this.isConnected = false;

    // Configuration from environment
    this.enabled = process.env.MQTT_ENABLED === 'true';
    this.broker = process.env.MQTT_BROKER || 'mqtt://localhost:1883';
    this.topic = process.env.MQTT_TOPIC || 'robo-face/event';
    this.username = process.env.MQTT_USERNAME;
    this.password = process.env.MQTT_PASSWORD;

    // Additional topics
    this.commandTopic = process.env.MQTT_COMMAND_TOPIC || 'robo-face/command';
    this.statusTopic = process.env.MQTT_STATUS_TOPIC || 'robo-face/status';
  }

  /**
   * Connect to MQTT broker
   */
  connect() {
    if (!this.enabled) {
      console.log('MQTT is disabled');
      return;
    }

    console.log(`Connecting to MQTT broker: ${this.broker}`);

    const options = {
      clientId: `robo-face-${Math.random().toString(16).slice(2, 8)}`,
      clean: true,
      reconnectPeriod: 5000,
      connectTimeout: 10000
    };

    // Add authentication if provided
    if (this.username) {
      options.username = this.username;
      options.password = this.password;
    }

    try {
      this.client = mqtt.connect(this.broker, options);

      this.client.on('connect', () => {
        console.log('✓ Connected to MQTT broker');
        this.isConnected = true;

        // Subscribe to event topic
        this.client.subscribe(this.topic, (err) => {
          if (err) {
            console.error('Failed to subscribe to topic:', this.topic);
          } else {
            console.log(`Subscribed to topic: ${this.topic}`);
          }
        });

        // Subscribe to command topic
        this.client.subscribe(this.commandTopic, (err) => {
          if (err) {
            console.error('Failed to subscribe to command topic:', this.commandTopic);
          } else {
            console.log(`Subscribed to command topic: ${this.commandTopic}`);
          }
        });

        // Publish online status
        this.publishStatus('online');
      });

      this.client.on('message', (topic, message) => {
        this.handleMessage(topic, message);
      });

      this.client.on('error', (error) => {
        console.error('MQTT error:', error);
      });

      this.client.on('close', () => {
        console.log('MQTT connection closed');
        this.isConnected = false;
      });

      this.client.on('reconnect', () => {
        console.log('Reconnecting to MQTT broker...');
      });

      // Listen for state changes to publish status
      this.eventManager.on('stateChange', (newState) => {
        this.publishStatus('online', { state: newState });
      });

    } catch (error) {
      console.error('Error connecting to MQTT broker:', error);
    }
  }

  /**
   * Handle incoming MQTT message
   */
  handleMessage(topic, message) {
    try {
      const payload = message.toString();
      console.log(`MQTT message on ${topic}:`, payload);

      let data;
      try {
        data = JSON.parse(payload);
      } catch (e) {
        // If not JSON, treat as simple emotion string
        data = { type: 'emotion', value: payload.trim() };
      }

      // Handle different topics
      if (topic === this.commandTopic) {
        this.handleCommand(data);
      } else if (topic === this.topic) {
        this.handleEvent(data);
      }

    } catch (error) {
      console.error('Error handling MQTT message:', error);
    }
  }

  /**
   * Handle event message
   */
  handleEvent(data) {
    try {
      const result = this.eventManager.processEvent(data);
      console.log('Event processed:', result);

      // Optionally publish result
      if (this.client && this.isConnected) {
        this.client.publish(`${this.statusTopic}/event`, JSON.stringify(result), {
          qos: 0,
          retain: false
        });
      }
    } catch (error) {
      console.error('Error processing event:', error);
    }
  }

  /**
   * Handle command message
   */
  handleCommand(data) {
    console.log('Processing command:', data);

    switch (data.command) {
      case 'status':
        this.publishStatus('online', {
          state: this.eventManager.getCurrentState(),
          uptime: process.uptime()
        });
        break;

      case 'queue':
        this.publishQueueStatus();
        break;

      case 'clear_queue':
        this.eventManager.clearQueue();
        console.log('Queue cleared');
        break;

      default:
        console.log('Unknown command:', data.command);
    }
  }

  /**
   * Publish status message
   */
  publishStatus(status, data = {}) {
    if (!this.client || !this.isConnected) return;

    const payload = {
      status: status,
      timestamp: new Date().toISOString(),
      ...data
    };

    this.client.publish(this.statusTopic, JSON.stringify(payload), {
      qos: 1,
      retain: true
    });
  }

  /**
   * Publish queue status
   */
  publishQueueStatus() {
    if (!this.client || !this.isConnected) return;

    const queueStatus = this.eventManager.getQueueStatus();

    this.client.publish(`${this.statusTopic}/queue`, JSON.stringify(queueStatus), {
      qos: 0,
      retain: false
    });
  }

  /**
   * Disconnect from MQTT broker
   */
  disconnect() {
    if (this.client && this.isConnected) {
      this.publishStatus('offline');
      this.client.end();
      this.isConnected = false;
      console.log('Disconnected from MQTT broker');
    }
  }

  /**
   * Check if connected
   */
  connected() {
    return this.isConnected;
  }
}

module.exports = MqttClient;
