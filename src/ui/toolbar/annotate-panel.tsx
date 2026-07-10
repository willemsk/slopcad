import {h} from 'preact';
import {activeToolNameSignal} from '../../state/ui-state';
import {DimensionIcon, TextIcon} from '../icons';
import {selectTool} from './helpers';

export function AnnotatePanel() {
  const activeToolName = activeToolNameSignal.value || 'select';

  return (
    <div className="ribbon-panel">
      <div className="ribbon-panel-body">
        <button
          className={`ribbon-btn-large ${activeToolName === 'dimension' ? 'active' : ''}`}
          onClick={() => selectTool('dimension')}
          title="Dimension (M)"
        >
          <span className="ribbon-btn-large-icon">
            <DimensionIcon />
          </span>
          <span className="ribbon-btn-large-label">Dimension</span>
        </button>
        <button
          className={`ribbon-btn-large ${activeToolName === 'text' ? 'active' : ''}`}
          onClick={() => selectTool('text')}
          title="Text (T)"
        >
          <span className="ribbon-btn-large-icon">
            <TextIcon />
          </span>
          <span className="ribbon-btn-large-label">Text</span>
        </button>
      </div>
      <div className="ribbon-panel-title">Annotation</div>
    </div>
  );
}
