import {generateId} from '../core/entity';
import type {Layer} from '../core/types';
import {projectSignal} from './project-state';
import {triggerRenderSignal} from './ui-state';

export function addLayerAction(name: string, color: string) {
  const project = projectSignal.value;
  const newLayer: Layer = {
    id: generateId(),
    name,
    color,
    visible: true,
    locked: false,
  };
  projectSignal.value = {
    ...project,
    layers: [...project.layers, newLayer],
    modified: Date.now(),
  };
  triggerRenderSignal.value = {};
}

export function updateLayerAction(id: string, updates: Partial<Layer>) {
  const project = projectSignal.value;
  const newLayers = project.layers.map((layer) =>
    layer.id === id ? {...layer, ...updates} : layer,
  );
  projectSignal.value = {
    ...project,
    layers: newLayers,
    modified: Date.now(),
  };
  triggerRenderSignal.value = {};
}

export function deleteLayerAction(id: string) {
  const project = projectSignal.value;
  if (id === '0' || project.layers.length <= 1) return; // Cannot delete default layer or last layer

  const newLayers = project.layers.filter((layer) => layer.id !== id);
  let newActiveLayerId = project.activeLayerId;
  if (newActiveLayerId === id) {
    newActiveLayerId = '0';
  }

  // Update entities to fallback layer '0'
  const newPages = project.pages.map((page) => ({
    ...page,
    entities: page.entities.map((e) =>
      e.layerId === id ? {...e, layerId: '0'} : e,
    ),
  }));

  projectSignal.value = {
    ...project,
    layers: newLayers,
    activeLayerId: newActiveLayerId,
    pages: newPages,
    modified: Date.now(),
  };
  triggerRenderSignal.value = {};
}

export function setActiveLayerAction(id: string) {
  const project = projectSignal.value;
  if (project.layers.some((l) => l.id === id)) {
    projectSignal.value = {
      ...project,
      activeLayerId: id,
    };
  }
}
