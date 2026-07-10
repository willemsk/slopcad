import {h} from 'preact';
import {activePageSignal} from '../../state/project-state';
import {
  gridEnabledSignal,
  pushCommandMessage,
  snapEnabledSignal,
  triggerRenderSignal,
} from '../../state/ui-state';
import {viewportSignal} from '../../state/viewport-state';
import {
  FitScreenIcon,
  GridIcon,
  SnapIcon,
  ZoomInIcon,
  ZoomOutIcon,
} from '../icons';
import {RibbonButton} from '../ribbon-button';

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
          <RibbonButton
            onClick={handleFitScreen}
            title="Fit to screen"
            label="Zoom Ext"
            icon={<FitScreenIcon />}
          />
          <div className="ribbon-btn-group-stacked">
            <RibbonButton
              size="small"
              onClick={() => {
                const vp = viewportSignal.value;
                if (vp) {
                  vp.zoom = vp.zoom * 1.25;
                  triggerRenderSignal.value = {};
                  pushCommandMessage('Command: ZOOM - In.');
                }
              }}
              title="Zoom In"
              label="Zoom In"
              icon={<ZoomInIcon />}
            />
            <RibbonButton
              size="small"
              onClick={() => {
                const vp = viewportSignal.value;
                if (vp) {
                  vp.zoom = vp.zoom * 0.8;
                  triggerRenderSignal.value = {};
                  pushCommandMessage('Command: ZOOM - Out.');
                }
              }}
              title="Zoom Out"
              label="Zoom Out"
              icon={<ZoomOutIcon />}
            />
          </div>
        </div>
        <div className="ribbon-panel-title">Navigate</div>
      </div>

      <div className="ribbon-panel">
        <div className="ribbon-panel-body">
          <RibbonButton
            active={gridEnabledSignal.value}
            onClick={() => {
              gridEnabledSignal.value = !gridEnabledSignal.value;
              pushCommandMessage(
                `Command: GRID - Grid display ${gridEnabledSignal.value ? 'ON' : 'OFF'}.`,
              );
            }}
            title="Toggle Grid Display"
            label="Grid"
            icon={<GridIcon />}
          />
          <RibbonButton
            active={snapEnabledSignal.value}
            onClick={() => {
              snapEnabledSignal.value = !snapEnabledSignal.value;
              pushCommandMessage(
                `Command: SNAP - Snapping to points ${snapEnabledSignal.value ? 'ON' : 'OFF'}.`,
              );
            }}
            title="Toggle Snapping"
            label="Snap"
            icon={<SnapIcon />}
          />
        </div>
        <div className="ribbon-panel-title">Aids</div>
      </div>
    </>
  );
}
