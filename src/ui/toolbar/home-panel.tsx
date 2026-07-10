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
import {selectTool} from './helpers';

export function HomePanel() {
  const activeToolName = activeToolNameSignal.value || 'select';

  return (
    <>
      {/* Draw Panel */}
      <div className="ribbon-panel">
        <div className="ribbon-panel-body">
          <button
            className={`ribbon-btn-large ${activeToolName === 'select' ? 'active' : ''}`}
            onClick={() => selectTool('select')}
            title="Select & Move (Esc)"
          >
            <span className="ribbon-btn-large-icon">
              <SelectIcon />
            </span>
            <span className="ribbon-btn-large-label">Modify</span>
          </button>
          <button
            className={`ribbon-btn-large ${activeToolName === 'wall' ? 'active' : ''}`}
            onClick={() => selectTool('wall')}
            title="Wall (W)"
          >
            <span className="ribbon-btn-large-icon">
              <WallIcon />
            </span>
            <span className="ribbon-btn-large-label">Wall</span>
          </button>
          <div className="ribbon-btn-group-stacked">
            <button
              className={`ribbon-btn-small ${activeToolName === 'line' ? 'active' : ''}`}
              onClick={() => selectTool('line')}
              title="Line (L)"
            >
              <span className="ribbon-btn-small-icon">
                <LineIcon />
              </span>
              <span className="ribbon-btn-small-label">Line</span>
            </button>
            <button
              className={`ribbon-btn-small ${activeToolName === 'rect' ? 'active' : ''}`}
              onClick={() => selectTool('rect')}
              title="Rectangle (R)"
            >
              <span className="ribbon-btn-small-icon">
                <RectIcon />
              </span>
              <span className="ribbon-btn-small-label">Rectangle</span>
            </button>
            <button
              className={`ribbon-btn-small ${activeToolName === 'circle' ? 'active' : ''}`}
              onClick={() => selectTool('circle')}
              title="Circle (C)"
            >
              <span className="ribbon-btn-small-icon">
                <CircleIcon />
              </span>
              <span className="ribbon-btn-small-label">Circle</span>
            </button>
          </div>
        </div>
        <div className="ribbon-panel-title">Draw</div>
      </div>

      {/* Architectural Panel */}
      <div className="ribbon-panel">
        <div className="ribbon-panel-body">
          <button
            className={`ribbon-btn-large ${activeToolName === 'door' ? 'active' : ''}`}
            onClick={() => selectTool('door')}
            title="Door (D)"
          >
            <span className="ribbon-btn-large-icon">
              <DoorIcon />
            </span>
            <span className="ribbon-btn-large-label">Door</span>
          </button>
          <button
            className={`ribbon-btn-large ${activeToolName === 'window' ? 'active' : ''}`}
            onClick={() => selectTool('window')}
            title="Window (N)"
          >
            <span className="ribbon-btn-large-icon">
              <WindowIcon />
            </span>
            <span className="ribbon-btn-large-label">Window</span>
          </button>
          <button
            className={`ribbon-btn-large ${activeToolName === 'stairs' ? 'active' : ''}`}
            onClick={() => selectTool('stairs')}
            title="Stairs (S)"
          >
            <span className="ribbon-btn-large-icon">
              <StairsIcon />
            </span>
            <span className="ribbon-btn-large-label">Stairs</span>
          </button>
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
          <button
            className="ribbon-btn-small"
            onClick={() => (isLayerModalOpenSignal.value = true)}
            style={{width: '100%', justifyContent: 'center'}}
          >
            <span className="ribbon-btn-small-label">Layer Properties</span>
          </button>
        </div>
        <div className="ribbon-panel-title">Layers</div>
      </div>
    </>
  );
}
