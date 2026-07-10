import {deleteSelectedAction} from '../state/history-actions';
import {pushCommandMessage} from '../state/ui-state';
import {setActiveToolByName} from './tool-registry';

const commandAliases: Record<string, string> = {
  // Tools
  L: 'line',
  LINE: 'line',
  W: 'wall',
  WALL: 'wall',
  C: 'circle',
  CIRCLE: 'circle',
  R: 'rect',
  REC: 'rect',
  RECT: 'rect',
  D: 'dimension',
  DIM: 'dimension',
  T: 'text',
  TEXT: 'text',
  S: 'select',
  SEL: 'select',
  SELECT: 'select',

  // Actions
  E: 'erase',
  ERASE: 'erase',
  DEL: 'erase',
  DELETE: 'erase',
};

export function dispatchCommand(input: string) {
  const cleanInput = input.trim().toUpperCase();
  if (!cleanInput) return;

  const resolved = commandAliases[cleanInput];

  if (resolved === 'erase') {
    deleteSelectedAction();
  } else if (resolved) {
    setActiveToolByName(resolved);
    pushCommandMessage(
      `Command: ${cleanInput} -> Switched to ${resolved} tool.`,
    );
  } else {
    pushCommandMessage(`Command: ${cleanInput} -> Unknown command.`);
  }
}
