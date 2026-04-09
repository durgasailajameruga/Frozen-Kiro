# Frozen Kiro — Domain Specification

All values come from `game-config.json` via `CONFIG`. Never hardcode domain constants in game logic.

---

## Game State Management

The game has exactly three phases. All transitions go through dedicated functions — never mutate `state.phase` directly.

```
idle ──[input]──► running ──[collision]──► gameover ──[input]──► running
```

| Phase | Entry function | Exit trigger |
|---|---|---|
| `idle` | `init()` on page load | Player input (Space / tap) |
| `running` | `startRun()` | Collision detected |
| `gameover` | `triggerGameOver()` | Player input (Space / tap) |

### State Object

```js
const state = {
  phase:        'idle',
  score:        0,
  highScore:    0,
  scoreAccum:   0,       // seconds accumulated for score calculation
  scoreDisplay: 'HI 00000  00000',
  obstacles:    [],
  speed:        0,
  spawnTimer:   0,       // ms since last spawn
  nextSpawnIn:  0,       // ms until next spawn
  rafHandle:    null,
  runner: {
    x: 0, y: 0,
    vy: 0,
    grounded: true,
    width: 0, height: 0,
  },
};
```

### startRun()

Resets all transient state and begins the game loop:

```js
function startRun() {
  state.phase       = 'running';
  state.score       = 0;
  state.scoreAccum  = 0;
  state.scoreDisplay = formatScore(state.highScore, 0);
  state.obstacles   = [];
  state.speed       = CONFIG.speed.obstacleSpeed;
  state.spawnTimer  = 0;
  state.nextSpawnIn = CONFIG.obstacles.spawnMinMs; // first spawn is immediate-ish
  resetRunner();
  setAnimState('run');
  state.rafHandle = requestAnimationFrame(gameLoop);
}
```

### triggerGameOver()

Stops the loop, persists high score, plays audio:

```js
function triggerGameOver() {
  state.phase = 'gameover';
  cancelAnimationFrame(state.rafHandle);
  audio.play(audio.gameOver);
  setAnimState('death');
  if (state.score > state.highScore) {
    state.highScore = state.score;
    try { localStorage.setItem('frozenKiro_hi', state.highScore); } catch (_) {}
  }
}
```

### resetGame()

Delegates to `startRun()` after clearing obstacles:

```js
function resetGame() {
  state.obstacles = [];
  startRun();
}
```

---

## Score Persistence (localStorage)

Key: `frozenKiro_hi`

### Read on init

```js
function loadHighScore() {
  try {
    const stored = localStorage.getItem('frozenKiro_hi');
    state.highScore = stored ? parseInt(stored, 10) : 0;
  } catch (_) {
    state.highScore = 0;
  }
}
```

### Write on game over

Only write when the current score beats the stored high score (see `triggerGameOver()` above). Always wrap in `try/catch` — `localStorage` may be unavailable in private browsing or when storage quota is exceeded.

---

## Scoring

Score is time-based and refresh-rate independent. Accumulate elapsed seconds and derive score from that:

```js
// inside update(dt):
state.scoreAccum += dt;
const newScore = Math.floor(state.scoreAccum * (1000 / CONFIG.scoring.scoreInterval));
if (newScore !== state.score) {
  state.score = newScore;
  state.scoreDisplay = formatScore(state.highScore, state.score);
  state.speed = computeSpeed(state.score);
}
```

`scoreInterval` is in ms — dividing 1000 by it gives points per second (e.g. `scoreInterval: 6` → ~167 pts/s at 60fps equivalent).

---

## Difficulty Progression

### Speed Scaling

Speed increases in discrete steps every `speedScoreInterval` points:

```js
function computeSpeed(score) {
  const steps  = Math.floor(score / CONFIG.speed.speedScoreInterval);
  const scaled = CONFIG.speed.obstacleSpeed * (1 + steps * CONFIG.speed.speedStepPercent);
  return Math.min(scaled, CONFIG.speed.obstacleSpeed * CONFIG.speed.maxSpeedMultiplier);
}
```

Speed table with default config values:

| Score | Speed (px/s) |
|-------|-------------|
| 0     | 120         |
| 500   | 126         |
| 1000  | 132         |
| 2500  | 150         |
| 5000  | 180         |
| 10000 | 240         |
| 25000 | 360 (cap)   |

### Obstacle Spawn Variation

Spawn timing is randomised within `[spawnMinMs, spawnMaxMs]`:

```js
function scheduleNextSpawn() {
  const { spawnMinMs, spawnMaxMs } = CONFIG.obstacles;
  state.nextSpawnIn = spawnMinMs + Math.random() * (spawnMaxMs - spawnMinMs);
  state.spawnTimer  = 0;
}
```

Advance timer and spawn inside `update(dt)`:

```js
state.spawnTimer += dt * 1000;
if (state.spawnTimer >= state.nextSpawnIn) {
  // enforce minimum spacing
  const last = state.obstacles.at(-1);
  if (!last || last.x <= canvas.width - CONFIG.obstacles.spawnSpacing) {
    spawnObstacle();
  }
  scheduleNextSpawn();
}
```

The minimum spacing check (`spawnSpacing: 350px`) prevents impossible back-to-back clusters regardless of the random timer.

### Size Variation

Each obstacle is randomly assigned `small` or `large` at spawn. Both variants use canvas-relative dimensions from `CONFIG.obstacles.variants`:

| Variant | Width (% canvas) | Height (% canvas) |
|---------|-----------------|-------------------|
| small   | 6%              | 8%                |
| large   | 9%              | 13%               |

Mixing variants creates visual rhythm and varying jump timing challenges.

---

## Off-Screen Cleanup

Remove obstacles that have fully exited the left edge after each update step:

```js
state.obstacles = state.obstacles.filter(o => o.x + o.width > 0);
```

This keeps the active obstacle array small (typically 1–3 entries).
