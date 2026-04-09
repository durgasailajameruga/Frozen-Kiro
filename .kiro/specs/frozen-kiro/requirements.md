# Requirements Document

## Introduction

Frozen Kiro is a browser-based endless runner game with a retro aesthetic. The player controls a character (Ghosty) running along a snowy ground strip against a dark background, dodging procedurally generated glowing ice crystal obstacles. The game tracks a current score and a persistent high score, displayed in a retro pixel font. The game is implemented as a single HTML/CSS/JS file using the Canvas API, with audio feedback for jumps and game over events.

## Glossary

- **Game**: The Frozen Kiro browser application as a whole
- **Runner**: The player-controlled character sprite (ghosty.png) that moves along the ground
- **Obstacle**: A glowing ice crystal object that spawns from the right edge and moves left
- **Ground**: The snowy horizontal strip at the bottom of the canvas on which the Runner travels
- **Score**: The current numeric value that increases while the Runner is alive
- **High_Score**: The highest Score achieved across all sessions, persisted in localStorage
- **Canvas**: The HTML5 canvas element on which all game visuals are rendered
- **Game_Loop**: The requestAnimationFrame-driven update and render cycle
- **Jump**: The Runner's upward arc motion triggered by player input
- **Collision**: The overlap between the Runner's hitbox and an Obstacle's hitbox
- **Audio_Engine**: The component responsible for playing jump.wav and game_over.wav

---

## Requirements

### Requirement 1: Game Initialization

**User Story:** As a player, I want the game to load and display a start state in my browser, so that I know it is ready to play.

#### Acceptance Criteria

1. THE Game SHALL render the Canvas with a black background on page load.
2. THE Game SHALL display the Ground as a snowy horizontal strip at the bottom of the Canvas on page load.
3. THE Game SHALL display the Runner sprite on the Ground in its idle position on page load.
4. THE Game SHALL display a "Press Space or Tap to Start" prompt on the Canvas before the first run begins.
5. THE Game SHALL load the High_Score from localStorage on initialization and display it in the score panel.

---

### Requirement 2: Player Input and Jump Mechanics

**User Story:** As a player, I want to make the Runner jump by pressing Space or tapping the screen, so that I can avoid obstacles.

#### Acceptance Criteria

1. WHEN the player presses the Space key while the Runner is on the Ground, THE Game SHALL apply an upward velocity to the Runner.
2. WHEN the player taps the Canvas on a touch device while the Runner is on the Ground, THE Game SHALL apply an upward velocity to the Runner.
3. WHILE the Runner is airborne, THE Game SHALL apply downward gravitational acceleration each frame until the Runner returns to the Ground.
4. WHEN the Runner returns to the Ground after a Jump, THE Game SHALL stop vertical movement and reset the Runner's vertical position to the Ground level.
5. WHILE the Runner is airborne, THE Game SHALL ignore additional jump input.
6. WHEN a Jump is triggered, THE Audio_Engine SHALL play jump.wav.

---

### Requirement 3: Obstacle Generation and Movement

**User Story:** As a player, I want ice crystal obstacles to appear and move toward me, so that the game presents a continuous challenge.

#### Acceptance Criteria

1. WHEN a run is active, THE Game SHALL spawn Obstacles at the right edge of the Canvas at randomized intervals between 1.2 seconds and 2.8 seconds.
2. WHEN an Obstacle is spawned, THE Game SHALL render it as a glowing blue ice crystal sitting on top of the Ground strip.
3. WHILE a run is active, THE Game SHALL move each Obstacle leftward at a constant speed each frame.
4. WHEN an Obstacle moves beyond the left edge of the Canvas, THE Game SHALL remove it from the active Obstacle list.
5. WHILE a run is active, THE Game SHALL increase Obstacle movement speed by 5% for every 500 points of Score, up to a maximum speed of 3 times the initial speed.

---

### Requirement 4: Collision Detection and Game Over

**User Story:** As a player, I want the game to end when I hit an obstacle, so that my run has meaningful consequences.

#### Acceptance Criteria

1. WHEN the Runner's hitbox overlaps an Obstacle's hitbox, THE Game SHALL transition to the Game Over state.
2. WHEN the Game Over state is entered, THE Audio_Engine SHALL play game_over.wav.
3. WHEN the Game Over state is entered, THE Game SHALL stop the Game_Loop and freeze all movement.
4. WHEN the Game Over state is entered, THE Game SHALL display a "Game Over" message and a "Press Space or Tap to Restart" prompt on the Canvas.
5. IF the current Score exceeds the High_Score at the time of Game Over, THEN THE Game SHALL update the High_Score to the current Score and persist it to localStorage.

---

### Requirement 5: Scoring

**User Story:** As a player, I want to see my score increase while I run and compare it to my best, so that I am motivated to improve.

#### Acceptance Criteria

1. WHILE a run is active, THE Game SHALL increment the Score by 1 for every 6 frames elapsed.
2. THE Game SHALL display the current Score and the High_Score in the top-right corner of the Canvas using a retro pixel font.
3. WHEN a new run begins, THE Game SHALL reset the current Score to 0.
4. THE Game SHALL format the score display as "HI [high score]  [current score]" matching the retro style shown in the reference UI.

---

### Requirement 6: Visual Style

**User Story:** As a player, I want the game to have a retro dark aesthetic with glowing ice visuals, so that the experience feels cohesive and atmospheric.

#### Acceptance Criteria

1. THE Canvas SHALL use a solid black (#000000) background for all game states.
2. THE Ground SHALL be rendered as a horizontal strip with a snowy/icy appearance at the bottom of the Canvas.
3. THE Obstacle SHALL be rendered with a glowing blue visual effect (e.g., CSS or Canvas shadow blur in a blue hue).
4. THE Game SHALL use a monospace pixel-style font (e.g., "Press Start 2P" or equivalent) for all on-screen text.
5. THE Runner SHALL be rendered using the ghosty.png sprite asset scaled to an appropriate size relative to the Canvas height.

---

### Requirement 7: Audio

**User Story:** As a player, I want audio feedback for key game events, so that the game feels responsive and alive.

#### Acceptance Criteria

1. WHEN a Jump occurs, THE Audio_Engine SHALL play the jump.wav audio file from the assets directory.
2. WHEN the Game Over state is entered, THE Audio_Engine SHALL play the game_over.wav audio file from the assets directory.
3. IF the browser has not received a user interaction before the first audio playback attempt, THEN THE Audio_Engine SHALL defer playback until the next user interaction to comply with browser autoplay policies.

---

### Requirement 8: Restart Flow

**User Story:** As a player, I want to restart the game quickly after a game over, so that I can try to beat my high score without reloading the page.

#### Acceptance Criteria

1. WHEN the player presses the Space key during the Game Over state, THE Game SHALL reset all game state and begin a new run.
2. WHEN the player taps the Canvas during the Game Over state on a touch device, THE Game SHALL reset all game state and begin a new run.
3. WHEN a new run begins, THE Game SHALL clear all active Obstacles from the Canvas.
4. WHEN a new run begins, THE Game SHALL retain and display the current High_Score.

---

### Requirement 9: Responsive Canvas

**User Story:** As a player, I want the game to fit my browser window, so that I can play comfortably on different screen sizes.

#### Acceptance Criteria

1. THE Canvas SHALL fill the full width and height of the browser viewport on load.
2. WHEN the browser window is resized, THE Game SHALL resize the Canvas to match the new viewport dimensions and reposition all game elements proportionally.
