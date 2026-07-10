import {h} from 'preact';
import {activeToolNameSignal} from '../../state/ui-state';
import {DimensionIcon, TextIcon} from '../icons';
import {RibbonButton} from '../ribbon-button';
import {selectTool} from './helpers';

export function AnnotatePanel() {
  const activeToolName = activeToolNameSignal.value || 'select';

  return (
    <div className="ribbon-panel">
      <div className="ribbon-panel-body">
        <RibbonButton
          active={activeToolName === 'dimension'}
          onClick={() => selectTool('dimension')}
          title="Dimension (M)"
          label="Dimension"
          icon={<DimensionIcon />}
        />
        <RibbonButton
          active={activeToolName === 'text'}
          onClick={() => selectTool('text')}
          title="Text (T)"
          label="Text"
          icon={<TextIcon />}
        />
      </div>
      <div className="ribbon-panel-title">Annotation</div>
    </div>
  );
}
