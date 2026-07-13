import {h} from 'preact';
import {ExportIcon, NewIcon, OpenIcon, SaveIcon} from './icons';
import {
  handleExportSVG,
  handleNewProject,
  handleOpenProject,
  handleSaveProject,
} from './menu-actions';

export function FilePanel() {
  return (
    <div className="ribbon-panel">
      <div className="ribbon-panel-body">
        <button
          className="ribbon-btn-large"
          onClick={handleNewProject}
          title="New Plan (Ctrl+N)"
          aria-keyshortcuts="Control+N"
        >
          <span className="ribbon-btn-large-icon">
            <NewIcon />
          </span>
          <span className="ribbon-btn-large-label">New</span>
        </button>
        <button
          className="ribbon-btn-large"
          onClick={handleOpenProject}
          title="Open Plan... (Ctrl+O)"
          aria-keyshortcuts="Control+O"
        >
          <span className="ribbon-btn-large-icon">
            <OpenIcon />
          </span>
          <span className="ribbon-btn-large-label">Open</span>
        </button>
        <button
          className="ribbon-btn-large"
          onClick={handleSaveProject}
          title="Save Plan (Ctrl+S)"
          aria-keyshortcuts="Control+S"
        >
          <span className="ribbon-btn-large-icon">
            <SaveIcon />
          </span>
          <span className="ribbon-btn-large-label">Save</span>
        </button>
        <button
          className="ribbon-btn-large"
          onClick={handleExportSVG}
          title="Export current floor layout to SVG"
        >
          <span className="ribbon-btn-large-icon">
            <ExportIcon />
          </span>
          <span className="ribbon-btn-large-label">Export SVG</span>
        </button>
      </div>
      <div className="ribbon-panel-title">Document</div>
    </div>
  );
}
