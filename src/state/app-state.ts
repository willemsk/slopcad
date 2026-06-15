import {signal, computed, effect} from '@preact/signals';
import {
  Project,
  Page,
  Entity,
  Constraint,
  PointRef,
  Vec2,
  UnitSystem,
  Layer,
} from '../core/types';
import {HistoryManager} from '../core/history';
import {solveConstraints} from '../core/solver';
import {dist} from '../core/geometry';
import {Tool} from '../tools/tool';
import {generateId} from '../core/entity';

// Initial default page
const defaultPage: Page = {
  id: generateId(),
  name: 'Ground Floor',
  entities: [],
  constraints: [],
};

// Initial default layer
const defaultLayer: Layer = {
  id: '0',
  name: '0',
  color: '#ffffff',
  visible: true,
  locked: false,
};

// Initial default project
const defaultProject: Project = {
  name: 'Architectural Plan',
  created: Date.now(),
  modified: Date.now(),
  unitSystem: 'metric',
  scale: 100, // 1:100
  layers: [defaultLayer],
  activeLayerId: '0',
  pages: [defaultPage],
  activePageIndex: 0,
};

// Global signals
let initialProject = defaultProject;
const saved = localStorage.getItem('antigravity_project');
if (saved) {
  try {
    initialProject = JSON.parse(saved);
    // Backward compatibility for old saves
    if (!initialProject.layers) {
      initialProject.layers = [
        {
          id: '0',
          name: '0',
          color: '#ffffff',
          visible: true,
          locked: false,
        },
      ];
    }
    if (!initialProject.activeLayerId) {
      initialProject.activeLayerId = '0';
    }
  } catch (e) {
    console.error('Failed to parse saved project', e);
  }
}

export const projectSignal = signal<Project>(initialProject);
export const activeToolSignal = signal<Tool | null>(null);
export const selectionSignal = signal<Set<string>>(new Set());
export const viewportSignal = signal<any>(null); // Viewport instance
export const snapEnabledSignal = signal<boolean>(true);
export const gridEnabledSignal = signal<boolean>(true);
export const showConstraintsSignal = signal<boolean>(true);
export const gridSpacingSignal = signal<number>(0.5); // 0.5 meters default grid spacing
export const previewEntitySignal = signal<Entity | null>(null);
export const hoveredEntityIdSignal = signal<string | null>(null);
export const triggerRenderSignal = signal<{}>({});
export const overlayPageIndexSignal = signal<number | null>(null);
export const mouseCoordsSignal = signal<Vec2>({x: 0, y: 0});

export interface UIPrompt {
  message: string;
  initialValue: string;
  position?: Vec2;
  resolve: (value: string | null) => void;
}
export const activePromptSignal = signal<UIPrompt | null>(null);

export function requestPrompt(
  message: string,
  initialValue: string,
  position?: Vec2,
): Promise<string | null> {
  return new Promise(resolve => {
    activePromptSignal.value = {
      message,
      initialValue,
      position,
      resolve: val => {
        activePromptSignal.value = null;
        resolve(val);
      },
    };
  });
}

export const commandLineMessagesSignal = signal<string[]>([
  'Antigravity CAD Redesign Initialized.',
  'Select a tool from the ribbon or double-click to select entities.',
]);

export const isPropertiesPanelOpenSignal = signal<boolean>(true);
export const isRibbonCollapsedSignal = signal<boolean>(false);
export const isLayerModalOpenSignal = signal<boolean>(false);

export const uiScaleSignal = signal<number>(
  parseFloat(localStorage.getItem('uiScale') || '1'),
);

export function setUiScale(scale: number) {
  uiScaleSignal.value = scale;
  localStorage.setItem('uiScale', scale.toString());
}

