/**
 * Cat-Face Character
 * Kawaii-style cat character
 */
class CatFaceCharacter extends BaseCharacter {
  constructor(renderer, animator) {
    super(renderer, animator);

    // Cat-specific animations
    this.earWiggle = 0;
    this.tailWag = 0;
    this.purr = 0;
    this.whiskerTwitch = 0;
  }

  update(deltaTime) {
    super.update(deltaTime);

    // Update ear wiggle
    this.earWiggle = Math.sin(this.idleTime * 3) * 5;

    // Update tail wag (faster when happy/excited)
    const wagSpeed = (this.currentState === 'happy' || this.currentState === 'excited') ? 8 : 2;
    this.tailWag = Math.sin(this.idleTime * wagSpeed) * 30;

    // Purr effect (when happy/loving)
    if (this.currentState === 'happy' || this.currentState === 'loving') {
      this.purr = Math.sin(this.idleTime * 15) * 2;
    } else {
      this.purr = 0;
    }

    // Whisker twitch
    this.whiskerTwitch = Math.sin(this.idleTime * 4) * 3;
  }

  render() {
    const center = this.renderer.getCenter();
    const baseSize = 180;

    // Draw glow
    this.renderer.drawGlow(() => {
      this.drawHead(center.x, center.y, baseSize);
    }, this.currentColor, 25);

    // Draw components
    this.drawTail(center.x + 120, center.y + 40);
    this.drawHead(center.x, center.y, baseSize);
    this.drawEars(center.x, center.y - 80, baseSize);
    this.drawEyes(center.x, center.y - 10, baseSize);
    this.drawNose(center.x, center.y + 20, baseSize);
    this.drawMouth(center.x, center.y + 30, baseSize);
    this.drawWhiskers(center.x, center.y + 15, baseSize);

    // Draw particles
    this.renderParticles();
  }

  drawHead(x, y, size) {
    const breathe = Math.sin(this.idleTime * this.breatheSpeed) * 3 + this.purr;
    const headSize = size + breathe;

    // Main head (circle)
    this.renderer.drawCircle(x, y, headSize / 2, this.currentColor);

    // Inner face
    const innerSize = headSize * 0.85;
    this.renderer.drawCircle(x, y, innerSize / 2, '#2a2a2a');
  }

  drawEars(x, y, size) {
    const earSize = 40;
    const earSpacing = 60;

    // Left ear
    this.renderer.save();
    this.renderer.ctx.fillStyle = this.currentColor;
    this.renderer.ctx.beginPath();
    this.renderer.ctx.moveTo(x - earSpacing + this.earWiggle, y);
    this.renderer.ctx.lineTo(x - earSpacing - 20, y - earSize);
    this.renderer.ctx.lineTo(x - earSpacing + 20 + this.earWiggle, y - earSize + 10);
    this.renderer.ctx.closePath();
    this.renderer.ctx.fill();

    // Right ear
    this.renderer.ctx.beginPath();
    this.renderer.ctx.moveTo(x + earSpacing - this.earWiggle, y);
    this.renderer.ctx.lineTo(x + earSpacing + 20, y - earSize);
    this.renderer.ctx.lineTo(x + earSpacing - 20 - this.earWiggle, y - earSize + 10);
    this.renderer.ctx.closePath();
    this.renderer.ctx.fill();

    // Inner ear (pink)
    this.renderer.ctx.fillStyle = '#FFB6C1';
    // Left
    this.renderer.ctx.beginPath();
    this.renderer.ctx.moveTo(x - earSpacing + this.earWiggle, y - 5);
    this.renderer.ctx.lineTo(x - earSpacing - 10, y - earSize + 10);
    this.renderer.ctx.lineTo(x - earSpacing + 10 + this.earWiggle, y - earSize + 15);
    this.renderer.ctx.closePath();
    this.renderer.ctx.fill();
    // Right
    this.renderer.ctx.beginPath();
    this.renderer.ctx.moveTo(x + earSpacing - this.earWiggle, y - 5);
    this.renderer.ctx.lineTo(x + earSpacing + 10, y - earSize + 10);
    this.renderer.ctx.lineTo(x + earSpacing - 10 - this.earWiggle, y - earSize + 15);
    this.renderer.ctx.closePath();
    this.renderer.ctx.fill();

    this.renderer.restore();
  }

