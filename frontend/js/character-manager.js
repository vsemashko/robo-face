/**
 * Character Manager
 * Handles character selection and management
 */
class CharacterManager {
  constructor(renderer, animator) {
    this.renderer = renderer;
    this.animator = animator;
    this.currentCharacter = null;
    this.characterType = 'robo-face';

    // Available characters
    this.characters = {
      'robo-face': {
        name: 'Robo-Face',
        description: 'Classic robot character',
        class: RoboFaceCharacter
      },
      'cat-face': {
        name: 'Cat-Face',
        description: 'Kawaii cat character',
        class: CatFaceCharacter
      },
      'pixel-friend': {
        name: 'Pixel-Friend',
        description: 'Retro pixel art character',
        class: PixelFriendCharacter
      }
    };

    // Load character from URL parameter or localStorage
    this.loadCharacterPreference();
    this.initCharacter();
  }

  /**
   * Load character preference from URL or storage
   */
  loadCharacterPreference() {
    // Check URL parameter first
    const urlParams = new URLSearchParams(window.location.search);
    const urlChar = urlParams.get('character');

    if (urlChar && this.characters[urlChar]) {
      this.characterType = urlChar;
      localStorage.setItem('robo-face-character', urlChar);
      return;
    }

    // Check localStorage
    const stored = localStorage.getItem('robo-face-character');
    if (stored && this.characters[stored]) {
      this.characterType = stored;
      return;
    }

    // Check environment variable (from .env)
    if (window.CHARACTER && this.characters[window.CHARACTER]) {
      this.characterType = window.CHARACTER;
      return;
    }

    // Default to robo-face
    this.characterType = 'robo-face';
  }

  /**
   * Initialize the current character
   */
  initCharacter() {
    const CharClass = this.characters[this.characterType].class;
    this.currentCharacter = new CharClass(this.renderer, this.animator);
    console.log(`Initialized character: ${this.characters[this.characterType].name}`);
  }

  /**
   * Switch to a different character
   */
  switchCharacter(characterType) {
    if (!this.characters[characterType]) {
      console.error('Unknown character type:', characterType);
      return false;
    }

    console.log(`Switching to character: ${this.characters[characterType].name}`);

    // Save current state
    const currentState = this.currentCharacter ? this.currentCharacter.getState() : 'idle';

    // Create new character
    const CharClass = this.characters[characterType].class;
    this.currentCharacter = new CharClass(this.renderer, this.animator);

    // Restore state
    this.currentCharacter.setState(currentState);

    // Update settings
    this.characterType = characterType;
    localStorage.setItem('robo-face-character', characterType);

    return true;
  }

  /**
   * Get current character instance
   */
  getCharacter() {
    return this.currentCharacter;
  }

  /**
   * Get current character type
   */
  getCharacterType() {
    return this.characterType;
  }

  /**
   * Get list of available characters
   */
  getAvailableCharacters() {
    return Object.keys(this.characters).map(key => ({
      id: key,
      name: this.characters[key].name,
      description: this.characters[key].description
    }));
  }

  /**
   * Update character
   */
  update(deltaTime) {
    if (this.currentCharacter) {
      this.currentCharacter.update(deltaTime);
    }
  }

  /**
   * Render character
   */
  render() {
    if (this.currentCharacter) {
      this.currentCharacter.render();
    }
  }

  /**
   * Set character state
   */
  setState(state) {
    if (this.currentCharacter) {
      this.currentCharacter.setState(state);
    }
  }

  /**
   * Get current state
   */
  getState() {
    return this.currentCharacter ? this.currentCharacter.getState() : 'idle';
  }
}
