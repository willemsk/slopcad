import {describe, expect, it, vi} from 'vitest';
import type {Constraint, PointRef} from '../types';
import {solveFixedAngle} from './fixed-angle';

describe('solveFixedAngle', () => {
  it('should return 0 if missing point refs or value', () => {
    const context = {
      constraint: {id: 'c1', type: 'fixed_angle'} as Constraint,
      entities: [],
      isPointLocked: vi.fn(),
      getPointValue: vi.fn(),
      setPointValue: vi.fn(),
    };
    expect(solveFixedAngle(context)).toBe(0);
  });

  it('should calculate error and move points to match angle', () => {
    const refA: PointRef = {entityId: 'e1', pointKey: 'start'};
    const refB: PointRef = {entityId: 'e2', pointKey: 'end'};

    // Line from (0,0) to (10,0) -> 0 degrees
    const getPointValue = vi.fn((_, ref) => {
      if (ref === refA) return {x: 0, y: 0};
      if (ref === refB) return {x: 10, y: 0};
      return null;
    });
    const setPointValue = vi.fn();
    const isPointLocked = vi.fn(() => false);

    const context = {
      constraint: {
        id: 'c1',
        type: 'fixed_angle',
        value: 90,
        pointRefs: [refA, refB],
      } as Constraint,
      entities: [],
      isPointLocked,
      getPointValue,
      setPointValue,
    };

    const error = solveFixedAngle(context);
    expect(error).toBeCloseTo(Math.PI / 2); // 90 degrees diff in rad

    // Middle is (5,0). Target angle is 90 deg (0, 1). Length is 10, half is 5.
    // refA -> mid - dir*5 -> (5,0) - (0,5) = (5, -5)
    // refB -> mid + dir*5 -> (5,0) + (0,5) = (5, 5)
    expect(setPointValue).toHaveBeenCalledTimes(2);

    const callA = setPointValue.mock.calls[0];
    const callB = setPointValue.mock.calls[1];

    expect(callA[1]).toBe(refA);
    expect(callA[2].x).toBeCloseTo(5);
    expect(callA[2].y).toBeCloseTo(-5);

    expect(callB[1]).toBe(refB);
    expect(callB[2].x).toBeCloseTo(5);
    expect(callB[2].y).toBeCloseTo(5);
  });
});
