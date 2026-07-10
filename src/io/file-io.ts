import type {Project} from '../core/types';
import {projectSignal} from '../state/project-state';
import {selectionSignal} from '../state/selection-state';
import {triggerRenderSignal} from '../state/ui-state';
import {deserializeProject, serializeProject} from './serialize';

export function saveProjectToFile(project: Project) {
  const jsonStr = serializeProject(project);
  const blob = new Blob([jsonStr], {type: 'application/json'});
  const url = URL.createObjectURL(blob);

  const a = document.createElement('a');
  // Format filename cleanly
  const filename =
    project.name.trim().toLowerCase().replace(/\s+/g, '_') || 'plan';
  a.href = url;
  a.download = `${filename}.archplan`;
  a.click();

  // Clean up
  setTimeout(() => URL.revokeObjectURL(url), 100);
}

export function loadProjectFromFile(
  onSuccess?: () => void,
  onFailure?: (err: string) => void,
) {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = '.archplan,application/json';

  input.onchange = (e) => {
    const file = (e.target as HTMLInputElement).files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      const loadedProject = deserializeProject(text);

      if (loadedProject) {
        // Reset selection and load project
        selectionSignal.value = new Set();
        projectSignal.value = loadedProject;
        triggerRenderSignal.value = {};

        if (onSuccess) onSuccess();
      } else {
        if (onFailure)
          onFailure('Invalid project file format. Could not parse.');
      }
    };

    reader.onerror = () => {
      if (onFailure) onFailure('Error reading file.');
    };

    reader.readAsText(file);
  };

  input.click();
}
