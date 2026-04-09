# Frozen Kiro — Game Mechanics

All values referenced here come from `game-config.json` via `CONFIG`. Never hardcode numbers in game logic.

---

## Physics

### Gravity & Vertical Movement

Physics runs in real units (px/s, px/s²) and is integrated each frame using delta time (`dt` in seconds):

```js
// Each frame while airborne:
state.runner.vy += CONFIG.physics.gravity * dt;   // 800 px/s²
state.runner.y  += state.runner.vy * dt;
```

Ground clamp — applied after integration:

```js
const groundY = canvas.height * CONFIG.layout.groundRatio;
if (state.runner.y >= groundY) {
  state.runner.y      = groundY;
  state.runner.vy     = 0;
  state.runner.grounded = true;
}
```

### Jump

Jump is instantaneous velocity application, not an impulse over time:

```js
function jump() {
  if (!state.runner.grounded) return;   // airborne — ignore
  state.runner.vy       = CONFIG.physics.jumpVelocity;  // -300 px/s
  state.runner.grounded = false;
  audio.play(audio.jump);
}
```

Jump feel is tuned via two values only: `jumpVelocity` (height) and `gravity` (arc speed). Increase gravity for a snappier, arcade feel; decrease for floatier jumps.

### Delta Time Cap

Always cap `dt` to prevent physics explosion after tab blur/resume:

```js
const dt = Math.min((timestamp - lastTime) / 1000, 0.05);
```

---

## Obstacle Movement

Obstacles move left at a constant speed each frame:

```js
for (const obs of state.obstacles) {
  obs.x -= state.speed * dt;
}
```

`state.speed` starts at `CONFIG.speed.obstacleSpeed` (120 px/s) and scales with score:

```js
function computeSpeed(score) {
  const steps = Math.floor(score / CONFIG.speed.speedScoreInterval);
  const scaled = CONFIG.speed.obstacleSpeed * (1 + steps * CONFIG.speed.speedStepPercent);
  return Math.min(scaled, CONFIG.speed.obstacleSpeed * CONFIG.speed.maxSpeedMultiplier);
}
```

Update speed each frame during `update()`:

```js
state.speed = computeSpeed(state.score);
```

---

## Obstacle Spawning

### Timing

Spawn intervals are randomised between `spawnMinMs` and `spawnMaxMs`:

```js
function scheduleNextSpawn() {
  const { spawnMinMs, spawnMaxMs } = CONFIG.obstacles;
  state.nextSpawnIn = spawnMinMs + Math.random() * (spawnMaxMs - spawnMinMs);
  state.spawnTimer  = 0;
}
```

Advance the timer each frame and spawn when due:

```js
state.spawnTimer += dt * 1000; // convert to ms
if (state.spawnTimer >= state.nextSpawnIn) {
  spawnObstacle();
  scheduleNextSpawn();
}
```

### Size Variation

Two variants — `small` and `large` — chosen randomly at spawn time. Dimensions are fractions of canvas size:

```js
function spawnObstacle() {
  const variant  = Math.random() < 0.5 ? 'small' : 'large';
  const scale    = CONFIG.obstacles.variants[variant];
  const width    = canvas.width  * scale.widthScale;
  const height   = canvas.height * scale.heightScale;
  const groundY  = canvas.height * CONFIG.layout.groundRatio;

  state.obstacles.push({
    x: canvas.width,          // spawn at right edge
    y: groundY - height,      // sit flush on ground
    width,
    height,
    variant,
  });
}
```

### Minimum Spacing

Enforce `spawnSpacing` (350px) to prevent impossible clusters. Before spawning, check the rightmost obstacle:

```js
const last = state.obstacles.at(-1);
if (last && last.x > canvas.width - CONFIG.obstacles.spawnSpacing) return;
```

---

## Collision Detection

### Hitbox Derivation

Hitboxes are inset from the rendered sprite bounds using padding fractions from `CONFIG.runner.hitboxPadding`:

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
```

Default padding (from `ghosty-sprites.md`):

| Side   | Value |
|--------|-------|
| top    | 0.20  |
| right  | 0.15  |
| bottom | 0.05  |
| left   | 0.15  |

### AABB Test

```js
function aabbOverlap(a, b) {
  return (
    a.x              < b.x + b.width  &&
    a.x + a.width    > b.x            &&
    a.y              < b.y + b.height &&
    a.y + a.height   > b.y
  );
}

function checkCollision() {
  const hb = getHitbox(state.runner);
  return state.obstacles.some(obs => aabbOverlap(hb, obs));
}
```

Call `checkCollision()` once per frame inside `update()`. On `true`, call `triggerGameOver()`.

---

## Scoring

Score increments based on elapsed time, not frame count, so it is refresh-rate independent:

```js
state.scoreAccum += dt;
const pointsPerSecond = 1000 / CONFIG.scoring.scoreInterval; // scoreInterval in ms
const newScore = Math.floor(state.scoreAccum * pointsPerSecond);
if (newScore > state.score) {
  state.score = newScore;
  state.scoreDisplay = formatScore(state.highScore, state.score);
}
```

Pre-compute `scoreDisplay` only when the score changes — not every frame.

### Score Display Format

Zero-pad both values to 5 digits:

```js
function zeroPad(n, digits = 5) {
  return String(n).padStart(digits, '0');
}

function formatScore(hi, score) {
  return `HI ${zeroPad(hi)}  ${zeroPad(score)}`;
}
// → "HI 00123  00014"
```

---

## Off-Screen Cleanup

Remove obstacles that have fully exited the left edge after each update:

```js
state.obstacles = state.obstacles.filter(o => o.x + o.width > 0);
```

---

## Speed Progression Summary

| Score range | Speed (px/s) |
|-------------|-------------|
| 0–499       | 120         |
| 500–999     | 126         |
| 1000–1499   | 132         |
| …           | +6 per 500  |
| ≥ 5000      | 360 (cap)   |