  drawEyes(x, y, size) {
    const eyeSpacing = 35;
    const leftX = x - eyeSpacing;
    const rightX = x + eyeSpacing;

    switch (this.currentState) {
      case 'idle':
      case 'thinking':
      case 'curious':
        this.drawCatEyes(leftX, rightX, y, 'normal');
        break;
      case 'happy':
      case 'loving':
        this.drawCatEyes(leftX, rightX, y, 'happy');
        break;
      case 'excited':
        this.drawCatEyes(leftX, rightX, y, 'sparkle');
        break;
      case 'sad':
        this.drawCatEyes(leftX, rightX, y, 'sad');
        break;
      case 'surprised':
      case 'scared':
        this.drawCatEyes(leftX, rightX, y, 'wide');
        break;
      case 'sleeping':
      case 'bored':
        this.drawCatEyes(leftX, rightX, y, 'closed');
        break;
      case 'angry':
        this.drawCatEyes(leftX, rightX, y, 'angry');
        break;
      case 'confused':
        this.drawCatEyes(leftX, rightX, y, 'confused');
        break;
      case 'alert':
        this.drawCatEyes(leftX, rightX, y, 'alert');
        break;
    }
  }

  drawCatEyes(leftX, rightX, y, type) {
    this.renderer.save();

    switch (type) {
      case 'normal':
        // Cat slit pupils
        this.renderer.drawEllipse(leftX, y, 18, 25, this.currentColor);
        this.renderer.drawEllipse(rightX, y, 18, 25, this.currentColor);
        if (!this.isBlinking) {
          this.renderer.drawEllipse(leftX, y, 3, 15, '#000');
          this.renderer.drawEllipse(rightX, y, 3, 15, '#000');
        }
        break;

      case 'happy':
        // Happy cat eyes (crescents)
        this.renderer.ctx.strokeStyle = this.currentColor;
        this.renderer.ctx.lineWidth = 3;
        this.renderer.ctx.beginPath();
        this.renderer.ctx.arc(leftX, y + 5, 12, 0.2 * Math.PI, 0.8 * Math.PI, false);
        this.renderer.ctx.stroke();
        this.renderer.ctx.beginPath();
        this.renderer.ctx.arc(rightX, y + 5, 12, 0.2 * Math.PI, 0.8 * Math.PI, false);
        this.renderer.ctx.stroke();
        break;

      case 'sparkle':
        // Excited sparkling eyes
        const sparkle = Math.sin(this.idleTime * 10) * 3;
        this.renderer.drawCircle(leftX, y, 22 + sparkle, this.currentColor);
        this.renderer.drawCircle(rightX, y, 22 + sparkle, this.currentColor);
        // Stars in eyes
        this.renderer.setAlpha(0.8);
        this.drawStar(leftX, y, 8);
        this.drawStar(rightX, y, 8);
        this.renderer.resetAlpha();
        break;

      case 'sad':
        // Sad droopy eyes
        this.renderer.drawEllipse(leftX, y, 15, 20, this.currentColor);
        this.renderer.drawEllipse(rightX, y, 15, 20, this.currentColor);
        // Tear
        if (Math.random() < 0.1) {
          this.addParticle(leftX, y + 25, '💧', '#4A90E2');
        }
        break;

      case 'wide':
        // Wide surprised eyes
        this.renderer.drawCircle(leftX, y, 28, this.currentColor);
        this.renderer.drawCircle(rightX, y, 28, this.currentColor);
        this.renderer.drawCircle(leftX, y, 10, '#000');
        this.renderer.drawCircle(rightX, y, 10, '#000');
        break;

      case 'closed':
        // Closed sleepy eyes
        this.renderer.ctx.strokeStyle = this.currentColor;
        this.renderer.ctx.lineWidth = 3;
        this.renderer.ctx.lineCap = 'round';
        this.renderer.ctx.beginPath();
        this.renderer.ctx.arc(leftX, y, 12, Math.PI, 0, false);
        this.renderer.ctx.stroke();
        this.renderer.ctx.beginPath();
        this.renderer.ctx.arc(rightX, y, 12, Math.PI, 0, false);
        this.renderer.ctx.stroke();
        if (this.currentState === 'sleeping' && Math.random() < 0.05) {
          this.addParticle(leftX + 25, y - 15, 'z');
        }
        break;

      case 'angry':
        // Angry slanted eyes
        this.renderer.ctx.strokeStyle = this.currentColor;
        this.renderer.ctx.lineWidth = 4;
        this.renderer.drawLine(leftX - 15, y - 8, leftX + 15, y + 8, this.currentColor, 4);
        this.renderer.drawLine(rightX - 15, y + 8, rightX + 15, y - 8, this.currentColor, 4);
        break;

      case 'confused':
        // One eye normal, one wider
        this.renderer.drawEllipse(leftX, y, 18, 25, this.currentColor);
        this.renderer.drawCircle(rightX, y - 3, 22, this.currentColor);
        break;

      case 'alert':
        // Focused cat eyes
        this.renderer.drawEllipse(leftX, y, 20, 30, this.currentColor);
        this.renderer.drawEllipse(rightX, y, 20, 30, this.currentColor);
        this.renderer.drawEllipse(leftX, y, 2, 20, '#000');
        this.renderer.drawEllipse(rightX, y, 2, 20, '#000');
        break;
    }

    this.renderer.restore();
  }

