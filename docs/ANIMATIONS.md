# Animation Guide

This guide explains how the animation system works and how to create custom animations for Robo-Face.

## Table of Contents

1. [Animation System Overview](#animation-system-overview)
2. [Character Anatomy](#character-anatomy)
3. [Animation States](#animation-states)
4. [Creating Custom Animations](#creating-custom-animations)
5. [Animation Configuration](#animation-configuration)
6. [Performance Optimization](#performance-optimization)
7. [Advanced Techniques](#advanced-techniques)

---

## Animation System Overview

### Architecture

```
┌──────────────┐
│  main.js     │  Application coordinator
└──────┬───────┘
       │
   ┌───▼────────────────────────────────┐
   │  animator.js                       │
   │  - 30 FPS loop                     │
   │  - Delta time calculation          │
   │  - Easing functions                │
   └───┬────────────────────────────────┘
       │
   ┌───▼────────────────────────────────┐
   │  character.js (RoboFace)           │
   │  - State machine                   │
   │  - Animation logic                 │
   │  - Particle effects                │
   └───┬────────────────────────────────┘
       │
   ┌───▼────────────────────────────────┐
   │  renderer.js                       │
   │  - Canvas drawing                  │
   │  - Primitives (circles, rects)     │
   │  - Effects (glow, alpha)           │
   └────────────────────────────────────┘
```

### Frame Rate

Target: **30 FPS**
- Optimized for Raspberry Pi
- Smooth enough for character animations
- Low CPU usage

### Animation Loop

```javascript
// Pseudo-code
every frame (30fps):
  1. Calculate deltaTime
  2. Update character state
     - Update blink timer
     - Update eye movement
     - Update particles
  3. Render to canvas
     - Clear screen
     - Draw character
     - Draw effects
```

---

## Character Anatomy

### Robo-Face Components

```
     ┌───┐
     │ • │  ← Antenna (sways, blinks)
     └─┬─┘
  ┌────────────┐
  │  ┌────┐    │  ← Eyes (change per state)
  │  └────┘    │
  │            │  ← Face (breathing effect)
  │   ┌───┐    │
  │   └───┘    │  ← Mouth (morphs per emotion)
  └────────────┘
```

### Drawing Order

1. Glow effect (background)
2. Face base (rounded rectangle)
3. Antenna (line + circle)
4. Eyes (state-specific)
5. Mouth (state-specific)
6. Particles (foreground)

---

## Animation States

### State Definitions

Each state has unique visual characteristics:

#### 1. Idle (Default)
```javascript
- Eyes: Medium rectangles
- Mouth: Straight line
- Color: Blue (#4A90E2)
- Effects: Gentle breathing
- Duration: Infinite
```

#### 2. Happy
```javascript
- Eyes: Arched upward (smiling)
- Mouth: Big upward curve
- Color: Green (#7ED321)
- Effects: Celebration particles
- Duration: 3-5 seconds
```

#### 3. Thinking
```javascript
- Eyes: Normal with moving pupils
- Mouth: Slight curve
- Color: Orange (#F5A623)
- Effects: Eyes look around
- Duration: 3-4 seconds
```

#### 4. Alert
```javascript
- Eyes: Large circles, pulsing
- Mouth: Circle (O shape)
- Color: Yellow (#F8E71C)
- Effects: Pulsing animation
- Duration: 5-8 seconds
```

#### 5. Sad
```javascript
- Eyes: Arched downward
- Mouth: Downward curve
- Color: Red (#D0021B)
- Effects: None
- Duration: 4-6 seconds
```

#### 6. Surprised
```javascript
- Eyes: Very large circles
- Mouth: Large circle
- Color: Purple (#BD10E0)
- Effects: Quick reaction, highlights
- Duration: 2-3 seconds
```

#### 7. Sleeping
```javascript
- Eyes: Horizontal lines (closed)
- Mouth: Small curve
- Color: Gray (#4A4A4A)
- Effects: ZZZ particles
- Duration: 10+ seconds
```

---

## Creating Custom Animations

### Step 1: Define the State

Add to `backend/config/events.json`:

```json
{
  "states": {
    "excited": {
      "description": "Very excited state",
      "color": "#FF6B6B"
    }
  }
}
```

### Step 2: Add State to Character

Edit `frontend/js/character.js`:

```javascript
constructor() {
  // Add to states
  this.states = {
    // ... existing states
    excited: { priority: 6, interruptible: true }
  };

  // Add color
  this.stateColors = {
    // ... existing colors
    excited: '#FF6B6B'
  };
}
```

### Step 3: Implement Drawing Logic

In `character.js`, add drawing method:

```javascript
drawEyes(x, y, baseSize) {
  switch (this.currentState) {
    // ... existing cases
    case 'excited':
      this.drawExcitedEyes(leftEyeX, rightEyeX, y);
      break;
  }
}

drawExcitedEyes(leftX, rightX, y) {
  // Animated size
  const bounce = Math.sin(this.idleTime * 10) * 5;
  const size = 35 + bounce;

  // Stars for eyes
  this.drawStar(leftX, y, size);
  this.drawStar(rightX, y, size);
}

drawMouth(x, y, baseSize) {
  switch (this.currentState) {
    // ... existing cases
    case 'excited':
      // Very wide smile with teeth
      this.renderer.ctx.beginPath();
      this.renderer.ctx.arc(x, y - 15, 40, 0.1 * Math.PI, 0.9 * Math.PI, false);
      this.renderer.ctx.stroke();
      break;
  }
}
```

### Step 4: Add Helper Functions

```javascript
drawStar(x, y, size) {
  this.renderer.save();
  this.renderer.ctx.fillStyle = this.currentColor;
  this.renderer.ctx.beginPath();

  const spikes = 5;
  const rotation = Math.PI / 2 * 3;
  const step = Math.PI / spikes;
  const outerRadius = size;
  const innerRadius = size / 2;

  let posX = x;
  let posY = y - outerRadius;

  for (let i = 0; i < spikes; i++) {
    const angle = rotation + (i * 2 * step);
    posX = x + Math.cos(angle) * outerRadius;
    posY = y + Math.sin(angle) * outerRadius;
    this.renderer.ctx.lineTo(posX, posY);

    const innerAngle = rotation + ((i * 2 + 1) * step);
    posX = x + Math.cos(innerAngle) * innerRadius;
    posY = y + Math.sin(innerAngle) * innerRadius;
    this.renderer.ctx.lineTo(posX, posY);
  }

  this.renderer.ctx.closePath();
  this.renderer.ctx.fill();
  this.renderer.restore();
}
```

### Step 5: Add Special Effects

```javascript
// In setState() method
setState(newState) {
  // ... existing code

  if (newState === 'excited') {
    // Add sparkle particles
    for (let i = 0; i < 10; i++) {
      setTimeout(() => {
        const center = this.renderer.getCenter();
        this.addParticle(
          center.x + (Math.random() - 0.5) * 150,
          center.y + (Math.random() - 0.5) * 150,
          '✨'
        );
      }, i * 50);
    }
  }
}
```

### Step 6: Map Event to State

In `backend/event-manager.js`:

```javascript
mapEventToState(event) {
  // ... existing mappings

  if (event.type === 'custom.party') return 'excited';

  // ... rest of code
}
```

### Step 7: Test Your Animation

```bash
curl -X POST http://localhost:3000/api/event \
  -H "Content-Type: application/json" \
  -d '{"type":"emotion","value":"excited","duration":5000}'
```

---

## Animation Configuration

### Configurable Parameters

Create `frontend/assets/animations/robo-face.json`:

```json
{
  "character": "robo-face",
  "baseSize": 200,
  "animations": {
    "idle": {
      "breatheSpeed": 2,
      "breatheAmount": 5,
      "blinkInterval": [2000, 5000],
      "blinkDuration": 150
    },
    "happy": {
      "particleCount": 5,
      "particleTypes": ["★", "♥", "•"],
      "celebrationDuration": 1000
    },
    "thinking": {
      "eyeMovementSpeed": 5,
      "eyeChangeInterval": [1000, 2000],
      "eyeRange": [-5, 5]
    },
    "alert": {
      "pulseSpeed": 8,
      "pulseAmount": 0.1
    },
    "sleeping": {
      "zzzInterval": 2000,
      "zzzCount": 3
    }
  }
}
```

### Loading Configuration

```javascript
class RoboFace {
  async loadConfig() {
    const response = await fetch('assets/animations/robo-face.json');
    this.config = await response.json();

    // Apply configuration
    this.breatheSpeed = this.config.animations.idle.breatheSpeed;
    this.blinkInterval = this.config.animations.idle.blinkInterval[0];
  }
}
```

---

## Performance Optimization

### 1. Reduce Draw Calls

❌ **Bad:**
```javascript
// Drawing each frame
drawEyes() {
  for (let i = 0; i < 100; i++) {
    this.renderer.drawCircle(...);
  }
}
```

✅ **Good:**
```javascript
// Batch or simplify
drawEyes() {
  this.renderer.drawEllipse(...);  // Single call
}
```

### 2. Use RequestAnimationFrame

Already implemented in `animator.js`:

```javascript
loop() {
  // Throttle to target FPS
  if (elapsed >= this.frameInterval) {
    this.update();
    this.render();
  }
  requestAnimationFrame(() => this.loop());
}
```

### 3. Dirty Rectangle Optimization

For static parts:

```javascript
render() {
  if (!this.needsRedraw) return;

  // Only redraw changed areas
  this.renderer.clear();
  this.drawCharacter();
  this.needsRedraw = false;
}
```

### 4. Particle Management

```javascript
updateParticles(deltaTime) {
  // Remove dead particles immediately
  for (let i = this.particles.length - 1; i >= 0; i--) {
    const p = this.particles[i];
    if (p.life <= 0) {
      this.particles.splice(i, 1);  // Remove
    }
  }
}
```

### 5. Offscreen Canvas (Advanced)

```javascript
// Pre-render static elements
this.faceCache = document.createElement('canvas');
const ctx = this.faceCache.getContext('2d');
// Draw face once
// Then blit in render loop
this.renderer.ctx.drawImage(this.faceCache, x, y);
```

---

## Advanced Techniques

### 1. Easing Functions

Use built-in easings from `animator.js`:

```javascript
// Smooth movement
const progress = this.animator.ease(0, 1, t, 'easeOutQuad');
const x = this.animator.lerp(startX, endX, progress);
```

Available easings:
- `linear`
- `easeInQuad`, `easeOutQuad`, `easeInOutQuad`
- `easeInCubic`, `easeOutCubic`, `easeInOutCubic`
- `easeInElastic`, `easeOutElastic`
- `easeOutBounce`

### 2. Tween Animation

```javascript
// Create a tween
this.eyeSizeTween = this.animator.createTween(
  30,   // from
  50,   // to
  1000, // duration (ms)
  'easeOutElastic'
);

// Update each frame
update(deltaTime) {
  this.eyeSizeTween.update(deltaTime);
  const size = this.eyeSizeTween.getValue();
  // Use size for drawing
}
```

### 3. Sprite Sheets (Future)

For complex animations, use sprite sheets:

```javascript
class SpriteSheet {
  constructor(image, frameWidth, frameHeight) {
    this.image = image;
    this.frameWidth = frameWidth;
    this.frameHeight = frameHeight;
    this.currentFrame = 0;
  }

  drawFrame(ctx, x, y, frame) {
    const col = frame % this.cols;
    const row = Math.floor(frame / this.cols);

    ctx.drawImage(
      this.image,
      col * this.frameWidth,
      row * this.frameHeight,
      this.frameWidth,
      this.frameHeight,
      x, y,
      this.frameWidth,
      this.frameHeight
    );
  }
}
```

### 4. State Transitions

Smooth color transitions:

```javascript
updateColor() {
  const targetColor = this.stateColors[this.targetState];

  // Parse colors
  const current = this.parseColor(this.currentColor);
  const target = this.parseColor(targetColor);

  // Interpolate RGB
  this.currentColor = this.interpolateColor(current, target, 0.1);
}

interpolateColor(from, to, t) {
  const r = Math.floor(from.r + (to.r - from.r) * t);
  const g = Math.floor(from.g + (to.g - from.g) * t);
  const b = Math.floor(from.b + (to.b - from.b) * t);
  return `rgb(${r}, ${g}, ${b})`;
}
```

### 5. Physics-based Particles

```javascript
class Particle {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.vx = (Math.random() - 0.5) * 100;
    this.vy = -50 - Math.random() * 50;
    this.gravity = 98; // pixels/sec²
  }

  update(deltaTime) {
    this.vy += this.gravity * deltaTime;
    this.x += this.vx * deltaTime;
    this.y += this.vy * deltaTime;
  }
}
```

---

## Animation Checklist

When creating a new animation:

- [ ] Define state in `backend/config/events.json`
- [ ] Add to character states with priority
- [ ] Define color in `stateColors`
- [ ] Implement `drawEyes()` case
- [ ] Implement `drawMouth()` case
- [ ] Add special effects if needed
- [ ] Test state transitions
- [ ] Optimize performance
- [ ] Document the animation

---

## Examples Gallery

### Bouncing Animation

```javascript
drawBouncingEyes(leftX, rightX, y) {
  const bounce = Math.abs(Math.sin(this.idleTime * 5)) * 10;
  const size = 30 + bounce;

  this.renderer.drawCircle(leftX, y - bounce, size, this.currentColor);
  this.renderer.drawCircle(rightX, y - bounce, size, this.currentColor);
}
```

### Pulsing Glow

```javascript
drawPulsingFace(x, y, size) {
  const pulse = 0.5 + Math.sin(this.idleTime * 4) * 0.5;
  const blur = 20 + pulse * 30;

  this.renderer.drawGlow(() => {
    this.drawFaceBase(x, y, size);
  }, this.currentColor, blur);
}
```

### Rotating Antenna

```javascript
drawRotatingAntenna(x, y) {
  const angle = this.idleTime * 2;
  const radius = 40;

  this.renderer.save();
  this.renderer.translate(x, y);
  this.renderer.rotate(angle);

  this.renderer.drawLine(0, 0, 0, -radius, this.currentColor, 4);
  this.renderer.drawCircle(0, -radius, 8, this.currentColor);

  this.renderer.restore();
}
```

---

## Troubleshooting

### Animation is choppy
- Check FPS in debug overlay
- Reduce particle count
- Simplify drawing operations
- Check CPU usage on RPi

### Colors not changing
- Verify `stateColors` defined
- Check `updateColor()` is called
- Ensure color format is valid hex/rgb

### State not transitioning
- Check priority levels
- Verify state name matches
- Check event mapping in config

### Particles not appearing
- Verify `maxParticles` not reached
- Check particle `life` value
- Ensure `renderParticles()` is called

---

## Best Practices

1. **Keep it simple** - Raspberry Pi has limited resources
2. **Test on device** - Performance differs from desktop
3. **Use constants** - Define magic numbers as constants
4. **Comment your code** - Explain animation logic
5. **Version control** - Commit working states
6. **Profile performance** - Monitor FPS and CPU

---

## Further Reading

- [Canvas API Reference](https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API)
- [RequestAnimationFrame](https://developer.mozilla.org/en-US/docs/Web/API/window/requestAnimationFrame)
- [Easing Functions](https://easings.net/)
- [Animation Principles](https://en.wikipedia.org/wiki/Twelve_basic_principles_of_animation)

---

## See Also

- [API Documentation](API.md) - Triggering animations
- [Events Guide](EVENTS.md) - Event types
- [Deployment Plan](../DEPLOYMENT_PLAN.md) - System architecture
