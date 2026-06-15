import {h} from 'preact';
import {QuickAccessToolbar} from './quick-access-toolbar';

export function Menubar() {
  return (
    <header className="menubar">
      <div className="qat-group">
        <span className="qat-logo">Antigravity CAD</span>
      </div>

      <QuickAccessToolbar />

      <div className="qat-group" style={{width: 80}} />
    </header>
  );
}
