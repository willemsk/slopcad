import {generateId} from '../core/entity';
import {projectSignal} from './project-state';
import {selectionSignal} from './selection-state';
import {
  overlayPageIndexSignal,
  pushCommandMessage,
  requestPrompt,
  triggerRenderSignal,
} from './ui-state';

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
    overlayPageIndexSignal.value = Number.parseInt(val, 10);
    const name = project.pages[Number.parseInt(val, 10)].name;
    pushCommandMessage(
      `Command: OVERLAY - Displaying "${name}" as background overlay.`,
    );
  }
  triggerRenderSignal.value = {};
}
