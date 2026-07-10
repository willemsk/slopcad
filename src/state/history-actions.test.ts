// @vitest-environment jsdom
import {beforeEach, describe, expect, it} from 'vitest';
import type {Constraint, Entity} from '../core/types';
import {
  clearHistory,
  deleteSelectedAction,
  redoAction,
  snapshotState,
  undoAction,
} from './history-actions';
import {
  activePageSignal,
  projectSignal,
  updateActivePage,
} from './project-state';
import {selectionSignal} from './selection-state';

describe('History Actions', () => {
  beforeEach(() => {
    // Reset signals before each test
    selectionSignal.value = new Set();
    const initialPage = projectSignal.value.pages[0];
    initialPage.entities = [];
    initialPage.constraints = [];
    projectSignal.value = {...projectSignal.value};
    clearHistory();
  });

  it('performs undo and redo operations correctly', () => {
    const e1: Entity = {
      id: 'L1',
      type: 'line',
      start: {x: 0, y: 0},
      end: {x: 10, y: 10},
    };

    const page = activePageSignal.value;
    page.entities.push(e1);
    updateActivePage(page.entities, page.constraints);

    // Save snapshot before modification
    snapshotState();

    // Modify active page
    const pageModified = activePageSignal.value;
    pageModified.entities = [];
    updateActivePage(pageModified.entities, pageModified.constraints);
    expect(activePageSignal.value.entities.length).toBe(0);

    // Undo should restore L1
    undoAction();
    expect(activePageSignal.value.entities.length).toBe(1);
    expect(activePageSignal.value.entities[0].id).toBe('L1');

    // Redo should clear L1 again
    redoAction();
    expect(activePageSignal.value.entities.length).toBe(0);
  });

  it('deletes selected entities and cascade deletes attached doors/windows', () => {
    const wall: Entity = {
      id: 'W1',
      type: 'wall',
      start: {x: 0, y: 0},
      end: {x: 5, y: 0},
      thickness: 0.2,
    };
    const door: Entity = {
      id: 'D1',
      type: 'door',
      wallId: 'W1',
      position: 0.5,
      width: 1.0,
    };

    const page = activePageSignal.value;
    page.entities.push(wall, door);
    updateActivePage(page.entities, page.constraints);

    // Select the wall and delete it
    selectionSignal.value = new Set(['W1']);
    deleteSelectedAction();

    // Wall and the attached door should both be deleted
    expect(activePageSignal.value.entities.length).toBe(0);
  });

  it('handles undo with empty history stack as a no-op', () => {
    const e1: Entity = {
      id: 'L1',
      type: 'line',
      start: {x: 0, y: 0},
      end: {x: 10, y: 10},
    };
    const page = activePageSignal.value;
    page.entities.push(e1);
    updateActivePage(page.entities, page.constraints);

    // Call undo with no history snapshots saved
    undoAction();

    expect(activePageSignal.value.entities.length).toBe(1);
    expect(activePageSignal.value.entities[0].id).toBe('L1');
  });

  it('handles redo with empty redo stack as a no-op', () => {
    const e1: Entity = {
      id: 'L1',
      type: 'line',
      start: {x: 0, y: 0},
      end: {x: 10, y: 10},
    };
    const page = activePageSignal.value;
    page.entities.push(e1);
    updateActivePage(page.entities, page.constraints);

    // Call redo with no redo snapshots saved
    redoAction();

    expect(activePageSignal.value.entities.length).toBe(1);
    expect(activePageSignal.value.entities[0].id).toBe('L1');
  });

  it('handles deleteSelectedAction with empty selection as a no-op', () => {
    const e1: Entity = {
      id: 'L1',
      type: 'line',
      start: {x: 0, y: 0},
      end: {x: 10, y: 10},
    };
    const page = activePageSignal.value;
    page.entities.push(e1);
    updateActivePage(page.entities, page.constraints);

    selectionSignal.value = new Set();
    deleteSelectedAction();

    expect(activePageSignal.value.entities.length).toBe(1);
  });

  it('removes constraints referencing deleted entities (constraint cascade)', () => {
    const e1: Entity = {
      id: 'L1',
      type: 'line',
      start: {x: 0, y: 0},
      end: {x: 10, y: 10},
    };
    const constraint: Constraint = {
      id: 'c1',
      type: 'horizontal',
      entityIds: ['L1'],
    };

    const page = activePageSignal.value;
    page.entities.push(e1);
    page.constraints.push(constraint);
    updateActivePage(page.entities, page.constraints);

    // Select and delete L1
    selectionSignal.value = new Set(['L1']);
    deleteSelectedAction();

    expect(activePageSignal.value.entities.length).toBe(0);
    expect(activePageSignal.value.constraints.length).toBe(0);
  });
});
