# Frozen Kiro — Visual Design

All rendering uses the HTML5 Canvas 2D API. No CSS transforms, no DOM elements for game visuals.

---

## Colour Palette

| Role | Value |
|---|---|
| Background | `#000000` |
| Ground (dark strip) | `#111118` |
| Ground (snow) | `#c8d8f0` |
| Snow highlight | `#ffffff` |
| Ice crystal base | `#5af` |
| Ice crystal glow | `#08f` |
| HUD text | `#aac8f0` |
| Overlay text | `#ffffff` |

---

## Sprite Rendering (Ghosty)

Ghosty is drawn from a horizontal sprite sheet (`assets/ghosty.png`). Each frame is 32×32px. The rendered size scales with canvas height via `CONFIG.layout.runnerHeightRatio`.

### Drawing a Frame

```js
function drawRunner(ctx, img, runner, frameIndex) {
  const srcX = frameIndex * 32;
  ctx.drawImage(
    img,
    srcX, 0, 32, 32,           // source rect
    runner.x, runner.y,         // dest position
    runner.width, runner.height // dest size (scaled)
  );
}
```

Always use integer pixel positions to avoid sub-pixel blurring:

```js
runner.renderX = Math.round(runner.x);
runner.renderY = Math.round(runner.y);
```

### Fallback (image load failure)

```js
ctx.fillStyle = '#5af';
ctx.fillRect(runner.x, runner.y, runner.width, runner.height);
```

---

## Animation State Machine

Animation state is tracked separately from game phase. Advance frames using an accumulator driven by `dt`, not frame count.

```js
const anim = {
  state: 'idle',   // 'idle' | 'run' | 'jump' | 'death'
  frame: 0,
  accum: 0,        // ms accumulated since last frame advance
};
```

### State Definitions (from ghosty-sprites.md)

| State  | Start | Frames | Loop  | Frame duration |
|--------|-------|--------|-------|----------------|
| `idle` | 0     | 4      | yes   | 100ms          |
| `run`  | 4     | 6      | yes   | 100ms          |
| `jump` | 10    | 3      | no    | 100ms          |
| `death`| 13    | 4      | no    | 100ms          |

### Advancing Frames

```js
function updateAnim(dt) {
  const def = ANIM_DEFS[anim.state];
  anim.accum += dt * 1000;
  if (anim.accum >= CONFIG.runner.animationFrameMs) {
    anim.accum = 0;
    if (anim.frame < def.frames - 1) {
      anim.frame++;
    } else if (def.loop) {
      anim.frame = 0;
    }
    // non-looping states hold on last frame
  }
}
```

### State Transitions

```js
function setAnimState(next) {
  if (anim.state === next) return;
  anim.state = next;
  anim.frame = 0;
  anim.accum = 0;
}
```

Trigger transitions from game logic:
- `startRun()` → `setAnimState('run')`
- `jump()` → `setAnimState('jump')`
- landing (grounded = true) → `setAnimState('run')`
- `triggerGameOver()` → `setAnimState('death')`
- idle phase → `setAnimState('idle')`

---

## Ice Crystal Obstacles

Obstacles are drawn procedurally using Canvas paths — no image asset required. Use `ctx.save()`/`ctx.restore()` to contain glow effects.

### Glow Effect

```js
function drawObstacle(ctx, obs) {
  ctx.save();
  ctx.shadowColor = '#08f';
  ctx.shadowBlur  = obs.variant === 'large' ? 24 : 16;
  drawCrystal(ctx, obs);
  ctx.restore();
}
```

### Crystal Shape

Draw a simple hexagonal/diamond crystal using `lineTo` paths. Scale all coordinates to `obs.width` and `obs.height`:

```js
function drawCrystal(ctx, obs) {
  const cx = obs.x + obs.width  / 2;
  const by = obs.y + obs.height;      // base y (ground level)
  const hw = obs.width  / 2;
  const hh = obs.height / 2;

  ctx.beginPath();
  ctx.moveTo(cx,        obs.y);       // top point
  ctx.lineTo(cx + hw,   obs.y + hh);  // right shoulder
  ctx.lineTo(cx + hw * 0.6, by);      // bottom-right
  ctx.lineTo(cx - hw * 0.6, by);      // bottom-left
  ctx.lineTo(cx - hw,   obs.y + hh);  // left shoulder
  ctx.closePath();

  ctx.fillStyle   = '#5af';
  ctx.strokeStyle = '#aef';
  ctx.lineWidth   = 1.5;
  ctx.fill();
  ctx.stroke();
}
```

Adjust the shape as needed — the key constraint is that the base sits flush at `groundY`.

---

## Ground Strip

The ground is two horizontal bands:

