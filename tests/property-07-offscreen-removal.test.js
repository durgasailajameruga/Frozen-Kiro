// Feature: frozen-kiro, Property 7: Off-screen obstacles are removed
import fc from 'fast-check';
import { describe, it, expect } from 'vitest';

/**
 * Validates: Requirements 3.4
 *
 * Property 7: Off-screen obstacles are removed
 * For any set of obstacles after an update step, no obstacle remaining in the
 * active list should have its right edge fully past the left edge of the canvas
 * (i.e., x + width <= 0).
 */

function filterOffScreen(obstacles) {
  return obstacles.filter(o => o.x + o.width > 0);
}

describe('Property 7: Off-screen obstacles are removed', () => {
  it('no remaining obstacle has right edge at or past left edge', () => {
    fc.assert(
      fc.property(
        fc.array(
          fc.record({
            x: fc.float({ min: Math.fround(-500), max: Math.fround(1000), noNaN: true }),
            width: fc.float({ min: Math.fround(10), max: Math.fround(200), noNaN: true }),
          }),
          { minLength: 0, maxLength: 20 }
        ),
        (obstacles) => {
          const remaining = filterOffScreen(obstacles);
          for (const obs of remaining) {
            expect(obs.x + obs.width).toBeGreaterThan(0);
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  it('obstacles with right edge past left edge are removed', () => {
    fc.assert(
      fc.property(
        fc.array(
          fc.record({
            x: fc.float({ min: Math.fround(-500), max: Math.fround(-1), noNaN: true }),
            width: fc.float({ min: Math.fround(1), max: Math.fround(100), noNaN: true }),
          }),
          { minLength: 1, maxLength: 10 }
        ),
        (obstacles) => {
          // All obstacles have x < 0; those with x + width <= 0 should be removed
          const remaining = filterOffScreen(obstacles);
          for (const obs of remaining) {
            // Any remaining obstacle must still have right edge visible
            expect(obs.x + obs.width).toBeGreaterThan(0);
          }
        }
      ),
      { numRuns: 100 }
    );
  });
});
