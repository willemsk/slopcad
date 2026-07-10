import {beforeEach, describe, expect, it} from 'vitest';
import type {LineEntity} from '../core/types';
import {activePageSignal, projectSignal} from '../state/project-state';
import {previewEntitySignal} from '../state/ui-state';
import {LineTool} from './line-tool';

describe('LineTool', () => {
  let tool: LineTool;

  beforeEach(() => {
    tool = new LineTool();
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
          entities: [],
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
    previewEntitySignal.value = null;
  });

  const createMouseEvent = (button = 0, shiftKey = false) =>
    new MouseEvent('mousedown', {button, shiftKey});

  it('sets start point on first click', () => {
    tool.onMouseDown({x: 0, y: 0}, createMouseEvent(), null);

    // Line tool sets preview on mouse move, not down
    expect(previewEntitySignal.value).toBeNull();
  });

  it('previews line on mouse move', () => {
    tool.onMouseDown({x: 0, y: 0}, createMouseEvent(), null);
    tool.onMouseMove({x: 10, y: 5}, createMouseEvent(), null);

    expect(previewEntitySignal.value).not.toBeNull();
    const preview = previewEntitySignal.value as LineEntity;
    expect(preview.type).toBe('line');
    expect(preview.start).toEqual({x: 0, y: 0});
    expect(preview.end).toEqual({x: 10, y: 5});
  });

  it('creates line on second click', () => {
    tool.onMouseDown({x: 0, y: 0}, createMouseEvent(), null);
    tool.onMouseDown({x: 10, y: 5}, createMouseEvent(), null);

    expect(activePageSignal.value.entities.length).toBe(1);
    const line = activePageSignal.value.entities[0] as LineEntity;
    expect(line.type).toBe('line');
    expect(line.start).toEqual({x: 0, y: 0});
    expect(line.end).toEqual({x: 10, y: 5});

    // Tool should reset after creating line
    expect(previewEntitySignal.value).toBeNull();
  });

  it('snaps to orthogonal angles with shift key', () => {
    tool.onMouseDown({x: 0, y: 0}, createMouseEvent(), null);

    // dx=10, dy=5 -> should snap to x-axis
    tool.onMouseMove({x: 10, y: 5}, createMouseEvent(0, true), null);
    let preview = previewEntitySignal.value as LineEntity;
    expect(preview.end).toEqual({x: 10, y: 0});

    // dx=5, dy=10 -> should snap to y-axis
    tool.onMouseMove({x: 5, y: 10}, createMouseEvent(0, true), null);
    preview = previewEntitySignal.value as LineEntity;
    expect(preview.end).toEqual({x: 0, y: 10});
  });
});
