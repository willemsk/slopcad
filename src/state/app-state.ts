import { signal, computed } from '@preact/signals';
import { Project, Page, Entity, Constraint, PointRef, Vec2, UnitSystem } from '../core/types';
import { HistoryManager } from '../core/history';
import { solveConstraints } from '../core/solver';
import { dist } from '../core/geometry';
import { Tool } from '../tools/tool';
import { generateId } from '../core/entity';

// Initial default page
const defaultPage: Page = {
  id: generateId(),
  name: 'Ground Floor',
  entities: [],
  constraints: [],
};

// Initial default project
const defaultProject: Project = {
  name: 'Architectural Plan',
  created: Date.now(),
  modified: Date.now(),
  unitSystem: 'metric',
  scale: 100, // 1:100
  pages: [defaultPage],
  activePageIndex: 0,
};

// Global signals
export const projectSignal = signal<Project>(defaultProject);
export const activeToolSignal = signal<Tool | null>(null);
export const selectionSignal = signal<Set<string>>(new Set());
export const viewportSignal = signal<any>(null); // Viewport instance
export const snapEnabledSignal = signal<boolean>(true);
export const gridEnabledSignal = signal<boolean>(true);
export const gridSpacingSignal = signal<number>(0.5); // 0.5 meters default grid spacing
export const previewEntitySignal = signal<Entity | null>(null);
export const hoveredEntityIdSignal = signal<string | null>(null);
export const triggerRenderSignal = signal<{}>({});
export const overlayPageIndexSignal = signal<number | null>(null);
export const mouseCoordsSignal = signal<Vec2>({ x: 0, y: 0 });
export const commandLineMessagesSignal = signal<string[]>([
  'Antigravity CAD Redesign Initialized.',
  'Select a tool from the ribbon or double-click to select entities.'
]);

export const uiScaleSignal = signal<number>(parseFloat(localStorage.getItem('uiScale') || '1'));

export function setUiScale(scale: number) {
  uiScaleSignal.value = scale;
  localStorage.setItem('uiScale', scale.toString());
}

export function pushCommandMessage(msg: string) {
  commandLineMessagesSignal.value = [...commandLineMessagesSignal.value.slice(-20), msg];
}

// History manager instance (per active page)
const historyManager = new HistoryManager();

// Computes the currently active page
export const activePageSignal = computed<Page>(() => {
  const proj = projectSignal.value;
  return proj.pages[proj.activePageIndex] || proj.pages[0];
});

// Snapshots the current page state to the history stack
export function snapshotState() {
  const page = activePageSignal.value;
  historyManager.pushState(page.entities, page.constraints);
}

// Global actions
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
  snapshotState(); // save history

  // Filter out deleted entities
  const newEntities = page.entities.filter((e) => !selection.has(e.id));

  // Filter out doors/windows attached to deleted walls
  const wallIdsDeleted = new Set(
    page.entities.filter((e) => selection.has(e.id) && e.type === 'wall').map((e) => e.id)
  );

  const finalEntities = newEntities.filter((e) => {
    if (e.type === 'door' || e.type === 'window') {
      return !wallIdsDeleted.has((e as any).wallId);
    }
    return true;
  });

  // Filter out constraints associated with deleted entities
  const newConstraints = page.constraints.filter((c) => {
    return c.entityIds.every((id) => {
      const isEntityDeleted = selection.has(id) || wallIdsDeleted.has(id);
      return !isEntityDeleted;
    });
  });

  updateActivePage(finalEntities, newConstraints);
  selectionSignal.value = new Set();
}

// Modify current page entities and constraints, then trigger solver
export function updateActivePage(entities: Entity[], constraints: Constraint[]) {
  const project = projectSignal.value;
  const newPages = [...project.pages];
  const idx = project.activePageIndex;

  newPages[idx] = {
    ...newPages[idx],
    entities,
    constraints,
  };

  projectSignal.value = {
    ...project,
    modified: Date.now(),
    pages: newPages,
  };

  triggerRenderSignal.value = {};
}

// Set active page selection
export function selectEntity(id: string, isMulti = false) {
  const current = selectionSignal.value;
  if (isMulti) {
    const next = new Set(current);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    selectionSignal.value = next;
  } else {
    selectionSignal.value = new Set([id]);
  }
}

export function clearSelection() {
  if (selectionSignal.value.size > 0) {
    selectionSignal.value = new Set();
  }
}

// Helper to run solver on active page
export function runSolverOnActivePage(pinnedRefs: PointRef[] = []) {
  const page = activePageSignal.value;
  const solved = solveConstraints(page.entities, page.constraints, pinnedRefs);
  updateActivePage(solved, page.constraints);
}

// Change project-wide setting
export function setUnitSystem(unit: UnitSystem) {
  projectSignal.value = {
    ...projectSignal.value,
    unitSystem: unit,
  };
  triggerRenderSignal.value = {};
}

