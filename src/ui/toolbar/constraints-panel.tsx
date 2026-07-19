import {h} from 'preact';
import {
  addFixedAngleConstraintAction,
  addHorizontalConstraintAction,
  addLengthConstraintAction,
  addVerticalConstraintAction,
  clearSelectedConstraintsAction,
} from '../../state/constraint-actions';
import {
  addCoincidentConstraintAction,
  addCollinearConstraintAction,
  addConcentricConstraintAction,
  addEqualLengthConstraintAction,
  addParallelConstraintAction,
  addPerpendicularConstraintAction,
} from '../../state/constraint-actions-relational';
import {selectionSignal} from '../../state/selection-state';
import {pushCommandMessage} from '../../state/ui-state';
import {DimensionIcon, TextIcon} from '../icons';

export function ConstraintsPanel() {
  const hasSelection = selectionSignal.value.size > 0;

  return (
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
              aria-label="Horizontal"
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
              aria-label="Vertical"
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
              aria-label="Parallel"
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
              aria-label="Perpendicular"
            >
              <span className="ribbon-btn-small-label">Perpendicular</span>
            </button>
          </div>

          <div className="ribbon-btn-group-stacked">
            <button
              className="ribbon-btn-small"
              onClick={() => {
                addCollinearConstraintAction();
                pushCommandMessage(
                  'Command: CONSTRAINT - Collinear constraint applied.',
                );
              }}
              disabled={!hasSelection}
              title="Constrain Collinear"
              aria-label="Collinear"
            >
              <span className="ribbon-btn-small-label">Collinear</span>
            </button>
            <button
              className="ribbon-btn-small"
              onClick={() => {
                addCoincidentConstraintAction();
                pushCommandMessage(
                  'Command: CONSTRAINT - Coincident constraint applied.',
                );
              }}
              disabled={!hasSelection}
              title="Constrain Coincident"
              aria-label="Coincident"
            >
              <span className="ribbon-btn-small-label">Coincident</span>
            </button>
            <button
              className="ribbon-btn-small"
              onClick={() => {
                addConcentricConstraintAction();
                pushCommandMessage(
                  'Command: CONSTRAINT - Concentric constraint applied.',
                );
              }}
              disabled={!hasSelection}
              title="Constrain Concentric"
              aria-label="Concentric"
            >
              <span className="ribbon-btn-small-label">Concentric</span>
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
            onClick={async () => {
              await addLengthConstraintAction();
              pushCommandMessage(
                'Command: CONSTRAINT - Fixed length constraint applied.',
              );
            }}
            disabled={!hasSelection}
            title="Constrain Fixed Length"
            aria-label="Fix Length"
          >
            <span className="ribbon-btn-large-icon">
              <DimensionIcon />
            </span>
            <span className="ribbon-btn-large-label">Fix Length</span>
          </button>

          <button
            className="ribbon-btn-large"
            onClick={() => {
              addEqualLengthConstraintAction();
              pushCommandMessage(
                'Command: CONSTRAINT - Equal length constraint applied.',
              );
            }}
            disabled={!hasSelection}
            title="Constrain Equal Length"
            aria-label="Equal Length"
          >
            <span className="ribbon-btn-large-icon">
              <DimensionIcon />
            </span>
            <span className="ribbon-btn-large-label">Equal Len</span>
          </button>

          <button
            className="ribbon-btn-large"
            onClick={async () => {
              await addFixedAngleConstraintAction();
              pushCommandMessage(
                'Command: CONSTRAINT - Fixed angle constraint applied.',
              );
            }}
            disabled={!hasSelection}
            title="Constrain Fixed Angle"
            aria-label="Fix Angle"
          >
            <span className="ribbon-btn-large-icon">
              <DimensionIcon />
            </span>
            <span className="ribbon-btn-large-label">Fix Angle</span>
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
            aria-label="Clear Constraints"
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
  );
}
