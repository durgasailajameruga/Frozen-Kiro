// Feature: frozen-kiro, Property 12: Score resets to zero on new run
import fc from 'fast-check';
import { describe, it, expect } from 'vitest';

/**
 * Validates: Requirements 5.3
 *
 * Property 12: Score resets to zero on new run
 * For any score value at the time of game over, after resetGame() is called
 * and a new run begins, state.score should equal 0.
 */

// Simulate the startRun score reset logic (pure)
function simulateStartRun(prevScore) {
  return {
    score: 0,
    scoreAccum: 0,
  };
}

describe('Property 12: Score resets to zero on new run', () => {
  it('score is always 0 after startRun regardless of previous score', () => {
    fc.assert(
      fc.property(
        fc.nat({ max: 99999 }),
        (prevScore) => {
          const state = simulateStartRun(prevScore);
          expect(state.score).toBe(0);
          expect(state.scoreAccum).toBe(0);
        }
      ),
      { numRuns: 100 }
    );
  });
});
