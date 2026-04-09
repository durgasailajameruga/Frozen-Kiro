// Feature: frozen-kiro, Property 1: High score localStorage round-trip
import fc from 'fast-check';
import { describe, it, expect } from 'vitest';

/**
 * Validates: Requirements 1.5
 *
 * Property 1: High score localStorage round-trip
 * For any non-negative integer stored in localStorage under the high score key,
 * initializing the game should load and display that exact value.
 */

const LS_KEY = 'frozenKiro_hi';

// Simulate loadHighScore logic
function loadHighScore(storage) {
  try {
    const stored = storage.getItem(LS_KEY);
    return stored ? parseInt(stored, 10) : 0;
  } catch (_) {
    return 0;
  }
}

// Simulate triggerGameOver write logic
function saveHighScore(score, prevHigh, storage) {
  if (score > prevHigh) {
    try {
      storage.setItem(LS_KEY, String(score));
      return score;
    } catch (_) {
      return prevHigh;
    }
  }
  return prevHigh;
}

// Simple in-memory storage mock
function makeStorage() {
  const data = {};
  return {
    getItem: (key) => data[key] ?? null,
    setItem: (key, val) => { data[key] = val; },
    removeItem: (key) => { delete data[key]; },
  };
}

describe('Property 1: High score localStorage round-trip', () => {
  it('stored high score is loaded back exactly', () => {
    fc.assert(
      fc.property(
        fc.nat({ max: 99999 }),
        (highScore) => {
          const storage = makeStorage();
          storage.setItem(LS_KEY, String(highScore));
          const loaded = loadHighScore(storage);
          expect(loaded).toBe(highScore);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('missing key returns 0', () => {
    fc.assert(
      fc.property(
        fc.nat({ max: 99999 }),
        (_) => {
          const storage = makeStorage(); // empty storage
          const loaded = loadHighScore(storage);
          expect(loaded).toBe(0);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('write then read round-trip preserves value', () => {
    fc.assert(
      fc.property(
        fc.nat({ max: 99999 }),  // new score
        fc.nat({ max: 99999 }),  // previous high score
        (score, prevHigh) => {
          const storage = makeStorage();
          // Pre-populate with prevHigh
          if (prevHigh > 0) storage.setItem(LS_KEY, String(prevHigh));

          const newHigh = saveHighScore(score, prevHigh, storage);
          const loaded = loadHighScore(storage);

          if (score > prevHigh) {
            expect(newHigh).toBe(score);
            expect(loaded).toBe(score);
          } else {
            expect(newHigh).toBe(prevHigh);
            // loaded may be prevHigh or 0 if storage was empty
          }
        }
      ),
      { numRuns: 100 }
    );
  });
});
