import {h} from 'preact';
import {useState, useRef, useEffect} from 'preact/hooks';
import {
  projectSignal,
  activePageSignal,
  selectionSignal,
  undoAction,
  redoAction,
  deleteSelectedAction,
  pushCommandMessage,
  triggerRenderSignal,
} from '../state/app-state';
import {saveProjectToFile, loadProjectFromFile} from '../io/file-io';
import {downloadSVGFile} from '../io/export-svg';
import {generateId} from '../core/entity';
import {
  NewIcon,
  OpenIcon,
  SaveIcon,
  ExportIcon,
  UndoIcon,
  RedoIcon,
  DeleteIcon,
} from './icons';

export function Menubar() {
  const project = projectSignal.value;
  const page = activePageSignal.value;
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

  const handleNewProject = () => {
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

  const handleOpenProject = () => {
    loadProjectFromFile();
    pushCommandMessage('Command: OPEN - Selected plan load requested.');
  };

  const handleSaveProject = () => {
    saveProjectToFile(projectSignal.value);
    pushCommandMessage('Command: SAVE - Saving drawing plan state to file...');
  };

  const handleExportSVG = () => {
    downloadSVGFile(activePageSignal.value, projectSignal.value.unitSystem);
    pushCommandMessage(
      `Command: EXPORT - Exporting floor "${page.name}" as vector SVG.`,
    );
  };

  const handleUndo = () => {
    undoAction();
    pushCommandMessage('Command: UNDO - Reverting last drawing operation.');
  };

  const handleRedo = () => {
    redoAction();
    pushCommandMessage('Command: REDO - Redoing last drawing operation.');
  };

  const handleDelete = () => {
    deleteSelectedAction();
    pushCommandMessage('Command: ERASE - Deleted selected drawing elements.');
  };

  return (
    <header className="menubar">
      <div className="qat-group">
        <span className="qat-logo">Antigravity CAD</span>

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
                <ExportIcon />{' '}
                <span style={{marginLeft: '8px'}}>Export SVG</span>
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
      </div>

      <div className="qat-title">{project.name || 'Untitled Plan'}</div>

      <div className="qat-group" style={{width: 80}} />
    </header>
  );
}
