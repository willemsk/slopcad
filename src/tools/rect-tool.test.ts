import {describe, it, expect, beforeEach} from 'vitest';
import {RectTool} from './rect-tool';
import {
  activePageSignal,
  projectSignal,
  previewEntitySignal,
} from '../state/app-state';
import {RectEntity} from '../core/types';

describe('RectTool', () => {
  let tool: RectTool;

  beforeEach(() => {
    tool = new RectTool();
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

  it('previews rect on mouse move', () => {
    tool.onMouseDown({x: 0, y: 0}, createMouseEvent(), null);
    tool.onMouseMove({x: 10, y: 5}, createMouseEvent(), null);

    expect(previewEntitySignal.value).not.toBeNull();
    const preview = previewEntitySignal.value as RectEntity;
    expect(preview.type).toBe('rect');
    expect(preview.p1).toEqual({x: 0, y: 0});
    expect(preview.p2).toEqual({x: 10, y: 5});
  });

  it('creates rect on second click', () => {
    tool.onMouseDown({x: 0, y: 0}, createMouseEvent(), null);
    tool.onMouseDown({x: 10, y: 5}, createMouseEvent(), null);

    expect(activePageSignal.value.entities.length).toBe(1);
    const rect = activePageSignal.value.entities[0] as RectEntity;
    expect(rect.type).toBe('rect');
    expect(rect.p1).toEqual({x: 0, y: 0});
    expect(rect.p2).toEqual({x: 10, y: 5});
  });

  it('forces square aspect ratio with shift key', () => {
    tool.onMouseDown({x: 0, y: 0}, createMouseEvent(), null);

    // dx=10, dy=5 -> side length should be max(10, 5) = 10
    tool.onMouseMove({x: 10, y: 5}, createMouseEvent(0, true), null);
    const preview = previewEntitySignal.value as RectEntity;
    expect(preview.p2).toEqual({x: 10, y: 10});
  });
});
