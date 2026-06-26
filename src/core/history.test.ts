import {describe, it, expect} from 'vitest';
import {HistoryManager} from './history';
import {Entity, Constraint, LineEntity} from './types';

describe('HistoryManager', () => {
  it('pushes state and manages undo/redo', () => {
    const history = new HistoryManager();
    const e1: Entity[] = [
      {
        id: '1',
        type: 'line',
        start: {x: 0, y: 0},
        end: {x: 10, y: 0},
        layerId: '0',
      },
    ];
    const c1: Constraint[] = [];

    // Push initial
    history.pushState(e1, c1);
    expect(history.canUndo()).toBe(true);
    expect(history.canRedo()).toBe(false);

    // Make change
    const e2: Entity[] = [
      {
        id: '1',
        type: 'line',
        start: {x: 0, y: 0},
        end: {x: 20, y: 0},
        layerId: '0',
      },
    ];

    // Undo
    const previous = history.undo(e2, c1);
    expect(previous).not.toBeNull();
    expect((previous?.entities[0] as LineEntity).end?.x).toBe(10);
    expect(history.canUndo()).toBe(false);
    expect(history.canRedo()).toBe(true);

    // Redo
    const next = history.redo(previous!.entities, previous!.constraints);
    expect(next).not.toBeNull();
    expect((next?.entities[0] as LineEntity).end?.x).toBe(20);
    expect(history.canUndo()).toBe(true);
    expect(history.canRedo()).toBe(false);
  });

  it('clears redo stack when new action is pushed', () => {
    const history = new HistoryManager();
    const e1: Entity[] = [
      {
        id: '1',
        type: 'line',
        start: {x: 0, y: 0},
        end: {x: 10, y: 0},
        layerId: '0',
      },
    ];
    history.pushState(e1, []);

    const e2: Entity[] = [
      {
        id: '1',
        type: 'line',
        start: {x: 0, y: 0},
        end: {x: 20, y: 0},
        layerId: '0',
      },
    ];
    const previous = history.undo(e2, []);
    expect(history.canRedo()).toBe(true);

    const e3: Entity[] = [
      {
        id: '1',
        type: 'line',
        start: {x: 0, y: 0},
        end: {x: 30, y: 0},
        layerId: '0',
      },
    ];
    history.pushState(e3, []);
    expect(history.canRedo()).toBe(false); // Redo stack should be wiped
  });

  it('prevents consecutive duplicate states', () => {
    const history = new HistoryManager();
    const e1: Entity[] = [
      {
        id: '1',
        type: 'line',
        start: {x: 0, y: 0},
        end: {x: 10, y: 0},
        layerId: '0',
      },
    ];

    history.pushState(e1, []);
    history.pushState(e1, []); // Should be ignored
    history.pushState(e1, []); // Should be ignored

    history.undo([], []); // Pops e1
    expect(history.canUndo()).toBe(false); // Only one state should have been saved
  });
});
