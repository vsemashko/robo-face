/**
 * Robo-Face Character
 * The original robot character with all emotions
 */
class RoboFaceCharacter extends BaseCharacter {
  constructor(renderer, animator) {
    super(renderer, animator);

    // Eye tracking
    this.eyeLookX = 0;
    this.eyeLookY = 0;
    this.eyeLookTargetX = 0;
    this.eyeLookTargetY = 0;
    this.eyeChangeTimer = 0;

    // Special animation states
    this.shakeAmount = 0;
    this.bounceOffset = 0;
  }

  update(deltaTime) {
    super.update(deltaTime);

    // Update eye look (for thinking/curious states)
    if (this.currentState === 'thinking' || this.currentState === 'curious') {
      this.updateEyeLook(deltaTime);
    }

    // Update shake (for angry/scared states)
    if (this.currentState === 'angry' || this.currentState === 'scared') {
      this.shakeAmount = Math.sin(this.idleTime * 15) * 3;
    } else {
      this.shakeAmount = 0;
    }

    // Update bounce (for excited state)
    if (this.currentState === 'excited') {
      this.bounceOffset = Math.abs(Math.sin(this.idleTime * 8)) * 15;
    } else {
      this.bounceOffset = 0;
    }
  }

  render() {
    const center = this.renderer.getCenter();
    const baseSize = 200;

    // Apply shake
    const shakeX = this.shakeAmount;
    const centerX = center.x + shakeX;
    const centerY = center.y - this.bounceOffset;

    // Draw glow effect
    this.renderer.drawGlow(() => {
      this.drawFaceBase(centerX, centerY, baseSize);
    }, this.currentColor, 30);

    // Draw face components
    this.drawFaceBase(centerX, centerY, baseSize);
    this.drawAntenna(centerX, centerY - baseSize / 2, baseSize);
    this.drawEyes(centerX, centerY - 20, baseSize);
    this.drawMouth(centerX, centerY + 40, baseSize);

    // Draw particles
    this.renderParticles();
  }

