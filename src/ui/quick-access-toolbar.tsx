import {h} from 'preact';
import {useEffect, useRef, useState} from 'preact/hooks';
import {projectSignal} from '../state/project-state';
import {selectionSignal} from '../state/selection-state';
import {
  DeleteIcon,
  ExportIcon,
  NewIcon,
  OpenIcon,
  RedoIcon,
  SaveIcon,
  UndoIcon,
} from './icons';
import {
  handleDelete,
  handleExportSVG,
  handleNewProject,
  handleOpenProject,
  handleRedo,
  handleSaveProject,
  handleUndo,
} from './menu-actions';

export function QuickAccessToolbar() {
  const hasSelection = selectionSignal.value.size > 0;
  const [isFileMenuOpen, setIsFileMenuOpen] = useState(false);
  const fileMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        fileMenuRef.current &&
        !fileMenuRef.current.contains(e.target as Node)
      ) {
        setIsFileMenuOpen(false);
      }
    };
    if (isFileMenuOpen) {
      window.addEventListener('mousedown', handleClickOutside);
    }
    return () => window.removeEventListener('mousedown', handleClickOutside);
  }, [isFileMenuOpen]);

  return (
    <>
      <button
        className="qat-btn"
        onClick={handleNewProject}
        title="New Plan (Ctrl+N)"
        aria-label="New Plan"
      >
        <NewIcon />
      </button>
      <button
        className="qat-btn"
        onClick={handleOpenProject}
        title="Open Plan... (Ctrl+O)"
        aria-label="Open Plan"
      >
        <OpenIcon />
      </button>
      <button
        className="qat-btn"
        onClick={handleSaveProject}
        title="Save Plan (Ctrl+S)"
        aria-label="Save Plan"
      >
        <SaveIcon />
      </button>
      <button
        className="qat-btn"
        onClick={handleExportSVG}
        title="Export current floor layout to SVG"
        aria-label="Export SVG"
      >
        <ExportIcon />
      </button>

      <div className="qat-separator" />

      <button
        className="qat-btn"
        onClick={handleUndo}
        title="Undo last change (Ctrl+Z)"
        aria-label="Undo"
      >
        <UndoIcon />
      </button>
      <button
        className="qat-btn"
        onClick={handleRedo}
        title="Redo last change (Ctrl+Y)"
        aria-label="Redo"
      >
        <RedoIcon />
      </button>
      <button
        className="qat-btn"
        onClick={handleDelete}
        disabled={!hasSelection}
        title="Delete selected (Del)"
        aria-label="Delete selected"
      >
        <DeleteIcon />
      </button>
    </>
  );
}
