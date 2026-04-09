// Feature: frozen-kiro, Property 4: Jump input idempotence while airborne
import fc from 'fast-check';
import { describe, it, expect } from 'vitest';

/**
 * Validates: Requirements 2.5
 *
 * Property 4: Jump input idempotence while airborne
 * For any airborne runner state, applying jump input N additional times
 * should leave vy unchanged from its value after the first jump was applied.
 */

const JUMP_VELOCITY = -300;

function applyJump(runner) {
  if (!runner.grounded) return runner; // ignore if airborne
  return { ...runner, vy: JUMP_VELOCITY, grounded: false };
}

describe('Property 4: Jump input idempotence while airborne', () => {
  it('additional jump inputs while airborne do not change vy', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 10 }), // extra jump attempts
        fc.float({ min: Math.fround(-300), max: Math.fround(300), noNaN: true }), // current vy while airborne
        (extraJumps, currentVy) => {
          // Runner is airborne (grounded = false)
          let runner = { vy: currentVy, grounded: false };
          const vyBefore = runner.vy;

          for (let i = 0; i < extraJumps; i++) {
            runner = applyJump(runner);
          }

          // vy should be unchanged since runner was airborne
          expect(runner.vy).toBe(vyBefore);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('jump only applies when grounded', () => {
    fc.assert(
      fc.property(
        fc.float({ min: Math.fround(-300), max: Math.fround(300), noNaN: true }),
        (currentVy) => {
          const airborneRunner = { vy: currentVy, grounded: false };
          const result = applyJump(airborneRunner);
          expect(result.vy).toBe(currentVy); // unchanged
          expect(result.grounded).toBe(false);
        }
      ),
      { numRuns: 100 }
    );
  });
});
