/**
 * Robo-Face Character
 * Defines the robo-face character and its animations
 */
class RoboFace {
  constructor(renderer, animator) {
    this.renderer = renderer;
    this.animator = animator;

    // Current state
    this.currentState = 'idle';
    this.targetState = 'idle';
    this.transitionProgress = 0;
    this.transitionDuration = 500; // ms

    // Animation timers
    this.blinkTimer = 0;
    this.blinkInterval = 3000;
    this.blinkDuration = 150;
    this.isBlinking = false;

    // Idle animation
    this.idleTime = 0;
    this.breatheSpeed = 2;

    // Eye tracking (for thinking state)
    this.eyeLookX = 0;
    this.eyeLookY = 0;
    this.eyeLookTargetX = 0;
    this.eyeLookTargetY = 0;
    this.eyeChangeTimer = 0;

    // Particle effects
    this.particles = [];
    this.maxParticles = 20;

    // State colors
    this.stateColors = {
      idle: '#4A90E2',
      happy: '#7ED321',
      thinking: '#F5A623',
      alert: '#F8E71C',
      sad: '#D0021B',
      surprised: '#BD10E0',
      sleeping: '#4A4A4A'
    };

    // Current color (interpolated)
    this.currentColor = this.stateColors.idle;
  }

  /**
   * Update character state and animations
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

    // Update idle animation
    this.idleTime += deltaTime;

    // Update blink timer
    this.updateBlink(deltaTime);

    // Update eye look (for thinking state)
    if (this.currentState === 'thinking') {
      this.updateEyeLook(deltaTime);
    }

    // Update particles
    this.updateParticles(deltaTime);

    // Interpolate color
    this.updateColor();
  }

  /**
   * Render the character
   */
  render() {
    const center = this.renderer.getCenter();
    const baseSize = 200;

    // Draw glow effect
    this.renderer.drawGlow(() => {
      this.drawFaceBase(center.x, center.y, baseSize);
    }, this.currentColor, 30);

    // Draw face components
    this.drawFaceBase(center.x, center.y, baseSize);
    this.drawAntenna(center.x, center.y - baseSize / 2, baseSize);
    this.drawEyes(center.x, center.y - 20, baseSize);
    this.drawMouth(center.x, center.y + 40, baseSize);

    // Draw particles
    this.renderParticles();
  }

  /**
   * Draw the base of the face (head)
   */
  drawFaceBase(x, y, size) {
    const breathe = Math.sin(this.idleTime * this.breatheSpeed) * 5;
    const faceSize = size + breathe;

    // Main face (rounded rectangle for robo look)
    this.renderer.drawRoundedRect(
      x - faceSize / 2,
      y - faceSize / 2,
      faceSize,
      faceSize,
      30,
      this.currentColor
    );

    // Inner darker rectangle
    const innerSize = faceSize * 0.9;
    this.renderer.drawRoundedRect(
      x - innerSize / 2,
      y - innerSize / 2,
      innerSize,
      innerSize,
      25,
      '#2a2a2a'
    );

    // Edge highlights
    this.renderer.setAlpha(0.3);
    this.renderer.drawLine(
      x - faceSize / 2 + 10,
      y - faceSize / 2 + 40,
      x - faceSize / 2 + 10,
      y + faceSize / 2 - 40,
      '#ffffff',
      2
    );
    this.renderer.resetAlpha();
  }

  /**
   * Draw antenna
   */
  drawAntenna(x, y, baseSize) {
    // Antenna moves with breathing
    const sway = Math.sin(this.idleTime * this.breatheSpeed * 0.5) * 3;

    // Antenna line
    this.renderer.drawLine(x, y, x + sway, y - 40, this.currentColor, 4);

    // Antenna tip (blinks with activity)
    const tipAlpha = this.currentState === 'thinking' || this.currentState === 'alert'
      ? 0.5 + Math.sin(this.idleTime * 10) * 0.5
      : 1;

    this.renderer.setAlpha(tipAlpha);
    this.renderer.drawCircle(x + sway, y - 40, 8, this.currentColor);
    this.renderer.resetAlpha();
  }

  /**
   * Draw eyes based on current state
   */
  drawEyes(x, y, baseSize) {
    const eyeSpacing = 50;
    const leftEyeX = x - eyeSpacing;
    const rightEyeX = x + eyeSpacing;

    switch (this.currentState) {
      case 'idle':
        this.drawIdleEyes(leftEyeX, rightEyeX, y);
        break;
      case 'happy':
        this.drawHappyEyes(leftEyeX, rightEyeX, y);
        break;
      case 'thinking':
        this.drawThinkingEyes(leftEyeX, rightEyeX, y);
        break;
      case 'alert':
        this.drawAlertEyes(leftEyeX, rightEyeX, y);
        break;
      case 'sad':
        this.drawSadEyes(leftEyeX, rightEyeX, y);
        break;
      case 'surprised':
        this.drawSurprisedEyes(leftEyeX, rightEyeX, y);
        break;
      case 'sleeping':
        this.drawSleepingEyes(leftEyeX, rightEyeX, y);
        break;
    }
  }

