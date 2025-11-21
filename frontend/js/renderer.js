/**
 * Canvas Renderer
 * Handles all drawing operations for the robo-face
 */
class Renderer {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d', { alpha: false });
    this.width = 800;
    this.height = 600;
    this.pixelRatio = window.devicePixelRatio || 1;

    this.setupCanvas();
    this.setupResizeHandler();
  }

  setupCanvas() {
    // Set display size
    this.canvas.style.width = this.width + 'px';
    this.canvas.style.height = this.height + 'px';

    // Set actual size in memory (scaled for retina)
    this.canvas.width = this.width * this.pixelRatio;
    this.canvas.height = this.height * this.pixelRatio;

    // Scale context to match
    this.ctx.scale(this.pixelRatio, this.pixelRatio);

    // Set rendering optimizations
    this.ctx.imageSmoothingEnabled = true;
    this.ctx.imageSmoothingQuality = 'high';
  }

  setupResizeHandler() {
    window.addEventListener('resize', () => {
      this.setupCanvas();
    });
  }

  /**
   * Clear the canvas
   */
  clear() {
    this.ctx.fillStyle = '#1a1a1a';
    this.ctx.fillRect(0, 0, this.width, this.height);
  }

  /**
   * Draw a circle
   */
  drawCircle(x, y, radius, color, fill = true) {
    this.ctx.beginPath();
    this.ctx.arc(x, y, radius, 0, Math.PI * 2);

    if (fill) {
      this.ctx.fillStyle = color;
      this.ctx.fill();
    } else {
      this.ctx.strokeStyle = color;
      this.ctx.stroke();
    }
  }

  /**
   * Draw a rectangle
   */
  drawRect(x, y, width, height, color, fill = true) {
    if (fill) {
      this.ctx.fillStyle = color;
      this.ctx.fillRect(x, y, width, height);
    } else {
      this.ctx.strokeStyle = color;
      this.ctx.strokeRect(x, y, width, height);
    }
  }

  /**
   * Draw a rounded rectangle
   */
  drawRoundedRect(x, y, width, height, radius, color, fill = true) {
    this.ctx.beginPath();
    this.ctx.moveTo(x + radius, y);
    this.ctx.lineTo(x + width - radius, y);
    this.ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    this.ctx.lineTo(x + width, y + height - radius);
    this.ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    this.ctx.lineTo(x + radius, y + height);
    this.ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    this.ctx.lineTo(x, y + radius);
    this.ctx.quadraticCurveTo(x, y, x + radius, y);
    this.ctx.closePath();

    if (fill) {
      this.ctx.fillStyle = color;
      this.ctx.fill();
    } else {
      this.ctx.strokeStyle = color;
      this.ctx.stroke();
    }
  }

  /**
   * Draw an ellipse
   */
  drawEllipse(x, y, radiusX, radiusY, color, fill = true) {
    this.ctx.beginPath();
    this.ctx.ellipse(x, y, radiusX, radiusY, 0, 0, Math.PI * 2);

    if (fill) {
      this.ctx.fillStyle = color;
      this.ctx.fill();
    } else {
      this.ctx.strokeStyle = color;
      this.ctx.stroke();
    }
  }

  /**
   * Draw a line
   */
  drawLine(x1, y1, x2, y2, color, width = 2) {
    this.ctx.strokeStyle = color;
    this.ctx.lineWidth = width;
    this.ctx.beginPath();
    this.ctx.moveTo(x1, y1);
    this.ctx.lineTo(x2, y2);
    this.ctx.stroke();
  }

  /**
   * Draw text
   */
  drawText(text, x, y, color = '#ffffff', size = 16, align = 'center') {
    this.ctx.fillStyle = color;
    this.ctx.font = `${size}px sans-serif`;
    this.ctx.textAlign = align;
    this.ctx.textBaseline = 'middle';
    this.ctx.fillText(text, x, y);
  }

  /**
   * Draw with glow effect
   */
  drawGlow(drawFunction, color, blur = 20) {
    this.ctx.save();
    this.ctx.shadowColor = color;
    this.ctx.shadowBlur = blur;
    drawFunction();
    this.ctx.restore();
  }

  /**
   * Set global alpha for transparency
   */
  setAlpha(alpha) {
    this.ctx.globalAlpha = alpha;
  }

  /**
   * Reset global alpha
   */
  resetAlpha() {
    this.ctx.globalAlpha = 1.0;
  }

  /**
   * Save context state
   */
  save() {
    this.ctx.save();
  }

  /**
   * Restore context state
   */
  restore() {
    this.ctx.restore();
  }

  /**
   * Translate context
   */
  translate(x, y) {
    this.ctx.translate(x, y);
  }

  /**
   * Rotate context
   */
  rotate(angle) {
    this.ctx.rotate(angle);
  }

  /**
   * Scale context
   */
  scale(x, y) {
    this.ctx.scale(x, y);
  }

  /**
   * Get center coordinates
   */
  getCenter() {
    return {
      x: this.width / 2,
      y: this.height / 2
    };
  }

  /**
   * Get canvas dimensions
   */
  getDimensions() {
    return {
      width: this.width,
      height: this.height
    };
  }
}
