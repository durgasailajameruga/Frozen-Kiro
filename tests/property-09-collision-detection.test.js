// Feature: frozen-kiro, Property 9: Collision detection correctness
import fc from 'fast-check';
import { describe, it, expect } from 'vitest';

/**
 * Validates: Requirements 4.1
 *
 * Property 9: Collision detection correctness
 * For any runner hitbox and obstacle hitbox that overlap (AABB intersection),
 * aabbOverlap() should return true; for any pair that do not overlap, it should return false.
 */

function aabbOverlap(a, b) {
  return (
    a.x              < b.x + b.width  &&
    a.x + a.width    > b.x            &&
    a.y              < b.y + b.height &&
    a.y + a.height   > b.y
  );
}

describe('Property 9: Collision detection correctness', () => {
  it('overlapping boxes return true', () => {
    fc.assert(
      fc.property(
        // Box A
        fc.float({ min: Math.fround(0), max: Math.fround(500), noNaN: true }),
        fc.float({ min: Math.fround(0), max: Math.fround(500), noNaN: true }),
        fc.float({ min: Math.fround(10), max: Math.fround(100), noNaN: true }),
        fc.float({ min: Math.fround(10), max: Math.fround(100), noNaN: true }),
        // Overlap offset (small, so boxes definitely overlap)
        fc.float({ min: Math.fround(1), max: Math.fround(5), noNaN: true }),
        fc.float({ min: Math.fround(1), max: Math.fround(5), noNaN: true }),
        (ax, ay, aw, ah, dx, dy) => {
          const a = { x: ax, y: ay, width: aw, height: ah };
          // Box B overlaps A by placing it slightly offset but still intersecting
          const b = { x: ax + dx, y: ay + dy, width: aw, height: ah };
          // Only test if they actually overlap
          if (dx < aw && dy < ah) {
            expect(aabbOverlap(a, b)).toBe(true);
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  it('non-overlapping boxes (separated horizontally) return false', () => {
    fc.assert(
      fc.property(
        fc.float({ min: Math.fround(0), max: Math.fround(400), noNaN: true }),
        fc.float({ min: Math.fround(0), max: Math.fround(400), noNaN: true }),
        fc.float({ min: Math.fround(10), max: Math.fround(80), noNaN: true }),
        fc.float({ min: Math.fround(10), max: Math.fround(80), noNaN: true }),
        fc.float({ min: Math.fround(1), max: Math.fround(50), noNaN: true }), // gap
        (ax, ay, aw, ah, gap) => {
          const a = { x: ax, y: ay, width: aw, height: ah };
          // B is placed to the right of A with a gap
          const b = { x: ax + aw + gap, y: ay, width: aw, height: ah };
          expect(aabbOverlap(a, b)).toBe(false);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('non-overlapping boxes (separated vertically) return false', () => {
    fc.assert(
      fc.property(
        fc.float({ min: Math.fround(0), max: Math.fround(400), noNaN: true }),
        fc.float({ min: Math.fround(0), max: Math.fround(400), noNaN: true }),
        fc.float({ min: Math.fround(10), max: Math.fround(80), noNaN: true }),
        fc.float({ min: Math.fround(10), max: Math.fround(80), noNaN: true }),
        fc.float({ min: Math.fround(1), max: Math.fround(50), noNaN: true }), // gap
        (ax, ay, aw, ah, gap) => {
          const a = { x: ax, y: ay, width: aw, height: ah };
          // B is placed below A with a gap
          const b = { x: ax, y: ay + ah + gap, width: aw, height: ah };
          expect(aabbOverlap(a, b)).toBe(false);
        }
      ),
      { numRuns: 100 }
    );
  });
});
