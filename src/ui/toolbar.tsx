import {h} from 'preact';
import {useState} from 'preact/hooks';
import {
  activeToolSignal,
  gridEnabledSignal,
  snapEnabledSignal,
  pushCommandMessage,
} from '../state/app-state';
import {setActiveToolByName} from '../tools/tool-registry';
import {
  SelectIcon,
  WallIcon,
  DoorIcon,
  WindowIcon,
  StairsIcon,
  LineIcon,
  RectIcon,
  CircleIcon,
  DimensionIcon,
  TextIcon,
  GridIcon,
  SnapIcon,
  FitScreenIcon,
  ZoomInIcon,
  ZoomOutIcon,
} from './icons';
import {
  addHorizontalConstraintAction,
  addVerticalConstraintAction,
  addLengthConstraintAction,
  addPerpendicularConstraintAction,
  addParallelConstraintAction,
  clearSelectedConstraintsAction,
  viewportSignal,
  triggerRenderSignal,
  activePageSignal,
  selectionSignal,
} from '../state/app-state';
import './ribbon.css';

const TOOL_PROMPTS: Record<string, string> = {
  select:
    'Command: SELECT - Select entities, drag to move, drag handles to resize. Press Del to delete.',
  wall: 'Command: WALL - Click canvas to start drawing wall segment. Press Esc to finish.',
  door: 'Command: DOOR - Hover over a wall to place door. Tab = flip hinge, F = flip swing side.',
  window:
    'Command: WINDOW - Hover over a wall to place window. Press Esc to cancel.',
  stairs:
    'Command: STAIRS - Click and drag to draw stair footprint, then change tread count in properties.',
  line: 'Command: LINE - Click to start line, click again to place end. Press Esc to cancel.',
  rect: 'Command: RECTANGLE - Click to place first corner, click again for opposite corner.',
  circle: 'Command: CIRCLE - Click center point, move and click to set radius.',
  dimension:
    'Command: DIMENSION - Click first point, click second point, then offset and click to place.',
  text: 'Command: TEXT - Click canvas to place text element, edit text inside properties panel.',
};

