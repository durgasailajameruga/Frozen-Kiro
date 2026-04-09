# Frozen Kiro — Game Coding Standards

## File Structure

The game uses two files only. No additional files should be introduced without good reason.

```
index.html      — all game logic, rendering, audio, input handling
config.js       — all tunable constants exported as CONFIG
game-config.json — physics and gameplay parameters (loaded by config.js)
```

All game code lives in a `<script type="module">` block inside `index.html`.

---

## Naming Conventions

| Thing | Convention | Example |
|---|---|---|
| Functions | camelCase verbs | `spawnObstacle()`, `triggerGameOver()` |
| State fields | camelCase nouns | `state.frameCount`, `state.highScore` |
| Config keys | camelCase nouns | `CONFIG.gravity`, `CONFIG.groundRatio` |
| Constants (local) | UPPER_SNAKE | `const FPS = 60` |
| Game phases | lowercase string literals | `'idle'`, `'running'`, `'gameover'` |

---

## Game Loop Structure

Use a fixed-timestep delta-time loop. Always derive physics values from `dt` (seconds), not frame count, so the game behaves consistently across different refresh rates.

```js
let lastTime = 0;

function gameLoop(timestamp) {
  const dt = Math.min((timestamp - lastTime) / 1000, 0.05); // cap at 50ms
  lastTime = timestamp;

  update(dt);
  render();

  if (state.phase === 'running') {
    requestAnimationFrame(gameLoop);
  }
}
```

- Cap `dt` at 50ms to prevent spiral-of-death on tab blur/resume
- Never use `setInterval` for the game loop
- Store the `requestAnimationFrame` handle so it can be cancelled on game over

---

## State Management

A single flat `state` object holds all mutable game data. No global variables outside of `state`, `CONFIG`, and the canvas/context references.

```js
const state = {
  phase: 'idle',       // 'idle' | 'running' | 'gameover'
  score: 0,
  highScore: 0,
  frameCount: 0,
  obstacles: [],
  runner: { x, y, vy, grounded, width, height },
  speed: 0,
  rafHandle: null,
};
```

State transitions must go through dedicated functions — never mutate `state.phase` inline:

```js
// good
startRun();
triggerGameOver();
resetGame();

// bad
state.phase = 'running'; // scattered inline mutation
```

---

## Canvas API Patterns

Always save/restore context state when applying temporary styles (shadows, transforms, alpha):

```js
// good
ctx.save();
ctx.shadowColor = '#4af';
ctx.shadowBlur = 20;
drawObstacle(obs);
ctx.restore();

// bad — shadow bleeds into subsequent draw calls
ctx.shadowBlur = 20;
drawObstacle(obs);
ctx.shadowBlur = 0; // easy to forget
```

Clear the full canvas at the start of each `render()` call:

```js
ctx.clearRect(0, 0, canvas.width, canvas.height);
```

Set `canvas.width` and `canvas.height` explicitly on resize — do not use CSS scaling, which causes blurry rendering.

---

## Physics

Physics values in `game-config.json` are in real units (px/s, px/s²). Convert to per-frame values using `dt`:

```js
// apply gravity
state.runner.vy += CONFIG.gravity * dt;
state.runner.y  += state.runner.vy * dt;

// clamp to ground
if (state.runner.y >= groundY) {
  state.runner.y = groundY;
  state.runner.vy = 0;
  state.runner.grounded = true;
}
```

Never hardcode physics values — always read from `CONFIG`.

---

## Collision Detection

Use AABB (axis-aligned bounding box) for all collision checks. Apply hitbox padding inward from the rendered sprite bounds to keep collisions forgiving:

```js
function getHitbox(runner) {
  const p = CONFIG.runner.hitboxPadding;
  return {
    x:      runner.x      + runner.width  * p.left,
    y:      runner.y      + runner.height * p.top,
    width:  runner.width  * (1 - p.left - p.right),
    height: runner.height * (1 - p.top  - p.bottom),
  };
}

function aabbOverlap(a, b) {
  return (
    a.x < b.x + b.width  &&
    a.x + a.width  > b.x &&
    a.y < b.y + b.height &&
    a.y + a.height > b.y
  );
}

function checkCollision() {
  const hb = getHitbox(state.runner);
  return state.obstacles.some(obs => aabbOverlap(hb, obs));
}
```

Keep `getHitbox` and `aabbOverlap` as pure functions — no side effects, easy to unit test.

---

## Memory Management

- Never allocate objects inside the game loop hot path (`update`/`render`)
- Reuse obstacle objects where possible; prefer `filter` over `splice` for removal
- Remove off-screen obstacles immediately to keep the array small:

```js
state.obstacles = state.obstacles.filter(o => o.x + o.width > 0);
```

- Avoid string concatenation in `render()` — pre-format the score string only when the score changes, not every frame

---

## Event Handling

Attach all input listeners once in `init()`. Dispatch to the correct handler based on `state.phase`:

```js
function handleInput() {
  if (state.phase === 'idle')     startRun();
  else if (state.phase === 'running')  jump();
  else if (state.phase === 'gameover') resetGame();
}

window.addEventListener('keydown', e => {
  if (e.code === 'Space') { e.preventDefault(); handleInput(); }
});
canvas.addEventListener('touchstart', e => {
  e.preventDefault(); handleInput();
}, { passive: false });
```

Use `{ passive: false }` on touch listeners to allow `preventDefault()` and suppress scroll.

---

## Audio

Use the lightweight wrapper pattern. Never call `Audio` methods directly in game logic:

```js
const audio = {
  jump:     new Audio('assets/jump.wav'),
  gameOver: new Audio('assets/game_over.wav'),
  play(sound) {
    sound.currentTime = 0;
    sound.play().catch(() => {});
  },
};
```

Reset `currentTime` before each play so rapid re-triggers work correctly.

---

## Error Handling

| Scenario | Pattern |
|---|---|
| `localStorage` read/write | Wrap in `try/catch`, default to 0 |
| Sprite image load failure | `img.onerror` fallback to filled rect |
| Audio autoplay blocked | `.catch(() => {})` — swallow silently |

---

## Performance Guidelines

- Target 60fps; profile with browser DevTools if frame time exceeds 16ms
- Avoid `ctx.getImageData` / `ctx.putImageData` — they are slow
- Use `ctx.drawImage` for sprites, not CSS background images
- Keep the obstacle array small (typically 1–3 active at once)
- Do not use `document.querySelector` inside the game loop — cache DOM references in `init()`
