import {describe, it, expect, vi} from 'vitest';
import {solveCoincident} from './coincident';
import {Constraint, PointRef} from '../types';

describe('solveCoincident', () => {
  it('should return 0 if missing point refs', () => {
    const context = {
      constraint: {id: 'c1', type: 'coincident'} as Constraint,
      entities: [],
      isPointLocked: vi.fn(),
      getPointValue: vi.fn(),
      setPointValue: vi.fn(),
    };
    expect(solveCoincident(context)).toBe(0);
  });

  it('should calculate error and move both points if neither is locked', () => {
    const refA: PointRef = {entityId: 'e1', pointKey: 'start'};
    const refB: PointRef = {entityId: 'e2', pointKey: 'end'};

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
        type: 'coincident',
        pointRefs: [refA, refB],
      } as Constraint,
      entities: [],
      isPointLocked,
      getPointValue,
      setPointValue,
    };

    const error = solveCoincident(context);
    expect(error).toBe(10);
    expect(setPointValue).toHaveBeenCalledWith([], refA, {x: 5, y: 0});
    expect(setPointValue).toHaveBeenCalledWith([], refB, {x: 5, y: 0});
  });

  it('should only move unlocked point if one is locked', () => {
    const refA: PointRef = {entityId: 'e1', pointKey: 'start'};
    const refB: PointRef = {entityId: 'e2', pointKey: 'end'};

    const getPointValue = vi.fn((_, ref) => {
      if (ref === refA) return {x: 0, y: 0};
      if (ref === refB) return {x: 10, y: 0};
      return null;
    });
    const setPointValue = vi.fn();
    const isPointLocked = vi.fn(ref => ref === refA);

    const context = {
      constraint: {
        id: 'c1',
        type: 'coincident',
        pointRefs: [refA, refB],
      } as Constraint,
      entities: [],
      isPointLocked,
      getPointValue,
      setPointValue,
    };

    solveCoincident(context);
    expect(setPointValue).toHaveBeenCalledWith([], refB, {x: 0, y: 0});
    expect(setPointValue).not.toHaveBeenCalledWith([], refA, expect.anything());
  });
});
