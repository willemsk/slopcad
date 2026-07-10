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
import {RibbonButton} from '../ribbon-button';

export function ConstraintsPanel() {
  const hasSelection = selectionSignal.value.size > 0;

  return (
    <>
      {/* Geometric Constraints */}
      <div className="ribbon-panel">
        <div className="ribbon-panel-body">
          <div className="ribbon-btn-group-stacked">
            <RibbonButton
              size="small"
              onClick={() => {
                addHorizontalConstraintAction();
                pushCommandMessage(
                  'Command: CONSTRAINT - Horizontal alignment constraint applied.',
                );
              }}
              disabled={!hasSelection}
              title="Constrain Horizontal"
              label="Horizontal"
            />
            <RibbonButton
              size="small"
              onClick={() => {
                addVerticalConstraintAction();
                pushCommandMessage(
                  'Command: CONSTRAINT - Vertical alignment constraint applied.',
                );
              }}
              disabled={!hasSelection}
              title="Constrain Vertical"
              label="Vertical"
            />
          </div>

          <div className="ribbon-btn-group-stacked">
            <RibbonButton
              size="small"
              onClick={() => {
                addParallelConstraintAction();
                pushCommandMessage(
                  'Command: CONSTRAINT - Parallel relationship constraint applied.',
                );
              }}
              title="Constrain Parallel (Select 2)"
              label="Parallel"
            />
            <RibbonButton
              size="small"
              onClick={() => {
                addPerpendicularConstraintAction();
                pushCommandMessage(
                  'Command: CONSTRAINT - Perpendicular relationship constraint applied.',
                );
              }}
              title="Constrain Perpendicular (Select 2)"
              label="Perpendicular"
            />
          </div>

          <div className="ribbon-btn-group-stacked">
            <RibbonButton
              size="small"
              onClick={() => {
                addCollinearConstraintAction();
                pushCommandMessage(
                  'Command: CONSTRAINT - Collinear constraint applied.',
                );
              }}
              disabled={!hasSelection}
              title="Constrain Collinear"
              label="Collinear"
            />
            <RibbonButton
              size="small"
              onClick={() => {
                addCoincidentConstraintAction();
                pushCommandMessage(
                  'Command: CONSTRAINT - Coincident constraint applied.',
                );
              }}
              disabled={!hasSelection}
              title="Constrain Coincident"
              label="Coincident"
            />
            <RibbonButton
              size="small"
              onClick={() => {
                addConcentricConstraintAction();
                pushCommandMessage(
                  'Command: CONSTRAINT - Concentric constraint applied.',
                );
              }}
              disabled={!hasSelection}
              title="Constrain Concentric"
              label="Concentric"
            />
          </div>
        </div>
        <div className="ribbon-panel-title">Geometric</div>
      </div>

      {/* Dimensional Constraints */}
      <div className="ribbon-panel">
        <div className="ribbon-panel-body">
          <RibbonButton
            onClick={async () => {
              await addLengthConstraintAction();
              pushCommandMessage(
                'Command: CONSTRAINT - Fixed length constraint applied.',
              );
            }}
            disabled={!hasSelection}
            title="Constrain Fixed Length"
            label="Fix Length"
            icon={<DimensionIcon />}
          />

          <RibbonButton
            onClick={() => {
              addEqualLengthConstraintAction();
              pushCommandMessage(
                'Command: CONSTRAINT - Equal length constraint applied.',
              );
            }}
            disabled={!hasSelection}
            title="Constrain Equal Length"
            label="Equal Len"
            icon={<DimensionIcon />}
          />

          <RibbonButton
            onClick={async () => {
              await addFixedAngleConstraintAction();
              pushCommandMessage(
                'Command: CONSTRAINT - Fixed angle constraint applied.',
              );
            }}
            disabled={!hasSelection}
            title="Constrain Fixed Angle"
            label="Fix Angle"
            icon={<DimensionIcon />}
          />

          <RibbonButton
            onClick={() => {
              clearSelectedConstraintsAction();
              pushCommandMessage(
                'Command: CONSTRAINTDEL - All constraints removed from selection.',
              );
            }}
            disabled={!hasSelection}
            title="Remove Selected Entity Constraints"
            label="Clear"
            icon={<TextIcon />}
          />
        </div>
        <div className="ribbon-panel-title">Dimensional</div>
      </div>
    </>
  );
}