// Constraint actions
export function addHorizontalConstraintAction() {
  const selection = selectionSignal.value;
  const page = activePageSignal.value;
  const selectedEntities = page.entities.filter((e) => selection.has(e.id));

  let added = false;
  const newConstraints = [...page.constraints];

  for (const ent of selectedEntities) {
    if (ent.type === 'wall' || ent.type === 'line') {
      const exists = newConstraints.some((c) => c.type === 'horizontal' && c.entityIds[0] === ent.id);
      if (!exists) {
        snapshotState();
        newConstraints.push({
          id: generateId(),
          type: 'horizontal',
          entityIds: [ent.id],
          pointRefs: [
            { entityId: ent.id, pointKey: 'start' },
            { entityId: ent.id, pointKey: 'end' },
          ],
        });
        added = true;
      }
    }
  }

  if (added) {
    const solved = solveConstraints(page.entities, newConstraints);
    updateActivePage(solved, newConstraints);
  }
}

export function addVerticalConstraintAction() {
  const selection = selectionSignal.value;
  const page = activePageSignal.value;
  const selectedEntities = page.entities.filter((e) => selection.has(e.id));

  let added = false;
  const newConstraints = [...page.constraints];

  for (const ent of selectedEntities) {
    if (ent.type === 'wall' || ent.type === 'line') {
      const exists = newConstraints.some((c) => c.type === 'vertical' && c.entityIds[0] === ent.id);
      if (!exists) {
        snapshotState();
        newConstraints.push({
          id: generateId(),
          type: 'vertical',
          entityIds: [ent.id],
          pointRefs: [
            { entityId: ent.id, pointKey: 'start' },
            { entityId: ent.id, pointKey: 'end' },
          ],
        });
        added = true;
      }
    }
  }

  if (added) {
    const solved = solveConstraints(page.entities, newConstraints);
    updateActivePage(solved, newConstraints);
  }
}

export function addLengthConstraintAction(targetVal?: number) {
  const selection = selectionSignal.value;
  const page = activePageSignal.value;
  const selectedEntities = page.entities.filter((e) => selection.has(e.id));

  const ent = selectedEntities[0];
  if (!ent || (ent.type !== 'wall' && ent.type !== 'line')) return;

  const currentLength = dist((ent as any).start, (ent as any).end);
  let val = targetVal;

  if (val === undefined) {
    const input = window.prompt(`Enter length in meters (current: ${currentLength.toFixed(2)}m):`, currentLength.toFixed(2));
    if (input === null) return;
    val = parseFloat(input);
  }

  if (isNaN(val) || val <= 0) return;

  snapshotState();
  const newConstraints = page.constraints.filter(
    (c) => !(c.type === 'fixed_length' && c.entityIds[0] === ent.id)
  );

  newConstraints.push({
    id: generateId(),
    type: 'fixed_length',
    entityIds: [ent.id],
    value: val,
    pointRefs: [
      { entityId: ent.id, pointKey: 'start' },
      { entityId: ent.id, pointKey: 'end' },
    ],
  });

  const solved = solveConstraints(page.entities, newConstraints);
  updateActivePage(solved, newConstraints);
}

export function addPerpendicularConstraintAction() {
  const selection = selectionSignal.value;
  const page = activePageSignal.value;
  const selectedEntities = page.entities.filter(
    (e) => selection.has(e.id) && (e.type === 'wall' || e.type === 'line')
  );

  if (selectedEntities.length !== 2) {
    window.alert('Please select exactly 2 walls/lines to make them perpendicular.');
    return;
  }

  snapshotState();
  const e1 = selectedEntities[0];
  const e2 = selectedEntities[1];

  const newConstraints = [...page.constraints];
  newConstraints.push({
    id: generateId(),
    type: 'perpendicular',
    entityIds: [e1.id, e2.id],
    pointRefs: [
      { entityId: e1.id, pointKey: 'start' },
      { entityId: e1.id, pointKey: 'end' },
      { entityId: e2.id, pointKey: 'start' },
      { entityId: e2.id, pointKey: 'end' },
    ],
  });

  const solved = solveConstraints(page.entities, newConstraints);
  updateActivePage(solved, newConstraints);
}

export function addParallelConstraintAction() {
  const selection = selectionSignal.value;
  const page = activePageSignal.value;
  const selectedEntities = page.entities.filter(
    (e) => selection.has(e.id) && (e.type === 'wall' || e.type === 'line')
  );

  if (selectedEntities.length !== 2) {
    window.alert('Please select exactly 2 walls/lines to make them parallel.');
    return;
  }

  snapshotState();
  const e1 = selectedEntities[0];
  const e2 = selectedEntities[1];

  const newConstraints = [...page.constraints];
  newConstraints.push({
    id: generateId(),
    type: 'parallel',
    entityIds: [e1.id, e2.id],
    pointRefs: [
      { entityId: e1.id, pointKey: 'start' },
      { entityId: e1.id, pointKey: 'end' },
      { entityId: e2.id, pointKey: 'start' },
      { entityId: e2.id, pointKey: 'end' },
    ],
  });

  const solved = solveConstraints(page.entities, newConstraints);
  updateActivePage(solved, newConstraints);
}

export function clearSelectedConstraintsAction() {
  const selection = selectionSignal.value;
  if (selection.size === 0) return;

  snapshotState();
  const page = activePageSignal.value;
  const newConstraints = page.constraints.filter((c) => {
    return !c.entityIds.some((id) => selection.has(id));
  });

  updateActivePage(page.entities, newConstraints);
}

