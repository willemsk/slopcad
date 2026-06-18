import {signal, computed, effect} from '@preact/signals';
import {
  Project,
  Page,
  Entity,
  Constraint,
  PointRef,
  UnitSystem,
  Layer,
} from '../core/types';
import {HistoryManager} from '../core/history';
import {generateId} from '../core/entity';
import {solveConstraints} from '../core/solver';
import {
  triggerRenderSignal,
  overlayPageIndexSignal,
  pushCommandMessage,
  requestPrompt,
} from './ui-state';
import {selectionSignal} from './selection-state';

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
