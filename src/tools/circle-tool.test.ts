import {describe, it, expect, beforeEach} from 'vitest';
import {CircleTool} from './circle-tool';
import {
  activePageSignal,
  projectSignal,
  previewEntitySignal,
} from '../state/app-state';
import {CircleEntity} from '../core/types';

describe('CircleTool', () => {
  let tool: CircleTool;

  beforeEach(() => {
    tool = new CircleTool();
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
          entities: [],
          constraints: [],
        },
      ],
      layers: [{id: 'layer1', name: 'Default', visible: true, locked: false}],
    };
    previewEntitySignal.value = null;
  });

  const createMouseEvent = (button = 0, shiftKey = false) =>
    new MouseEvent('mousedown', {button, shiftKey});

  it('previews circle on mouse move', () => {
    tool.onMouseDown({x: 0, y: 0}, createMouseEvent(), null);
    tool.onMouseMove({x: 10, y: 0}, createMouseEvent(), null);

    expect(previewEntitySignal.value).not.toBeNull();
    const preview = previewEntitySignal.value as CircleEntity;
    expect(preview.type).toBe('circle');
    expect(preview.center).toEqual({x: 0, y: 0});
    expect(preview.radius).toBe(10);
  });

  it('creates circle on second click', () => {
    tool.onMouseDown({x: 0, y: 0}, createMouseEvent(), null);
    tool.onMouseDown({x: 0, y: 10}, createMouseEvent(), null);

    expect(activePageSignal.value.entities.length).toBe(1);
    const circle = activePageSignal.value.entities[0] as CircleEntity;
    expect(circle.type).toBe('circle');
    expect(circle.center).toEqual({x: 0, y: 0});
    expect(circle.radius).toBe(10);
  });
});
