/**
 * Pixel-Friend Character
 * Retro pixel-art style character
 */
class PixelFriendCharacter extends BaseCharacter {
  constructor(renderer, animator) {
    super(renderer, animator);

    // Pixel-specific settings
    this.pixelSize = 8;
    this.bounce = 0;
    this.shimmer = 0;
  }

  update(deltaTime) {
    super.update(deltaTime);

    // Retro bounce animation
    this.bounce = Math.abs(Math.sin(this.idleTime * 4)) * 10;

    // Shimmer effect
    this.shimmer = Math.sin(this.idleTime * 6) * 0.3;
  }

  render() {
    const center = this.renderer.getCenter();
    const baseSize = 160;

    const x = center.x;
    const y = center.y - this.bounce;

    // Pixelated glow
    this.renderer.setAlpha(0.5 + this.shimmer);
    this.renderer.drawRect(x - baseSize/2 - 10, y - baseSize/2 - 10, baseSize + 20, baseSize + 20, this.currentColor);
    this.renderer.resetAlpha();

    // Draw pixel body
    this.drawPixelBody(x, y, baseSize);
    this.drawPixelEyes(x, y - 20, baseSize);
    this.drawPixelMouth(x, y + 30, baseSize);
    this.drawPixelDetails(x, y, baseSize);

    // Draw particles
    this.renderParticles();
  }

  drawPixelBody(x, y, size) {
    const ps = this.pixelSize;

    // Main body (pixelated square)
    this.renderer.ctx.fillStyle = this.currentColor;
    this.fillPixelRect(x - size/2, y - size/2, size, size);

    // Inner darker area
    this.renderer.ctx.fillStyle = '#2a2a2a';
    this.fillPixelRect(x - size/2 + ps*2, y - size/2 + ps*2, size - ps*4, size - ps*4);

    // Pixel highlights (top-left)
    this.renderer.ctx.fillStyle = this.lightenColor(this.currentColor, 40);
    this.fillPixelRect(x - size/2 + ps, y - size/2 + ps, ps*2, ps*6);
    this.fillPixelRect(x - size/2 + ps, y - size/2 + ps, ps*6, ps*2);

    // Pixel shadows (bottom-right)
    this.renderer.ctx.fillStyle = this.darkenColor(this.currentColor, 40);
    this.fillPixelRect(x + size/2 - ps*3, y + size/2 - ps*7, ps*2, ps*6);
    this.fillPixelRect(x + size/2 - ps*7, y + size/2 - ps*3, ps*6, ps*2);
  }

