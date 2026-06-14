// @vitest-environment jsdom
import {describe, it, expect, beforeEach} from 'vitest';
import {
  projectSignal,
  selectionSignal,
  activePageSignal,
  updateActivePage,
  deleteSelectedAction,
  clearSelection,
  addHorizontalConstraintAction,
} from './app-state';
import {Entity} from '../core/types';

describe('App State', () => {
  beforeEach(() => {
    // Reset signals before each test
    selectionSignal.value = new Set();
    const initialPage = projectSignal.value.pages[0];
    initialPage.entities = [];
    initialPage.constraints = [];
    projectSignal.value = {...projectSignal.value};
  });

  it('adds an entity correctly via updateActivePage', () => {
    const e: Entity = {
      id: 'L1',
      type: 'line',
      start: {x: 0, y: 0},
      end: {x: 10, y: 10},
      layerId: '0',
    };
    const page = activePageSignal.value;
    page.entities.push(e);
    updateActivePage(page.entities, page.constraints);

    expect(activePageSignal.value.entities.length).toBe(1);
    expect(activePageSignal.value.entities[0].id).toBe('L1');
  });

  it('clears selection', () => {
    selectionSignal.value = new Set(['L1', 'L2']);
    clearSelection();
    expect(selectionSignal.value.size).toBe(0);
  });

  it('deletes selected entities', () => {
    const e1: Entity = {
      id: 'L1',
      type: 'line',
      start: {x: 0, y: 0},
      end: {x: 10, y: 10},
      layerId: '0',
    };
    const e2: Entity = {
      id: 'L2',
      type: 'line',
      start: {x: 0, y: 0},
      end: {x: 5, y: 5},
      layerId: '0',
    };

    const page = activePageSignal.value;
    page.entities.push(e1, e2);
    updateActivePage(page.entities, page.constraints);

    selectionSignal.value = new Set(['L1']);
    deleteSelectedAction();

    expect(activePageSignal.value.entities.length).toBe(1);
    expect(activePageSignal.value.entities[0].id).toBe('L2');
    expect(selectionSignal.value.size).toBe(0); // Should clear selection after delete
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
});
