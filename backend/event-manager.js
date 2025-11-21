const EventEmitter = require('events');
const eventConfig = require('./config/events.json');

class EventManager extends EventEmitter {
  constructor() {
    super();
    this.currentState = process.env.DEFAULT_STATE || 'idle';
    this.eventQueue = [];
    this.maxQueueSize = parseInt(process.env.EVENT_QUEUE_SIZE) || 10;
    this.isProcessing = false;
    this.stateHistory = [];
    this.maxHistorySize = 50;

    // Load states from config
    this.states = {};
    Object.keys(eventConfig.states || {}).forEach(stateName => {
      const stateConfig = eventConfig.states[stateName];
      this.states[stateName] = {
        priority: stateConfig.priority || 0,
        interruptible: stateConfig.priority < 8  // High priority states (8+) are non-interruptible
      };
    });

    // Load event mappings from config
    this.eventMappings = eventConfig.mappings || {};
  }

  /**
   * Get current animation state
   */
  getCurrentState() {
    return this.currentState;
  }

  /**
   * Get available animations
   */
  getAvailableAnimations() {
    return Object.keys(this.states);
  }

  /**
   * Process an incoming event
   */
  processEvent(event) {
    console.log('Processing event:', event);

    // Determine target state from event
    const targetState = this.mapEventToState(event);

    if (!targetState) {
      throw new Error(`Unable to map event type "${event.type}" to a state`);
    }

    // Validate state exists
    if (!this.states[targetState]) {
      throw new Error(`Invalid state: ${targetState}`);
    }

    // Get duration (default 3000ms)
    const duration = event.duration || parseInt(process.env.DEFAULT_ANIMATION_DURATION) || 3000;

    // Create animation command
    const animationCommand = {
      state: targetState,
      duration: duration,
      priority: this.states[targetState].priority,
      timestamp: Date.now(),
      metadata: event.metadata || {}
    };

    // Check if we should interrupt current state
    if (this.shouldInterrupt(animationCommand)) {
      this.changeState(targetState);
      this.scheduleReturn(duration);

      return {
        type: 'animation',
        state: targetState,
        duration: duration,
        interrupted: true
      };
    } else {
      // Queue the event if queue not full
      if (this.eventQueue.length < this.maxQueueSize) {
        this.eventQueue.push(animationCommand);
        this.eventQueue.sort((a, b) => b.priority - a.priority);

        return {
          type: 'queued',
          state: targetState,
          queuePosition: this.eventQueue.indexOf(animationCommand),
          queueSize: this.eventQueue.length
        };
      } else {
        return {
          type: 'dropped',
          state: targetState,
          reason: 'Queue full'
        };
      }
    }
  }

  /**
   * Map event to animation state
   */
  mapEventToState(event) {
    // Direct state specification
    if (event.state) {
      return event.state;
    }

    // Event type mapping
    if (event.type === 'emotion') {
      return event.value || 'idle';
    }

    // Use configuration mapping
    const mapping = this.eventMappings[event.type];
    if (mapping) {
      return mapping.state || mapping;
    }

    // System events
    if (event.type === 'system.boot') return 'happy';
    if (event.type === 'system.error') return 'sad';
    if (event.type === 'system.shutdown') return 'sleeping';

    // Time events
    if (event.type === 'time.idle') return 'sleeping';
    if (event.type === 'time.morning') return 'happy';

    // Notification events
    if (event.type === 'notification.message') return 'happy';
    if (event.type === 'notification.alert') return 'alert';

    // Sensor events
    if (event.type === 'sensor.motion') return 'surprised';

    // Default to idle for unknown events
    return 'idle';
  }

  /**
   * Determine if current state should be interrupted
   */
  shouldInterrupt(incomingAnimation) {
    const currentStateConfig = this.states[this.currentState];

    // Always interrupt if current state is interruptible and incoming has higher priority
    if (currentStateConfig.interruptible) {
      return incomingAnimation.priority >= currentStateConfig.priority;
    }

    // Don't interrupt non-interruptible states unless much higher priority
    return incomingAnimation.priority > currentStateConfig.priority + 3;
  }

  /**
   * Change to a new state
   */
  changeState(newState) {
    const previousState = this.currentState;

    if (newState !== previousState) {
      // Add to history
      this.stateHistory.push({
        from: previousState,
        to: newState,
        timestamp: Date.now()
      });

      // Trim history
      if (this.stateHistory.length > this.maxHistorySize) {
        this.stateHistory.shift();
      }

      this.currentState = newState;
      this.emit('stateChange', newState, previousState);

      console.log(`State changed: ${previousState} -> ${newState}`);
    }

    return newState;
  }

  /**
   * Schedule return to idle state after duration
   */
  scheduleReturn(duration) {
    if (this.returnTimer) {
      clearTimeout(this.returnTimer);
    }

    this.returnTimer = setTimeout(() => {
      // Check if there are queued events
      if (this.eventQueue.length > 0) {
        const nextEvent = this.eventQueue.shift();
        this.changeState(nextEvent.state);
        this.scheduleReturn(nextEvent.duration);
      } else {
        // Return to idle
        this.changeState('idle');
      }
    }, duration);
  }

  /**
   * Get state history
   */
  getStateHistory(limit = 10) {
    return this.stateHistory.slice(-limit);
  }

  /**
   * Clear event queue
   */
  clearQueue() {
    this.eventQueue = [];
  }

  /**
   * Get queue status
   */
  getQueueStatus() {
    return {
      size: this.eventQueue.length,
      maxSize: this.maxQueueSize,
      events: this.eventQueue.map(e => ({
        state: e.state,
        priority: e.priority,
        timestamp: e.timestamp
      }))
    };
  }
}

module.exports = EventManager;
