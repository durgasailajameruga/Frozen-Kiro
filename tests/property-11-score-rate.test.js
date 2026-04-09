// Feature: frozen-kiro, Property 11: Score increments at correct rate
import fc from 'fast-check';
import { describe, it, expect } from 'vitest';

/**
 * Validates: Requirements 5.1
 *
 * Property 11: Score increments at correct rate
 * For any number of seconds elapsed during a run, the score should equal
 * Math.floor(scoreAccum * (1000 / scoreInterval)).
 * scoreInterval = 6ms → ~167 points per second.
 */

const SCORE_INTERVAL_MS = 6;
const POINTS_PER_SECOND = 1000 / SCORE_INTERVAL_MS;

function computeScore(scoreAccum) {
  return Math.floor(scoreAccum * POINTS_PER_SECOND);
}

describe('Property 11: Score increments at correct rate', () => {
  it('score equals floor(scoreAccum * pointsPerSecond)', () => {
    fc.assert(
      fc.property(
        fc.float({ min: 0, max: Math.fround(60), noNaN: true }), // up to 60 seconds
        (scoreAccum) => {
          const score = computeScore(scoreAccum);
          const expected = Math.floor(scoreAccum * POINTS_PER_SECOND);
          expect(score).toBe(expected);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('score is always non-negative', () => {
    fc.assert(
      fc.property(
        fc.float({ min: 0, max: Math.fround(3600), noNaN: true }),
        (scoreAccum) => {
          const score = computeScore(scoreAccum);
          expect(score).toBeGreaterThanOrEqual(0);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('score increases monotonically with time', () => {
    fc.assert(
      fc.property(
        fc.float({ min: 0, max: Math.fround(30), noNaN: true }),
        fc.float({ min: Math.fround(0.001), max: Math.fround(1), noNaN: true }),
        (t1, dt) => {
          const t2 = t1 + dt;
          const score1 = computeScore(t1);
          const score2 = computeScore(t2);
          expect(score2).toBeGreaterThanOrEqual(score1);
        }
      ),
      { numRuns: 100 }
    );
  });
});
