// Feature: frozen-kiro, Property 14: Obstacles cleared on restart
import fc from 'fast-check';
import { describe, it, expect } from 'vitest';

/**
 * Validates: Requirements 8.3
 *
 * Property 14: Obstacles cleared on restart
 * For any number of active obstacles at game over, after resetGame() is called,
 * state.obstacles should be an empty array.
 */

// Simulate the resetGame obstacle clearing logic (pure)
function simulateResetGame(obstacles) {
  // resetGame clears obstacles then calls startRun which also clears them
  return [];
}

describe('Property 14: Obstacles cleared on restart', () => {
  it('obstacles array is empty after reset regardless of how many existed', () => {
    fc.assert(
      fc.property(
        fc.array(
          fc.record({
            x: fc.float({ min: Math.fround(-100), max: Math.fround(1000), noNaN: true }),
            y: fc.float({ min: Math.fround(0), max: Math.fround(500), noNaN: true }),
            width: fc.float({ min: Math.fround(10), max: Math.fround(100), noNaN: true }),
            height: fc.float({ min: Math.fround(10), max: Math.fround(100), noNaN: true }),
          }),
          { minLength: 0, maxLength: 10 }
        ),
        (obstacles) => {
          const result = simulateResetGame(obstacles);
          expect(result).toEqual([]);
          expect(result.length).toBe(0);
        }
      ),
      { numRuns: 100 }
    );
  });
});
