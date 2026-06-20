import {describe, it, expect, vi} from 'vitest';
import {solveEqualLength} from './equal-length';
import {Constraint, PointRef} from '../types';

describe('solveEqualLength', () => {
  it('should return 0 if missing point refs', () => {
    const context = {
      constraint: {id: 'c1', type: 'equal_length'} as Constraint,
      entities: [],
      isPointLocked: vi.fn(),
      getPointValue: vi.fn(),
      setPointValue: vi.fn(),
    };
    expect(solveEqualLength(context)).toBe(0);
  });

  it('should calculate error and change lines to average length', () => {
    const refA: PointRef = {entityId: 'e1', pointKey: 'start'};
    const refB: PointRef = {entityId: 'e1', pointKey: 'end'};
    const refC: PointRef = {entityId: 'e2', pointKey: 'start'};
    const refD: PointRef = {entityId: 'e2', pointKey: 'end'};

    const getPointValue = vi.fn((_, ref) => {
      if (ref === refA) return {x: 0, y: 0};
      if (ref === refB) return {x: 10, y: 0}; // length 10
      if (ref === refC) return {x: 0, y: 10};
      if (ref === refD) return {x: 20, y: 10}; // length 20
      return null;
    });
    const setPointValue = vi.fn();
    const isPointLocked = vi.fn(() => false);

    const context = {
      constraint: {
        id: 'c1',
        type: 'equal_length',
        pointRefs: [refA, refB, refC, refD],
      } as Constraint,
      entities: [],
      isPointLocked,
      getPointValue,
      setPointValue,
    };

    const error = solveEqualLength(context);
    expect(error).toBe(10); // |10 - 20|

    // Target length is 15.
    expect(setPointValue).toHaveBeenCalledTimes(4);
  });
});
