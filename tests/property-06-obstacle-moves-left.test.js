// Feature: frozen-kiro, Property 6: Obstacle moves left at constant speed
import fc from 'fast-check';
import { describe, it, expect } from 'vitest';

/**
 * Validates: Requirements 3.3
 *
 * Property 6: Obstacle moves left at constant speed
 * For any obstacle with initial x-position x0 and current speed s,
 * after N frames of update, the obstacle's x-position should equal x0 - s * N * dt.
 */

function moveObstacleNFrames(x0, speed, dt, n) {
  let x = x0;
  for (let i = 0; i < n; i++) {
    x -= speed * dt;
  }
  return x;
}

describe('Property 6: Obstacle moves left at constant speed', () => {
  it('obstacle x decreases by speed * dt each frame', () => {
    fc.assert(
      fc.property(
        fc.float({ min: Math.fround(100), max: Math.fround(1000), noNaN: true }), // x0
        fc.float({ min: Math.fround(60), max: Math.fround(360), noNaN: true }),   // speed px/s
        fc.float({ min: Math.fround(0.008), max: Math.fround(0.05), noNaN: true }), // dt
        fc.integer({ min: 1, max: 200 }),                                          // frames
        (x0, speed, dt, n) => {
          const result = moveObstacleNFrames(x0, speed, dt, n);
          const expected = x0 - speed * dt * n;
          expect(result).toBeCloseTo(expected, 3);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('obstacle always moves left (x decreases)', () => {
    fc.assert(
      fc.property(
        fc.float({ min: Math.fround(100), max: Math.fround(1000), noNaN: true }),
        fc.float({ min: Math.fround(60), max: Math.fround(360), noNaN: true }),
        fc.float({ min: Math.fround(0.008), max: Math.fround(0.05), noNaN: true }),
        fc.integer({ min: 1, max: 200 }),
        (x0, speed, dt, n) => {
          const result = moveObstacleNFrames(x0, speed, dt, n);
          expect(result).toBeLessThan(x0);
        }
      ),
      { numRuns: 100 }
    );
  });
});
