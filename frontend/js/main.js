/**
 * Main Application
 * Initializes and coordinates all components
 */
class RoboFaceApp {
  constructor() {
    this.canvas = document.getElementById('canvas');
    this.renderer = new Renderer(this.canvas);
    this.animator = new Animator(30); // 30 FPS
    this.characterManager = new CharacterManager(this.renderer, this.animator);
    this.wsClient = new WebSocketClient();

    // Debug elements
    this.debugCharacter = document.getElementById('debug-character');
    this.debugState = document.getElementById('debug-state');
    this.debugFps = document.getElementById('debug-fps');
    this.debugConnection = document.getElementById('debug-connection');

    // Check if in production mode
    this.isProduction = window.location.search.includes('production') ||
                        window.location.search.includes('kiosk');

    if (this.isProduction) {
      document.body.classList.add('production');
      document.body.classList.add('kiosk');
    }

    this.init();
  }

  /**
   * Initialize the application
   */
  init() {
    console.log('🤖 Initializing Robo-Face...');

    // Set up animation callbacks
    this.animator.onUpdate((deltaTime) => this.update(deltaTime));
    this.animator.onRender((deltaTime) => this.render(deltaTime));

    // Set up WebSocket handlers
    this.wsClient.onStateChange((state, duration) => {
      console.log(`State change: ${state} (${duration}ms)`);
      this.characterManager.setState(state);
    });

    this.wsClient.onConnectionChange((status) => {
      console.log(`Connection status: ${status}`);
      this.updateConnectionStatus(status);
    });

    // Connect to WebSocket
    this.wsClient.connect();

    // Start animation loop
    this.animator.start();

    // Update debug info periodically
    setInterval(() => this.updateDebugInfo(), 100);

    // Update character selector UI
    this.updateCharacterSelector();

    // Expose to window for test controls
    window.app = this;

    console.log('✓ Robo-Face initialized');
  }

  /**
   * Update game state
   */
  update(deltaTime) {
    this.characterManager.update(deltaTime);
  }

  /**
   * Render frame
   */
  render(deltaTime) {
    this.renderer.clear();
    this.characterManager.render();
  }

  /**
   * Update debug information
   */
  updateDebugInfo() {
    if (this.debugCharacter) {
      this.debugCharacter.textContent = this.characterManager.getCharacterType();
    }

    if (this.debugState) {
      this.debugState.textContent = this.characterManager.getState();
    }

    if (this.debugFps) {
      this.debugFps.textContent = this.animator.getFps();
    }
  }

  /**
   * Update character selector buttons
   */
  updateCharacterSelector() {
    const currentChar = this.characterManager.getCharacterType();
    const buttons = document.querySelectorAll('.char-btn');

    buttons.forEach(btn => {
      if (btn.dataset.char === currentChar) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });
  }

  /**
   * Update connection status display
   */
  updateConnectionStatus(status) {
    if (this.debugConnection) {
      this.debugConnection.textContent = status;
      this.debugConnection.className = status;
    }
  }

  /**
   * Switch character
   */
  switchCharacter(characterType) {
    console.log(`Switching to character: ${characterType}`);
    const success = this.characterManager.switchCharacter(characterType);

    if (success) {
      this.updateCharacterSelector();
    }

    return success;
  }

  /**
   * Trigger an emotion (for test controls)
   */
  triggerEmotion(emotion) {
    console.log(`Triggering emotion: ${emotion}`);
    this.wsClient.triggerEmotion(emotion);
  }

  /**
   * Trigger a custom event
   */
  triggerEvent(eventType, data) {
    this.wsClient.triggerEvent(eventType, data);
  }

  /**
   * Get current state
   */
  getState() {
    return this.characterManager.getState();
  }

  /**
   * Get FPS
   */
  getFps() {
    return this.animator.getFps();
  }

  /**
   * Get connection status
   */
  getConnectionStatus() {
    return this.wsClient.getStatus();
  }
}

// Initialize app when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    new RoboFaceApp();
  });
} else {
  new RoboFaceApp();
}
