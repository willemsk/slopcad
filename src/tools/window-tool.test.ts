import {describe, it, expect, beforeEach} from 'vitest';
import {WindowTool} from './window-tool';
import {
  activePageSignal,
  projectSignal,
  previewEntitySignal,
} from '../state/app-state';
import {WallEntity, WindowEntity} from '../core/types';

describe('WindowTool', () => {
  let tool: WindowTool;

  beforeEach(() => {
    tool = new WindowTool();
    projectSignal.value = {
      id: 'test-project',
      name: 'Test Project',
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
      layers: [{id: 'layer1', name: 'Default', visible: true, locked: false}],
    };
    previewEntitySignal.value = null;
  });

  const createMouseEvent = (button = 0, shiftKey = false) =>
    new MouseEvent('mousedown', {button, shiftKey});

  it('previews window on wall', () => {
    // Hover over the middle of the wall
    tool.onMouseMove({x: 5, y: 0}, createMouseEvent(), {
      type: 'wall-align',
      point: {x: 5, y: 0},
      entityId: 'wall1',
      distance: 0,
      extra: {t: 0.5},
    });

    expect(previewEntitySignal.value).not.toBeNull();
    const preview = previewEntitySignal.value as WindowEntity;
    expect(preview.type).toBe('window');
    expect(preview.wallId).toBe('wall1');
    expect(preview.position).toBeCloseTo(0.5);
  });

  it('creates window on click', () => {
    tool.onMouseDown({x: 5, y: 0}, createMouseEvent(), {
      type: 'wall-align',
      point: {x: 5, y: 0},
      entityId: 'wall1',
      distance: 0,
      extra: {t: 0.5},
    });

    expect(activePageSignal.value.entities.length).toBe(2);
    const win = activePageSignal.value.entities[1] as WindowEntity;
    expect(win.type).toBe('window');
    expect(win.wallId).toBe('wall1');
    expect(win.position).toBeCloseTo(0.5);
  });
});
