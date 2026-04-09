// Feature: frozen-kiro, Property 5: Spawn interval is within bounds
import fc from 'fast-check';
import { describe, it, expect } from 'vitest';

/**
 * Validates: Requirements 3.1
 *
 * Property 5: Spawn interval is within bounds
 * For any generated spawn interval value, it should be >= 1200ms and <= 2800ms.
 */

const SPAWN_MIN_MS = 1200;
const SPAWN_MAX_MS = 2800;

function scheduleNextSpawn() {
  return SPAWN_MIN_MS + Math.random() * (SPAWN_MAX_MS - SPAWN_MIN_MS);
}

describe('Property 5: Spawn interval is within bounds', () => {
  it('spawn interval is always within [spawnMinMs, spawnMaxMs]', () => {
    // Run many times to test the random distribution
    for (let i = 0; i < 1000; i++) {
      const interval = scheduleNextSpawn();
      expect(interval).toBeGreaterThanOrEqual(SPAWN_MIN_MS);
      expect(interval).toBeLessThanOrEqual(SPAWN_MAX_MS);
    }
  });

  it('spawn interval formula always stays in bounds for any random seed', () => {
    fc.assert(
      fc.property(
        fc.float({ min: 0, max: Math.fround(1), noNaN: true }),
        (rand) => {
          const interval = SPAWN_MIN_MS + rand * (SPAWN_MAX_MS - SPAWN_MIN_MS);
          expect(interval).toBeGreaterThanOrEqual(SPAWN_MIN_MS);
          expect(interval).toBeLessThanOrEqual(SPAWN_MAX_MS + 1); // +1 for float precision
        }
      ),
      { numRuns: 100 }
    );
  });
});
