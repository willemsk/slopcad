import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';
import {Project, type WallEntity} from '../core/types';
import {activePageSignal, projectSignal} from '../state/project-state';
import {selectionSignal} from '../state/selection-state';
import {previewEntitySignal} from '../state/ui-state';
import {WallTool} from './wall-tool';

describe('WallTool', () => {
  let tool: WallTool;

  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(1000);
    tool = new WallTool();
    // Reset state
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
    selectionSignal.value.clear();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  const createMouseEvent = (button = 0) =>
    new MouseEvent('mousedown', {button});

  it('sets start point on first click', () => {
    tool.onMouseDown({x: 0, y: 0}, createMouseEvent(), null);

    // Wall tool sets preview on mouse move, not down
    expect(previewEntitySignal.value).toBeNull();
  });

  it('creates a wall and starts a new chain on second click', () => {
    tool.onMouseDown({x: 0, y: 0}, createMouseEvent(), null);
    tool.onMouseMove({x: 10, y: 0}, createMouseEvent(), null); // Move to set preview end

    vi.advanceTimersByTime(500); // Advance time past 300ms double click threshold
    tool.onMouseDown({x: 10, y: 0}, createMouseEvent(), null);

    // Should have added 1 wall to entities
    expect(activePageSignal.value.entities.length).toBe(1);
    const wall = activePageSignal.value.entities[0] as WallEntity;
    expect(wall.type).toBe('wall');
    expect(wall.start).toEqual({x: 0, y: 0});
    expect(wall.end).toEqual({x: 10, y: 0});

    // Preview should still be active for the next wall in the chain
    tool.onMouseMove({x: 20, y: 0}, createMouseEvent(), null);
    expect(previewEntitySignal.value).not.toBeNull();
    const nextPreview = previewEntitySignal.value as WallEntity;
    expect(nextPreview.start).toEqual({x: 10, y: 0});
  });

  it('cancels the chain on right click', () => {
    tool.onMouseDown({x: 0, y: 0}, createMouseEvent(), null);
    tool.onMouseDown({x: 10, y: 0}, createMouseEvent(2), null); // Right click

    // State should be reset
    expect(previewEntitySignal.value).toBeNull();
  });

  it('deactivate cleans up preview', () => {
    tool.onMouseDown({x: 0, y: 0}, createMouseEvent(), null);
    tool.onMouseMove({x: 10, y: 0}, createMouseEvent(), null);
    expect(previewEntitySignal.value).not.toBeNull();

    tool.deactivate();
    expect(previewEntitySignal.value).toBeNull();
  });
});
