import {
  Entity,
  WallEntity,
  LineEntity,
  StairsEntity,
  RectEntity,
  DimensionEntity,
  ArcEntity,
  CircleEntity,
  Vec2,
} from '../core/types';
import {generateId} from '../core/entity';
import {solveConstraints} from '../core/solver';
import {dist} from '../core/geometry';
import {activePageSignal, updateActivePage} from './project-state';
import {snapshotState} from './history-actions';
import {selectionSignal} from './selection-state';

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
  const e1 = selectedEntities[0];
  const e2 = selectedEntities[1];

  const getPts = (e: Entity) => {
    const pts: {
      key: 'start' | 'end' | 'p1' | 'p2' | 'center' | 'position';
      pt: Vec2;
    }[] = [];
    if (e.type === 'wall' || e.type === 'line' || e.type === 'stairs') {
      const w = e as WallEntity | LineEntity | StairsEntity;
      pts.push({key: 'start', pt: w.start});
      pts.push({key: 'end', pt: w.end});
    } else if (e.type === 'rect' || e.type === 'dimension') {
      const r = e as RectEntity | DimensionEntity;
      pts.push({key: 'p1', pt: r.p1});
      pts.push({key: 'p2', pt: r.p2});
    }
    return pts;
  };

  const points1 = getPts(e1);
  const points2 = getPts(e2);

  if (points1.length === 0 || points2.length === 0) return;

  let best = {p1: points1[0], p2: points2[0], d: Infinity};
  for (const p1 of points1) {
    for (const p2 of points2) {
      const d = dist(p1.pt, p2.pt);
      if (d < best.d) {
        best = {p1, p2, d};
      }
    }
  }

  const newConstraints = [...page.constraints];
  newConstraints.push({
    id: generateId(),
    type: 'coincident',
    entityIds: [e1.id, e2.id],
    pointRefs: [
      {entityId: e1.id, pointKey: best.p1.key},
      {entityId: e2.id, pointKey: best.p2.key},
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
