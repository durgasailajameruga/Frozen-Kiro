// Feature: frozen-kiro, Property 13: Score display format
import fc from 'fast-check';
import { describe, it, expect } from 'vitest';

/**
 * Validates: Requirements 5.4
 *
 * Property 13: Score display format
 * For any high score hi and current score s, formatScore(hi, s) should return
 * a string matching "HI " + zeroPad(hi) + "  " + zeroPad(s).
 */

function zeroPad(n, digits = 5) {
  return String(n).padStart(digits, '0');
}

function formatScore(hi, score) {
  return `HI ${zeroPad(hi)}  ${zeroPad(score)}`;
}

describe('Property 13: Score display format', () => {
  it('formatScore returns correct format for any hi and score', () => {
    fc.assert(
      fc.property(
        fc.nat({ max: 99999 }),
        fc.nat({ max: 99999 }),
        (hi, score) => {
          const result = formatScore(hi, score);
          const expected = `HI ${zeroPad(hi)}  ${zeroPad(score)}`;
          expect(result).toBe(expected);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('score values are always zero-padded to 5 digits', () => {
    fc.assert(
      fc.property(
        fc.nat({ max: 99999 }),
        fc.nat({ max: 99999 }),
        (hi, score) => {
          const result = formatScore(hi, score);
          // Extract the two numeric parts
          const match = result.match(/^HI (\d{5})  (\d{5})$/);
          expect(match).not.toBeNull();
          expect(parseInt(match[1], 10)).toBe(hi);
          expect(parseInt(match[2], 10)).toBe(score);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('format always starts with "HI " prefix', () => {
    fc.assert(
      fc.property(
        fc.nat({ max: 99999 }),
        fc.nat({ max: 99999 }),
        (hi, score) => {
          const result = formatScore(hi, score);
          expect(result.startsWith('HI ')).toBe(true);
        }
      ),
      { numRuns: 100 }
    );
  });
});
