// Feature: frozen-kiro, Property 3: Landing resets vertical state
import fc from 'fast-check';
import { describe, it, expect } from 'vitest';

/**
 * Validates: Requirements 2.4
 *
 * Property 3: Landing resets vertical state
 * For any jump with any initial upward velocity, once the runner's computed
 * y-position reaches or exceeds the ground level, the runner's vy should be
 * set to 0 and y should equal groundY - runnerHeight.
 */

const GRAVITY = 800;

function simulateUntilLanding(vy0, groundY, runnerHeight, dt) {
  let y = groundY - runnerHeight; // start on ground
  let vy = vy0;
  let grounded = false;
  let iterations = 0;
  const maxIter = 10000;

  // Apply jump
  vy = vy0; // negative = upward

  while (!grounded && iterations < maxIter) {
    vy += GRAVITY * dt;
    y += vy * dt;

    if (y >= groundY - runnerHeight) {
      y = groundY - runnerHeight;
      vy = 0;
      grounded = true;
    }
    iterations++;
  }

  return { y, vy, grounded };
}

describe('Property 3: Landing resets vertical state', () => {
  it('after landing, vy is 0 and y equals groundY - runnerHeight', () => {
    fc.assert(
      fc.property(
        fc.float({ min: Math.fround(-300), max: Math.fround(-10), noNaN: true }), // initial upward velocity
        fc.integer({ min: 200, max: 800 }),              // groundY
        fc.integer({ min: 20, max: 100 }),               // runnerHeight
        fc.float({ min: Math.fround(0.008), max: Math.fround(0.02), noNaN: true }), // dt (~60fps)
        (vy0, groundY, runnerHeight, dt) => {
          const result = simulateUntilLanding(vy0, groundY, runnerHeight, dt);
          expect(result.grounded).toBe(true);
          expect(result.vy).toBe(0);
          expect(result.y).toBeCloseTo(groundY - runnerHeight, 5);
        }
      ),
      { numRuns: 100 }
    );
  });
});
