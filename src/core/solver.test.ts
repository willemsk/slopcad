import {describe, it, expect} from 'vitest';
import {solveConstraints, getPointValue} from './solver';
import {Entity, Constraint} from './types';

describe('solveConstraints', () => {
  it('solves horizontal constraint', () => {
    const line: Entity = {
      id: 'L1',
      type: 'line',
      start: {x: 0, y: 0},
      end: {x: 10, y: 5}, // Not horizontal
      layer: '0',
    };

    const constraints: Constraint[] = [
      {
        id: 'C1',
        type: 'horizontal',
        pointRefs: [
          {entityId: 'L1', pointKey: 'start'},
          {entityId: 'L1', pointKey: 'end'},
        ],
      },
    ];

    const solved = solveConstraints([line], constraints, [
      {entityId: 'L1', pointKey: 'start'}, // Lock start
    ]);

    const solvedLine = solved.find(e => e.id === 'L1')!;
    expect(solvedLine.start).toEqual({x: 0, y: 0}); // Locked
    expect(solvedLine.end?.y).toBeCloseTo(0); // Y moved to match start
    expect(solvedLine.end?.x).toBeCloseTo(10); // X untouched by Gauss-Seidel for horizontal
  });

  it('solves vertical constraint', () => {
    const line: Entity = {
      id: 'L1',
      type: 'line',
      start: {x: 0, y: 0},
      end: {x: 5, y: 10}, // Not vertical
      layer: '0',
    };

    const constraints: Constraint[] = [
      {
        id: 'C1',
        type: 'vertical',
        pointRefs: [
          {entityId: 'L1', pointKey: 'start'},
          {entityId: 'L1', pointKey: 'end'},
        ],
      },
    ];

    const solved = solveConstraints([line], constraints, [
      {entityId: 'L1', pointKey: 'start'}, // Lock start
    ]);

    const solvedLine = solved.find(e => e.id === 'L1')!;
    expect(solvedLine.start).toEqual({x: 0, y: 0});
    expect(solvedLine.end?.x).toBeCloseTo(0);
    expect(solvedLine.end?.y).toBeCloseTo(10);
  });

  it('solves parallel constraint', () => {
    const line1: Entity = {
      id: 'L1',
      type: 'line',
      start: {x: 0, y: 0},
      end: {x: 10, y: 0}, // Horizontal
      layer: '0',
    };
    const line2: Entity = {
      id: 'L2',
      type: 'line',
      start: {x: 0, y: 5},
      end: {x: 10, y: 15}, // Diagonal
      layer: '0',
    };

    const constraints: Constraint[] = [
      {
        id: 'C1',
        type: 'parallel',
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

    const solvedLine2 = solved.find(e => e.id === 'L2')!;
    // L2 should become horizontal. Its midpoint shouldn't change ideally, or one of its points changes to align.
    const p1 = solvedLine2.start!;
    const p2 = solvedLine2.end!;
    expect(Math.abs(p1.y - p2.y)).toBeCloseTo(0);
  });

  it('solves fixed_length constraint', () => {
    const line: Entity = {
      id: 'L1',
      type: 'line',
      start: {x: 0, y: 0},
      end: {x: 5, y: 0}, // Length 5
      layer: '0',
    };

    const constraints: Constraint[] = [
      {
        id: 'C1',
        type: 'fixed_length',
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

    const solvedLine = solved.find(e => e.id === 'L1')!;
    expect(solvedLine.start).toEqual({x: 0, y: 0});
    expect(solvedLine.end?.x).toBeCloseTo(10);
    expect(solvedLine.end?.y).toBeCloseTo(0);
  });

  it('solves coincident constraint', () => {
    const line1: Entity = {
      id: 'L1',
      type: 'line',
      start: {x: 0, y: 0},
      end: {x: 10, y: 0},
      layer: '0',
    };
    const line2: Entity = {
      id: 'L2',
      type: 'line',
      start: {x: 10, y: 5}, // Off by 5 in y
      end: {x: 20, y: 5},
      layer: '0',
    };

    const constraints: Constraint[] = [
      {
        id: 'C1',
        type: 'coincident',
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

    const solvedLine2 = solved.find(e => e.id === 'L2')!;
    expect(solvedLine2.start).toEqual({x: 10, y: 0});
  });
});
