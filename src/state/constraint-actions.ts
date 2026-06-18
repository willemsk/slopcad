import {Vec2} from '../core/types';
import {generateId} from '../core/entity';
import {solveConstraints} from '../core/solver';
import {dist} from '../core/geometry';
import {
  activePageSignal,
  snapshotState,
  updateActivePage,
} from './project-state';
import {selectionSignal} from './selection-state';
import {viewportSignal} from './viewport-state';
import {requestPrompt} from './ui-state';

export function addHorizontalConstraintAction() {
  const selection = selectionSignal.value;
  const page = activePageSignal.value;
  const selectedEntities = page.entities.filter(e => selection.has(e.id));

  let added = false;
  const newConstraints = [...page.constraints];

  for (const ent of selectedEntities) {
    if (ent.type === 'wall' || ent.type === 'line') {
      const exists = newConstraints.some(
        c => c.type === 'horizontal' && c.entityIds[0] === ent.id,
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
  const selectedEntities = page.entities.filter(e => selection.has(e.id));

  let added = false;
  const newConstraints = [...page.constraints];

  for (const ent of selectedEntities) {
    if (ent.type === 'wall' || ent.type === 'line') {
      const exists = newConstraints.some(
        c => c.type === 'vertical' && c.entityIds[0] === ent.id,
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
  const selectedEntities = page.entities.filter(e => selection.has(e.id));

  const ent = selectedEntities[0];
  if (!ent || (ent.type !== 'wall' && ent.type !== 'line')) return;

  const currentLength = dist((ent as any).start, (ent as any).end);
  let val = targetVal;

  if (val === undefined) {
    let screenPos: Vec2 | undefined;
    if (viewportSignal.value) {
      const midX = ((ent as any).start.x + (ent as any).end.x) / 2;
      const midY = ((ent as any).start.y + (ent as any).end.y) / 2;
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
    c => !(c.type === 'fixed_length' && c.entityIds[0] === ent.id),
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

export function addPerpendicularConstraintAction() {
  const selection = selectionSignal.value;
  const page = activePageSignal.value;
  const selectedEntities = page.entities.filter(
    e => selection.has(e.id) && (e.type === 'wall' || e.type === 'line'),
  );

  if (selectedEntities.length !== 2) {
    window.alert(
      'Please select exactly 2 walls/lines to make them perpendicular.',
    );
    return;
  }

  snapshotState();
  const e1 = selectedEntities[0];
  const e2 = selectedEntities[1];

  const newConstraints = [...page.constraints];
  newConstraints.push({
    id: generateId(),
    type: 'perpendicular',
    entityIds: [e1.id, e2.id],
    pointRefs: [
      {entityId: e1.id, pointKey: 'start'},
      {entityId: e1.id, pointKey: 'end'},
      {entityId: e2.id, pointKey: 'start'},
      {entityId: e2.id, pointKey: 'end'},
    ],
  });

  const solved = solveConstraints(page.entities, newConstraints);
  updateActivePage(solved, newConstraints);
}

export function addParallelConstraintAction() {
  const selection = selectionSignal.value;
  const page = activePageSignal.value;
  const selectedEntities = page.entities.filter(
    e => selection.has(e.id) && (e.type === 'wall' || e.type === 'line'),
  );

  if (selectedEntities.length !== 2) {
    window.alert('Please select exactly 2 walls/lines to make them parallel.');
    return;
  }

  snapshotState();
  const e1 = selectedEntities[0];
  const e2 = selectedEntities[1];

  const newConstraints = [...page.constraints];
  newConstraints.push({
    id: generateId(),
    type: 'parallel',
    entityIds: [e1.id, e2.id],
    pointRefs: [
      {entityId: e1.id, pointKey: 'start'},
      {entityId: e1.id, pointKey: 'end'},
      {entityId: e2.id, pointKey: 'start'},
      {entityId: e2.id, pointKey: 'end'},
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
  const newConstraints = page.constraints.filter(c => {
    return !c.entityIds.some(id => selection.has(id));
  });

  updateActivePage(page.entities, newConstraints);
}

export function addCoincidentConstraintAction() {
  const selection = selectionSignal.value;
  const page = activePageSignal.value;
  const selectedEntities = page.entities.filter(
    e =>
      selection.has(e.id) &&
      (e.type === 'wall' || e.type === 'line' || e.type === 'arc'),
  );

  if (selectedEntities.length !== 2) {
    window.alert('Please select exactly 2 entities for coincident constraint.');
    return;
  }

  snapshotState();
  const e1 = selectedEntities[0] as any;
  const e2 = selectedEntities[1] as any;

  // For arcs/lines, check start and end
  const getPts = (e: any) => {
    const pts = [];
    if (e.start) pts.push({key: 'start', pt: e.start});
    if (e.end) pts.push({key: 'end', pt: e.end});
    if (e.p1) pts.push({key: 'p1', pt: e.p1});
    if (e.p2) pts.push({key: 'p2', pt: e.p2});
    return pts;
  };

  const points1 = getPts(e1);
  const points2 = getPts(e2);

  let best = {p1: points1[0], p2: points2[0], d: Infinity};
  for (const p1 of points1) {
    for (const p2 of points2) {
      const d = dist(p1.pt, p2.pt);
      if (d < best.d) {
        best = {p1, p2, d};
      }
    }
  }

  if (!best.p1 || !best.p2) return;

  const newConstraints = [...page.constraints];
  newConstraints.push({
    id: generateId(),
    type: 'coincident',
    entityIds: [e1.id, e2.id],
    pointRefs: [
      {entityId: e1.id, pointKey: best.p1.key as any},
      {entityId: e2.id, pointKey: best.p2.key as any},
    ],
  });

  const solved = solveConstraints(page.entities, newConstraints);
  updateActivePage(solved, newConstraints);
}

export function addCollinearConstraintAction() {
  const selection = selectionSignal.value;
  const page = activePageSignal.value;
  const selectedEntities = page.entities.filter(
    e => selection.has(e.id) && (e.type === 'wall' || e.type === 'line'),
  );

  if (selectedEntities.length !== 2) {
    window.alert('Please select exactly 2 walls/lines to make them collinear.');
    return;
  }

  snapshotState();
  const e1 = selectedEntities[0];
  const e2 = selectedEntities[1];

  const newConstraints = [...page.constraints];
  newConstraints.push({
    id: generateId(),
    type: 'collinear',
    entityIds: [e1.id, e2.id],
    pointRefs: [
      {entityId: e1.id, pointKey: 'start'},
      {entityId: e1.id, pointKey: 'end'},
      {entityId: e2.id, pointKey: 'start'},
      {entityId: e2.id, pointKey: 'end'},
    ],
  });

  const solved = solveConstraints(page.entities, newConstraints);
  updateActivePage(solved, newConstraints);
}

export function addConcentricConstraintAction() {
  const selection = selectionSignal.value;
  const page = activePageSignal.value;
  const selectedEntities = page.entities.filter(
    e => selection.has(e.id) && (e.type === 'circle' || e.type === 'arc'),
  );

  if (selectedEntities.length !== 2) {
    window.alert(
      'Please select exactly 2 circles/arcs to make them concentric.',
    );
    return;
  }

  snapshotState();
  const e1 = selectedEntities[0];
  const e2 = selectedEntities[1];

  const newConstraints = [...page.constraints];
  newConstraints.push({
    id: generateId(),
    type: 'concentric',
    entityIds: [e1.id, e2.id],
    pointRefs: [
      {entityId: e1.id, pointKey: 'center'},
      {entityId: e2.id, pointKey: 'center'},
    ],
  });

  const solved = solveConstraints(page.entities, newConstraints);
  updateActivePage(solved, newConstraints);
}

export function addEqualLengthConstraintAction() {
  const selection = selectionSignal.value;
  const page = activePageSignal.value;
  const selectedEntities = page.entities.filter(
    e => selection.has(e.id) && (e.type === 'wall' || e.type === 'line'),
  );

  if (selectedEntities.length !== 2) {
    window.alert(
      'Please select exactly 2 walls/lines to make them equal length.',
    );
    return;
  }

  snapshotState();
  const e1 = selectedEntities[0];
  const e2 = selectedEntities[1];

  const newConstraints = [...page.constraints];
  newConstraints.push({
    id: generateId(),
    type: 'equal_length',
    entityIds: [e1.id, e2.id],
    pointRefs: [
      {entityId: e1.id, pointKey: 'start'},
      {entityId: e1.id, pointKey: 'end'},
      {entityId: e2.id, pointKey: 'start'},
      {entityId: e2.id, pointKey: 'end'},
    ],
  });

  const solved = solveConstraints(page.entities, newConstraints);
  updateActivePage(solved, newConstraints);
}

export async function addFixedAngleConstraintAction() {
  const selection = selectionSignal.value;
  const page = activePageSignal.value;
  const selectedEntities = page.entities.filter(
    e => selection.has(e.id) && (e.type === 'wall' || e.type === 'line'),
  );

  if (selectedEntities.length !== 1) {
    window.alert('Please select exactly 1 wall/line to fix its angle.');
    return;
  }

  const ent = selectedEntities[0] as any;
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
    c => !(c.type === 'fixed_angle' && c.entityIds[0] === ent.id),
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
