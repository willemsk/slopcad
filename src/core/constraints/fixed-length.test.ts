import {describe, it, expect, vi} from 'vitest';
import {solveFixedLength} from './fixed-length';
import {Constraint, PointRef} from '../types';

describe('solveFixedLength', () => {
  it('should return 0 if missing point refs or value', () => {
    const context = {
      constraint: {id: 'c1', type: 'fixed_length'} as Constraint,
      entities: [],
      isPointLocked: vi.fn(),
      getPointValue: vi.fn(),
      setPointValue: vi.fn(),
    };
    expect(solveFixedLength(context)).toBe(0);
  });

  it('should calculate error and move both points equally', () => {
    const refA: PointRef = {entityId: 'e1', pointKey: 'start'};
    const refB: PointRef = {entityId: 'e2', pointKey: 'end'};

    const getPointValue = vi.fn((_, ref) => {
      if (ref === refA) return {x: 0, y: 0};
      if (ref === refB) return {x: 10, y: 0}; // distance 10
      return null;
    });
    const setPointValue = vi.fn();
    const isPointLocked = vi.fn(() => false);

    const context = {
      constraint: {
        id: 'c1',
        type: 'fixed_length',
        value: 20,
        pointRefs: [refA, refB],
      } as Constraint,
      entities: [],
      isPointLocked,
      getPointValue,
      setPointValue,
    };

    const error = solveFixedLength(context);
    expect(error).toBe(10); // |10 - 20|

    // Middle is (5,0). Target length 20, so half is 10.
    // refA should move to (5-10, 0) = (-5, 0)
    // refB should move to (5+10, 0) = (15, 0)
    expect(setPointValue).toHaveBeenCalledWith([], refA, {x: -5, y: 0});
    expect(setPointValue).toHaveBeenCalledWith([], refB, {x: 15, y: 0});
  });
});