  drawIdleEyes(leftX, rightX, y) {
    const eyeHeight = this.isBlinking ? 5 : 30;
    const eyeWidth = 25;

    // Left eye
    this.renderer.drawRoundedRect(leftX - eyeWidth / 2, y - eyeHeight / 2, eyeWidth, eyeHeight, 5, this.currentColor);
    // Right eye
    this.renderer.drawRoundedRect(rightX - eyeWidth / 2, y - eyeHeight / 2, eyeWidth, eyeHeight, 5, this.currentColor);
  }

  drawHappyEyes(leftX, rightX, y) {
    const eyeHeight = this.isBlinking ? 5 : 20;
    const eyeWidth = 30;

    // Happy eyes (arched)
    this.renderer.save();
    this.renderer.ctx.lineWidth = 4;
    this.renderer.ctx.strokeStyle = this.currentColor;
    this.renderer.ctx.lineCap = 'round';

    // Left eye
    this.renderer.ctx.beginPath();
    this.renderer.ctx.arc(leftX, y + 10, 15, Math.PI, 0, false);
    this.renderer.ctx.stroke();

    // Right eye
    this.renderer.ctx.beginPath();
    this.renderer.ctx.arc(rightX, y + 10, 15, Math.PI, 0, false);
    this.renderer.ctx.stroke();

    this.renderer.restore();
  }

  drawThinkingEyes(leftX, rightX, y) {
    const eyeHeight = this.isBlinking ? 5 : 25;
    const eyeWidth = 20;

    // Eyes look around
    const lookX = this.eyeLookX * 5;
    const lookY = this.eyeLookY * 5;

    // Left eye with pupil
    this.renderer.drawRoundedRect(leftX - eyeWidth / 2, y - eyeHeight / 2, eyeWidth, eyeHeight, 5, this.currentColor);
    if (!this.isBlinking) {
      this.renderer.drawCircle(leftX + lookX, y + lookY, 5, '#2a2a2a');
    }

    // Right eye with pupil
    this.renderer.drawRoundedRect(rightX - eyeWidth / 2, y - eyeHeight / 2, eyeWidth, eyeHeight, 5, this.currentColor);
    if (!this.isBlinking) {
      this.renderer.drawCircle(rightX + lookX, y + lookY, 5, '#2a2a2a');
    }
  }

  drawAlertEyes(leftX, rightX, y) {
    const eyeSize = this.isBlinking ? 10 : 35;
    const pulse = 1 + Math.sin(this.idleTime * 8) * 0.1;

    // Large circular eyes (alert/wide)
    this.renderer.drawCircle(leftX, y, eyeSize * pulse, this.currentColor);
    this.renderer.drawCircle(rightX, y, eyeSize * pulse, this.currentColor);
  }

  drawSadEyes(leftX, rightX, y) {
    const eyeHeight = this.isBlinking ? 5 : 20;
    const eyeWidth = 25;

    // Droopy eyes
    this.renderer.save();
    this.renderer.ctx.lineWidth = 4;
    this.renderer.ctx.strokeStyle = this.currentColor;
    this.renderer.ctx.lineCap = 'round';

    // Left eye
    this.renderer.ctx.beginPath();
    this.renderer.ctx.arc(leftX, y - 10, 15, 0, Math.PI, false);
    this.renderer.ctx.stroke();

    // Right eye
    this.renderer.ctx.beginPath();
    this.renderer.ctx.arc(rightX, y - 10, 15, 0, Math.PI, false);
    this.renderer.ctx.stroke();

    this.renderer.restore();
  }

  drawSurprisedEyes(leftX, rightX, y) {
    const eyeSize = this.isBlinking ? 10 : 40;

    // Very large circular eyes
    this.renderer.drawCircle(leftX, y, eyeSize, this.currentColor);
    this.renderer.drawCircle(rightX, y, eyeSize, this.currentColor);

    // Highlight
    if (!this.isBlinking) {
      this.renderer.setAlpha(0.5);
      this.renderer.drawCircle(leftX - 5, y - 5, 8, '#ffffff');
      this.renderer.drawCircle(rightX - 5, y - 5, 8, '#ffffff');
      this.renderer.resetAlpha();
    }
  }

