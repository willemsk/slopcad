import {h} from 'preact';
import {ExportIcon, NewIcon, OpenIcon, SaveIcon} from './icons';
import {
  handleExportSVG,
  handleNewProject,
  handleOpenProject,
  handleSaveProject,
} from './menu-actions';
import {RibbonButton} from './ribbon-button';

export function FilePanel() {
  return (
    <div className="ribbon-panel">
      <div className="ribbon-panel-body">
        <RibbonButton
          onClick={handleNewProject}
          title="New Plan (Ctrl+N)"
          label="New"
          icon={<NewIcon />}
        />
        <RibbonButton
          onClick={handleOpenProject}
          title="Open Plan... (Ctrl+O)"
          label="Open"
          icon={<OpenIcon />}
        />
        <RibbonButton
          onClick={handleSaveProject}
          title="Save Plan (Ctrl+S)"
          label="Save"
          icon={<SaveIcon />}
        />
        <RibbonButton
          onClick={handleExportSVG}
          title="Export current floor layout to SVG"
          label="Export SVG"
          icon={<ExportIcon />}
        />
      </div>
      <div className="ribbon-panel-title">Document</div>
    </div>
  );
}
