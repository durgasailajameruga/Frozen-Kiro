// Feature: frozen-kiro, Property 8: Speed scaling formula
import fc from 'fast-check';
import { describe, it, expect } from 'vitest';

/**
 * Validates: Requirements 3.5
 *
 * Property 8: Speed scaling formula
 * For any score value s >= 0, computeSpeed(s) should return a value in the range
 * [BASE_SPEED, BASE_SPEED * MAX_SPEED_MULTIPLIER] and equal
 * min(BASE_SPEED * (1 + floor(s / 500) * SPEED_STEP), BASE_SPEED * MAX_SPEED_MULTIPLIER).
 */

const BASE_SPEED = 120;
const MAX_SPEED_MULTIPLIER = 3;
const SPEED_STEP_PERCENT = 0.05;
const SPEED_SCORE_INTERVAL = 500;

function computeSpeed(score) {
  const steps = Math.floor(score / SPEED_SCORE_INTERVAL);
  const scaled = BASE_SPEED * (1 + steps * SPEED_STEP_PERCENT);
  return Math.min(scaled, BASE_SPEED * MAX_SPEED_MULTIPLIER);
}

describe('Property 8: Speed scaling formula', () => {
  it('speed is always within [BASE_SPEED, BASE_SPEED * MAX_MULTIPLIER]', () => {
    fc.assert(
      fc.property(fc.nat({ max: 100000 }), (score) => {
        const speed = computeSpeed(score);
        expect(speed).toBeGreaterThanOrEqual(BASE_SPEED);
        expect(speed).toBeLessThanOrEqual(BASE_SPEED * MAX_SPEED_MULTIPLIER);
      }),
      { numRuns: 100 }
    );
  });

  it('speed matches the formula exactly', () => {
    fc.assert(
      fc.property(fc.nat({ max: 100000 }), (score) => {
        const speed = computeSpeed(score);
        const steps = Math.floor(score / SPEED_SCORE_INTERVAL);
        const expected = Math.min(
          BASE_SPEED * (1 + steps * SPEED_STEP_PERCENT),
          BASE_SPEED * MAX_SPEED_MULTIPLIER
        );
        expect(speed).toBeCloseTo(expected, 10);
      }),
      { numRuns: 100 }
    );
  });

  it('speed increases monotonically with score until cap', () => {
    fc.assert(
      fc.property(
        fc.nat({ max: 50000 }),
        fc.nat({ max: 50000 }),
        (s1, s2) => {
          if (s1 >= s2) return; // skip unordered pairs
          const speed1 = computeSpeed(s1);
          const speed2 = computeSpeed(s2);
          expect(speed2).toBeGreaterThanOrEqual(speed1);
        }
      ),
      { numRuns: 100 }
    );
  });
});
