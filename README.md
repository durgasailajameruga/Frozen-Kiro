# Frozen Kiro

A browser-based endless runner game with a retro dark aesthetic. Control a olaf character sprite running along a snowy ground, jumping over glowing ice crystal obstacles. Built with vanilla JavaScript and the HTML5 Canvas API — no build step, no dependencies.

---

## Requirements

- A modern browser (Chrome, Firefox, Edge, Safari)
- [Node.js](https://nodejs.org/) — only needed to run a local dev server and the test suite

---

## Installation

Clone or download the project, then install the dev dependencies (used for tests only):

```bash
npm install
```

---

## Running the Game

Because `config.js` loads `game-config.json` via `fetch`, the game must be served over HTTP — opening `index.html` directly as a file won't work.

Start a local server with:

```bash
npx serve .
```

Then open **http://localhost:3000** in your browser.

> Any static file server works. If you have Python installed you can also use:
> `python -m http.server 3000`

---

## How to Play

| Input | Action |
|-------|--------|
| `Space` | Jump (on desktop) |
| Tap the screen | Jump (on mobile/touch) |

- Press **Space or tap** on the start screen to begin a run
- Jump over the ice crystal obstacles
- Your score increases automatically over time
- The game gets faster as your score climbs
- On game over, press **Space or tap** to restart
- Your high score is saved in the browser between sessions

---

## Project Structure

```
index.html        — all game logic, rendering, audio, and input handling
config.js         — loads game-config.json and exports a CONFIG object
game-config.json  — all tunable gameplay constants (physics, speed, obstacles)
assets/
  ghosty.png      — player sprite sheet
  jump.wav        — jump sound effect
  game_over.wav   — game over sound effect
tests/            — property-based tests (fast-check + vitest)
```

---

## Running the Tests

```bash
npm test
```

This runs all 16 property-based tests covering physics, scoring, collision detection, and more.

---

## Extending the Game

All gameplay values live in `game-config.json` — no code changes needed for tuning:

| Key | What it controls |
|-----|-----------------|
| `physics.gravity` | How fast Ghosty falls |
| `physics.jumpVelocity` | How high Ghosty jumps |
| `physics.fallGravityMultiplier` | Hang time at peak (lower = floatier) |
| `speed.obstacleSpeed` | Starting obstacle speed (px/s) |
| `speed.speedStepPercent` | Speed increase per score interval |
| `speed.speedScoreInterval` | Score points between each speed step |
| `obstacles.spawnMinPx` / `spawnMaxPx` | Min/max pixel gap between obstacles |
| `obstacles.variants.small.scale` | Small crystal size (fraction of canvas height) |
| `obstacles.variants.large.scale` | Large crystal size (fraction of canvas height) |
| `layout.groundRatio` | How far down the ground sits (0–1) |
| `layout.runnerHeightRatio` | Ghosty's height relative to canvas height |

To add new features, all game logic is in the `<script type="module">` block inside `index.html`, organised into clearly named functions (`update`, `render`, `spawnObstacle`, `triggerGameOver`, etc.).

---

## Licence

See [LICENCE.md](LICENCE.md).
