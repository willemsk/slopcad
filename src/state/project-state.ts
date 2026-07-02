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
import {generateId} from '../core/entity';
import {solveConstraints} from '../core/solver';
import {triggerRenderSignal} from './ui-state';

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

// Computes the currently active page
export const activePageSignal = computed<Page>(() => {
  const proj = projectSignal.value;
  return proj.pages[proj.activePageIndex] || proj.pages[0];
});

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

// Autosave Effect
let saveTimeout: ReturnType<typeof setTimeout>;
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
