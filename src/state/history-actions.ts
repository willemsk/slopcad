import {HistoryManager} from '../core/history';
import {type DoorEntity, Entity, type WindowEntity} from '../core/types';
import {activePageSignal, updateActivePage} from './project-state';
import {selectionSignal} from './selection-state';

const historyManager = new HistoryManager();

export function clearHistory() {
  historyManager.clear();
}

export function snapshotState() {
  const page = activePageSignal.value;
  historyManager.pushState(page.entities, page.constraints);
}

export function undoAction() {
  const page = activePageSignal.value;
  const prevSnapshot = historyManager.undo(page.entities, page.constraints);
  if (prevSnapshot) {
    updateActivePage(prevSnapshot.entities, prevSnapshot.constraints);
    selectionSignal.value = new Set();
  }
}

export function redoAction() {
  const page = activePageSignal.value;
  const nextSnapshot = historyManager.redo(page.entities, page.constraints);
  if (nextSnapshot) {
    updateActivePage(nextSnapshot.entities, nextSnapshot.constraints);
    selectionSignal.value = new Set();
  }
}

export function deleteSelectedAction() {
  const selection = selectionSignal.value;
  if (selection.size === 0) return;

  const page = activePageSignal.value;
  snapshotState();

  const wallIdsDeleted = new Set<string>();
  for (const ent of page.entities) {
    if (ent.type === 'wall' && selection.has(ent.id)) {
      wallIdsDeleted.add(ent.id);
    }
  }

  const finalEntities = page.entities.filter((e) => {
    if (selection.has(e.id)) return false;
    if (e.type === 'door' || e.type === 'window') {
      const de = e as DoorEntity | WindowEntity;
      return !wallIdsDeleted.has(de.wallId);
    }
    return true;
  });

  const newConstraints = page.constraints.filter((c) => {
    if (!c.entityIds) return true;
    for (let i = 0; i < c.entityIds.length; i++) {
      const id = c.entityIds[i];
      if (selection.has(id) || wallIdsDeleted.has(id)) {
        return false;
      }
    }
    return true;
  });

  updateActivePage(finalEntities, newConstraints);
  selectionSignal.value = new Set();
}