  drawSleepingEyes(leftX, rightX, y) {
    // Closed eyes (lines)
    this.renderer.ctx.lineWidth = 4;
    this.renderer.ctx.strokeStyle = this.currentColor;
    this.renderer.ctx.lineCap = 'round';

    // Left eye
    this.renderer.drawLine(leftX - 15, y, leftX + 15, y, this.currentColor, 4);
    // Right eye
    this.renderer.drawLine(rightX - 15, y, rightX + 15, y, this.currentColor, 4);

    // ZZZ particles
    if (Math.random() < 0.05) {
      this.addParticle(leftX + 30, y - 20, 'Z');
    }
  }

  /**
   * Draw mouth based on current state
   */
  drawMouth(x, y, baseSize) {
    this.renderer.save();
    this.renderer.ctx.lineWidth = 4;
    this.renderer.ctx.strokeStyle = this.currentColor;
    this.renderer.ctx.lineCap = 'round';

    switch (this.currentState) {
      case 'idle':
        this.renderer.drawLine(x - 30, y, x + 30, y, this.currentColor, 4);
        break;
      case 'happy':
        this.renderer.ctx.beginPath();
        this.renderer.ctx.arc(x, y - 10, 35, 0.2 * Math.PI, 0.8 * Math.PI, false);
        this.renderer.ctx.stroke();
        break;
      case 'thinking':
        this.renderer.ctx.beginPath();
        this.renderer.ctx.moveTo(x - 30, y);
        this.renderer.ctx.quadraticCurveTo(x, y + 5, x + 30, y);
        this.renderer.ctx.stroke();
        break;
      case 'alert':
        this.renderer.drawCircle(x, y, 15, this.currentColor, false);
        break;
      case 'sad':
        this.renderer.ctx.beginPath();
        this.renderer.ctx.arc(x, y + 20, 35, 1.2 * Math.PI, 1.8 * Math.PI, false);
        this.renderer.ctx.stroke();
        break;
      case 'surprised':
        this.renderer.drawCircle(x, y, 20, this.currentColor, false);
        break;
      case 'sleeping':
        this.renderer.ctx.beginPath();
        this.renderer.ctx.moveTo(x - 25, y);
        this.renderer.ctx.quadraticCurveTo(x, y - 5, x + 25, y);
        this.renderer.ctx.stroke();
        break;
    }

    this.renderer.restore();
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
        // Randomize next blink
        this.blinkInterval = 2000 + Math.random() * 3000;
      }
    }
  }

  /**
   * Update eye look direction (for thinking state)
   */
  updateEyeLook(deltaTime) {
    this.eyeChangeTimer += deltaTime * 1000;

    // Change look direction every 1-2 seconds
    if (this.eyeChangeTimer >= 1000 + Math.random() * 1000) {
      this.eyeLookTargetX = (Math.random() - 0.5) * 2;
      this.eyeLookTargetY = (Math.random() - 0.5) * 2;
      this.eyeChangeTimer = 0;
    }

    // Smoothly interpolate to target
    this.eyeLookX += (this.eyeLookTargetX - this.eyeLookX) * deltaTime * 5;
    this.eyeLookY += (this.eyeLookTargetY - this.eyeLookY) * deltaTime * 5;
  }

  /**
   * Update color interpolation
   */
  updateColor() {
    const targetColor = this.stateColors[this.targetState] || this.stateColors.idle;
    // For now, just snap to target color
    // TODO: Implement smooth color interpolation
    this.currentColor = targetColor;
  }

  /**
   * Add a particle effect
   */
  addParticle(x, y, char = '•') {
    if (this.particles.length < this.maxParticles) {
      this.particles.push({
        x,
        y,
        char,
        vx: (Math.random() - 0.5) * 50,
        vy: -20 - Math.random() * 30,
        life: 1.0,
        decay: 0.5 + Math.random() * 0.5
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
      this.renderer.drawText(p.char, p.x, p.y, this.currentColor, 20);
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

      // Trigger state-specific effects
      if (newState === 'happy') {
        // Add some celebration particles
        for (let i = 0; i < 5; i++) {
          setTimeout(() => {
            const center = this.renderer.getCenter();
            this.addParticle(
              center.x + (Math.random() - 0.5) * 100,
              center.y + (Math.random() - 0.5) * 100,
              ['★', '♥', '•'][Math.floor(Math.random() * 3)]
            );
          }, i * 100);
        }
      }
    }
  }

  /**
   * Get current state
   */
  getState() {
    return this.currentState;
  }
}
