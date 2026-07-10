import {h} from 'preact';
import {setActiveLayerAction} from '../../state/layer-actions';
import {projectSignal} from '../../state/project-state';
import {
  activeToolNameSignal,
  isLayerModalOpenSignal,
} from '../../state/ui-state';
import {
  CircleIcon,
  DoorIcon,
  LineIcon,
  RectIcon,
  SelectIcon,
  StairsIcon,
  WallIcon,
  WindowIcon,
} from '../icons';
import {RibbonButton} from '../ribbon-button';
import {selectTool} from './helpers';

export function HomePanel() {
  const activeToolName = activeToolNameSignal.value || 'select';

  return (
    <>
      {/* Draw Panel */}
      <div className="ribbon-panel">
        <div className="ribbon-panel-body">
          <RibbonButton
            active={activeToolName === 'select'}
            onClick={() => selectTool('select')}
            title="Select & Move (Esc)"
            label="Modify"
            icon={<SelectIcon />}
          />
          <RibbonButton
            active={activeToolName === 'wall'}
            onClick={() => selectTool('wall')}
            title="Wall (W)"
            label="Wall"
            icon={<WallIcon />}
          />
          <div className="ribbon-btn-group-stacked">
            <RibbonButton
              size="small"
              active={activeToolName === 'line'}
              onClick={() => selectTool('line')}
              title="Line (L)"
              label="Line"
              icon={<LineIcon />}
            />
            <RibbonButton
              size="small"
              active={activeToolName === 'rect'}
              onClick={() => selectTool('rect')}
              title="Rectangle (R)"
              label="Rectangle"
              icon={<RectIcon />}
            />
            <RibbonButton
              size="small"
              active={activeToolName === 'circle'}
              onClick={() => selectTool('circle')}
              title="Circle (C)"
              label="Circle"
              icon={<CircleIcon />}
            />
          </div>
        </div>
        <div className="ribbon-panel-title">Draw</div>
      </div>

      {/* Architectural Panel */}
      <div className="ribbon-panel">
        <div className="ribbon-panel-body">
          <RibbonButton
            active={activeToolName === 'door'}
            onClick={() => selectTool('door')}
            title="Door (D)"
            label="Door"
            icon={<DoorIcon />}
          />
          <RibbonButton
            active={activeToolName === 'window'}
            onClick={() => selectTool('window')}
            title="Window (N)"
            label="Window"
            icon={<WindowIcon />}
          />
          <RibbonButton
            active={activeToolName === 'stairs'}
            onClick={() => selectTool('stairs')}
            title="Stairs (S)"
            label="Stairs"
            icon={<StairsIcon />}
          />
        </div>
        <div className="ribbon-panel-title">Architectural</div>
      </div>

      {/* Layers Panel */}
      <div className="ribbon-panel">
        <div
          className="ribbon-panel-body"
          style={{
            flexDirection: 'column',
            alignItems: 'flex-start',
            gap: 4,
            padding: '4px 8px',
          }}
        >
          <select
            style={{
              width: 120,
              padding: 4,
              borderRadius: 4,
              border: '1px solid var(--border-color)',
              background: 'var(--bg-tertiary)',
              color: 'var(--text-primary)',
            }}
            value={projectSignal.value.activeLayerId}
            onChange={(e) =>
              setActiveLayerAction((e.target as HTMLSelectElement).value)
            }
          >
            {projectSignal.value.layers.map((l) => (
              <option key={l.id} value={l.id}>
                {l.name}
              </option>
            ))}
          </select>
          <RibbonButton
            size="small"
            onClick={() => (isLayerModalOpenSignal.value = true)}
            label="Layer Properties"
            style={{width: '100%', justifyContent: 'center'}}
          />
        </div>
        <div className="ribbon-panel-title">Layers</div>
      </div>
    </>
  );
}
