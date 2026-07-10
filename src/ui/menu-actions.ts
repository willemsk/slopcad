import {generateId} from '../core/entity';
import {downloadSVGFile} from '../io/export-svg';
import {loadProjectFromFile, saveProjectToFile} from '../io/file-io';
import {
  deleteSelectedAction,
  redoAction,
  undoAction,
} from '../state/history-actions';
import {activePageSignal, projectSignal} from '../state/project-state';
import {selectionSignal} from '../state/selection-state';
import {pushCommandMessage, triggerRenderSignal} from '../state/ui-state';

export const handleNewProject = () => {
  if (
    window.confirm('Start a new project? Any unsaved changes will be lost.')
  ) {
    const defaultProject = {
      name: 'New Project',
      created: Date.now(),
      modified: Date.now(),
      unitSystem: 'metric' as const,
      scale: 50,
      layers: [
        {
          id: '0',
          name: 'Layer 0',
          color: '#ffffff',
          visible: true,
          locked: false,
        },
      ],
      activeLayerId: '0',
      pages: [
        {
          id: generateId(),
          name: 'Ground Floor',
          entities: [],
          constraints: [],
        },
      ],
      activePageIndex: 0,
    };
    projectSignal.value = defaultProject;
    selectionSignal.value = new Set();
    triggerRenderSignal.value = {};
    pushCommandMessage(
      'Command: NEW - Started new architectural drawing plan.',
    );
  }
};

export const handleOpenProject = () => {
  loadProjectFromFile();
  pushCommandMessage('Command: OPEN - Selected plan load requested.');
};

export const handleSaveProject = () => {
  saveProjectToFile(projectSignal.value);
  pushCommandMessage('Command: SAVE - Saving drawing plan state to file...');
};

export const handleExportSVG = () => {
  const page = activePageSignal.value;
  downloadSVGFile(page, projectSignal.value.unitSystem);
  pushCommandMessage(
    `Command: EXPORT - Exporting floor "${page.name}" as vector SVG.`,
  );
};

export const handleUndo = () => {
  undoAction();
  pushCommandMessage('Command: UNDO - Reverting last drawing operation.');
};

export const handleRedo = () => {
  redoAction();
  pushCommandMessage('Command: REDO - Redoing last drawing operation.');
};

export const handleDelete = () => {
  deleteSelectedAction();
  pushCommandMessage('Command: ERASE - Deleted selected drawing elements.');
};
