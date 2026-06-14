import {describe, it, expect, beforeEach} from 'vitest';
import {DoorTool} from './door-tool';
import {
  activePageSignal,
  projectSignal,
  previewEntitySignal,
} from '../state/app-state';
import {WallEntity, DoorEntity} from '../core/types';

describe('DoorTool', () => {
  let tool: DoorTool;

  beforeEach(() => {
    tool = new DoorTool();
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
    // Don't set activePageSignal.value if it's computed, it updates automatically when projectSignal changes
    previewEntitySignal.value = null;
  });

  const createMouseEvent = (button = 0, shiftKey = false) =>
    new MouseEvent('mousedown', {button, shiftKey});

  it('previews door on wall', () => {
    // Hover over the middle of the wall
    tool.onMouseMove({x: 5, y: 0}, createMouseEvent(), {
      type: 'wall-align',
      point: {x: 5, y: 0},
      entityId: 'wall1',
      distance: 0,
      extra: {t: 0.5},
    });

    expect(previewEntitySignal.value).not.toBeNull();
    const preview = previewEntitySignal.value as DoorEntity;
    expect(preview.type).toBe('door');
    expect(preview.wallId).toBe('wall1');
    expect(preview.position).toBeCloseTo(0.5);
  });

  it('creates door on click', () => {
    tool.onMouseDown({x: 5, y: 0}, createMouseEvent(), {
      type: 'wall-align',
      point: {x: 5, y: 0},
      entityId: 'wall1',
      distance: 0,
      extra: {t: 0.5},
    });

    expect(activePageSignal.value.entities.length).toBe(2);
    const door = activePageSignal.value.entities[1] as DoorEntity;
    expect(door.type).toBe('door');
    expect(door.wallId).toBe('wall1');
    expect(door.position).toBeCloseTo(0.5);
  });
});
