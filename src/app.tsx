import {h} from 'preact';
import {useEffect} from 'preact/hooks';
import {Menubar} from './ui/menubar';
import {Toolbar} from './ui/toolbar';
import {CanvasComponent} from './canvas/canvas-component';
import {PropertiesPanel} from './ui/properties/PropertiesPanel';
import {CommandLine} from './ui/command-line';
import {PageTabs} from './ui/page-tabs';
import {StatusBar} from './ui/status-bar';
import {UcsIcon} from './ui/ucs-icon';
import {NavigationBar} from './ui/navigation-bar';
import {setActiveToolByName} from './tools/tool-registry';
import {
  uiScaleSignal,
  isPropertiesPanelOpenSignal,
  clearSelection,
  deleteSelectedAction,
  activePromptSignal,
  isLayerModalOpenSignal,
} from './state/app-state';
import {DynamicPrompt} from './ui/dynamic-prompt';
import {LayerModal} from './ui/layer-modal';
import './app.css';

export function App() {
  useEffect(() => {
    setActiveToolByName('select');

    const handleGlobalShortcuts = (e: KeyboardEvent) => {
      // Ignore if user is typing in an input/textarea
      const target = e.target as HTMLElement;
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable ||
        activePromptSignal.value !== null ||
        isLayerModalOpenSignal.value
      ) {
        return;
      }

      if (e.key === 'Escape') {
        setActiveToolByName('select');
        clearSelection();
      } else if (e.key === 'Delete' || e.key === 'Backspace') {
        deleteSelectedAction();
      }
    };

    window.addEventListener('keydown', handleGlobalShortcuts);
    return () => window.removeEventListener('keydown', handleGlobalShortcuts);
  }, []);

  const uiScale = uiScaleSignal.value;
  const isPropertiesPanelOpen = isPropertiesPanelOpenSignal.value;

  return (
    <div className="app-shell">
      <div style={{zoom: uiScale}}>
        <Menubar />
      </div>
      <div style={{zoom: uiScale}}>
        <Toolbar />
      </div>
      <main className="app-main">
        <div className="canvas-area">
          <CanvasComponent />
          <div style={{zoom: uiScale}}>
            <UcsIcon />
            <NavigationBar />
          </div>
          <div className="floating-command-line" style={{zoom: uiScale}}>
            <CommandLine />
          </div>
        </div>
        <div
          className={`properties-sidebar ${isPropertiesPanelOpen ? 'open' : 'collapsed'}`}
          style={{zoom: uiScale}}
        >
          <PropertiesPanel />
        </div>
      </main>
      <div style={{zoom: uiScale}}>
        <PageTabs />
      </div>
      <div style={{zoom: uiScale}}>
        <StatusBar />
      </div>
      <DynamicPrompt />
      <div style={{zoom: uiScale}}>
        <LayerModal />
      </div>
    </div>
  );
}
