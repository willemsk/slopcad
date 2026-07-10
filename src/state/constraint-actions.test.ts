// @vitest-environment jsdom
import {beforeEach, describe, expect, it} from 'vitest';
import type {Entity, LineEntity} from '../core/types';
import {
  addFixedAngleConstraintAction,
  addHorizontalConstraintAction,
  addLengthConstraintAction,
  addVerticalConstraintAction,
  clearSelectedConstraintsAction,
} from './constraint-actions';
import {
  activePageSignal,
  projectSignal,
  updateActivePage,
} from './project-state';
import {selectionSignal} from './selection-state';
import {activePromptSignal} from './ui-state';

describe('Simple Constraint Actions', () => {
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
    };

    const page = activePageSignal.value;
    page.entities.push(e1);
    updateActivePage(page.entities, page.constraints);

    selectionSignal.value = new Set(['L1']);
    addHorizontalConstraintAction();

    expect(activePageSignal.value.constraints.length).toBe(1);
    expect(activePageSignal.value.constraints[0].type).toBe('horizontal');

    // The solver should have run, modifying L1 to be horizontal
    const line = activePageSignal.value.entities[0] as LineEntity;
    expect(line.start.y).toBeCloseTo(line.end.y);
  });

  it('adds a vertical constraint and solves', () => {
    const e1: Entity = {
      id: 'L1',
      type: 'line',
      start: {x: 0, y: 0},
      end: {x: 5, y: 10},
    };

    const page = activePageSignal.value;
    page.entities.push(e1);
    updateActivePage(page.entities, page.constraints);

    selectionSignal.value = new Set(['L1']);
    addVerticalConstraintAction();

    expect(activePageSignal.value.constraints.length).toBe(1);
    expect(activePageSignal.value.constraints[0].type).toBe('vertical');

    // The solver should have run, modifying L1 to be vertical
    const line = activePageSignal.value.entities[0] as LineEntity;
    expect(line.start.x).toBeCloseTo(line.end.x);
  });

  it('adds a length constraint when prompt is resolved', async () => {
    const e1: Entity = {
      id: 'L1',
      type: 'line',
      start: {x: 0, y: 0},
      end: {x: 10, y: 0},
    };
    const page = activePageSignal.value;
    page.entities.push(e1);
    updateActivePage(page.entities, page.constraints);

    selectionSignal.value = new Set(['L1']);
    const promise = addLengthConstraintAction();

    expect(activePromptSignal.value).not.toBeNull();
    activePromptSignal.value?.resolve('15.0');

    await promise;

    expect(activePageSignal.value.constraints.length).toBe(1);
    expect(activePageSignal.value.constraints[0].type).toBe('fixed_length');
    expect(activePageSignal.value.constraints[0].value).toBe(15.0);
  });

  it('adds a fixed angle constraint when prompt is resolved', async () => {
    const e1: Entity = {
      id: 'L1',
      type: 'line',
      start: {x: 0, y: 0},
      end: {x: 10, y: 10},
    };
    const page = activePageSignal.value;
    page.entities.push(e1);
    updateActivePage(page.entities, page.constraints);

    selectionSignal.value = new Set(['L1']);
    const promise = addFixedAngleConstraintAction();

    expect(activePromptSignal.value).not.toBeNull();
    activePromptSignal.value?.resolve('45.0');

    await promise;

    expect(activePageSignal.value.constraints.length).toBe(1);
    expect(activePageSignal.value.constraints[0].type).toBe('fixed_angle');
    expect(activePageSignal.value.constraints[0].value).toBe(45.0);
  });

  it('clears selected constraints', () => {
    const e1: Entity = {
      id: 'L1',
      type: 'line',
      start: {x: 0, y: 0},
      end: {x: 10, y: 0},
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