export function pushCommandMessage(msg: string) {
  commandLineMessagesSignal.value = [
    ...commandLineMessagesSignal.value.slice(-20),
    msg,
  ];
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
  const newEntities = page.entities.filter(e => !selection.has(e.id));

  // Filter out doors/windows attached to deleted walls
  const wallIdsDeleted = new Set(
    page.entities
      .filter(e => selection.has(e.id) && e.type === 'wall')
      .map(e => e.id),
  );

  const finalEntities = newEntities.filter(e => {
    if (e.type === 'door' || e.type === 'window') {
      return !wallIdsDeleted.has((e as any).wallId);
    }
    return true;
  });

  // Filter out constraints associated with deleted entities
  const newConstraints = page.constraints.filter(c => {
    return c.entityIds.every(id => {
      const isEntityDeleted = selection.has(id) || wallIdsDeleted.has(id);
      return !isEntityDeleted;
    });
  });

  updateActivePage(finalEntities, newConstraints);
  selectionSignal.value = new Set();
}

// Modify current page entities and constraints, then trigger solver
export function updateActivePage(
  entities: Entity[],
  constraints: Constraint[],
) {
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

// Page actions
export function selectPageAction(index: number) {
  const project = projectSignal.value;
  projectSignal.value = {...project, activePageIndex: index};
  selectionSignal.value = new Set();
  triggerRenderSignal.value = {};
  const pageName = project.pages[index].name;
  pushCommandMessage(
    `Command: LAYOUT - Switched to floor layout "${pageName}".`,
  );
}

export async function addPageAction() {
  const project = projectSignal.value;
  const defaultName = `Floor ${project.pages.length}`;
  const name = await requestPrompt('Floor name:', defaultName);
  if (name === null) return;
  const cleanName = name.trim() || defaultName;
  const newPage = {
    id: generateId(),
    name: cleanName,
    entities: [],
    constraints: [],
  };
  const newPages = [...project.pages, newPage];
  projectSignal.value = {
    ...project,
    pages: newPages,
    activePageIndex: newPages.length - 1,
  };
  selectionSignal.value = new Set();
  triggerRenderSignal.value = {};
  pushCommandMessage(
    `Command: LAYOUTNEW - Floor layout "${cleanName}" created.`,
  );
}

export async function renamePageAction(index: number) {
  const project = projectSignal.value;
  const page = project.pages[index];
  const name = await requestPrompt(`Rename floor "${page.name}":`, page.name);
  if (name === null) return;
  const cleanName = name.trim();
  if (!cleanName) return;
  const oldName = page.name;
  const newPages = [...project.pages];
  newPages[index] = {...newPages[index], name: cleanName};
  projectSignal.value = {...project, pages: newPages};
  triggerRenderSignal.value = {};
  pushCommandMessage(
    `Command: RENAME - Floor "${oldName}" renamed to "${cleanName}".`,
  );
}

export function deletePageAction(index: number) {
  const project = projectSignal.value;
  if (project.pages.length <= 1) {
    window.alert('Cannot delete the last remaining floor.');
    return;
  }
  const page = project.pages[index];
  if (
    window.confirm(`Delete floor "${page.name}"? This action cannot be undone.`)
  ) {
    const newPages = project.pages.filter((_, i) => i !== index);
    let newActiveIndex = project.activePageIndex;
    if (newActiveIndex >= newPages.length) newActiveIndex = newPages.length - 1;
    projectSignal.value = {
      ...project,
      pages: newPages,
      activePageIndex: newActiveIndex,
    };
    selectionSignal.value = new Set();
    if (overlayPageIndexSignal.value === index) {
      overlayPageIndexSignal.value = null;
    } else if (
      overlayPageIndexSignal.value !== null &&
      overlayPageIndexSignal.value > index
    ) {
      overlayPageIndexSignal.value -= 1;
    }
    triggerRenderSignal.value = {};
    pushCommandMessage(`Command: LAYOUTDEL - Floor "${page.name}" deleted.`);
  }
}

export function setOverlayPageAction(val: string) {
  const project = projectSignal.value;
  if (val === 'none') {
    overlayPageIndexSignal.value = null;
    pushCommandMessage('Command: OVERLAY - Ghost overlay disabled.');
  } else {
    overlayPageIndexSignal.value = parseInt(val, 10);
    const name = project.pages[parseInt(val, 10)].name;
    pushCommandMessage(
      `Command: OVERLAY - Displaying "${name}" as background overlay.`,
    );
  }
  triggerRenderSignal.value = {};
}

// Layer actions
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
  const newLayers = project.layers.map(layer =>
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

  const newLayers = project.layers.filter(layer => layer.id !== id);
  let newActiveLayerId = project.activeLayerId;
  if (newActiveLayerId === id) {
    newActiveLayerId = '0';
  }

  // Update entities to fallback layer '0'
  const newPages = project.pages.map(page => ({
    ...page,
    entities: page.entities.map(e =>
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
  if (project.layers.some(l => l.id === id)) {
    projectSignal.value = {
      ...project,
      activeLayerId: id,
    };
  }
}

// Constraint actions
export function addHorizontalConstraintAction() {
  const selection = selectionSignal.value;
  const page = activePageSignal.value;
  const selectedEntities = page.entities.filter(e => selection.has(e.id));

  let added = false;
  const newConstraints = [...page.constraints];

  for (const ent of selectedEntities) {
    if (ent.type === 'wall' || ent.type === 'line') {
      const exists = newConstraints.some(
        c => c.type === 'horizontal' && c.entityIds[0] === ent.id,
      );
      if (!exists) {
        snapshotState();
        newConstraints.push({
          id: generateId(),
          type: 'horizontal',
          entityIds: [ent.id],
          pointRefs: [
            {entityId: ent.id, pointKey: 'start'},
            {entityId: ent.id, pointKey: 'end'},
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
  const selectedEntities = page.entities.filter(e => selection.has(e.id));

  let added = false;
  const newConstraints = [...page.constraints];

  for (const ent of selectedEntities) {
    if (ent.type === 'wall' || ent.type === 'line') {
      const exists = newConstraints.some(
        c => c.type === 'vertical' && c.entityIds[0] === ent.id,
      );
      if (!exists) {
        snapshotState();
        newConstraints.push({
          id: generateId(),
          type: 'vertical',
          entityIds: [ent.id],
          pointRefs: [
            {entityId: ent.id, pointKey: 'start'},
            {entityId: ent.id, pointKey: 'end'},
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

export async function addLengthConstraintAction(targetVal?: number) {
  const selection = selectionSignal.value;
  const page = activePageSignal.value;
  const selectedEntities = page.entities.filter(e => selection.has(e.id));

  const ent = selectedEntities[0];
  if (!ent || (ent.type !== 'wall' && ent.type !== 'line')) return;

  const currentLength = dist((ent as any).start, (ent as any).end);
  let val = targetVal;

  if (val === undefined) {
    let screenPos: Vec2 | undefined;
    if (viewportSignal.value) {
      const midX = ((ent as any).start.x + (ent as any).end.x) / 2;
      const midY = ((ent as any).start.y + (ent as any).end.y) / 2;
      screenPos = viewportSignal.value.worldToScreen({x: midX, y: midY});
    }

    const input = await requestPrompt(
      'Length in meters:',
      currentLength.toFixed(2),
      screenPos,
    );
    if (input === null) return;
    val = parseFloat(input);
  }

  if (isNaN(val) || val <= 0) return;

  snapshotState();
  const newConstraints = page.constraints.filter(
    c => !(c.type === 'fixed_length' && c.entityIds[0] === ent.id),
  );

  newConstraints.push({
    id: generateId(),
    type: 'fixed_length',
    entityIds: [ent.id],
    value: val,
    pointRefs: [
      {entityId: ent.id, pointKey: 'start'},
      {entityId: ent.id, pointKey: 'end'},
    ],
  });

  const solved = solveConstraints(page.entities, newConstraints);
  updateActivePage(solved, newConstraints);
}

export function addPerpendicularConstraintAction() {
  const selection = selectionSignal.value;
  const page = activePageSignal.value;
  const selectedEntities = page.entities.filter(
    e => selection.has(e.id) && (e.type === 'wall' || e.type === 'line'),
  );

  if (selectedEntities.length !== 2) {
    window.alert(
      'Please select exactly 2 walls/lines to make them perpendicular.',
    );
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
      {entityId: e1.id, pointKey: 'start'},
      {entityId: e1.id, pointKey: 'end'},
      {entityId: e2.id, pointKey: 'start'},
      {entityId: e2.id, pointKey: 'end'},
    ],
  });

  const solved = solveConstraints(page.entities, newConstraints);
  updateActivePage(solved, newConstraints);
}

export function addParallelConstraintAction() {
  const selection = selectionSignal.value;
  const page = activePageSignal.value;
  const selectedEntities = page.entities.filter(
    e => selection.has(e.id) && (e.type === 'wall' || e.type === 'line'),
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
      {entityId: e1.id, pointKey: 'start'},
      {entityId: e1.id, pointKey: 'end'},
      {entityId: e2.id, pointKey: 'start'},
      {entityId: e2.id, pointKey: 'end'},
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
  const newConstraints = page.constraints.filter(c => {
    return !c.entityIds.some(id => selection.has(id));
  });

  updateActivePage(page.entities, newConstraints);
}

export function addCoincidentConstraintAction() {
  const selection = selectionSignal.value;
  const page = activePageSignal.value;
  const selectedEntities = page.entities.filter(
    e =>
      selection.has(e.id) &&
      (e.type === 'wall' || e.type === 'line' || e.type === 'arc'),
  );

  if (selectedEntities.length !== 2) {
    window.alert('Please select exactly 2 entities for coincident constraint.');
    return;
  }

  snapshotState();
  const e1 = selectedEntities[0] as any;
  const e2 = selectedEntities[1] as any;

  // For arcs/lines, check start and end
  const getPts = (e: any) => {
    const pts = [];
    if (e.start) pts.push({key: 'start', pt: e.start});
    if (e.end) pts.push({key: 'end', pt: e.end});
    if (e.p1) pts.push({key: 'p1', pt: e.p1});
    if (e.p2) pts.push({key: 'p2', pt: e.p2});
    return pts;
  };

  const points1 = getPts(e1);
  const points2 = getPts(e2);

  let best = {p1: points1[0], p2: points2[0], d: Infinity};
  for (const p1 of points1) {
    for (const p2 of points2) {
      const d = dist(p1.pt, p2.pt);
      if (d < best.d) {
        best = {p1, p2, d};
      }
    }
  }

  if (!best.p1 || !best.p2) return;

  const newConstraints = [...page.constraints];
  newConstraints.push({
    id: generateId(),
    type: 'coincident',
    entityIds: [e1.id, e2.id],
    pointRefs: [
      {entityId: e1.id, pointKey: best.p1.key as any},
      {entityId: e2.id, pointKey: best.p2.key as any},
    ],
  });

  const solved = solveConstraints(page.entities, newConstraints);
  updateActivePage(solved, newConstraints);
}

export function addCollinearConstraintAction() {
  const selection = selectionSignal.value;
  const page = activePageSignal.value;
  const selectedEntities = page.entities.filter(
    e => selection.has(e.id) && (e.type === 'wall' || e.type === 'line'),
  );

  if (selectedEntities.length !== 2) {
    window.alert('Please select exactly 2 walls/lines to make them collinear.');
    return;
  }

  snapshotState();
  const e1 = selectedEntities[0];
  const e2 = selectedEntities[1];

  const newConstraints = [...page.constraints];
  newConstraints.push({
    id: generateId(),
    type: 'collinear',
    entityIds: [e1.id, e2.id],
    pointRefs: [
      {entityId: e1.id, pointKey: 'start'},
      {entityId: e1.id, pointKey: 'end'},
      {entityId: e2.id, pointKey: 'start'},
      {entityId: e2.id, pointKey: 'end'},
    ],
  });

  const solved = solveConstraints(page.entities, newConstraints);
  updateActivePage(solved, newConstraints);
}

export function addConcentricConstraintAction() {
  const selection = selectionSignal.value;
  const page = activePageSignal.value;
  const selectedEntities = page.entities.filter(
    e => selection.has(e.id) && (e.type === 'circle' || e.type === 'arc'),
  );

  if (selectedEntities.length !== 2) {
    window.alert(
      'Please select exactly 2 circles/arcs to make them concentric.',
    );
    return;
  }

  snapshotState();
  const e1 = selectedEntities[0];
  const e2 = selectedEntities[1];

  const newConstraints = [...page.constraints];
  newConstraints.push({
    id: generateId(),
    type: 'concentric',
    entityIds: [e1.id, e2.id],
    pointRefs: [
      {entityId: e1.id, pointKey: 'center'},
      {entityId: e2.id, pointKey: 'center'},
    ],
  });

  const solved = solveConstraints(page.entities, newConstraints);
  updateActivePage(solved, newConstraints);
}

export function addEqualLengthConstraintAction() {
  const selection = selectionSignal.value;
  const page = activePageSignal.value;
  const selectedEntities = page.entities.filter(
    e => selection.has(e.id) && (e.type === 'wall' || e.type === 'line'),
  );

  if (selectedEntities.length !== 2) {
    window.alert(
      'Please select exactly 2 walls/lines to make them equal length.',
    );
    return;
  }

  snapshotState();
  const e1 = selectedEntities[0];
  const e2 = selectedEntities[1];

  const newConstraints = [...page.constraints];
  newConstraints.push({
    id: generateId(),
    type: 'equal_length',
    entityIds: [e1.id, e2.id],
    pointRefs: [
      {entityId: e1.id, pointKey: 'start'},
      {entityId: e1.id, pointKey: 'end'},
      {entityId: e2.id, pointKey: 'start'},
      {entityId: e2.id, pointKey: 'end'},
    ],
  });

  const solved = solveConstraints(page.entities, newConstraints);
  updateActivePage(solved, newConstraints);
}

export async function addFixedAngleConstraintAction() {
  const selection = selectionSignal.value;
  const page = activePageSignal.value;
  const selectedEntities = page.entities.filter(
    e => selection.has(e.id) && (e.type === 'wall' || e.type === 'line'),
  );

  if (selectedEntities.length !== 1) {
    window.alert('Please select exactly 1 wall/line to fix its angle.');
    return;
  }

  const ent = selectedEntities[0] as any;
  const currentAngleRad = Math.atan2(
    ent.end.y - ent.start.y,
    ent.end.x - ent.start.x,
  );
  const currentAngleDeg = (currentAngleRad * 180) / Math.PI;

  let screenPos: Vec2 | undefined;
  if (viewportSignal.value) {
    const midX = (ent.start.x + ent.end.x) / 2;
    const midY = (ent.start.y + ent.end.y) / 2;
    screenPos = viewportSignal.value.worldToScreen({x: midX, y: midY});
  }

  const input = await requestPrompt(
    'Angle (degrees):',
    currentAngleDeg.toFixed(2),
    screenPos,
  );
  if (input === null) return;
  const val = parseFloat(input);
  if (isNaN(val)) return;

  snapshotState();
  const newConstraints = page.constraints.filter(
    c => !(c.type === 'fixed_angle' && c.entityIds[0] === ent.id),
  );

  newConstraints.push({
    id: generateId(),
    type: 'fixed_angle',
    entityIds: [ent.id],
    value: val,
    pointRefs: [
      {entityId: ent.id, pointKey: 'start'},
      {entityId: ent.id, pointKey: 'end'},
    ],
  });

  const solved = solveConstraints(page.entities, newConstraints);
  updateActivePage(solved, newConstraints);
}

// Autosave Effect
let saveTimeout: any;
effect(() => {
  const project = projectSignal.value;
  clearTimeout(saveTimeout);
  saveTimeout = setTimeout(() => {
    try {
      localStorage.setItem('antigravity_project', JSON.stringify(project));
    } catch (e) {
      console.warn('Failed to autosave project to localStorage', e);
    }
  }, 1500); // 1.5s debounce
});
