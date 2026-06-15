import {h} from 'preact';
import {useState, useRef, useEffect} from 'preact/hooks';
import {NewIcon, OpenIcon, SaveIcon, ExportIcon} from './icons';
import {
  handleNewProject,
  handleOpenProject,
  handleSaveProject,
  handleExportSVG,
} from './menu-actions';

export function FileMenu() {
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
    <div className="file-menu-container" ref={fileMenuRef}>
      <button
        className={`file-menu-btn ribbon-tab ${isFileMenuOpen ? 'active' : ''}`}
        onClick={() => setIsFileMenuOpen(!isFileMenuOpen)}
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
  );
}
