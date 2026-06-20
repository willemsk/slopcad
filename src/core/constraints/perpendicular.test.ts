import {describe, it, expect, vi} from 'vitest';
import {solvePerpendicular} from './perpendicular';
import {Constraint, PointRef} from '../types';

describe('solvePerpendicular', () => {
  it('should return 0 if missing point refs', () => {
    const context = {
      constraint: {id: 'c1', type: 'perpendicular'} as Constraint,
      entities: [],
      isPointLocked: vi.fn(),
      getPointValue: vi.fn(),
      setPointValue: vi.fn(),
    };
    expect(solvePerpendicular(context)).toBe(0);
  });

  it('should calculate error and rotate lines to be perpendicular', () => {
    const refA: PointRef = {entityId: 'e1', pointKey: 'start'};
    const refB: PointRef = {entityId: 'e1', pointKey: 'end'};
    const refC: PointRef = {entityId: 'e2', pointKey: 'start'};
    const refD: PointRef = {entityId: 'e2', pointKey: 'end'};

    const getPointValue = vi.fn((_, ref) => {
      if (ref === refA) return {x: 0, y: 0};
      if (ref === refB) return {x: 10, y: 0}; // 0 degrees
      if (ref === refC) return {x: 0, y: 0};
      if (ref === refD) return {x: 10, y: 0}; // 0 degrees (should be 90)
      return null;
    });
    const setPointValue = vi.fn();
    const isPointLocked = vi.fn(() => false);

    const context = {
      constraint: {
        id: 'c1',
        type: 'perpendicular',
        pointRefs: [refA, refB, refC, refD],
      } as Constraint,
      entities: [],
      isPointLocked,
      getPointValue,
      setPointValue,
    };

    const error = solvePerpendicular(context);
    expect(error).toBeCloseTo(Math.PI / 2);
    expect(setPointValue).toHaveBeenCalledTimes(4);
  });
});