  drawFaceBase(x, y, size) {
    const breathe = Math.sin(this.idleTime * this.breatheSpeed) * 5;
    const faceSize = size + breathe;

    // Main face
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

  drawAntenna(x, y, baseSize) {
    const sway = Math.sin(this.idleTime * this.breatheSpeed * 0.5) * 3;

    // Antenna line
    this.renderer.drawLine(x, y, x + sway, y - 40, this.currentColor, 4);

    // Antenna tip
    const tipAlpha = (this.currentState === 'thinking' || this.currentState === 'alert')
      ? 0.5 + Math.sin(this.idleTime * 10) * 0.5
      : 1;

    this.renderer.setAlpha(tipAlpha);
    this.renderer.drawCircle(x + sway, y - 40, 8, this.currentColor);
    this.renderer.resetAlpha();
  }

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
      case 'excited':
        this.drawExcitedEyes(leftEyeX, rightEyeX, y);
        break;
      case 'confused':
        this.drawConfusedEyes(leftEyeX, rightEyeX, y);
        break;
      case 'angry':
        this.drawAngryEyes(leftEyeX, rightEyeX, y);
        break;
      case 'loving':
        this.drawLovingEyes(leftEyeX, rightEyeX, y);
        break;
      case 'bored':
        this.drawBoredEyes(leftEyeX, rightEyeX, y);
        break;
      case 'curious':
        this.drawCuriousEyes(leftEyeX, rightEyeX, y);
        break;
      case 'scared':
        this.drawScaredEyes(leftEyeX, rightEyeX, y);
        break;
    }
  }

  // Existing eye drawing methods
  drawIdleEyes(leftX, rightX, y) {
    const eyeHeight = this.isBlinking ? 5 : 30;
    const eyeWidth = 25;
    this.renderer.drawRoundedRect(leftX - eyeWidth / 2, y - eyeHeight / 2, eyeWidth, eyeHeight, 5, this.currentColor);
    this.renderer.drawRoundedRect(rightX - eyeWidth / 2, y - eyeHeight / 2, eyeWidth, eyeHeight, 5, this.currentColor);
  }

  drawHappyEyes(leftX, rightX, y) {
    this.renderer.save();
    this.renderer.ctx.lineWidth = 4;
    this.renderer.ctx.strokeStyle = this.currentColor;
    this.renderer.ctx.lineCap = 'round';
    this.renderer.ctx.beginPath();
    this.renderer.ctx.arc(leftX, y + 10, 15, Math.PI, 0, false);
    this.renderer.ctx.stroke();
    this.renderer.ctx.beginPath();
    this.renderer.ctx.arc(rightX, y + 10, 15, Math.PI, 0, false);
    this.renderer.ctx.stroke();
    this.renderer.restore();
  }

  drawThinkingEyes(leftX, rightX, y) {
    const eyeHeight = this.isBlinking ? 5 : 25;
    const eyeWidth = 20;
    const lookX = this.eyeLookX * 5;
    const lookY = this.eyeLookY * 5;

    this.renderer.drawRoundedRect(leftX - eyeWidth / 2, y - eyeHeight / 2, eyeWidth, eyeHeight, 5, this.currentColor);
    if (!this.isBlinking) {
      this.renderer.drawCircle(leftX + lookX, y + lookY, 5, '#2a2a2a');
    }

    this.renderer.drawRoundedRect(rightX - eyeWidth / 2, y - eyeHeight / 2, eyeWidth, eyeHeight, 5, this.currentColor);
    if (!this.isBlinking) {
      this.renderer.drawCircle(rightX + lookX, y + lookY, 5, '#2a2a2a');
    }
  }

  drawAlertEyes(leftX, rightX, y) {
    const eyeSize = this.isBlinking ? 10 : 35;
    const pulse = 1 + Math.sin(this.idleTime * 8) * 0.1;
    this.renderer.drawCircle(leftX, y, eyeSize * pulse, this.currentColor);
    this.renderer.drawCircle(rightX, y, eyeSize * pulse, this.currentColor);
  }

  drawSadEyes(leftX, rightX, y) {
    this.renderer.save();
    this.renderer.ctx.lineWidth = 4;
    this.renderer.ctx.strokeStyle = this.currentColor;
    this.renderer.ctx.lineCap = 'round';
    this.renderer.ctx.beginPath();
    this.renderer.ctx.arc(leftX, y - 10, 15, 0, Math.PI, false);
    this.renderer.ctx.stroke();
    this.renderer.ctx.beginPath();
    this.renderer.ctx.arc(rightX, y - 10, 15, 0, Math.PI, false);
    this.renderer.ctx.stroke();
    this.renderer.restore();
  }

  drawSurprisedEyes(leftX, rightX, y) {
    const eyeSize = this.isBlinking ? 10 : 40;
    this.renderer.drawCircle(leftX, y, eyeSize, this.currentColor);
    this.renderer.drawCircle(rightX, y, eyeSize, this.currentColor);
    if (!this.isBlinking) {
      this.renderer.setAlpha(0.5);
      this.renderer.drawCircle(leftX - 5, y - 5, 8, '#ffffff');
      this.renderer.drawCircle(rightX - 5, y - 5, 8, '#ffffff');
      this.renderer.resetAlpha();
    }
  }

  drawSleepingEyes(leftX, rightX, y) {
    this.renderer.drawLine(leftX - 15, y, leftX + 15, y, this.currentColor, 4);
    this.renderer.drawLine(rightX - 15, y, rightX + 15, y, this.currentColor, 4);
    if (Math.random() < 0.05) {
      this.addParticle(leftX + 30, y - 20, 'Z');
    }
  }

  // New emotion eye drawing methods
  drawExcitedEyes(leftX, rightX, y) {
    const bounce = Math.sin(this.idleTime * 10) * 5;
    const eyeSize = 35 + bounce;
    // Star-like sparkle effect
    this.renderer.drawCircle(leftX, y, eyeSize, this.currentColor);
    this.renderer.drawCircle(rightX, y, eyeSize, this.currentColor);
    // Add sparkles
    this.renderer.setAlpha(0.7);
    for (let i = 0; i < 4; i++) {
      const angle = (Math.PI * 2 * i / 4) + this.idleTime * 5;
      const sx = Math.cos(angle) * 10;
      const sy = Math.sin(angle) * 10;
      this.renderer.drawCircle(leftX + sx, y + sy, 3, '#ffffff');
      this.renderer.drawCircle(rightX + sx, y + sy, 3, '#ffffff');
    }
    this.renderer.resetAlpha();
  }

  drawConfusedEyes(leftX, rightX, y) {
    // Different sizes, one tilted
    this.renderer.save();
    // Left eye normal
    this.renderer.drawCircle(leftX, y, 25, this.currentColor);
    // Right eye smaller and higher
    this.renderer.drawCircle(rightX, y - 5, 20, this.currentColor);
    this.renderer.restore();
  }

  drawAngryEyes(leftX, rightX, y) {
    // Angled rectangles (angry brows)
    this.renderer.save();
    this.renderer.ctx.lineWidth = 6;
    this.renderer.ctx.strokeStyle = this.currentColor;
    this.renderer.ctx.lineCap = 'round';
    // Left eye angled down from outside
    this.renderer.drawLine(leftX - 20, y - 10, leftX + 10, y + 5, this.currentColor, 6);
    // Right eye angled down from outside
    this.renderer.drawLine(rightX + 20, y - 10, rightX - 10, y + 5, this.currentColor, 6);
    this.renderer.restore();
  }

  drawLovingEyes(leftX, rightX, y) {
    // Heart-shaped eyes
    this.renderer.save();
    this.renderer.ctx.fillStyle = this.currentColor;
    this.drawHeart(leftX, y, 15);
    this.drawHeart(rightX, y, 15);
    this.renderer.restore();
  }

  drawBoredEyes(leftX, rightX, y) {
    // Half-closed eyes
    const eyeHeight = 15;
    const eyeWidth = 25;
    this.renderer.drawRoundedRect(leftX - eyeWidth / 2, y - eyeHeight / 2, eyeWidth, eyeHeight, 5, this.currentColor);
    this.renderer.drawRoundedRect(rightX - eyeWidth / 2, y - eyeHeight / 2, eyeWidth, eyeHeight, 5, this.currentColor);
  }

  drawCuriousEyes(leftX, rightX, y) {
    // Wide eyes looking around
    const eyeHeight = this.isBlinking ? 5 : 30;
    const eyeWidth = 30;
    const lookX = this.eyeLookX * 7;
    const lookY = this.eyeLookY * 7;

    this.renderer.drawCircle(leftX, y, 28, this.currentColor);
    if (!this.isBlinking) {
      this.renderer.drawCircle(leftX + lookX, y + lookY, 10, '#2a2a2a');
    }

    this.renderer.drawCircle(rightX, y, 28, this.currentColor);
    if (!this.isBlinking) {
      this.renderer.drawCircle(rightX + lookX, y + lookY, 10, '#2a2a2a');
    }
  }

  drawScaredEyes(leftX, rightX, y) {
    // Shaking wide eyes
    const tremble = Math.sin(this.idleTime * 20) * 2;
    const eyeSize = 38;
    this.renderer.drawCircle(leftX + tremble, y, eyeSize, this.currentColor);
    this.renderer.drawCircle(rightX - tremble, y, eyeSize, this.currentColor);
    // Small pupils
    this.renderer.drawCircle(leftX + tremble, y, 8, '#2a2a2a');
    this.renderer.drawCircle(rightX - tremble, y, 8, '#2a2a2a');
  }

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
      case 'excited':
        // Wide open smile
        this.renderer.ctx.beginPath();
        this.renderer.ctx.arc(x, y - 15, 40, 0.15 * Math.PI, 0.85 * Math.PI, false);
        this.renderer.ctx.stroke();
        // Teeth
        for (let i = -2; i <= 2; i++) {
          this.renderer.drawLine(x + i * 15, y + 10, x + i * 15, y + 20, this.currentColor, 2);
        }
        break;
      case 'confused':
        // Wavy mouth
        this.renderer.ctx.beginPath();
        this.renderer.ctx.moveTo(x - 30, y);
        this.renderer.ctx.bezierCurveTo(x - 15, y + 10, x - 5, y - 10, x + 10, y + 5);
        this.renderer.ctx.bezierCurveTo(x + 15, y + 10, x + 20, y - 5, x + 30, y);
        this.renderer.ctx.stroke();
        break;
      case 'angry':
        // Gritted teeth/angry line
        this.renderer.drawLine(x - 35, y + 5, x + 35, y + 5, this.currentColor, 6);
        this.renderer.ctx.beginPath();
        for (let i = -3; i <= 3; i++) {
          this.renderer.drawLine(x + i * 10, y + 2, x + i * 10, y + 8, this.currentColor, 3);
        }
        break;
      case 'loving':
        // Soft smile
        this.renderer.ctx.beginPath();
        this.renderer.ctx.arc(x, y - 5, 30, 0.3 * Math.PI, 0.7 * Math.PI, false);
        this.renderer.ctx.stroke();
        break;
      case 'bored':
        // Flat line, slightly droopy
        this.renderer.ctx.beginPath();
        this.renderer.ctx.moveTo(x - 30, y);
        this.renderer.ctx.lineTo(x + 30, y + 5);
        this.renderer.ctx.stroke();
        break;
      case 'curious':
        // Small o shape
        this.renderer.drawCircle(x, y, 12, this.currentColor, false);
        break;
      case 'scared':
        // Open mouth, trembling
        const tremble = Math.sin(this.idleTime * 20) * 3;
        this.renderer.drawCircle(x + tremble, y, 18, this.currentColor, false);
        break;
    }

    this.renderer.restore();
  }

  // Helper methods
  updateEyeLook(deltaTime) {
    this.eyeChangeTimer += deltaTime * 1000;
    if (this.eyeChangeTimer >= 1000 + Math.random() * 1000) {
      this.eyeLookTargetX = (Math.random() - 0.5) * 2;
      this.eyeLookTargetY = (Math.random() - 0.5) * 2;
      this.eyeChangeTimer = 0;
    }
    this.eyeLookX += (this.eyeLookTargetX - this.eyeLookX) * deltaTime * 5;
    this.eyeLookY += (this.eyeLookTargetY - this.eyeLookY) * deltaTime * 5;
  }

  drawHeart(x, y, size) {
    this.renderer.ctx.beginPath();
    this.renderer.ctx.moveTo(x, y + size / 4);
    this.renderer.ctx.bezierCurveTo(x, y, x - size / 2, y - size / 2, x - size, y + size / 3);
    this.renderer.ctx.bezierCurveTo(x - size, y + size, x, y + size * 1.2, x, y + size * 1.5);
    this.renderer.ctx.bezierCurveTo(x, y + size * 1.2, x + size, y + size, x + size, y + size / 3);
    this.renderer.ctx.bezierCurveTo(x + size / 2, y - size / 2, x, y, x, y + size / 4);
    this.renderer.ctx.fill();
  }

  onStateChange(newState) {
    const center = this.renderer.getCenter();

    // State-specific effects
    switch (newState) {
      case 'happy':
      case 'excited':
        for (let i = 0; i < 5; i++) {
          setTimeout(() => {
            this.addParticle(
              center.x + (Math.random() - 0.5) * 100,
              center.y + (Math.random() - 0.5) * 100,
              ['★', '♥', '•', '✨'][Math.floor(Math.random() * 4)]
            );
          }, i * 100);
        }
        break;
      case 'loving':
        for (let i = 0; i < 8; i++) {
          setTimeout(() => {
            this.addParticle(
              center.x + (Math.random() - 0.5) * 120,
              center.y + (Math.random() - 0.5) * 120,
              '♥',
              '#FF69B4'
            );
          }, i * 150);
        }
        break;
      case 'angry':
        for (let i = 0; i < 3; i++) {
          this.addParticle(
            center.x + (Math.random() - 0.5) * 80,
            center.y - 80,
            ['💢', '!!', '!'][i % 3]
          );
        }
        break;
      case 'confused':
        for (let i = 0; i < 3; i++) {
          setTimeout(() => {
            this.addParticle(
              center.x + 60 + Math.random() * 20,
              center.y - 60 - Math.random() * 20,
              '?'
            );
          }, i * 200);
        }
        break;
    }
  }
}
