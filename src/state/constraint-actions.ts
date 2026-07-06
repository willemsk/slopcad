import {Vec2, WallEntity, LineEntity} from '../core/types';
import {generateId} from '../core/entity';
import {solveConstraints} from '../core/solver';
import {dist} from '../core/geometry';
import {activePageSignal, updateActivePage, entityMap} from './project-state';
import {snapshotState} from './history-actions';
import {selectionSignal} from './selection-state';
import {viewportSignal} from './viewport-state';
import {requestPrompt} from './ui-state';

export function addHorizontalConstraintAction() {
  const selection = selectionSignal.value;
  const page = activePageSignal.value;
  const map = entityMap.value;
  const selectedEntities: (WallEntity | LineEntity)[] = [];
  for (const id of selection) {
    const ent = map.get(id);
    if (ent && (ent.type === 'wall' || ent.type === 'line')) {
      selectedEntities.push(ent as WallEntity | LineEntity);
    }
  }

  let added = false;
  const newConstraints = [...page.constraints];

  for (const ent of selectedEntities) {
    if (ent.type === 'wall' || ent.type === 'line') {
      const exists = newConstraints.some(
        (c) => c.type === 'horizontal' && c.entityIds[0] === ent.id,
      );
      if (!exists) {
        snapshotState();
        newConstraints.push({
          id: generateId(),
          type: 'horizontal',
          entityIds: [ent.id],
          pointRefs: [
            {entityId: ent.id, pointKey: 'start'},
            {entityId: ent.id, pointKey: 'end'},
          ],
        });
        added = true;
      }
    }
  }

  if (added) {
    const solved = solveConstraints(page.entities, newConstraints);
    updateActivePage(solved, newConstraints);
  }
}

export function addVerticalConstraintAction() {
  const selection = selectionSignal.value;
  const page = activePageSignal.value;
  const map = entityMap.value;
  const selectedEntities: (WallEntity | LineEntity)[] = [];
  for (const id of selection) {
    const ent = map.get(id);
    if (ent && (ent.type === 'wall' || ent.type === 'line')) {
      selectedEntities.push(ent as WallEntity | LineEntity);
    }
  }

  let added = false;
  const newConstraints = [...page.constraints];

  for (const ent of selectedEntities) {
    if (ent.type === 'wall' || ent.type === 'line') {
      const exists = newConstraints.some(
        (c) => c.type === 'vertical' && c.entityIds[0] === ent.id,
      );
      if (!exists) {
        snapshotState();
        newConstraints.push({
          id: generateId(),
          type: 'vertical',
          entityIds: [ent.id],
          pointRefs: [
            {entityId: ent.id, pointKey: 'start'},
            {entityId: ent.id, pointKey: 'end'},
          ],
        });
        added = true;
      }
    }
  }

  if (added) {
    const solved = solveConstraints(page.entities, newConstraints);
    updateActivePage(solved, newConstraints);
  }
}

export async function addLengthConstraintAction(targetVal?: number) {
  const selection = selectionSignal.value;
  const page = activePageSignal.value;
  const map = entityMap.value;
  const selectedEntities: (WallEntity | LineEntity)[] = [];
  for (const id of selection) {
    const ent = map.get(id);
    if (ent && (ent.type === 'wall' || ent.type === 'line')) {
      selectedEntities.push(ent as WallEntity | LineEntity);
    }
  }

  const ent = selectedEntities[0];
  if (!ent || (ent.type !== 'wall' && ent.type !== 'line')) return;

  const w = ent as WallEntity | LineEntity;
  const currentLength = dist(w.start, w.end);
  let val = targetVal;

  if (val === undefined) {
    let screenPos: Vec2 | undefined;
    if (viewportSignal.value) {
      const midX = (w.start.x + w.end.x) / 2;
      const midY = (w.start.y + w.end.y) / 2;
      screenPos = viewportSignal.value.worldToScreen({x: midX, y: midY});
    }

    const input = await requestPrompt(
      'Length in meters:',
      currentLength.toFixed(2),
      screenPos,
    );
    if (input === null) return;
    val = parseFloat(input);
  }

  if (isNaN(val) || val <= 0) return;

  snapshotState();
  const newConstraints = page.constraints.filter(
    (c) => !(c.type === 'fixed_length' && c.entityIds[0] === ent.id),
  );

  newConstraints.push({
    id: generateId(),
    type: 'fixed_length',
    entityIds: [ent.id],
    value: val,
    pointRefs: [
      {entityId: ent.id, pointKey: 'start'},
      {entityId: ent.id, pointKey: 'end'},
    ],
  });

  const solved = solveConstraints(page.entities, newConstraints);
  updateActivePage(solved, newConstraints);
}

export function clearSelectedConstraintsAction() {
  const selection = selectionSignal.value;
  if (selection.size === 0) return;

  snapshotState();
  const page = activePageSignal.value;
  const newConstraints = page.constraints.filter((c) => {
    return !c.entityIds.some((id) => selection.has(id));
  });

  updateActivePage(page.entities, newConstraints);
}

export async function addFixedAngleConstraintAction() {
  const selection = selectionSignal.value;
  const page = activePageSignal.value;
  const map = entityMap.value;
  const selectedEntities: (WallEntity | LineEntity)[] = [];
  for (const id of selection) {
    const ent = map.get(id);
    if (ent && (ent.type === 'wall' || ent.type === 'line')) {
      selectedEntities.push(ent as WallEntity | LineEntity);
    }
  }

  if (selectedEntities.length !== 1) {
    window.alert('Please select exactly 1 wall/line to fix its angle.');
    return;
  }

  const ent = selectedEntities[0] as WallEntity | LineEntity;
  const currentAngleRad = Math.atan2(
    ent.end.y - ent.start.y,
    ent.end.x - ent.start.x,
  );
  const currentAngleDeg = (currentAngleRad * 180) / Math.PI;

  let screenPos: Vec2 | undefined;
  if (viewportSignal.value) {
    const midX = (ent.start.x + ent.end.x) / 2;
    const midY = (ent.start.y + ent.end.y) / 2;
    screenPos = viewportSignal.value.worldToScreen({x: midX, y: midY});
  }

  const input = await requestPrompt(
    'Angle (degrees):',
    currentAngleDeg.toFixed(2),
    screenPos,
  );
  if (input === null) return;
  const val = parseFloat(input);
  if (isNaN(val)) return;

  snapshotState();
  const newConstraints = page.constraints.filter(
    (c) => !(c.type === 'fixed_angle' && c.entityIds[0] === ent.id),
  );

  newConstraints.push({
    id: generateId(),
    type: 'fixed_angle',
    entityIds: [ent.id],
    value: val,
    pointRefs: [
      {entityId: ent.id, pointKey: 'start'},
      {entityId: ent.id, pointKey: 'end'},
    ],
  });

  const solved = solveConstraints(page.entities, newConstraints);
  updateActivePage(solved, newConstraints);
}
