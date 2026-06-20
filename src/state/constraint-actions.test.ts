// @vitest-environment jsdom
import {describe, it, expect, beforeEach} from 'vitest';
import {
  addHorizontalConstraintAction,
  addVerticalConstraintAction,
  clearSelectedConstraintsAction,
} from './constraint-actions';
import {
  projectSignal,
  activePageSignal,
  updateActivePage,
} from './project-state';
import {selectionSignal} from './selection-state';
import {Entity} from '../core/types';

describe('Constraint Actions', () => {
  beforeEach(() => {
    // Reset signals before each test
    selectionSignal.value = new Set();
    const initialPage = projectSignal.value.pages[0];
    initialPage.entities = [];
    initialPage.constraints = [];
    projectSignal.value = {...projectSignal.value};
  });

  it('adds a horizontal constraint and solves', () => {
    const e1: Entity = {
      id: 'L1',
      type: 'line',
      start: {x: 0, y: 0},
      end: {x: 10, y: 5},
      layerId: '0',
    };

    const page = activePageSignal.value;
    page.entities.push(e1);
    updateActivePage(page.entities, page.constraints);

    selectionSignal.value = new Set(['L1']);
    addHorizontalConstraintAction();

    expect(activePageSignal.value.constraints.length).toBe(1);
    expect(activePageSignal.value.constraints[0].type).toBe('horizontal');

    // The solver should have run, modifying L1 to be horizontal
    const line = activePageSignal.value.entities[0];
    expect((line as any).start?.y).toBeCloseTo((line as any).end?.y as number);
  });

  it('adds a vertical constraint and solves', () => {
    const e1: Entity = {
      id: 'L1',
      type: 'line',
      start: {x: 0, y: 0},
      end: {x: 5, y: 10},
      layerId: '0',
    };

    const page = activePageSignal.value;
    page.entities.push(e1);
    updateActivePage(page.entities, page.constraints);

    selectionSignal.value = new Set(['L1']);
    addVerticalConstraintAction();

    expect(activePageSignal.value.constraints.length).toBe(1);
    expect(activePageSignal.value.constraints[0].type).toBe('vertical');

    // The solver should have run, modifying L1 to be vertical
    const line = activePageSignal.value.entities[0];
    expect((line as any).start?.x).toBeCloseTo((line as any).end?.x as number);
  });

  it('clears selected constraints', () => {
    const e1: Entity = {
      id: 'L1',
      type: 'line',
      start: {x: 0, y: 0},
      end: {x: 10, y: 0},
      layerId: '0',
    };

    const page = activePageSignal.value;
    page.entities.push(e1);
    page.constraints.push({
      id: 'C1',
      type: 'horizontal',
      entityIds: ['L1'],
      pointRefs: [
        {entityId: 'L1', pointKey: 'start'},
        {entityId: 'L1', pointKey: 'end'},
      ],
    });
    updateActivePage(page.entities, page.constraints);

    selectionSignal.value = new Set(['L1']);
    clearSelectedConstraintsAction();

    expect(activePageSignal.value.constraints.length).toBe(0);
  });
});
