import {describe, it, expect} from 'vitest';
import {solveConstraints, getPointValue} from './solver';
import {Entity, Constraint, LineEntity} from './types';

describe('solveConstraints', () => {
  it('solves horizontal constraint', () => {
    const line: Entity = {
      id: 'L1',
      type: 'line',
      start: {x: 0, y: 0},
      end: {x: 10, y: 5}, // Not horizontal
      layerId: '0',
    };

    const constraints: Constraint[] = [
      {
        id: 'C1',
        type: 'horizontal',
        entityIds: ['L1'],
        pointRefs: [
          {entityId: 'L1', pointKey: 'start'},
          {entityId: 'L1', pointKey: 'end'},
        ],
      },
    ];

    const solved = solveConstraints([line], constraints, [
      {entityId: 'L1', pointKey: 'start'}, // Lock start
    ]);

    const solvedLine = solved.find((e) => e.id === 'L1') as LineEntity;
    expect(solvedLine.start).toEqual({x: 0, y: 0}); // Locked
    expect(solvedLine.end.y).toBeCloseTo(0); // Y moved to match start
    expect(solvedLine.end.x).toBeCloseTo(10); // X untouched by Gauss-Seidel for horizontal
  });

  it('solves vertical constraint', () => {
    const line: Entity = {
      id: 'L1',
      type: 'line',
      start: {x: 0, y: 0},
      end: {x: 5, y: 10}, // Not vertical
      layerId: '0',
    };

    const constraints: Constraint[] = [
      {
        id: 'C1',
        type: 'vertical',
        entityIds: ['L1'],
        pointRefs: [
          {entityId: 'L1', pointKey: 'start'},
          {entityId: 'L1', pointKey: 'end'},
        ],
      },
    ];

    const solved = solveConstraints([line], constraints, [
      {entityId: 'L1', pointKey: 'start'}, // Lock start
    ]);

    const solvedLine = solved.find((e) => e.id === 'L1') as LineEntity;
    expect(solvedLine.start).toEqual({x: 0, y: 0});
    expect(solvedLine.end.x).toBeCloseTo(0);
    expect(solvedLine.end.y).toBeCloseTo(10);
  });

  it('solves parallel constraint', () => {
    const line1: Entity = {
      id: 'L1',
      type: 'line',
      start: {x: 0, y: 0},
      end: {x: 10, y: 0}, // Horizontal
      layerId: '0',
    };
    const line2: Entity = {
      id: 'L2',
      type: 'line',
      start: {x: 0, y: 5},
      end: {x: 10, y: 15}, // Diagonal
      layerId: '0',
    };

    const constraints: Constraint[] = [
      {
        id: 'C1',
        type: 'parallel',
        entityIds: ['L1', 'L2'],
        pointRefs: [
          {entityId: 'L1', pointKey: 'start'},
          {entityId: 'L1', pointKey: 'end'},
          {entityId: 'L2', pointKey: 'start'},
          {entityId: 'L2', pointKey: 'end'},
        ],
      },
    ];

    const solved = solveConstraints([line1, line2], constraints, [
      {entityId: 'L1', pointKey: 'start'},
      {entityId: 'L1', pointKey: 'end'},
    ]);

    const solvedLine2 = solved.find((e) => e.id === 'L2') as LineEntity;
    // L2 should become horizontal. Its midpoint shouldn't change ideally, or one of its points changes to align.
    const p1 = solvedLine2.start;
    const p2 = solvedLine2.end;
    expect(Math.abs(p1.y - p2.y)).toBeCloseTo(0);
  });

  it('solves fixed_length constraint', () => {
    const line: Entity = {
      id: 'L1',
      type: 'line',
      start: {x: 0, y: 0},
      end: {x: 5, y: 0}, // Length 5
      layerId: '0',
    };

    const constraints: Constraint[] = [
      {
        id: 'C1',
        type: 'fixed_length',
        entityIds: ['L1'],
        pointRefs: [
          {entityId: 'L1', pointKey: 'start'},
          {entityId: 'L1', pointKey: 'end'},
        ],
        value: 10, // Target length 10
      },
    ];

    const solved = solveConstraints([line], constraints, [
      {entityId: 'L1', pointKey: 'start'}, // Lock start
    ]);

    const solvedLine = solved.find((e) => e.id === 'L1') as LineEntity;
    expect(solvedLine.start).toEqual({x: 0, y: 0});
    expect(solvedLine.end.x).toBeCloseTo(10);
    expect(solvedLine.end.y).toBeCloseTo(0);
  });

  it('solves coincident constraint', () => {
    const line1: Entity = {
      id: 'L1',
      type: 'line',
      start: {x: 0, y: 0},
      end: {x: 10, y: 0},
      layerId: '0',
    };
    const line2: Entity = {
      id: 'L2',
      type: 'line',
      start: {x: 10, y: 5}, // Off by 5 in y
      end: {x: 20, y: 5},
      layerId: '0',
    };

    const constraints: Constraint[] = [
      {
        id: 'C1',
        type: 'coincident',
        entityIds: ['L1', 'L2'],
        pointRefs: [
          {entityId: 'L1', pointKey: 'end'},
          {entityId: 'L2', pointKey: 'start'},
        ],
      },
    ];

    const solved = solveConstraints([line1, line2], constraints, [
      {entityId: 'L1', pointKey: 'start'},
      {entityId: 'L1', pointKey: 'end'},
    ]);

    const solvedLine2 = solved.find((e) => e.id === 'L2') as LineEntity;
    expect(solvedLine2.start).toEqual({x: 10, y: 0});
  });
});
