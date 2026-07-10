import {h} from 'preact';
import {useState} from 'preact/hooks';
import {FilePanel} from './file-panel';
import {AnnotatePanel} from './toolbar/annotate-panel';
import {ConstraintsPanel} from './toolbar/constraints-panel';
import {HomePanel} from './toolbar/home-panel';
import {ViewPanel} from './toolbar/view-panel';
import './ribbon.css';

export function Toolbar() {
  const [activeTab, setActiveTab] = useState<
    'file' | 'home' | 'annotate' | 'view' | 'constraints'
  >('home');
  const [isRibbonCollapsed, setIsRibbonCollapsed] = useState(false);

  return (
    <div className="ribbon-container">
      {/* Ribbon Tabs */}
      <div className="ribbon-tabs">
        <button
          className={`ribbon-tab ${activeTab === 'file' ? 'active' : ''}`}
          onClick={() => setActiveTab('file')}
        >
          File
        </button>
        <button
          className={`ribbon-tab ${activeTab === 'home' ? 'active' : ''}`}
          onClick={() => setActiveTab('home')}
        >
          Home
        </button>
        <button
          className={`ribbon-tab ${activeTab === 'annotate' ? 'active' : ''}`}
          onClick={() => setActiveTab('annotate')}
        >
          Annotate
        </button>
        <button
          className={`ribbon-tab ${activeTab === 'constraints' ? 'active' : ''}`}
          onClick={() => setActiveTab('constraints')}
        >
          Parametric
        </button>
        <button
          className={`ribbon-tab ${activeTab === 'view' ? 'active' : ''}`}
          onClick={() => setActiveTab('view')}
        >
          View
        </button>
        <div style={{flex: 1}} />
        <button
          className="ribbon-collapse-toggle"
          onClick={() => setIsRibbonCollapsed(!isRibbonCollapsed)}
          title={isRibbonCollapsed ? 'Expand Ribbon' : 'Collapse Ribbon'}
          aria-label={isRibbonCollapsed ? 'Expand Ribbon' : 'Collapse Ribbon'}
          aria-expanded={!isRibbonCollapsed}
        >
          {isRibbonCollapsed ? '▼' : '▲'}
        </button>
      </div>

      {/* Ribbon Panels */}
      {!isRibbonCollapsed && (
        <div className="ribbon-content">
          {activeTab === 'file' && <FilePanel />}
          {activeTab === 'home' && <HomePanel />}
          {activeTab === 'annotate' && <AnnotatePanel />}
          {activeTab === 'constraints' && <ConstraintsPanel />}
          {activeTab === 'view' && <ViewPanel />}
        </div>
      )}
    </div>
  );
}
