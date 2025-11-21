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

    // Voice elements
    this.voiceControls = document.getElementById('voice-controls');
    this.voiceBtn = document.getElementById('voice-btn');
    this.voiceStatus = document.getElementById('voice-status');

    // Check if in production mode
    this.isProduction = window.location.search.includes('production') ||
                        window.location.search.includes('kiosk');

    if (this.isProduction) {
      document.body.classList.add('production');
      document.body.classList.add('kiosk');
    }

    // Initialize voice client (will be null if voice not supported)
    this.voiceClient = null;

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

    // Initialize voice client if available
    this.initVoice();

    // Expose to window for test controls
    window.app = this;

    console.log('✓ Robo-Face initialized');
  }

  /**
   * Initialize voice client
   */
  async initVoice() {
    try {
      // Check if voice is enabled on backend
      const response = await fetch('/api/health');
      const data = await response.json();

      if (data.voiceEnabled && typeof VoiceClient !== 'undefined') {
        this.voiceClient = new VoiceClient();

        // Set current character
        this.voiceClient.setCharacter(this.characterManager.getCharacterType());

        // Set up callbacks
        this.voiceClient.onTranscript = (text) => {
          console.log('Voice transcript:', text);
          if (this.voiceStatus) {
            this.voiceStatus.textContent = `You: ${text}`;
            this.voiceStatus.classList.add('active');
          }
        };

        this.voiceClient.onResponse = (response) => {
          console.log('Voice response:', response.text);
          if (this.voiceStatus) {
            this.voiceStatus.textContent = `${this.characterManager.getCharacterType()}: ${response.text.substring(0, 50)}...`;
            this.voiceStatus.classList.remove('listening');
            this.voiceStatus.classList.add('active');
          }
        };

        this.voiceClient.onError = (error) => {
          console.error('Voice error:', error);
          if (this.voiceStatus) {
            this.voiceStatus.textContent = `Error: ${error}`;
            this.voiceStatus.classList.remove('listening', 'active');
          }
        };

        this.voiceClient.onListeningChange = (isListening) => {
          console.log('Voice listening:', isListening);
          if (this.voiceBtn) {
            if (isListening) {
              this.voiceBtn.classList.add('listening');
              this.voiceBtn.textContent = '🎤 Listening...';
            } else {
              this.voiceBtn.classList.remove('listening');
              this.voiceBtn.textContent = '🎤 Push to Talk';
            }
          }
          if (this.voiceStatus) {
            if (isListening) {
              this.voiceStatus.textContent = 'Listening...';
              this.voiceStatus.classList.add('listening');
              this.voiceStatus.classList.remove('active');
            } else if (!this.voiceStatus.classList.contains('active')) {
              this.voiceStatus.textContent = 'Voice: Ready';
              this.voiceStatus.classList.remove('listening');
            }
          }
        };

        // Show voice controls
        if (this.voiceControls && !this.isProduction) {
          this.voiceControls.style.display = 'block';
        }

        if (this.voiceStatus) {
          this.voiceStatus.textContent = 'Voice: Ready';
          this.voiceStatus.classList.add('active');
        }

        console.log('✓ Voice client initialized');
      } else {
        console.log('Voice plugin not enabled');
      }
    } catch (error) {
      console.error('Failed to initialize voice:', error);
    }
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

      // Update voice client character if initialized
      if (this.voiceClient) {
        this.voiceClient.setCharacter(characterType);
      }
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

  /**
   * Toggle voice listening
   */
  toggleVoice() {
    if (!this.voiceClient) {
      console.warn('Voice client not initialized');
      return;
    }

    if (this.voiceClient.isListening) {
      this.voiceClient.stopListening();
    } else {
      this.voiceClient.startListening();
    }
  }

  /**
   * Clear voice conversation history
   */
  async clearVoiceHistory() {
    if (!this.voiceClient) {
      console.warn('Voice client not initialized');
      return;
    }

    try {
      await this.voiceClient.clearHistory();
      if (this.voiceStatus) {
        this.voiceStatus.textContent = 'History cleared';
        this.voiceStatus.classList.remove('listening', 'active');
        setTimeout(() => {
          this.voiceStatus.textContent = 'Voice: Ready';
          this.voiceStatus.classList.add('active');
        }, 2000);
      }
      console.log('Voice history cleared');
    } catch (error) {
      console.error('Failed to clear voice history:', error);
    }
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
