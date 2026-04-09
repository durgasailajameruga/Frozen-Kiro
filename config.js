// config.js — all tunable constants for Frozen Kiro
// Values are loaded from game-config.json; this module re-exports them
// as a single CONFIG object with a stable shape for the rest of the game.

const raw = await fetch('./game-config.json').then(r => r.json());

export const CONFIG = {
  // Physics (px/s and px/s² — integrated with dt each frame)
  physics: {
    gravity:               raw.physics.gravity,               // 1200 px/s²
    jumpVelocity:          raw.physics.jumpVelocity,          // -550 px/s
    fallGravityMultiplier: raw.physics.fallGravityMultiplier, // 0.18 — heavily reduced gravity on descent for maximum hang time
  },

  // Speed / difficulty progression
  speed: {
    obstacleSpeed:      raw.speed.obstacleSpeed,      // 160 px/s base
    maxSpeedMultiplier: raw.speed.maxSpeedMultiplier, // cap at 3× = 480 px/s
    speedStepPercent:   raw.speed.speedStepPercent,   // 8% per interval
    speedScoreInterval: raw.speed.speedScoreInterval, // every 300 pts
  },

  // Obstacle spawning and sizing
  obstacles: {
    spawnMinMs:    raw.obstacles.spawnMinMs ?? 900,   // fallback for legacy
    spawnMaxMs:    raw.obstacles.spawnMaxMs ?? 2200,  // fallback for legacy
    spawnMinPx:    raw.obstacles.spawnMinPx,          // 500 px min gap between obstacles
    spawnMaxPx:    raw.obstacles.spawnMaxPx,          // 1100 px max gap
    spawnSpacing:  raw.obstacles.spawnSpacing,        // 350 px hard minimum
    variants:      raw.obstacles.variants,
  },

  // Scoring
  scoring: {
    scoreInterval: raw.scoring.scoreInterval,  // ms per point (6 → ~167 pts/s)
  },

  // Layout ratios (fractions of canvas dimensions)
  layout: {
    groundRatio:       raw.layout.groundRatio,       // 0.85
    runnerHeightRatio: raw.layout.runnerHeightRatio, // 0.12
    runnerXRatio:      raw.layout.runnerXRatio,      // 0.15
  },

  // Runner sprite / animation (from ghosty-sprites.md)
  runner: {
    frameWidth:       32,
    frameHeight:      32,
    animationFrameMs: 100,
    hitboxPadding: {
      top:    0.20,
      right:  0.15,
      bottom: 0.05,
      left:   0.15,
    },
  },
};
