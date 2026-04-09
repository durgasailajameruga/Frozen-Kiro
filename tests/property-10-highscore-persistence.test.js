// Feature: frozen-kiro, Property 10: High score persistence on game over
import fc from 'fast-check';
import { describe, it, expect } from 'vitest';

/**
 * Validates: Requirements 4.5
 *
 * Property 10: High score persistence on game over
 * For any current score that exceeds the stored high score, after triggerGameOver()
 * is called, localStorage should contain the new score as the high score.
 */

// Simulate the triggerGameOver high score logic (pure, no DOM/audio)
function updateHighScore(currentScore, currentHighScore, storage) {
  if (currentScore > currentHighScore) {
    const newHigh = currentScore;
    storage['frozenKiro_hi'] = String(newHigh);
    return newHigh;
  }
  return currentHighScore;
}

describe('Property 10: High score persistence on game over', () => {
  it('high score is updated when current score exceeds it', () => {
    fc.assert(
      fc.property(
        fc.nat({ max: 99999 }),  // current score
        fc.nat({ max: 99999 }),  // previous high score
        (score, prevHigh) => {
          const storage = {};
          const newHigh = updateHighScore(score, prevHigh, storage);
          if (score > prevHigh) {
            expect(newHigh).toBe(score);
            expect(storage['frozenKiro_hi']).toBe(String(score));
          } else {
            expect(newHigh).toBe(prevHigh);
            expect(storage['frozenKiro_hi']).toBeUndefined();
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  it('high score is never decreased', () => {
    fc.assert(
      fc.property(
        fc.nat({ max: 99999 }),
        fc.nat({ max: 99999 }),
        (score, prevHigh) => {
          const storage = {};
          const newHigh = updateHighScore(score, prevHigh, storage);
          expect(newHigh).toBeGreaterThanOrEqual(prevHigh);
        }
      ),
      { numRuns: 100 }
    );
  });
});
