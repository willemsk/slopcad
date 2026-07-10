import {describe, expect, it, vi} from 'vitest';
import type {Constraint, PointRef} from '../types';
import {solveVertical} from './vertical';

describe('solveVertical', () => {
  it('should return 0 if missing point refs', () => {
    const context = {
      constraint: {id: 'c1', type: 'vertical'} as Constraint,
      entities: [],
      isPointLocked: vi.fn(),
      getPointValue: vi.fn(),
      setPointValue: vi.fn(),
    };
    expect(solveVertical(context)).toBe(0);
  });

  it('should calculate error and move x coordinates to average', () => {
    const refA: PointRef = {entityId: 'e1', pointKey: 'start'};
    const refB: PointRef = {entityId: 'e2', pointKey: 'end'};

    const getPointValue = vi.fn((_, ref) => {
      if (ref === refA) return {x: 10, y: 0};
      if (ref === refB) return {x: 20, y: 5};
      return null;
    });
    const setPointValue = vi.fn();
    const isPointLocked = vi.fn(() => false);

    const context = {
      constraint: {
        id: 'c1',
        type: 'vertical',
        pointRefs: [refA, refB],
      } as Constraint,
      entities: [],
      isPointLocked,
      getPointValue,
      setPointValue,
    };

    const error = solveVertical(context);
    expect(error).toBe(10); // |20 - 10|

    // Average X is 15.
    expect(setPointValue).toHaveBeenCalledWith([], refA, {x: 15, y: 0});
    expect(setPointValue).toHaveBeenCalledWith([], refB, {x: 15, y: 5});
  });
});
