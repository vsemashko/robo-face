/**
 * Base Character Class
 * Abstract class for all character types
 */
class BaseCharacter {
  constructor(renderer, animator) {
    this.renderer = renderer;
    this.animator = animator;

    // Current state
    this.currentState = 'idle';
    this.targetState = 'idle';
    this.transitionProgress = 0;
    this.transitionDuration = 500;

    // Animation timers
    this.blinkTimer = 0;
    this.blinkInterval = 3000;
    this.blinkDuration = 150;
    this.isBlinking = false;

    // Idle animation
    this.idleTime = 0;
    this.breatheSpeed = 2;

    // Particles
    this.particles = [];
    this.maxParticles = 30;

    // State colors (loaded from config or overridden by subclass)
    this.stateColors = {
      idle: '#4A90E2',
      happy: '#7ED321',
      thinking: '#F5A623',
      alert: '#F8E71C',
      sad: '#D0021B',
      surprised: '#BD10E0',
      sleeping: '#4A4A4A',
      excited: '#FF6B6B',
      confused: '#9B59B6',
      angry: '#E74C3C',
      loving: '#FF69B4',
      bored: '#95A5A6',
      curious: '#3498DB',
      scared: '#8E44AD'
    };

    // State priorities
    this.states = {
      idle: { priority: 0, interruptible: true },
      happy: { priority: 5, interruptible: true },
      thinking: { priority: 3, interruptible: true },
      alert: { priority: 8, interruptible: false },
      sad: { priority: 4, interruptible: true },
      surprised: { priority: 7, interruptible: false },
      sleeping: { priority: 1, interruptible: true },
      excited: { priority: 6, interruptible: true },
      confused: { priority: 3, interruptible: true },
      angry: { priority: 7, interruptible: false },
      loving: { priority: 5, interruptible: true },
      bored: { priority: 2, interruptible: true },
      curious: { priority: 4, interruptible: true },
      scared: { priority: 8, interruptible: false }
    };

    this.currentColor = this.stateColors.idle;
  }

  /**
   * Update character (must be overridden)
   */
  update(deltaTime) {
    // Update state transition
    if (this.currentState !== this.targetState) {
      this.transitionProgress += (deltaTime * 1000);
      if (this.transitionProgress >= this.transitionDuration) {
        this.currentState = this.targetState;
        this.transitionProgress = 0;
      }
    }

    this.idleTime += deltaTime;
    this.updateBlink(deltaTime);
    this.updateParticles(deltaTime);
    this.updateColor();
  }

  /**
   * Render character (must be overridden by subclass)
   */
  render() {
    throw new Error('render() must be implemented by subclass');
  }

  /**
   * Update blink animation
   */
  updateBlink(deltaTime) {
    if (this.currentState === 'sleeping') {
      this.isBlinking = false;
      return;
    }

    this.blinkTimer += deltaTime * 1000;

    if (this.isBlinking) {
      if (this.blinkTimer >= this.blinkDuration) {
        this.isBlinking = false;
        this.blinkTimer = 0;
      }
    } else {
      if (this.blinkTimer >= this.blinkInterval) {
        this.isBlinking = true;
        this.blinkTimer = 0;
        this.blinkInterval = 2000 + Math.random() * 3000;
      }
    }
  }

  /**
   * Update color interpolation
   */
  updateColor() {
    const targetColor = this.stateColors[this.targetState] || this.stateColors.idle;
    this.currentColor = targetColor;
  }

  /**
   * Add a particle effect
   */
  addParticle(x, y, char = '•', color = null) {
    if (this.particles.length < this.maxParticles) {
      this.particles.push({
        x,
        y,
        char,
        vx: (Math.random() - 0.5) * 50,
        vy: -20 - Math.random() * 30,
        life: 1.0,
        decay: 0.5 + Math.random() * 0.5,
        color: color || this.currentColor
      });
    }
  }

  /**
   * Update particles
   */
  updateParticles(deltaTime) {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx * deltaTime;
      p.y += p.vy * deltaTime;
      p.life -= p.decay * deltaTime;

      if (p.life <= 0) {
        this.particles.splice(i, 1);
      }
    }
  }

  /**
   * Render particles
   */
  renderParticles() {
    this.particles.forEach(p => {
      this.renderer.setAlpha(p.life);
      this.renderer.drawText(p.char, p.x, p.y, p.color, 20);
      this.renderer.resetAlpha();
    });
  }

  /**
   * Change to a new state
   */
  setState(newState) {
    if (this.stateColors[newState]) {
      this.targetState = newState;
      this.transitionProgress = 0;
      this.onStateChange(newState);
    }
  }

  /**
   * Hook for state change (override in subclass for special effects)
   */
  onStateChange(newState) {
    // Override in subclass
  }

  /**
   * Get current state
   */
  getState() {
    return this.currentState;
  }
}
