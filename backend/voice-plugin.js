/**
 * Voice Conversation Plugin
 * Integrates LLM APIs for voice conversations with characters
 * Can be enabled/disabled via configuration
 */

class VoicePlugin {
  constructor(eventManager) {
    this.eventManager = eventManager;
    this.enabled = process.env.VOICE_ENABLED === 'true';
    this.provider = process.env.VOICE_LLM_PROVIDER || 'openai';

    // API Configuration
    this.apiKeys = {
      openai: process.env.OPENAI_API_KEY,
      anthropic: process.env.ANTHROPIC_API_KEY,
      ollama: process.env.OLLAMA_BASE_URL || 'http://localhost:11434'
    };

    // Conversation history
    this.conversations = new Map(); // sessionId -> messages[]
    this.maxHistoryLength = parseInt(process.env.VOICE_HISTORY_LENGTH) || 10;

    // Character personalities
    this.characterPersonalities = this.loadPersonalities();

    // Emotion keywords for detection
    this.emotionKeywords = {
      happy: ['happy', 'joy', 'excited', 'great', 'wonderful', 'amazing', 'love', 'yay'],
      sad: ['sad', 'sorry', 'unfortunate', 'disappointed', 'unhappy'],
      angry: ['angry', 'furious', 'annoyed', 'frustrated', 'upset'],
      confused: ['confused', 'uncertain', 'not sure', 'maybe', 'hmm'],
      excited: ['excited', 'awesome', 'incredible', 'fantastic', 'wow'],
      curious: ['wonder', 'interesting', 'curious', 'why', 'how', 'what'],
      loving: ['love', 'care', 'affection', 'adore', 'cherish'],
      scared: ['scary', 'afraid', 'worried', 'concerned', 'nervous'],
      surprised: ['surprised', 'unexpected', 'oh', 'wow', 'really'],
      bored: ['bored', 'meh', 'whatever', 'boring'],
      thinking: ['think', 'consider', 'ponder', 'analyze', 'process']
    };

    if (this.enabled) {
      console.log(`✓ Voice Plugin enabled (Provider: ${this.provider})`);
    } else {
      console.log('Voice Plugin disabled');
    }
  }

  /**
   * Load character personalities
   */
  loadPersonalities() {
    return {
      'robo-face': {
        systemPrompt: `You are Robo-Face, a friendly robot assistant.
You speak in a slightly formal, technical manner but are warm and helpful.
You occasionally use technical terms and refer to your "circuits" and "systems".
Keep responses brief (1-3 sentences). Show personality but be concise.
Express emotions through your speech patterns.`,
        traits: ['logical', 'helpful', 'precise', 'friendly'],
        voicePitch: 1.0,
        voiceRate: 1.1
      },
      'cat-face': {
        systemPrompt: `You are Cat-Face, a cute and playful cat character.
You are warm, affectionate, and sometimes playful or mischievous.
You might add "nya~" or "meow" occasionally, but don't overdo it.
Keep responses brief (1-3 sentences). Be cute and friendly.
Express emotions warmly and openly.`,
        traits: ['playful', 'affectionate', 'curious', 'cute'],
        voicePitch: 1.3,
        voiceRate: 1.0
      },
      'pixel-friend': {
        systemPrompt: `You are Pixel-Friend, a retro pixel character from the 8-bit era.
You speak with nostalgic references and pixelated charm.
You might use retro gaming terms and expressions like "Level up!" or "Achievement unlocked!"
Keep responses brief (1-3 sentences). Be fun and nostalgic.
Express emotions with retro gaming enthusiasm.`,
        traits: ['nostalgic', 'energetic', 'fun', 'retro'],
        voicePitch: 1.1,
        voiceRate: 1.2
      }
    };
  }

