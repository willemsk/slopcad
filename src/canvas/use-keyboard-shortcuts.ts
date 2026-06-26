import {RefObject} from 'preact';
import {useEffect} from 'preact/hooks';
import {Tool} from '../tools/tool';

declare global {
  interface Window {
    isSpacePressed?: boolean;
  }
}
import {
  undoAction,
  redoAction,
  deleteSelectedAction,
} from '../state/history-actions';
import {
  isLayerModalOpenSignal,
  pushCommandMessage,
  previewEntitySignal,
  triggerRenderSignal,
  activeToolNameSignal,
} from '../state/ui-state';
import {toolsMap} from '../tools/tool-registry';

/**
 * Hook to manage global keydown and keyup shortcut listeners.
 */
export function useKeyboardShortcuts(
  activeTool: Tool | undefined,
  draw: () => void,
  canvasRef: RefObject<HTMLCanvasElement>,
  isPanningRef: RefObject<boolean>,
) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        document.activeElement?.tagName === 'INPUT' ||
        document.activeElement?.tagName === 'TEXTAREA' ||
        document.activeElement?.getAttribute('contenteditable') === 'true' ||
        isLayerModalOpenSignal.value
      ) {
        return;
      }

      if (e.code === 'Space') {
        e.preventDefault();

        window.isSpacePressed = true;
        if (canvasRef.current && !isPanningRef.current) {
          canvasRef.current.style.cursor = 'grab';
        }
      }

      // Undo: Ctrl+Z
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') {
        e.preventDefault();
        undoAction();
        pushCommandMessage('Command: UNDO - Reverted last drawing operation.');
      }

      // Redo: Ctrl+Y
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'y') {
        e.preventDefault();
        redoAction();
        pushCommandMessage('Command: REDO - Redoing last drawing operation.');
      }

      // Delete key deletes selection
      if (e.key === 'Delete' || e.key === 'Backspace') {
        e.preventDefault();
        deleteSelectedAction();
        pushCommandMessage(
          'Command: ERASE - Deleted selected drawing elements.',
        );
      }

      // Escape cancels current tool operations or sets active tool to select
      if (e.key === 'Escape') {
        pushCommandMessage('Command: *Cancel*');
        const activeToolObj = toolsMap[activeToolNameSignal.value];
        if (activeToolObj) {
          activeToolObj.deactivate();
          activeToolObj.activate();
          previewEntitySignal.value = null;
          triggerRenderSignal.value = {};
        }
      }

      // Route to active tool
      if (activeTool && activeTool.onKeyDown) {
        activeTool.onKeyDown(e);
        draw();
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        window.isSpacePressed = false;
        if (canvasRef.current) {
          canvasRef.current.style.cursor = 'default';
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [activeTool, draw, canvasRef, isPanningRef]);
}
