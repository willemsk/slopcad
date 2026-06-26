import {Entity, DoorEntity, WindowEntity} from '../core/types';
import {HistoryManager} from '../core/history';
import {activePageSignal, updateActivePage} from './project-state';
import {selectionSignal} from './selection-state';

const historyManager = new HistoryManager();

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

  const newEntities = page.entities.filter(e => !selection.has(e.id));

  const wallIdsDeleted = new Set(
    page.entities
      .filter(e => selection.has(e.id) && e.type === 'wall')
      .map(e => e.id),
  );

  const finalEntities = newEntities.filter(e => {
    if (e.type === 'door' || e.type === 'window') {
      const de = e as DoorEntity | WindowEntity;
      return !wallIdsDeleted.has(de.wallId);
    }
    return true;
  });

  const newConstraints = page.constraints.filter(c => {
    return c.entityIds.every(id => {
      const isEntityDeleted = selection.has(id) || wallIdsDeleted.has(id);
      return !isEntityDeleted;
    });
  });

  updateActivePage(finalEntities, newConstraints);
  selectionSignal.value = new Set();
}
