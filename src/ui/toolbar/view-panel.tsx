import {h} from 'preact';
import {viewportSignal} from '../../state/viewport-state';
import {activePageSignal} from '../../state/project-state';
import {
  triggerRenderSignal,
  gridEnabledSignal,
  snapEnabledSignal,
  pushCommandMessage,
} from '../../state/ui-state';
import {
  FitScreenIcon,
  ZoomInIcon,
  ZoomOutIcon,
  GridIcon,
  SnapIcon,
} from '../icons';

export function ViewPanel() {
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

  return (
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
  );
}