  drawPixelEyes(x, y, size) {
    const ps = this.pixelSize;
    const eyeSpacing = ps * 5;

    switch (this.currentState) {
      case 'idle':
      case 'thinking':
      case 'curious':
        // Normal rectangular eyes
        this.renderer.ctx.fillStyle = this.currentColor;
        this.fillPixelRect(x - eyeSpacing - ps*2, y - ps, ps*3, ps*3);
        this.fillPixelRect(x + eyeSpacing - ps, y - ps, ps*3, ps*3);
        break;

      case 'happy':
      case 'excited':
      case 'loving':
        // Smiling eyes (two pixels high)
        this.renderer.ctx.fillStyle = this.currentColor;
        this.fillPixelRect(x - eyeSpacing - ps*2, y, ps*3, ps*2);
        this.fillPixelRect(x + eyeSpacing - ps, y, ps*3, ps*2);
        break;

      case 'sad':
        // Sad eyes (higher on one side)
        this.renderer.ctx.fillStyle = this.currentColor;
        this.fillPixelRect(x - eyeSpacing - ps*2, y - ps, ps*3, ps*3);
        this.fillPixelRect(x + eyeSpacing - ps, y + ps, ps*3, ps*3);
        // Tear pixel
        if (Math.random() < 0.1) {
          this.renderer.ctx.fillStyle = '#4A90E2';
          this.fillPixelRect(x - eyeSpacing, y + ps*4, ps, ps);
        }
        break;

      case 'surprised':
      case 'scared':
        // Wide eyes
        this.renderer.ctx.fillStyle = this.currentColor;
        this.fillPixelRect(x - eyeSpacing - ps*3, y - ps*2, ps*4, ps*4);
        this.fillPixelRect(x + eyeSpacing - ps, y - ps*2, ps*4, ps*4);
        break;

      case 'sleeping':
      case 'bored':
        // Horizontal lines (closed eyes)
        this.renderer.ctx.fillStyle = this.currentColor;
        this.fillPixelRect(x - eyeSpacing - ps*2, y, ps*3, ps);
        this.fillPixelRect(x + eyeSpacing - ps, y, ps*3, ps);
        if (this.currentState === 'sleeping' && Math.random() < 0.05) {
          this.addParticle(x + eyeSpacing + ps*3, y - ps*3, 'z');
        }
        break;

      case 'angry':
        // Angled angry eyes
        this.renderer.ctx.fillStyle = this.currentColor;
        // Left eye
        this.fillPixelRect(x - eyeSpacing - ps*3, y - ps*2, ps, ps);
        this.fillPixelRect(x - eyeSpacing - ps*2, y - ps, ps*2, ps);
        this.fillPixelRect(x - eyeSpacing, y, ps*2, ps);
        // Right eye
        this.fillPixelRect(x + eyeSpacing + ps*2, y - ps*2, ps, ps);
        this.fillPixelRect(x + eyeSpacing, y - ps, ps*2, ps);
        this.fillPixelRect(x + eyeSpacing - ps*2, y, ps*2, ps);
        break;

      case 'confused':
        // Asymmetric eyes
        this.renderer.ctx.fillStyle = this.currentColor;
        this.fillPixelRect(x - eyeSpacing - ps*2, y - ps, ps*3, ps*3);
        this.fillPixelRect(x + eyeSpacing - ps, y - ps*2, ps*4, ps*4);
        break;

      case 'alert':
        // Large focused eyes with pupils
        this.renderer.ctx.fillStyle = this.currentColor;
        this.fillPixelRect(x - eyeSpacing - ps*3, y - ps*2, ps*4, ps*4);
        this.fillPixelRect(x + eyeSpacing - ps, y - ps*2, ps*4, ps*4);
        // Pupils
        this.renderer.ctx.fillStyle = '#000';
        this.fillPixelRect(x - eyeSpacing - ps, y, ps*2, ps*2);
        this.fillPixelRect(x + eyeSpacing + ps, y, ps*2, ps*2);
        break;
    }
  }

  drawPixelMouth(x, y, size) {
    const ps = this.pixelSize;

    this.renderer.ctx.fillStyle = this.currentColor;

    switch (this.currentState) {
      case 'idle':
      case 'thinking':
      case 'curious':
        // Straight line
        this.fillPixelRect(x - ps*3, y, ps*6, ps);
        break;

      case 'happy':
      case 'excited':
      case 'loving':
        // Smile (pixelated curve)
        this.fillPixelRect(x - ps*4, y - ps, ps, ps);
        this.fillPixelRect(x - ps*3, y, ps*2, ps);
        this.fillPixelRect(x - ps, y + ps, ps*2, ps);
        this.fillPixelRect(x + ps, y + ps, ps*2, ps);
        this.fillPixelRect(x + ps*3, y, ps*2, ps);
        this.fillPixelRect(x + ps*4, y - ps, ps, ps);
        break;

      case 'sad':
        // Frown (inverted smile)
        this.fillPixelRect(x - ps*4, y + ps*2, ps, ps);
        this.fillPixelRect(x - ps*3, y + ps, ps*2, ps);
        this.fillPixelRect(x - ps, y, ps*2, ps);
        this.fillPixelRect(x + ps, y, ps*2, ps);
        this.fillPixelRect(x + ps*3, y + ps, ps*2, ps);
        this.fillPixelRect(x + ps*4, y + ps*2, ps, ps);
        break;

      case 'surprised':
      case 'scared':
        // O shape
        this.fillPixelRect(x - ps*2, y - ps, ps, ps);
        this.fillPixelRect(x - ps*3, y, ps, ps*2);
        this.fillPixelRect(x - ps*2, y + ps*2, ps*4, ps);
        this.fillPixelRect(x + ps*2, y, ps, ps*2);
        this.fillPixelRect(x + ps*2, y - ps, ps, ps);
        break;

      case 'angry':
        // Zigzag angry mouth
        for (let i = -3; i <= 3; i++) {
          const yOffset = (i % 2 === 0) ? 0 : ps;
          this.fillPixelRect(x + i*ps, y + yOffset, ps, ps);
        }
        break;

      case 'sleeping':
        // Small line
        this.fillPixelRect(x - ps*2, y + ps, ps*4, ps);
        break;

      case 'bored':
        // Slight frown
        this.fillPixelRect(x - ps*3, y, ps*2, ps);
        this.fillPixelRect(x - ps, y, ps*2, ps);
        this.fillPixelRect(x + ps, y, ps*2, ps);
        this.fillPixelRect(x + ps*2, y + ps, ps, ps);
        break;

      case 'confused':
        // Wavy line
        this.fillPixelRect(x - ps*3, y, ps, ps);
        this.fillPixelRect(x - ps*2, y - ps, ps, ps);
        this.fillPixelRect(x - ps, y, ps, ps);
        this.fillPixelRect(x, y + ps, ps, ps);
        this.fillPixelRect(x + ps, y, ps, ps);
        this.fillPixelRect(x + ps*2, y - ps, ps, ps);
        this.fillPixelRect(x + ps*3, y, ps, ps);
        break;
    }
  }