  drawNose(x, y, size) {
    // Triangle nose
    this.renderer.save();
    this.renderer.ctx.fillStyle = '#FFB6C1';
    this.renderer.ctx.beginPath();
    this.renderer.ctx.moveTo(x, y + 8);
    this.renderer.ctx.lineTo(x - 6, y);
    this.renderer.ctx.lineTo(x + 6, y);
    this.renderer.ctx.closePath();
    this.renderer.ctx.fill();
    this.renderer.restore();
  }

  drawMouth(x, y, size) {
    this.renderer.save();
    this.renderer.ctx.strokeStyle = this.currentColor;
    this.renderer.ctx.lineWidth = 2;

    switch (this.currentState) {
      case 'happy':
      case 'excited':
      case 'loving':
        // Happy cat mouth (W shape)
        this.renderer.ctx.beginPath();
        this.renderer.ctx.moveTo(x, y - 5);
        this.renderer.ctx.quadraticCurveTo(x - 10, y + 10, x - 20, y + 5);
        this.renderer.ctx.stroke();
        this.renderer.ctx.beginPath();
        this.renderer.ctx.moveTo(x, y - 5);
        this.renderer.ctx.quadraticCurveTo(x + 10, y + 10, x + 20, y + 5);
        this.renderer.ctx.stroke();
        break;

      case 'sad':
        // Sad mouth
        this.renderer.ctx.beginPath();
        this.renderer.ctx.moveTo(x, y - 5);
        this.renderer.ctx.quadraticCurveTo(x - 10, y, x - 20, y - 5);
        this.renderer.ctx.stroke();
        this.renderer.ctx.beginPath();
        this.renderer.ctx.moveTo(x, y - 5);
        this.renderer.ctx.quadraticCurveTo(x + 10, y, x + 20, y - 5);
        this.renderer.ctx.stroke();
        break;

      case 'surprised':
      case 'scared':
        // O mouth
        this.renderer.drawCircle(x, y + 5, 10, this.currentColor, false);
        break;

      case 'angry':
        // Hissing mouth
        this.renderer.ctx.beginPath();
        this.renderer.ctx.moveTo(x - 15, y);
        this.renderer.ctx.lineTo(x + 15, y);
        this.renderer.ctx.stroke();
        // Fangs
        this.renderer.ctx.fillStyle = '#fff';
        this.renderer.ctx.beginPath();
        this.renderer.ctx.moveTo(x - 10, y);
        this.renderer.ctx.lineTo(x - 12, y + 8);
        this.renderer.ctx.lineTo(x - 8, y);
        this.renderer.ctx.fill();
        this.renderer.ctx.beginPath();
        this.renderer.ctx.moveTo(x + 10, y);
        this.renderer.ctx.lineTo(x + 12, y + 8);
        this.renderer.ctx.lineTo(x + 8, y);
        this.renderer.ctx.fill();
        break;

      default:
        // Normal cat mouth (small W)
        this.renderer.ctx.beginPath();
        this.renderer.ctx.moveTo(x, y - 5);
        this.renderer.ctx.quadraticCurveTo(x - 8, y + 5, x - 15, y);
        this.renderer.ctx.stroke();
        this.renderer.ctx.beginPath();
        this.renderer.ctx.moveTo(x, y - 5);
        this.renderer.ctx.quadraticCurveTo(x + 8, y + 5, x + 15, y);
        this.renderer.ctx.stroke();
    }

    this.renderer.restore();
  }

