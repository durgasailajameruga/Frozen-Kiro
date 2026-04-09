# Implementation Plan: Frozen Kiro

## Overview

Implement a two-file browser-based endless runner game (`config.js` + `index.html`) using the HTML5 Canvas API, `requestAnimationFrame`, and vanilla JavaScript. No build step or dependencies beyond a Google Fonts import.

## Tasks

- [x] 1. Create `config.js` with all tunable constants
  - Export a single `CONFIG` object containing all physics, speed, scoring, obstacle, and layout constants
  - Include: `gravity`, `jumpVelocity`, `baseSpeed`, `maxSpeedMultiplier`, `speedStepPercent`, `speedScoreInterval`, `scoreInterval`, `spawnMinMs`, `spawnMaxMs`, `groundRatio`, `runnerHeightRatio`, `runnerXRatio`
  - _Requirements: 3.1, 3.5, 5.1, 9.2_

- [x] 2. Scaffold `index.html` with canvas, font import, and module script
  - Create `index.html` with a full-viewport `<canvas>` element, black CSS background, Google Fonts import for "Press Start 2P", and a `<script type="module">` block that imports `CONFIG` from `./config.js`
  - Set up the `state` object with all mutable fields: `phase`, `score`, `highScore`, `frameCount`, `nextObstacleIn`, `obstacles`, `runner`, `speed`
  - _Requirements: 1.1, 6.1, 6.4, 9.1_

- [x] 3. Implement `init()`, `handleResize()`, and asset loading
  - [x] 3.1 Implement `handleResize()` to set `canvas.width`/`canvas.height` to `window.innerWidth`/`window.innerHeight` and recompute `groundY`, runner dimensions, and runner x-position from `CONFIG` ratios; attach to `window` `resize` event
  - [x] 3.2 Implement `init()` to load `ghosty.png` (with `onerror` fallback to a filled rectangle), instantiate the `audio` object for `jump.wav` and `game_over.wav`, read `highScore` from `localStorage` (wrapped in `try/catch`, defaulting to 0), call `handleResize()`, attach keyboard and touch event listeners, and draw the idle screen
  - _Requirements: 1.2, 1.3, 1.5, 6.5, 7.3, 9.1, 9.2_

  - [x] 3.3 Write property test for canvas resize (Property 16)
    - **Property 16: Canvas fills viewport on resize**
    - **Validates: Requirements 9.2**

- [x] 4. Implement pure utility functions
  - [x] 4.1 Implement `computeSpeed(score)` — returns `Math.min(BASE_SPEED * (1 + Math.floor(score / speedScoreInterval) * speedStepPercent), BASE_SPEED * maxSpeedMultiplier)`
  - [x] 4.2 Implement `formatScore(hi, score)` — returns `"HI " + zeroPad(hi, 5) + "  " + zeroPad(score, 5)` where `zeroPad` left-pads with zeros to 5 digits

  - [x] 4.3 Write property test for speed scaling formula (Property 8)
    - **Property 8: Speed scaling formula**
    - **Validates: Requirements 3.5**

  - [x] 4.4 Write property test for score display format (Property 13)
    - **Property 13: Score display format**
    - **Validates: Requirements 5.4**

- [x] 5. Implement physics and jump mechanics
  - [x] 5.1 Implement `jump()` — apply `CONFIG.jumpVelocity` to `state.runner.vy` only when `state.runner.grounded` is `true`, set `grounded` to `false`, and call `audio.play(audio.jump)`
  - [x] 5.2 Implement the physics update step inside `update()` — apply gravity to `vy` each frame, advance `runner.y` by `vy`, and clamp to `groundY` (setting `vy = 0` and `grounded = true` on landing)
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6_

  - [x] 5.3 Write property test for gravity accumulation (Property 2)
    - **Property 2: Gravity accumulation**
    - **Validates: Requirements 2.3**

  - [x] 5.4 Write property test for landing resets vertical state (Property 3)
    - **Property 3: Landing resets vertical state**
    - **Validates: Requirements 2.4**

  - [x] 5.5 Write property test for jump input idempotence while airborne (Property 4)
    - **Property 4: Jump input idempotence while airborne**
    - **Validates: Requirements 2.5**

- [x] 6. Implement obstacle spawning, movement, and removal
  - [x] 6.1 Implement `spawnObstacle()` — push a new obstacle object (`x`, `y`, `width`, `height`, `variant`) onto `state.obstacles` with `x = canvas.width`, `y = groundY - height`, and schedule `state.nextObstacleIn` using a random interval in `[spawnMinMs, spawnMaxMs]`
  - [x] 6.2 Implement the obstacle update step inside `update()` — move each obstacle left by `state.speed` per frame, then filter out any obstacle where `x + width < 0`
  - _Requirements: 3.1, 3.2, 3.3, 3.4_

  - [x] 6.3 Write property test for spawn interval bounds (Property 5)
    - **Property 5: Spawn interval is within bounds**
    - **Validates: Requirements 3.1**

  - [x] 6.4 Write property test for obstacle moves left at constant speed (Property 6)
    - **Property 6: Obstacle moves left at constant speed**
    - **Validates: Requirements 3.3**

  - [x] 6.5 Write property test for off-screen obstacle removal (Property 7)
    - **Property 7: Off-screen obstacles are removed**
    - **Validates: Requirements 3.4**

