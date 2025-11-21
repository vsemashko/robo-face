/**
 * WebSocket Client
 * Handles real-time communication with the backend server
 */
class WebSocketClient {
  constructor() {
    this.ws = null;
    this.isConnected = false;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 10;
    this.reconnectDelay = 1000;
    this.messageHandlers = [];
    this.stateChangeHandlers = [];
    this.connectionHandlers = [];
  }

  /**
   * Connect to WebSocket server
   */
  connect(url = null) {
    // Auto-detect WebSocket URL
    if (!url) {
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const host = window.location.host;
      url = `${protocol}//${host}`;
    }

    console.log('Connecting to WebSocket:', url);

    try {
      this.ws = new WebSocket(url);

      this.ws.onopen = () => {
        console.log('WebSocket connected');
        this.isConnected = true;
        this.reconnectAttempts = 0;
        this.notifyConnectionChange('connected');
      };

      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          this.handleMessage(data);
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };

      this.ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        this.notifyConnectionChange('error');
      };

      this.ws.onclose = () => {
        console.log('WebSocket disconnected');
        this.isConnected = false;
        this.notifyConnectionChange('disconnected');
        this.attemptReconnect(url);
      };
    } catch (error) {
      console.error('Error creating WebSocket:', error);
      this.attemptReconnect(url);
    }
  }

  /**
   * Attempt to reconnect
   */
  attemptReconnect(url) {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      const delay = this.reconnectDelay * Math.pow(1.5, this.reconnectAttempts - 1);

      console.log(`Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
      this.notifyConnectionChange('connecting');

      setTimeout(() => {
        this.connect(url);
      }, delay);
    } else {
      console.error('Max reconnection attempts reached');
      this.notifyConnectionChange('failed');
    }
  }

  /**
   * Handle incoming message
   */
  handleMessage(data) {
    console.log('WebSocket message:', data);

    // Handle different message types
    switch (data.type) {
      case 'state':
      case 'stateChange':
        this.notifyStateChange(data.state);
        break;
      case 'animation':
        this.notifyStateChange(data.state, data.duration);
        break;
      case 'error':
        console.error('Server error:', data.message);
        break;
      default:
        // Notify all message handlers
        this.messageHandlers.forEach(handler => {
          try {
            handler(data);
          } catch (error) {
            console.error('Error in message handler:', error);
          }
        });
    }
  }

  /**
   * Send message to server
   */
  send(data) {
    if (this.isConnected && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(data));
      return true;
    } else {
      console.warn('Cannot send message: WebSocket not connected');
      return false;
    }
  }

  /**
   * Trigger an emotion
   */
  triggerEmotion(emotion, duration = 3000) {
    return this.send({
      type: 'emotion',
      value: emotion,
      duration: duration
    });
  }

  /**
   * Trigger a custom event
   */
  triggerEvent(eventType, data = {}) {
    return this.send({
      type: eventType,
      ...data
    });
  }

  /**
   * Register a message handler
   */
  onMessage(handler) {
    this.messageHandlers.push(handler);
  }

  /**
   * Register a state change handler
   */
  onStateChange(handler) {
    this.stateChangeHandlers.push(handler);
  }

  /**
   * Register a connection change handler
   */
  onConnectionChange(handler) {
    this.connectionHandlers.push(handler);
  }

  /**
   * Notify state change handlers
   */
  notifyStateChange(state, duration) {
    this.stateChangeHandlers.forEach(handler => {
      try {
        handler(state, duration);
      } catch (error) {
        console.error('Error in state change handler:', error);
      }
    });
  }

  /**
   * Notify connection change handlers
   */
  notifyConnectionChange(status) {
    this.connectionHandlers.forEach(handler => {
      try {
        handler(status);
      } catch (error) {
        console.error('Error in connection handler:', error);
      }
    });
  }

  /**
   * Close connection
   */
  close() {
    if (this.ws) {
      this.reconnectAttempts = this.maxReconnectAttempts; // Prevent reconnect
      this.ws.close();
    }
  }

  /**
   * Get connection status
   */
  getStatus() {
    if (!this.ws) return 'disconnected';

    switch (this.ws.readyState) {
      case WebSocket.CONNECTING:
        return 'connecting';
      case WebSocket.OPEN:
        return 'connected';
      case WebSocket.CLOSING:
        return 'closing';
      case WebSocket.CLOSED:
        return 'disconnected';
      default:
        return 'unknown';
    }
  }
}
