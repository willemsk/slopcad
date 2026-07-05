// @vitest-environment jsdom
import {describe, it, expect, beforeEach} from 'vitest';
import {
  addLayerAction,
  updateLayerAction,
  deleteLayerAction,
  setActiveLayerAction,
} from './layer-actions';
import {projectSignal} from './project-state';

describe('Layer Actions', () => {
  beforeEach(() => {
    projectSignal.value = {
      ...projectSignal.value,
      layers: [
        {id: '0', name: '0', color: '#ffffff', visible: true, locked: false},
      ],
      activeLayerId: '0',
    };
  });

  it('adds a new layer', () => {
    addLayerAction('Walls', '#ff0000');
    expect(projectSignal.value.layers.length).toBe(2);
    expect(projectSignal.value.layers[1].name).toBe('Walls');
    expect(projectSignal.value.layers[1].color).toBe('#ff0000');
  });

  it('updates an existing layer', () => {
    addLayerAction('Walls', '#ff0000');
    const newLayerId = projectSignal.value.layers[1].id;

    updateLayerAction(newLayerId, {color: '#00ff00', locked: true});
    const updatedLayer = projectSignal.value.layers.find(
      l => l.id === newLayerId,
    );
    expect(updatedLayer?.color).toBe('#00ff00');
    expect(updatedLayer?.locked).toBe(true);
  });

  it('sets the active layer', () => {
    addLayerAction('Walls', '#ff0000');
    const newLayerId = projectSignal.value.layers[1].id;

    setActiveLayerAction(newLayerId);
    expect(projectSignal.value.activeLayerId).toBe(newLayerId);
  });

  it('deletes a layer and falls back active layer to 0', () => {
    addLayerAction('Walls', '#ff0000');
    const newLayerId = projectSignal.value.layers[1].id;

    setActiveLayerAction(newLayerId);
    deleteLayerAction(newLayerId);

    expect(projectSignal.value.layers.length).toBe(1);
    expect(projectSignal.value.activeLayerId).toBe('0');
  });

  it('cannot delete the default layer 0', () => {
    deleteLayerAction('0');
    expect(projectSignal.value.layers.length).toBe(1);
  });
});
