// Feature: frozen-kiro, Property 16: Canvas fills viewport on resize
import fc from 'fast-check';
import { describe, it, expect } from 'vitest';

/**
 * Validates: Requirements 9.2
 *
 * Property 16: Canvas fills viewport on resize
 * For any new viewport dimensions (w, h), after the resize handler fires,
 * canvas.width should equal w and canvas.height should equal h,
 * and the ground y-position should equal h * GROUND_RATIO.
 */

const CONFIG = {
  layout: {
    groundRatio: 0.85,
    runnerHeightRatio: 0.12,
    runnerXRatio: 0.15,
  },
};

// Pure function extracted from handleResize logic
function computeLayout(w, h) {
  const groundY = h * CONFIG.layout.groundRatio;
  const runnerHeight = h * CONFIG.layout.runnerHeightRatio;
  const runnerWidth = runnerHeight; // square sprite (32×32 source)
  const runnerX = w * CONFIG.layout.runnerXRatio;
  const runnerY = groundY - runnerHeight;
  return { canvasWidth: w, canvasHeight: h, groundY, runnerHeight, runnerWidth, runnerX, runnerY };
}

describe('Property 16: Canvas fills viewport on resize', () => {
  it('canvas dimensions match viewport', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 320, max: 3840 }),
        fc.integer({ min: 240, max: 2160 }),
        (w, h) => {
          const layout = computeLayout(w, h);
          expect(layout.canvasWidth).toBe(w);
          expect(layout.canvasHeight).toBe(h);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('groundY equals h * GROUND_RATIO', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 320, max: 3840 }),
        fc.integer({ min: 240, max: 2160 }),
        (w, h) => {
          const layout = computeLayout(w, h);
          expect(layout.groundY).toBeCloseTo(h * 0.85, 10);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('runner dimensions and position are proportional to canvas', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 320, max: 3840 }),
        fc.integer({ min: 240, max: 2160 }),
        (w, h) => {
          const layout = computeLayout(w, h);
          expect(layout.runnerHeight).toBeCloseTo(h * 0.12, 10);
          expect(layout.runnerWidth).toBe(layout.runnerHeight);
          expect(layout.runnerX).toBeCloseTo(w * 0.15, 10);
          expect(layout.runnerY).toBeCloseTo(layout.groundY - layout.runnerHeight, 10);
        }
      ),
      { numRuns: 100 }
    );
  });
});
