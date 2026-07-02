// @vitest-environment jsdom
import {describe, it, expect, beforeEach, vi} from 'vitest';
import {
  addPerpendicularConstraintAction,
  addParallelConstraintAction,
  addCoincidentConstraintAction,
  addCollinearConstraintAction,
  addConcentricConstraintAction,
  addEqualLengthConstraintAction,
} from './constraint-actions-relational';
import {
  projectSignal,
  activePageSignal,
  updateActivePage,
} from './project-state';
import {selectionSignal} from './selection-state';
import {Entity} from '../core/types';

describe('Relational Constraint Actions', () => {
  beforeEach(() => {
    // Reset signals before each test
    selectionSignal.value = new Set();
    const initialPage = projectSignal.value.pages[0];
    initialPage.entities = [];
    initialPage.constraints = [];
    projectSignal.value = {...projectSignal.value};
  });

  it('adds perpendicular constraint', () => {
    const e1: Entity = {
      id: 'L1',
      type: 'line',
      start: {x: 0, y: 0},
      end: {x: 5, y: 0},
    };
    const e2: Entity = {
      id: 'L2',
      type: 'line',
      start: {x: 10, y: 0},
      end: {x: 10, y: 5},
    };

    const page = activePageSignal.value;
    page.entities.push(e1, e2);
    updateActivePage(page.entities, page.constraints);

    selectionSignal.value = new Set(['L1', 'L2']);
    addPerpendicularConstraintAction();

    expect(activePageSignal.value.constraints.length).toBe(1);
    expect(activePageSignal.value.constraints[0].type).toBe('perpendicular');
  });

  it('adds parallel constraint', () => {
    const e1: Entity = {
      id: 'L1',
      type: 'line',
      start: {x: 0, y: 0},
      end: {x: 5, y: 0},
    };
    const e2: Entity = {
      id: 'L2',
      type: 'line',
      start: {x: 0, y: 2},
      end: {x: 5, y: 2},
    };

    const page = activePageSignal.value;
    page.entities.push(e1, e2);
    updateActivePage(page.entities, page.constraints);

    selectionSignal.value = new Set(['L1', 'L2']);
    addParallelConstraintAction();

    expect(activePageSignal.value.constraints.length).toBe(1);
    expect(activePageSignal.value.constraints[0].type).toBe('parallel');
  });

  it('adds coincident constraint to the closest endpoints', () => {
    // End points: L1 (5, 0), L2 (5.1, 0.1) are closest
    const e1: Entity = {
      id: 'L1',
      type: 'line',
      start: {x: 0, y: 0},
      end: {x: 5, y: 0},
    };
    const e2: Entity = {
      id: 'L2',
      type: 'line',
      start: {x: 5.1, y: 0.1},
      end: {x: 10, y: 10},
    };

    const page = activePageSignal.value;
    page.entities.push(e1, e2);
    updateActivePage(page.entities, page.constraints);

    selectionSignal.value = new Set(['L1', 'L2']);
    addCoincidentConstraintAction();

    expect(activePageSignal.value.constraints.length).toBe(1);
    const constr = activePageSignal.value.constraints[0];
    expect(constr.type).toBe('coincident');
    expect(constr.pointRefs?.[0].pointKey).toBe('end'); // L1 end
    expect(constr.pointRefs?.[1].pointKey).toBe('start'); // L2 start
  });

  it('adds collinear constraint', () => {
    const e1: Entity = {
      id: 'L1',
      type: 'line',
      start: {x: 0, y: 0},
      end: {x: 5, y: 0},
    };
    const e2: Entity = {
      id: 'L2',
      type: 'line',
      start: {x: 6, y: 0},
      end: {x: 10, y: 0},
    };

    const page = activePageSignal.value;
    page.entities.push(e1, e2);
    updateActivePage(page.entities, page.constraints);

    selectionSignal.value = new Set(['L1', 'L2']);
    addCollinearConstraintAction();

    expect(activePageSignal.value.constraints.length).toBe(1);
    expect(activePageSignal.value.constraints[0].type).toBe('collinear');
  });

  it('adds concentric constraint', () => {
    const e1: Entity = {
      id: 'C1',
      type: 'circle',
      center: {x: 0, y: 0},
      radius: 2,
    };
    const e2: Entity = {
      id: 'C2',
      type: 'circle',
      center: {x: 0.1, y: 0.1},
      radius: 4,
    };

    const page = activePageSignal.value;
    page.entities.push(e1, e2);
    updateActivePage(page.entities, page.constraints);

    selectionSignal.value = new Set(['C1', 'C2']);
    addConcentricConstraintAction();

    expect(activePageSignal.value.constraints.length).toBe(1);
    expect(activePageSignal.value.constraints[0].type).toBe('concentric');
  });

  it('adds equal length constraint', () => {
    const e1: Entity = {
      id: 'L1',
      type: 'line',
      start: {x: 0, y: 0},
      end: {x: 5, y: 0},
    };
    const e2: Entity = {
      id: 'L2',
      type: 'line',
      start: {x: 10, y: 10},
      end: {x: 15, y: 10},
    };

    const page = activePageSignal.value;
    page.entities.push(e1, e2);
    updateActivePage(page.entities, page.constraints);

    selectionSignal.value = new Set(['L1', 'L2']);
    addEqualLengthConstraintAction();

    expect(activePageSignal.value.constraints.length).toBe(1);
    expect(activePageSignal.value.constraints[0].type).toBe('equal_length');
  });
});
