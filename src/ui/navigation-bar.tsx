import {h} from 'preact';
import {viewportSignal} from '../state/viewport-state';
import {triggerRenderSignal, pushCommandMessage} from '../state/ui-state';
import {activePageSignal} from '../state/project-state';
import {PanIcon, ZoomInIcon, ZoomOutIcon, FitScreenIcon} from './icons';

export function NavigationBar() {
  const handlePan = () => {
    pushCommandMessage(
      'Command: PAN - Drag canvas to pan (or use Middle Mouse Button).',
    );
  };

  const handleZoomExtents = () => {
    const vp = viewportSignal.value;
    if (vp) {
      vp.fitToContent(
        activePageSignal.value.entities,
        window.innerWidth - 320,
        window.innerHeight - 150,
      );
      triggerRenderSignal.value = {};
      pushCommandMessage('Command: ZOOMEXT - Zoom Extents.');
    }
  };

  const handleZoomIn = () => {
    const vp = viewportSignal.value;
    if (vp) {
      vp.zoom *= 1.25;
      triggerRenderSignal.value = {};
      pushCommandMessage('Command: ZOOMIN - Zoom In.');
    }
  };

  const handleZoomOut = () => {
    const vp = viewportSignal.value;
    if (vp) {
      vp.zoom *= 0.8;
      triggerRenderSignal.value = {};
      pushCommandMessage('Command: ZOOMOUT - Zoom Out.');
    }
  };

  return (
    <div
      className="nav-bar"
      style={{
        position: 'absolute',
        top: '20px',
        right: '20px',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: 'rgba(30,30,30,0.85)',
        backdropFilter: 'blur(8px)',
        border: '1px solid var(--border-color)',
        borderRadius: '6px',
        zIndex: 40,
        boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
        padding: '4px',
      }}
    >
      <button
        className="nav-btn"
        onClick={handlePan}
        title="Pan"
        aria-label="Pan"
      >
        <PanIcon />
      </button>
      <button
        className="nav-btn"
        onClick={handleZoomExtents}
        title="Zoom Extents"
        aria-label="Zoom Extents"
      >
        <FitScreenIcon />
      </button>
      <button
        className="nav-btn"
        onClick={handleZoomIn}
        title="Zoom In"
        aria-label="Zoom In"
      >
        <ZoomInIcon />
      </button>
      <button
        className="nav-btn"
        onClick={handleZoomOut}
        title="Zoom Out"
        aria-label="Zoom Out"
      >
        <ZoomOutIcon />
      </button>
    </div>
  );
}
