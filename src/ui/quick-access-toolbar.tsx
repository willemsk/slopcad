import {h} from 'preact';
import {useState, useRef, useEffect} from 'preact/hooks';
import {projectSignal, selectionSignal} from '../state/app-state';
import {
  NewIcon,
  OpenIcon,
  SaveIcon,
  ExportIcon,
  UndoIcon,
  RedoIcon,
  DeleteIcon,
} from './icons';
import {
  handleNewProject,
  handleOpenProject,
  handleSaveProject,
  handleExportSVG,
  handleUndo,
  handleRedo,
  handleDelete,
} from './menu-actions';

export function QuickAccessToolbar() {
  const project = projectSignal.value;
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
    <div className="qat-group">
      <div className="file-menu-container" ref={fileMenuRef}>
        <button
          className={`file-menu-btn ${isFileMenuOpen ? 'active' : ''}`}
          onClick={() => setIsFileMenuOpen(!isFileMenuOpen)}
          aria-expanded={isFileMenuOpen}
          aria-haspopup="true"
        >
          File
        </button>
        {isFileMenuOpen && (
          <div className="file-dropdown-menu">
            <button
              className="file-menu-item"
              onClick={() => {
                setIsFileMenuOpen(false);
                handleNewProject();
              }}
            >
              <NewIcon /> <span style={{marginLeft: '8px'}}>New Plan</span>{' '}
              <span className="shortcut">Ctrl+N</span>
            </button>
            <button
              className="file-menu-item"
              onClick={() => {
                setIsFileMenuOpen(false);
                handleOpenProject();
              }}
            >
              <OpenIcon /> <span style={{marginLeft: '8px'}}>Open...</span>{' '}
              <span className="shortcut">Ctrl+O</span>
            </button>
            <button
              className="file-menu-item"
              onClick={() => {
                setIsFileMenuOpen(false);
                handleSaveProject();
              }}
            >
              <SaveIcon /> <span style={{marginLeft: '8px'}}>Save</span>{' '}
              <span className="shortcut">Ctrl+S</span>
            </button>
            <button
              className="file-menu-item"
              onClick={() => {
                setIsFileMenuOpen(false);
                handleExportSVG();
              }}
            >
              <ExportIcon /> <span style={{marginLeft: '8px'}}>Export SVG</span>
            </button>
          </div>
        )}
      </div>

      <div className="qat-separator" />

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

      <div className="qat-separator" />
      <div className="qat-title">{project.name || 'Untitled Plan'}</div>
    </div>
  );
}
