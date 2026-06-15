import {describe, it, expect, beforeEach} from 'vitest';
import {SelectTool} from './select-tool';
import {
  activePageSignal,
  projectSignal,
  selectionSignal,
} from '../state/app-state';
import {WallEntity} from '../core/types';

describe('SelectTool', () => {
  let tool: SelectTool;

  beforeEach(() => {
    tool = new SelectTool();
    projectSignal.value = {
      name: 'Test Project',
      created: 0,
      modified: 0,
      activeLayerId: 'layer1',
      unitSystem: 'metric',
      scale: 100,
      activePageIndex: 0,
      pages: [
        {
          id: 'page1',
          name: 'Floor 1',
          entities: [
            {
              id: 'wall1',
              type: 'wall',
              start: {x: 0, y: 0},
              end: {x: 10, y: 0},
              thickness: 0.2,
              layerId: 'layer1',
            } as WallEntity,
          ],
          constraints: [],
        },
      ],
      layers: [
        {
          id: 'layer1',
          name: 'Default',
          visible: true,
          locked: false,
          color: '#ffffff',
        },
      ],
    };
    selectionSignal.value.clear();
  });

  const createMouseEvent = (button = 0, shiftKey = false) =>
    new MouseEvent('mousedown', {button, shiftKey});

  it('selects an entity on click', () => {
    // Click on the wall
    tool.onMouseDown({x: 5, y: 0}, createMouseEvent(), null);
    expect(selectionSignal.value.has('wall1')).toBe(true);
  });

  it('clears selection when clicking on empty space', () => {
    selectionSignal.value = new Set(['wall1']);
    // Click away from the wall
    tool.onMouseDown({x: 5, y: 10}, createMouseEvent(), null);
    expect(selectionSignal.value.size).toBe(0);
  });

  it('toggles selection with shift key', () => {
    // Select the wall
    tool.onMouseDown({x: 5, y: 0}, createMouseEvent(), null);
    tool.onMouseUp({x: 5, y: 0}, createMouseEvent(), null);
    expect(selectionSignal.value.has('wall1')).toBe(true);

    // Shift-click the wall to deselect
    tool.onMouseDown({x: 5, y: 0}, createMouseEvent(0, true), null);
    tool.onMouseUp({x: 5, y: 0}, createMouseEvent(0, true), null);
    expect(selectionSignal.value.size).toBe(0);
  });
});
