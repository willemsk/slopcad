import {h} from 'preact';
import {projectSignal} from '../state/project-state';
import {QuickAccessToolbar} from './quick-access-toolbar';

export function Menubar() {
  const project = projectSignal.value;

  return (
    <header className="menubar">
      <div className="qat-group">
        <span className="qat-logo">SlopCAD</span>

        <div className="qat-separator" />
        <QuickAccessToolbar />
      </div>

      <div className="qat-title">{project.name || 'Untitled Plan'}</div>

      <div className="qat-group" style={{width: 80}} />
    </header>
  );
}
