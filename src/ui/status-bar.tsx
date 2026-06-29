import {h} from 'preact';
import {projectSignal, activePageSignal} from '../state/project-state';
import {viewportSignal} from '../state/viewport-state';
import {
  snapEnabledSignal,
  gridEnabledSignal,
  showConstraintsSignal,
  mouseCoordsSignal,
  pushCommandMessage,
  uiScaleSignal,
  setUiScale,
} from '../state/ui-state';
import {formatLength} from '../core/units';
import {UnitSystem} from '../core/types';
import {GridIcon, SnapIcon, ConstraintIcon} from './icons';
import './status-bar.css';

function MouseCoordsDisplay({unitSystem}: {unitSystem: UnitSystem}) {
  const mouseCoords = mouseCoordsSignal.value;
  const xStr = formatLength(mouseCoords.x, unitSystem, 3);
  const yStr = formatLength(mouseCoords.y, unitSystem, 3);

  return (
    <div className="status-section coords">
      <span>X: {xStr}</span>
      <span>Y: {yStr}</span>
      <span>Z: 0.000</span>
    </div>
  );
}

export function StatusBar() {
  const project = projectSignal.value;
  const page = activePageSignal.value;
  const viewport = viewportSignal.value;

  const zoomPercent = viewport ? Math.round(viewport.zoom) : 100;
  const entityCount = page.entities.length;
  const constraintCount = page.constraints.length;

  const toggleGrid = () => {
    gridEnabledSignal.value = !gridEnabledSignal.value;
    pushCommandMessage(
      `Command: GRID - Grid display ${gridEnabledSignal.value ? 'ON' : 'OFF'}.`,
    );
  };

  const toggleSnap = () => {
    snapEnabledSignal.value = !snapEnabledSignal.value;
    pushCommandMessage(
      `Command: SNAP - Snapping to geometry ${snapEnabledSignal.value ? 'ON' : 'OFF'}.`,
    );
  };

  const toggleConstraints = () => {
    showConstraintsSignal.value = !showConstraintsSignal.value;
    pushCommandMessage(
      `Command: CONSTRAINTS - Display ${showConstraintsSignal.value ? 'ON' : 'OFF'}.`,
    );
  };

  const cycleUiScale = () => {
    const scales = [1, 1.25, 1.5];
    let currentIndex = scales.indexOf(uiScaleSignal.value);
    if (currentIndex === -1) currentIndex = 0;
    const nextScale = scales[(currentIndex + 1) % scales.length];
    setUiScale(nextScale);
    pushCommandMessage(
      `Command: UI SCALE - Set to ${Math.round(nextScale * 100)}%.`,
    );
  };

  return (
    <div className="status-bar">
      <MouseCoordsDisplay unitSystem={project.unitSystem} />

      <div className="status-toggles">
        <button
          className={`status-btn ${gridEnabledSignal.value ? 'active' : ''}`}
          onClick={toggleGrid}
          title="Grid Display (G / F7)"
          aria-label="Toggle Grid Display"
          aria-pressed={gridEnabledSignal.value}
        >
          <GridIcon />
        </button>
        <button
          className={`status-btn ${snapEnabledSignal.value ? 'active' : ''}`}
          onClick={toggleSnap}
          title="Object Snap (S / F3)"
          aria-label="Toggle Object Snap"
          aria-pressed={snapEnabledSignal.value}
        >
          <SnapIcon />
        </button>
        <button
          className={`status-btn ${showConstraintsSignal.value ? 'active' : ''}`}
          onClick={toggleConstraints}
          title="Show Constraints"
          aria-label="Toggle Show Constraints"
          aria-pressed={showConstraintsSignal.value}
        >
          <ConstraintIcon />
        </button>
      </div>

      <div className="status-section status-stats">
        <span className="status-item">
          Zoom: <span className="status-value">{zoomPercent}%</span>
        </span>
        <span className="status-item">
          Entities: <span className="status-value">{entityCount}</span>
        </span>
        <span className="status-item">
          Constraints: <span className="status-value">{constraintCount}</span>
        </span>
        <span className="status-item">
          Units:{' '}
          <span className="status-value">
            {project.unitSystem === 'metric' ? 'METRIC' : 'IMPERIAL'}
          </span>
        </span>
        <button
          className="status-item"
          onClick={cycleUiScale}
          style={{
            background: 'transparent',
            border: 'none',
            color: 'inherit',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            fontFamily: 'inherit',
            fontSize: 'inherit',
          }}
          title="Cycle UI Scale"
        >
          UI Scale:{' '}
          <span className="status-value">
            {Math.round(uiScaleSignal.value * 100)}%
          </span>
        </button>
      </div>
    </div>
  );
}