  drawPixelDetails(x, y, size) {
    const ps = this.pixelSize;

    // Antenna (for some states)
    if (['thinking', 'alert', 'curious'].includes(this.currentState)) {
      const antennaX = x;
      const antennaY = y - size/2;

      this.renderer.ctx.fillStyle = this.currentColor;
      this.fillPixelRect(antennaX - ps/2, antennaY - ps*5, ps, ps*5);

      // Blinking tip
      const blink = Math.sin(this.idleTime * 8) > 0.5;
      if (blink) {
        this.fillPixelRect(antennaX - ps, antennaY - ps*6, ps*2, ps*2);
      }
    }

    // Cheeks (for happy/loving states)
    if (['happy', 'loving', 'excited'].includes(this.currentState)) {
      this.renderer.ctx.fillStyle = '#FF69B4';
      this.renderer.setAlpha(0.5);
      this.fillPixelRect(x - size/2 + ps*3, y + ps, ps*2, ps*2);
      this.fillPixelRect(x + size/2 - ps*5, y + ps, ps*2, ps*2);
      this.renderer.resetAlpha();
    }
  }

  // Helper method to draw pixelated rectangles
  fillPixelRect(x, y, width, height) {
    const ps = this.pixelSize;
    const cols = Math.floor(width / ps);
    const rows = Math.floor(height / ps);

    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        this.renderer.ctx.fillRect(
          Math.floor(x + col * ps),
          Math.floor(y + row * ps),
          ps,
          ps
        );
      }
    }
  }

  // Color manipulation helpers
  lightenColor(color, percent) {
    const num = parseInt(color.replace('#', ''), 16);
    const amt = Math.round(2.55 * percent);
    const R = Math.min(255, (num >> 16) + amt);
    const G = Math.min(255, ((num >> 8) & 0x00FF) + amt);
    const B = Math.min(255, (num & 0x0000FF) + amt);
    return '#' + (0x1000000 + R * 0x10000 + G * 0x100 + B).toString(16).slice(1);
  }

  darkenColor(color, percent) {
    const num = parseInt(color.replace('#', ''), 16);
    const amt = Math.round(2.55 * percent);
    const R = Math.max(0, (num >> 16) - amt);
    const G = Math.max(0, ((num >> 8) & 0x00FF) - amt);
    const B = Math.max(0, (num & 0x0000FF) - amt);
    return '#' + (0x1000000 + R * 0x10000 + G * 0x100 + B).toString(16).slice(1);
  }

  onStateChange(newState) {
    const center = this.renderer.getCenter();

    switch (newState) {
      case 'happy':
      case 'excited':
        // Pixel particles
        for (let i = 0; i < 8; i++) {
          setTimeout(() => {
            this.addParticle(
              center.x + (Math.random() - 0.5) * 100,
              center.y + (Math.random() - 0.5) * 100,
              ['■', '●', '♦'][Math.floor(Math.random() * 3)]
            );
          }, i * 80);
        }
        break;
      case 'loving':
        // Heart pixels
        for (let i = 0; i < 5; i++) {
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
      case 'confused':
        // Question mark pixels
        this.addParticle(center.x + 60, center.y - 60, '?');
        break;
    }
  }
}
