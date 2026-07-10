import {describe, expect, it, vi} from 'vitest';
import type {Constraint, PointRef} from '../types';
import {solveCollinear} from './collinear';

describe('solveCollinear', () => {
  it('should return 0 if missing point refs', () => {
    const context = {
      constraint: {id: 'c1', type: 'collinear'} as Constraint,
      entities: [],
      isPointLocked: vi.fn(),
      getPointValue: vi.fn(),
      setPointValue: vi.fn(),
    };
    expect(solveCollinear(context)).toBe(0);
  });

  it('should calculate error and move lines to be collinear', () => {
    const refA: PointRef = {entityId: 'e1', pointKey: 'start'};
    const refB: PointRef = {entityId: 'e1', pointKey: 'end'};
    const refC: PointRef = {entityId: 'e2', pointKey: 'start'};
    const refD: PointRef = {entityId: 'e2', pointKey: 'end'};

    const getPointValue = vi.fn((_, ref) => {
      if (ref === refA) return {x: 0, y: 0};
      if (ref === refB) return {x: 10, y: 0}; // on x-axis
      if (ref === refC) return {x: 0, y: 10};
      if (ref === refD) return {x: 10, y: 10}; // parallel, but not collinear (y=10)
      return null;
    });
    const setPointValue = vi.fn();
    const isPointLocked = vi.fn(() => false);

    const context = {
      constraint: {
        id: 'c1',
        type: 'collinear',
        pointRefs: [refA, refB, refC, refD],
      } as Constraint,
      entities: [],
      isPointLocked,
      getPointValue,
      setPointValue,
    };

    const error = solveCollinear(context);
    expect(error).toBeGreaterThan(0);
    expect(setPointValue).toHaveBeenCalledTimes(4);
  });
});
