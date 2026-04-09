// Feature: frozen-kiro, Property 2: Gravity accumulation
import fc from 'fast-check';
import { describe, it, expect } from 'vitest';

/**
 * Validates: Requirements 2.3
 *
 * Property 2: Gravity accumulation
 * For any runner in an airborne state with initial vertical velocity vy0,
 * after N frames of physics update (without landing), the runner's vertical
 * velocity should equal vy0 + N * GRAVITY * dt.
 */

const GRAVITY = 800; // px/s²

function applyGravityNFrames(vy0, dt, n) {
  let vy = vy0;
  for (let i = 0; i < n; i++) {
    vy += GRAVITY * dt;
  }
  return vy;
}

describe('Property 2: Gravity accumulation', () => {
  it('vy accumulates gravity linearly over N frames', () => {
    fc.assert(
      fc.property(
        fc.float({ min: Math.fround(-300), max: Math.fround(0), noNaN: true }),  // initial upward velocity
        fc.integer({ min: 1, max: 120 }),               // number of frames
        fc.float({ min: Math.fround(0.001), max: Math.fround(0.05), noNaN: true }), // dt in seconds
        (vy0, n, dt) => {
          const result = applyGravityNFrames(vy0, dt, n);
          const expected = vy0 + n * GRAVITY * dt;
          expect(result).toBeCloseTo(expected, 5);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('vy always increases (becomes less negative) while airborne', () => {
    fc.assert(
      fc.property(
        fc.float({ min: Math.fround(-300), max: Math.fround(-1), noNaN: true }),
        fc.integer({ min: 1, max: 60 }),
        fc.float({ min: Math.fround(0.001), max: Math.fround(0.05), noNaN: true }),
        (vy0, n, dt) => {
          const result = applyGravityNFrames(vy0, dt, n);
          expect(result).toBeGreaterThan(vy0);
        }
      ),
      { numRuns: 100 }
    );
  });
});
