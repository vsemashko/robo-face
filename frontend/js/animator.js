/**
 * Animator
 * Manages animation loop, timing, and frame rate
 */
class Animator {
  constructor(targetFps = 30) {
    this.targetFps = targetFps;
    this.frameInterval = 1000 / targetFps;
    this.lastFrameTime = 0;
    this.deltaTime = 0;
    this.currentFps = 0;
    this.frameCount = 0;
    this.fpsUpdateTime = 0;
    this.isRunning = false;
    this.animationId = null;

    // Animation callbacks
    this.updateCallback = null;
    this.renderCallback = null;

    // Easing functions
    this.easings = {
      linear: t => t,
      easeInQuad: t => t * t,
      easeOutQuad: t => t * (2 - t),
      easeInOutQuad: t => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t,
      easeInCubic: t => t * t * t,
      easeOutCubic: t => (--t) * t * t + 1,
      easeInOutCubic: t => t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1,
      easeInElastic: t => {
        const c4 = (2 * Math.PI) / 3;
        return t === 0 ? 0 : t === 1 ? 1 : -Math.pow(2, 10 * t - 10) * Math.sin((t * 10 - 10.75) * c4);
      },
      easeOutElastic: t => {
        const c4 = (2 * Math.PI) / 3;
        return t === 0 ? 0 : t === 1 ? 1 : Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * c4) + 1;
      },
      easeOutBounce: t => {
        const n1 = 7.5625;
        const d1 = 2.75;
        if (t < 1 / d1) {
          return n1 * t * t;
        } else if (t < 2 / d1) {
          return n1 * (t -= 1.5 / d1) * t + 0.75;
        } else if (t < 2.5 / d1) {
          return n1 * (t -= 2.25 / d1) * t + 0.9375;
        } else {
          return n1 * (t -= 2.625 / d1) * t + 0.984375;
        }
      }
    };
  }

  /**
   * Start the animation loop
   */
  start() {
    if (this.isRunning) return;

    this.isRunning = true;
    this.lastFrameTime = performance.now();
    this.fpsUpdateTime = this.lastFrameTime;
    this.frameCount = 0;
    this.loop();
  }

  /**
   * Stop the animation loop
   */
  stop() {
    this.isRunning = false;
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
  }

  /**
   * Main animation loop
   */
  loop() {
    if (!this.isRunning) return;

    const currentTime = performance.now();
    const elapsed = currentTime - this.lastFrameTime;

    // Throttle to target FPS
    if (elapsed >= this.frameInterval) {
      this.deltaTime = elapsed / 1000; // Convert to seconds
      this.lastFrameTime = currentTime - (elapsed % this.frameInterval);

      // Update FPS counter
      this.frameCount++;
      if (currentTime - this.fpsUpdateTime >= 1000) {
        this.currentFps = Math.round((this.frameCount * 1000) / (currentTime - this.fpsUpdateTime));
        this.frameCount = 0;
        this.fpsUpdateTime = currentTime;
      }

      // Call update callback
      if (this.updateCallback) {
        this.updateCallback(this.deltaTime);
      }

      // Call render callback
      if (this.renderCallback) {
        this.renderCallback(this.deltaTime);
      }
    }

    // Request next frame
    this.animationId = requestAnimationFrame(() => this.loop());
  }

  /**
   * Set update callback
   */
  onUpdate(callback) {
    this.updateCallback = callback;
  }

  /**
   * Set render callback
   */
  onRender(callback) {
    this.renderCallback = callback;
  }

  /**
   * Get current FPS
   */
  getFps() {
    return this.currentFps;
  }

  /**
   * Get delta time (time since last frame in seconds)
   */
  getDeltaTime() {
    return this.deltaTime;
  }

  /**
   * Interpolate between two values
   */
  lerp(start, end, t) {
    return start + (end - start) * t;
  }

  /**
   * Interpolate with easing
   */
  ease(start, end, t, easingName = 'linear') {
    const easing = this.easings[easingName] || this.easings.linear;
    return this.lerp(start, end, easing(t));
  }

  /**
   * Clamp value between min and max
   */
  clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
  }

  /**
   * Map value from one range to another
   */
  map(value, inMin, inMax, outMin, outMax) {
    return ((value - inMin) * (outMax - outMin)) / (inMax - inMin) + outMin;
  }

  /**
   * Create a tween animation
   */
  createTween(from, to, duration, easing = 'linear') {
    return {
      from,
      to,
      duration,
      easing,
      elapsed: 0,
      isComplete: false,
      getValue: function() {
        const t = this.clamp(this.elapsed / this.duration, 0, 1);
        if (t >= 1) {
          this.isComplete = true;
          return this.to;
        }
        return this.ease(this.from, this.to, t, this.easing);
      }.bind(this),
      update: function(deltaTime) {
        this.elapsed += deltaTime * 1000; // Convert to ms
      },
      reset: function() {
        this.elapsed = 0;
        this.isComplete = false;
      }
    };
  }

  /**
   * Generate random value between min and max
   */
  random(min, max) {
    return Math.random() * (max - min) + min;
  }

  /**
   * Generate random integer between min and max
   */
  randomInt(min, max) {
    return Math.floor(this.random(min, max + 1));
  }
}