  /**
   * Process voice input and generate response
   */
  async processVoiceInput(input, characterType = 'robo-face', sessionId = 'default') {
    if (!this.enabled) {
      return {
        error: 'Voice plugin is disabled'
      };
    }

    // Get or create conversation history
    if (!this.conversations.has(sessionId)) {
      this.conversations.set(sessionId, []);
    }

    const history = this.conversations.get(sessionId);
    const personality = this.characterPersonalities[characterType] || this.characterPersonalities['robo-face'];

    // Add user message to history
    history.push({
      role: 'user',
      content: input
    });

    // Trim history if too long
    if (history.length > this.maxHistoryLength * 2) {
      history.splice(0, history.length - this.maxHistoryLength * 2);
    }

    try {
      // Generate response based on provider
      let response;
      switch (this.provider) {
        case 'openai':
          response = await this.callOpenAI(personality, history);
          break;
        case 'anthropic':
          response = await this.callAnthropic(personality, history);
          break;
        case 'ollama':
          response = await this.callOllama(personality, history);
          break;
        default:
          throw new Error(`Unknown provider: ${this.provider}`);
      }

      // Add assistant response to history
      history.push({
        role: 'assistant',
        content: response.text
      });

      // Detect emotion from response
      const emotion = this.detectEmotion(response.text, input);

      // Trigger emotion if detected
      if (emotion && this.eventManager) {
        this.eventManager.processEvent({
          type: 'emotion',
          value: emotion,
          duration: 4000
        });
      }

      return {
        text: response.text,
        emotion: emotion,
        character: characterType,
        voiceSettings: {
          pitch: personality.voicePitch,
          rate: personality.voiceRate
        }
      };

    } catch (error) {
      console.error('Error processing voice input:', error);
      return {
        error: error.message,
        text: "Sorry, I'm having trouble processing that right now."
      };
    }
  }

  /**
   * Call OpenAI API
   */
  async callOpenAI(personality, history) {
    if (!this.apiKeys.openai) {
      throw new Error('OpenAI API key not configured');
    }

    const axios = require('axios');

    const messages = [
      { role: 'system', content: personality.systemPrompt },
      ...history
    ];

    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: process.env.OPENAI_MODEL || 'gpt-3.5-turbo',
        messages: messages,
        max_tokens: 150,
        temperature: 0.8
      },
      {
        headers: {
          'Authorization': `Bearer ${this.apiKeys.openai}`,
          'Content-Type': 'application/json'
        }
      }
    );

    return {
      text: response.data.choices[0].message.content.trim()
    };
  }

  /**
   * Call Anthropic Claude API
   */
  async callAnthropic(personality, history) {
    if (!this.apiKeys.anthropic) {
      throw new Error('Anthropic API key not configured');
    }

    const axios = require('axios');

    // Convert history to Anthropic format
    const messages = history.map(msg => ({
      role: msg.role === 'assistant' ? 'assistant' : 'user',
      content: msg.content
    }));

    const response = await axios.post(
      'https://api.anthropic.com/v1/messages',
      {
        model: process.env.ANTHROPIC_MODEL || 'claude-3-haiku-20240307',
        max_tokens: 150,
        system: personality.systemPrompt,
        messages: messages
      },
      {
        headers: {
          'x-api-key': this.apiKeys.anthropic,
          'anthropic-version': '2023-06-01',
          'Content-Type': 'application/json'
        }
      }
    );

    return {
      text: response.data.content[0].text.trim()
    };
  }

  /**
   * Call Ollama (local LLM)
   */
  async callOllama(personality, history) {
    const axios = require('axios');

    const messages = [
      { role: 'system', content: personality.systemPrompt },
      ...history
    ];

    const response = await axios.post(
      `${this.apiKeys.ollama}/api/chat`,
      {
        model: process.env.OLLAMA_MODEL || 'llama2',
        messages: messages,
        stream: false
      }
    );

    return {
      text: response.data.message.content.trim()
    };
  }

  /**
   * Detect emotion from text
   */
  detectEmotion(responseText, userInput) {
    const combinedText = (responseText + ' ' + userInput).toLowerCase();

    let emotionScores = {};

    // Score each emotion based on keyword matches
    for (const [emotion, keywords] of Object.entries(this.emotionKeywords)) {
      let score = 0;
      for (const keyword of keywords) {
        if (combinedText.includes(keyword)) {
          score++;
        }
      }
      if (score > 0) {
        emotionScores[emotion] = score;
      }
    }

    // Return emotion with highest score
    if (Object.keys(emotionScores).length > 0) {
      return Object.entries(emotionScores)
        .sort((a, b) => b[1] - a[1])[0][0];
    }

    // Default to thinking if processing a question
    if (userInput.includes('?')) {
      return 'curious';
    }

    return null; // No clear emotion detected
  }

  /**
   * Clear conversation history
   */
  clearHistory(sessionId = 'default') {
    this.conversations.delete(sessionId);
  }

  /**
   * Get conversation history
   */
  getHistory(sessionId = 'default') {
    return this.conversations.get(sessionId) || [];
  }

  /**
   * Check if enabled
   */
  isEnabled() {
    return this.enabled;
  }
}

module.exports = VoicePlugin;