export function Toolbar() {
  const [activeTab, setActiveTab] = useState<
    'home' | 'annotate' | 'view' | 'constraints'
  >('home');
  const activeTool = activeToolSignal.value;
  const activeToolName = activeTool?.name || 'select';

  const selectTool = (name: string) => {
    setActiveToolByName(name);
    const prompt = TOOL_PROMPTS[name] || `Command: ${name.toUpperCase()}`;
    pushCommandMessage(prompt);
  };

  const handleFitScreen = () => {
    const vp = viewportSignal.value;
    if (vp) {
      vp.fitToContent(
        activePageSignal.value.entities,
        window.innerWidth - 320,
        window.innerHeight - 150,
      );
      triggerRenderSignal.value = {};
      pushCommandMessage('Command: ZOOMFIT - View fitted to drawing bounds.');
    }
  };

  const hasSelection = selectionSignal.value.size > 0;

  return (
    <div className="ribbon-container">
      {/* Ribbon Tabs */}
      <div className="ribbon-tabs">
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
      </div>

      {/* Ribbon Panels */}
      <div className="ribbon-content">
        {activeTab === 'home' && (
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
          </>
        )}

        {activeTab === 'annotate' && (
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
        )}

        {activeTab === 'constraints' && (
          <>
            {/* Geometric Constraints */}
            <div className="ribbon-panel">
              <div className="ribbon-panel-body">
                <div className="ribbon-btn-group-stacked">
                  <button
                    className="ribbon-btn-small"
                    onClick={() => {
                      addHorizontalConstraintAction();
                      pushCommandMessage(
                        'Command: CONSTRAINT - Horizontal alignment constraint applied.',
                      );
                    }}
                    disabled={!hasSelection}
                    title="Constrain Horizontal"
                  >
                    <span className="ribbon-btn-small-label">Horizontal</span>
                  </button>
                  <button
                    className="ribbon-btn-small"
                    onClick={() => {
                      addVerticalConstraintAction();
                      pushCommandMessage(
                        'Command: CONSTRAINT - Vertical alignment constraint applied.',
                      );
                    }}
                    disabled={!hasSelection}
                    title="Constrain Vertical"
                  >
                    <span className="ribbon-btn-small-label">Vertical</span>
                  </button>
                </div>

                <div className="ribbon-btn-group-stacked">
                  <button
                    className="ribbon-btn-small"
                    onClick={() => {
                      addParallelConstraintAction();
                      pushCommandMessage(
                        'Command: CONSTRAINT - Parallel relationship constraint applied.',
                      );
                    }}
                    title="Constrain Parallel (Select 2)"
                  >
                    <span className="ribbon-btn-small-label">Parallel</span>
                  </button>
                  <button
                    className="ribbon-btn-small"
                    onClick={() => {
                      addPerpendicularConstraintAction();
                      pushCommandMessage(
                        'Command: CONSTRAINT - Perpendicular relationship constraint applied.',
                      );
                    }}
                    title="Constrain Perpendicular (Select 2)"
                  >
                    <span className="ribbon-btn-small-label">
                      Perpendicular
                    </span>
                  </button>
                </div>
              </div>
              <div className="ribbon-panel-title">Geometric</div>
            </div>

            {/* Dimensional Constraints */}
            <div className="ribbon-panel">
              <div className="ribbon-panel-body">
                <button
                  className="ribbon-btn-large"
                  onClick={() => {
                    addLengthConstraintAction();
                    pushCommandMessage(
                      'Command: CONSTRAINT - Fixed length constraint applied.',
                    );
                  }}
                  disabled={!hasSelection}
                  title="Constrain Fixed Length"
                >
                  <span className="ribbon-btn-large-icon">
                    <DimensionIcon />
                  </span>
                  <span className="ribbon-btn-large-label">Fix Length</span>
                </button>

                <button
                  className="ribbon-btn-large"
                  onClick={() => {
                    clearSelectedConstraintsAction();
                    pushCommandMessage(
                      'Command: CONSTRAINTDEL - All constraints removed from selection.',
                    );
                  }}
                  disabled={!hasSelection}
                  title="Remove Selected Entity Constraints"
                >
                  <span className="ribbon-btn-large-icon">
                    <TextIcon />
                  </span>
                  <span className="ribbon-btn-large-label">Clear</span>
                </button>
              </div>
              <div className="ribbon-panel-title">Dimensional</div>
            </div>
          </>
        )}

        {activeTab === 'view' && (
          <>
            <div className="ribbon-panel">
              <div className="ribbon-panel-body">
                <button
                  className="ribbon-btn-large"
                  onClick={handleFitScreen}
                  title="Fit to screen"
                >
                  <span className="ribbon-btn-large-icon">
                    <FitScreenIcon />
                  </span>
                  <span className="ribbon-btn-large-label">Zoom Ext</span>
                </button>
                <div className="ribbon-btn-group-stacked">
                  <button
                    className="ribbon-btn-small"
                    onClick={() => {
                      const vp = viewportSignal.value;
                      if (vp) {
                        vp.zoom = vp.zoom * 1.25;
                        triggerRenderSignal.value = {};
                        pushCommandMessage('Command: ZOOM - In.');
                      }
                    }}
                    title="Zoom In"
                  >
                    <span className="ribbon-btn-small-icon">
                      <ZoomInIcon />
                    </span>
                    <span className="ribbon-btn-small-label">Zoom In</span>
                  </button>
                  <button
                    className="ribbon-btn-small"
                    onClick={() => {
                      const vp = viewportSignal.value;
                      if (vp) {
                        vp.zoom = vp.zoom * 0.8;
                        triggerRenderSignal.value = {};
                        pushCommandMessage('Command: ZOOM - Out.');
                      }
                    }}
                    title="Zoom Out"
                  >
                    <span className="ribbon-btn-small-icon">
                      <ZoomOutIcon />
                    </span>
                    <span className="ribbon-btn-small-label">Zoom Out</span>
                  </button>
                </div>
              </div>
              <div className="ribbon-panel-title">Navigate</div>
            </div>

            <div className="ribbon-panel">
              <div className="ribbon-panel-body">
                <button
                  className={`ribbon-btn-large ${gridEnabledSignal.value ? 'active' : ''}`}
                  onClick={() => {
                    gridEnabledSignal.value = !gridEnabledSignal.value;
                    pushCommandMessage(
                      `Command: GRID - Grid display ${gridEnabledSignal.value ? 'ON' : 'OFF'}.`,
                    );
                  }}
                  title="Toggle Grid Display"
                >
                  <span className="ribbon-btn-large-icon">
                    <GridIcon />
                  </span>
                  <span className="ribbon-btn-large-label">Grid</span>
                </button>
                <button
                  className={`ribbon-btn-large ${snapEnabledSignal.value ? 'active' : ''}`}
                  onClick={() => {
                    snapEnabledSignal.value = !snapEnabledSignal.value;
                    pushCommandMessage(
                      `Command: SNAP - Snapping to points ${snapEnabledSignal.value ? 'ON' : 'OFF'}.`,
                    );
                  }}
                  title="Toggle Snapping"
                >
                  <span className="ribbon-btn-large-icon">
                    <SnapIcon />
                  </span>
                  <span className="ribbon-btn-large-label">Snap</span>
                </button>
              </div>
              <div className="ribbon-panel-title">Aids</div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