  drawWhiskers(x, y, size) {
    this.renderer.save();
    this.renderer.ctx.strokeStyle = this.currentColor;
    this.renderer.ctx.lineWidth = 1.5;

    const whiskerLength = 40;
    const whiskerY = y;

    // Left whiskers
    for (let i = 0; i < 3; i++) {
      const angle = (i - 1) * 0.15;
      const startX = x - 80;
      const endX = startX - whiskerLength;
      const startY = whiskerY + (i - 1) * 8;
      const endY = startY + whiskerLength * Math.sin(angle) + this.whiskerTwitch * (i - 1);
      this.renderer.drawLine(startX, startY, endX, endY, this.currentColor, 1.5);
    }

    // Right whiskers
    for (let i = 0; i < 3; i++) {
      const angle = (i - 1) * 0.15;
      const startX = x + 80;
      const endX = startX + whiskerLength;
      const startY = whiskerY + (i - 1) * 8;
      const endY = startY - whiskerLength * Math.sin(angle) - this.whiskerTwitch * (i - 1);
      this.renderer.drawLine(startX, startY, endX, endY, this.currentColor, 1.5);
    }

    this.renderer.restore();
  }

  drawTail(x, y) {
    this.renderer.save();
    this.renderer.ctx.strokeStyle = this.currentColor;
    this.renderer.ctx.lineWidth = 12;
    this.renderer.ctx.lineCap = 'round';

    // Wagging tail curve
    this.renderer.ctx.beginPath();
    this.renderer.ctx.moveTo(x - 40, y);
    this.renderer.ctx.quadraticCurveTo(
      x, y - 30 + this.tailWag,
      x + 20, y - 50 + this.tailWag
    );
    this.renderer.ctx.stroke();

    // Tail tip
    this.renderer.drawCircle(x + 20, y - 50 + this.tailWag, 8, this.currentColor);

    this.renderer.restore();
  }

  drawStar(x, y, size) {
    this.renderer.ctx.save();
    this.renderer.ctx.fillStyle = '#fff';
    this.renderer.ctx.beginPath();
    for (let i = 0; i < 5; i++) {
      const angle = (i * 4 * Math.PI / 5) - Math.PI / 2;
      const r = i % 2 === 0 ? size : size / 2;
      const px = x + r * Math.cos(angle);
      const py = y + r * Math.sin(angle);
      if (i === 0) {
        this.renderer.ctx.moveTo(px, py);
      } else {
        this.renderer.ctx.lineTo(px, py);
      }
    }
    this.renderer.ctx.closePath();
    this.renderer.ctx.fill();
    this.renderer.ctx.restore();
  }

  onStateChange(newState) {
    const center = this.renderer.getCenter();

    switch (newState) {
      case 'happy':
      case 'loving':
        // Hearts and paw prints
        for (let i = 0; i < 6; i++) {
          setTimeout(() => {
            this.addParticle(
              center.x + (Math.random() - 0.5) * 120,
              center.y + (Math.random() - 0.5) * 120,
              ['♥', '🐾', '✨'][Math.floor(Math.random() * 3)]
            );
          }, i * 150);
        }
        break;
      case 'excited':
        // Lots of sparkles
        for (let i = 0; i < 10; i++) {
          setTimeout(() => {
            this.addParticle(
              center.x + (Math.random() - 0.5) * 150,
              center.y + (Math.random() - 0.5) * 150,
              '✨'
            );
          }, i * 100);
        }
        break;
      case 'curious':
        // Question marks
        for (let i = 0; i < 2; i++) {
          setTimeout(() => {
            this.addParticle(
              center.x + 70 + Math.random() * 20,
              center.y - 70 - Math.random() * 20,
              '?'
            );
          }, i * 300);
        }
        break;
    }
  }
}
