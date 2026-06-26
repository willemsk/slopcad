// @vitest-environment jsdom
import {describe, it, expect, beforeEach} from 'vitest';
import {
  projectSignal,
  activePageSignal,
  updateActivePage,
} from './project-state';
import {
  snapshotState,
  undoAction,
  redoAction,
  deleteSelectedAction,
} from './history-actions';
import {selectionSignal} from './selection-state';
import {Entity} from '../core/types';

describe('History Actions', () => {
  beforeEach(() => {
    // Reset signals before each test
    selectionSignal.value = new Set();
    const initialPage = projectSignal.value.pages[0];
    initialPage.entities = [];
    initialPage.constraints = [];
    projectSignal.value = {...projectSignal.value};
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
});
