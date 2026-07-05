import {describe, it, expect, vi} from 'vitest';
import {solveHorizontal} from './horizontal';
import {Constraint, PointRef} from '../types';

describe('solveHorizontal', () => {
  it('should return 0 if missing point refs', () => {
    const context = {
      constraint: {id: 'c1', type: 'horizontal'} as Constraint,
      entities: [],
      isPointLocked: vi.fn(),
      getPointValue: vi.fn(),
      setPointValue: vi.fn(),
    };
    expect(solveHorizontal(context)).toBe(0);
  });

  it('should calculate error and move y coordinates to average', () => {
    const refA: PointRef = {entityId: 'e1', pointKey: 'start'};
    const refB: PointRef = {entityId: 'e2', pointKey: 'end'};

    const getPointValue = vi.fn((_, ref) => {
      if (ref === refA) return {x: 0, y: 10};
      if (ref === refB) return {x: 5, y: 20};
      return null;
    });
    const setPointValue = vi.fn();
    const isPointLocked = vi.fn(() => false);

    const context = {
      constraint: {
        id: 'c1',
        type: 'horizontal',
        pointRefs: [refA, refB],
      } as Constraint,
      entities: [],
      isPointLocked,
      getPointValue,
      setPointValue,
    };

    const error = solveHorizontal(context);
    expect(error).toBe(10); // |20 - 10|

    // Average Y is 15.
    expect(setPointValue).toHaveBeenCalledWith([], refA, {x: 0, y: 15});
    expect(setPointValue).toHaveBeenCalledWith([], refB, {x: 5, y: 15});
  });
});