- [x] 7. Implement collision detection
  - [x] 7.1 Implement `checkCollision()` — AABB test between `state.runner` hitbox and each obstacle in `state.obstacles`; return `true` on first overlap, `false` otherwise
  - _Requirements: 4.1_

  - [x] 7.2 Write property test for collision detection correctness (Property 9)
    - **Property 9: Collision detection correctness**
    - **Validates: Requirements 4.1**

- [x] 8. Implement scoring
  - [x] 8.1 Implement the score update step inside `update()` — increment `state.score` by 1 when `state.frameCount % CONFIG.scoreInterval === 0`; update `state.speed` via `computeSpeed(state.score)`
  - _Requirements: 3.5, 5.1_

  - [x] 8.2 Write property test for score increments at correct rate (Property 11)
    - **Property 11: Score increments at correct rate**
    - **Validates: Requirements 5.1**

- [x] 9. Checkpoint — Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 10. Implement game state transitions: `startRun()`, `triggerGameOver()`, `resetGame()`
  - [x] 10.1 Implement `startRun()` — set `state.phase = 'running'`, reset `score`, `frameCount`, `obstacles`, `runner` position/velocity, set `state.speed = CONFIG.baseSpeed`, schedule first obstacle spawn, and call `requestAnimationFrame(gameLoop)`
  - [x] 10.2 Implement `triggerGameOver()` — set `state.phase = 'gameover'`, play `game_over.wav`, update `state.highScore` if `state.score > state.highScore`, persist to `localStorage` (wrapped in `try/catch`)
  - [x] 10.3 Implement `resetGame()` — clear `state.obstacles`, reset `state.score` to 0 and `state.frameCount` to 0, reset runner to grounded position, then call `startRun()`
  - _Requirements: 4.2, 4.3, 4.5, 5.3, 8.1, 8.3, 8.4_

  - [x] 10.4 Write property test for high score persistence on game over (Property 10)
    - **Property 10: High score persistence on game over**
    - **Validates: Requirements 4.5**

  - [x] 10.5 Write property test for score resets to zero on new run (Property 12)
    - **Property 12: Score resets to zero on new run**
    - **Validates: Requirements 5.3**

  - [x] 10.6 Write property test for obstacles cleared on restart (Property 14)
    - **Property 14: Obstacles cleared on restart**
    - **Validates: Requirements 8.3**

  - [x] 10.7 Write property test for high score retained across restart (Property 15)
    - **Property 15: High score retained across restart**
    - **Validates: Requirements 8.4**

- [x] 11. Implement `localStorage` high score round-trip
  - Ensure `init()` reads the high score from `localStorage` and `triggerGameOver()` writes it; both wrapped in `try/catch`
  - _Requirements: 1.5, 4.5_

  - [x] 11.1 Write property test for high score localStorage round-trip (Property 1)
    - **Property 1: High score localStorage round-trip**
    - **Validates: Requirements 1.5**

- [x] 12. Implement `render()` and all draw routines
  - [x] 12.1 Implement `render()` — clear canvas with `#000000`, draw ground strip (snowy/icy appearance), draw runner sprite (or fallback rectangle), draw each obstacle as a glowing blue ice crystal (canvas `shadowBlur` + `shadowColor`), draw score HUD in top-right corner using "Press Start 2P" font
  - [x] 12.2 Implement idle overlay — draw "Press Space or Tap to Start" prompt centered on canvas
  - [x] 12.3 Implement game over overlay — draw "Game Over" and "Press Space or Tap to Restart" prompt centered on canvas
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 4.4, 5.2, 5.4, 6.1, 6.2, 6.3, 6.4, 6.5_

- [x] 13. Implement `gameLoop()` and wire everything together
  - [x] 13.1 Implement `gameLoop(timestamp)` — increment `state.frameCount`, call `update()` then `render()`, and call `requestAnimationFrame(gameLoop)` only when `state.phase === 'running'`
  - [x] 13.2 Wire input handlers — Space keydown and canvas `touchstart` events dispatch to `jump()` when running, `startRun()` when idle, and `resetGame()` when gameover
  - [x] 13.3 Call `init()` at the bottom of the module script to start the game
  - _Requirements: 1.4, 2.1, 2.2, 4.3, 8.1, 8.2_

- [x] 14. Final checkpoint — Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for a faster MVP
- Property tests use [fast-check](https://github.com/dubzzz/fast-check) with a minimum of 100 iterations each
- Each property test file should include the tag comment: `// Feature: frozen-kiro, Property N: <property_text>`
- All constants must be read from `CONFIG` — no magic numbers in `index.html`
- The `audio.play()` wrapper silently swallows autoplay errors via `.catch(() => {})`
