import { h } from 'preact';
import { useEffect } from 'preact/hooks';
import { Menubar } from './ui/menubar';
import { Toolbar } from './ui/toolbar';
import { CanvasComponent } from './canvas/canvas-component';
import { PropertiesPanel } from './ui/properties-panel';
import { CommandLine } from './ui/command-line';
import { PageTabs } from './ui/page-tabs';
import { StatusBar } from './ui/status-bar';
import { setActiveToolByName } from './tools/tool-registry';
import { uiScaleSignal } from './state/app-state';
import './app.css';

export function App() {
  useEffect(() => {
    setActiveToolByName('select');
  }, []);

  const uiScale = uiScaleSignal.value;

  return (
    <div className="app-shell">
      <div style={{ zoom: uiScale }}><Menubar /></div>
      <div style={{ zoom: uiScale }}><Toolbar /></div>
      <main className="app-main">
        <div className="canvas-area">
          <CanvasComponent />
        </div>
        <div style={{ zoom: uiScale, display: 'flex', height: '100%' }}>
          <PropertiesPanel />
        </div>
      </main>
      <div style={{ zoom: uiScale }}><CommandLine /></div>
      <div style={{ zoom: uiScale }}><PageTabs /></div>
      <div style={{ zoom: uiScale }}><StatusBar /></div>
    </div>
  );
}
