/**
 * Voice Client
 * Handles speech recognition and text-to-speech using Web Speech API
 */
class VoiceClient {
  constructor() {
    this.recognition = null;
    this.synthesis = window.speechSynthesis;
    this.isListening = false;
    this.isEnabled = false;
    this.currentCharacter = 'robo-face';
    this.sessionId = this.generateSessionId();

    // Callbacks
    this.onTranscript = null;
    this.onResponse = null;
    this.onError = null;
    this.onListeningChange = null;

    // Voice settings
    this.voiceSettings = {
      'robo-face': { pitch: 1.0, rate: 1.1 },
      'cat-face': { pitch: 1.3, rate: 1.0 },
      'pixel-friend': { pitch: 1.1, rate: 1.2 }
    };

    this.initSpeechRecognition();
  }

  /**
   * Initialize Speech Recognition
   */
  initSpeechRecognition() {
    // Check if Speech Recognition is supported
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      console.warn('Speech Recognition not supported in this browser');
      return;
    }

    this.recognition = new SpeechRecognition();
    this.recognition.continuous = false;
    this.recognition.interimResults = false;
    this.recognition.lang = 'en-US';

    this.recognition.onstart = () => {
      console.log('Voice recognition started');
      this.isListening = true;
      if (this.onListeningChange) {
        this.onListeningChange(true);
      }
    };

    this.recognition.onresult = async (event) => {
      const transcript = event.results[0][0].transcript;
      console.log('Transcript:', transcript);

      if (this.onTranscript) {
        this.onTranscript(transcript);
      }

      // Send to backend for processing
      await this.processTranscript(transcript);
    };

    this.recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      this.isListening = false;

      if (this.onListeningChange) {
        this.onListeningChange(false);
      }

      if (this.onError) {
        this.onError(event.error);
      }
    };

    this.recognition.onend = () => {
      console.log('Voice recognition ended');
      this.isListening = false;

      if (this.onListeningChange) {
        this.onListeningChange(false);
      }
    };

    console.log('✓ Speech Recognition initialized');
  }

  /**
   * Start listening
   */
  startListening() {
    if (!this.recognition) {
      console.error('Speech Recognition not available');
      if (this.onError) {
        this.onError('Speech Recognition not supported');
      }
      return;
    }

    if (this.isListening) {
      console.log('Already listening');
      return;
    }

    try {
      this.recognition.start();
    } catch (error) {
      console.error('Error starting recognition:', error);
      if (this.onError) {
        this.onError(error.message);
      }
    }
  }

  /**
   * Stop listening
   */
  stopListening() {
    if (this.recognition && this.isListening) {
      this.recognition.stop();
    }
  }

  /**
   * Process transcript through LLM
   */
  async processTranscript(text) {
    try {
      const response = await fetch('/api/voice/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          text: text,
          character: this.currentCharacter,
          sessionId: this.sessionId
        })
      });

      const data = await response.json();

      if (data.error) {
        console.error('Error from server:', data.error);
        if (this.onError) {
          this.onError(data.error);
        }
        return;
      }

      console.log('LLM Response:', data);

      // Trigger callback
      if (this.onResponse) {
        this.onResponse(data);
      }

      // Speak the response
      if (data.text) {
        this.speak(data.text, data.voiceSettings);
      }

    } catch (error) {
      console.error('Error processing transcript:', error);
      if (this.onError) {
        this.onError(error.message);
      }
    }
  }

  /**
   * Speak text using TTS
   */
  speak(text, voiceSettings = null) {
    if (!this.synthesis) {
      console.error('Speech Synthesis not available');
      return;
    }

    // Cancel any ongoing speech
    this.synthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);

    // Apply voice settings
    const settings = voiceSettings || this.voiceSettings[this.currentCharacter];
    if (settings) {
      utterance.pitch = settings.pitch || 1.0;
      utterance.rate = settings.rate || 1.0;
    }

    utterance.volume = 1.0;
    utterance.lang = 'en-US';

    utterance.onstart = () => {
      console.log('Speaking:', text);
    };

    utterance.onend = () => {
      console.log('Finished speaking');
    };

    utterance.onerror = (event) => {
      console.error('Speech synthesis error:', event.error);
    };

    this.synthesis.speak(utterance);
  }

  /**
   * Stop speaking
   */
  stopSpeaking() {
    if (this.synthesis) {
      this.synthesis.cancel();
    }
  }

  /**
   * Set current character
   */
  setCharacter(character) {
    this.currentCharacter = character;
  }

  /**
   * Check if voice is enabled on server
   */
  async checkVoiceEnabled() {
    try {
      const response = await fetch('/api/health');
      const data = await response.json();
      this.isEnabled = data.voiceEnabled || false;
      return this.isEnabled;
    } catch (error) {
      console.error('Error checking voice status:', error);
      return false;
    }
  }

  /**
   * Clear conversation history
   */
  async clearHistory() {
    try {
      await fetch('/api/voice/clear', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          sessionId: this.sessionId
        })
      });
      console.log('Conversation history cleared');
    } catch (error) {
      console.error('Error clearing history:', error);
    }
  }

  /**
   * Get conversation history
   */
  async getHistory() {
    try {
      const response = await fetch(`/api/voice/history/${this.sessionId}`);
      const data = await response.json();
      return data.history || [];
    } catch (error) {
      console.error('Error getting history:', error);
      return [];
    }
  }

  /**
   * Generate unique session ID
   */
  generateSessionId() {
    return 'session-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
  }

  /**
   * Get listening status
   */
  getListeningStatus() {
    return this.isListening;
  }

  /**
   * Get enabled status
   */
  getEnabledStatus() {
    return this.isEnabled;
  }
}