```js
function drawGround(ctx, canvas) {
  const groundY = canvas.height * CONFIG.layout.groundRatio;
  const stripH  = canvas.height * 0.015;  // thin dark strip
  const snowH   = canvas.height * 0.06;   // snow bank below

  // dark asphalt strip
  ctx.fillStyle = '#111118';
  ctx.fillRect(0, groundY, canvas.width, stripH);

  // snow bank
  ctx.fillStyle = '#c8d8f0';
  ctx.fillRect(0, groundY + stripH, canvas.width, snowH);

  // scattered snow highlights (static — computed once on resize)
  drawSnowDots(ctx, canvas, groundY + stripH, snowH);
}
```

Snow dots are pre-computed on `init()` and `handleResize()` into a static array — do not regenerate every frame.

---

## Snow Particles (optional)

A small pool of falling snow particles adds atmosphere without significant cost. Cap at 40 particles.

```js
const MAX_SNOW = 40;
const snowParticles = [];

function initSnow(canvas) {
  snowParticles.length = 0;
  for (let i = 0; i < MAX_SNOW; i++) {
    snowParticles.push(makeSnowParticle(canvas, true));
  }
}

function makeSnowParticle(canvas, randomY = false) {
  return {
    x:    Math.random() * canvas.width,
    y:    randomY ? Math.random() * canvas.height : -4,
    r:    1 + Math.random() * 2,
    vy:   20 + Math.random() * 40,   // px/s
    vx:  -5  - Math.random() * 10,   // slight leftward drift
    alpha: 0.4 + Math.random() * 0.5,
  };
}

function updateSnow(dt, canvas) {
  const groundY = canvas.height * CONFIG.layout.groundRatio;
  for (let i = 0; i < snowParticles.length; i++) {
    const p = snowParticles[i];
    p.x += p.vx * dt;
    p.y += p.vy * dt;
    if (p.y > groundY || p.x < -4) {
      snowParticles[i] = makeSnowParticle(canvas);
    }
  }
}

function drawSnow(ctx) {
  ctx.save();
  for (const p of snowParticles) {
    ctx.globalAlpha = p.alpha;
    ctx.fillStyle   = '#ffffff';
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}
```

Update and draw snow even during `gameover` and `idle` states for a living background.

---

## HUD

Score panel in the top-right corner, "Press Start 2P" font:

```js
function drawHUD(ctx, canvas) {
  const pad  = canvas.width * 0.02;
  const size = Math.max(10, canvas.width * 0.018);

  ctx.save();
  ctx.font         = `${size}px "Press Start 2P", monospace`;
  ctx.fillStyle    = '#aac8f0';
  ctx.textAlign    = 'right';
  ctx.textBaseline = 'top';
  ctx.fillText(state.scoreDisplay, canvas.width - pad, pad);
  ctx.restore();
}
```

`state.scoreDisplay` is pre-formatted by `formatScore()` and only updated when the score changes.

---

## Overlays

### Start Screen

```js
function drawStartOverlay(ctx, canvas) {
  drawCenteredText(ctx, canvas, 'FROZEN KIRO', 0.38, 'large');
  drawCenteredText(ctx, canvas, 'PRESS SPACE OR TAP TO START', 0.52, 'small');
}
```

### Game Over Screen

```js
function drawGameOverOverlay(ctx, canvas) {
  drawCenteredText(ctx, canvas, 'GAME OVER', 0.40, 'large');
  drawCenteredText(ctx, canvas, 'PRESS SPACE OR TAP TO RESTART', 0.54, 'small');
}
```

Helper:

```js
function drawCenteredText(ctx, canvas, text, yRatio, size) {
  const fontSize = size === 'large'
    ? Math.max(16, canvas.width * 0.03)
    : Math.max(10, canvas.width * 0.016);

  ctx.save();
  ctx.font         = `${fontSize}px "Press Start 2P", monospace`;
  ctx.fillStyle    = '#ffffff';
  ctx.textAlign    = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, canvas.width / 2, canvas.height * yRatio);
  ctx.restore();
}
```

---

## Render Order

Each frame, draw in this order to ensure correct layering:

1. Clear canvas (`#000000`)
2. Snow particles (background layer)
3. Ground strip + snow bank
4. Obstacles (with glow)
5. Runner sprite
6. HUD (score)
7. Overlay (start / game over) — only when applicable

---

## Performance Rules

- `ctx.save()`/`ctx.restore()` around every block that sets `shadowBlur`, `globalAlpha`, or `globalCompositeOperation`
- Pre-compute static geometry (snow dots, ground dimensions) on `init()` and `handleResize()` — not in `render()`
- Cap snow particles at 40; cap active obstacles at ~5
- Use `Math.round()` on all draw positions to avoid sub-pixel rendering
- Never call `ctx.getImageData` or `ctx.putImageData` in the render loop
- Load `ghosty.png` once in `init()` — never create `new Image()` inside the game loop
