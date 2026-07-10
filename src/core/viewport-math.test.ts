import {describe, expect, it} from 'vitest';
import {ViewportMath, getAdaptiveGridSpacing} from './viewport-math';

describe('ViewportMath', () => {
  it('correctly maps coordinates between world and screen space', () => {
    const viewport = new ViewportMath(50, {x: 100, y: 200});
    const worldPt = {x: 10, y: -5};
    const screenPt = viewport.worldToScreen(worldPt);

    expect(screenPt.x).toBe(10 * 50 + 100);
    expect(screenPt.y).toBe(-5 * 50 + 200);

    const backToWorld = viewport.screenToWorld(screenPt);
    expect(backToWorld.x).toBeCloseTo(worldPt.x);
    expect(backToWorld.y).toBeCloseTo(worldPt.y);
  });

  it('correctly pans the offset', () => {
    const viewport = new ViewportMath(100, {x: 10, y: 20});
    viewport.pan(5, -10);
    expect(viewport.panOffset).toEqual({x: 15, y: 10});
  });

  it('zooms at a stable screen point', () => {
    const viewport = new ViewportMath(100, {x: 0, y: 0});
    const cursor = {x: 300, y: 400};
    const cursorWorldBefore = viewport.screenToWorld(cursor);

    viewport.zoomAt(cursor, 1.5);

    const cursorWorldAfter = viewport.screenToWorld(cursor);
    expect(cursorWorldAfter.x).toBeCloseTo(cursorWorldBefore.x);
    expect(cursorWorldAfter.y).toBeCloseTo(cursorWorldBefore.y);
  });
});

describe('getAdaptiveGridSpacing', () => {
  it('keeps base spacing if on-screen pitch is large enough', () => {
    // 0.5m spacing at zoom=100 (50 pixels on screen). 50 >= 20, so no change.
    expect(getAdaptiveGridSpacing(0.5, 100)).toBe(0.5);

    // 1m spacing at zoom=50 (50 pixels on screen). 50 >= 20, so no change.
    expect(getAdaptiveGridSpacing(1.0, 50)).toBe(1.0);
  });

  it('scales up spacing following the 2/5/10 progression if on-screen pitch is too small', () => {
    // 0.5m spacing at zoom=10 (5 pixels on screen, which is < 20).
    // Progression for 0.5m:
    // mult=1: 0.5m * 10 = 5px (< 20)
    // mult=2: 1.0m * 10 = 10px (< 20)
    // mult=5: 2.5m * 10 = 25px (>= 20)
    // Returns 0.5 * 5 = 2.5m
    expect(getAdaptiveGridSpacing(0.5, 10)).toBe(2.5);

    // 0.5m spacing at zoom=1 (0.5 pixels on screen).
    // Progression multipliers: 1, 2, 5, 10, 20, 50, 100...
    // mult=50: 25.0m * 1 = 25px (>= 20)
    // Returns 0.5 * 50 = 25.0m
    expect(getAdaptiveGridSpacing(0.5, 1)).toBe(25.0);

    // 1.0m spacing at zoom=5 (5 pixels on screen).
    // Progression for 1.0m:
    // mult=1: 1.0m * 5 = 5px (< 20)
    // mult=2: 2.0m * 5 = 10px (< 20)
    // mult=5: 5.0m * 5 = 25px (>= 20)
    // Returns 1.0 * 5 = 5.0m
    expect(getAdaptiveGridSpacing(1.0, 5)).toBe(5.0);
  });

  it('safely handles zero or negative inputs', () => {
    expect(getAdaptiveGridSpacing(0, 100)).toBe(0);
    expect(getAdaptiveGridSpacing(-0.5, 100)).toBe(-0.5);
    expect(getAdaptiveGridSpacing(0.5, 0)).toBe(0.5);
    expect(getAdaptiveGridSpacing(0.5, -10)).toBe(0.5);
  });
});
