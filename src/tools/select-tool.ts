import {Tool} from './tool';
import {Vec2, SnapResult, Entity, PointRef, WallEntity} from '../core/types';
import {getEntityPoint} from '../core/entity';
import {ViewportMath} from '../core/viewport-math';
import {dist, sub, add, lerp, projectPointT} from '../core/geometry';
import {findEntityAt} from '../core/hit-test';
import {solveConstraints} from '../core/solver';
import {
  projectSignal,
  updateActivePage,
  activePageSignal,
  runSolverOnActivePage,
  entityMap,
} from '../state/project-state';
import {snapshotState} from '../state/history-actions';
import {
  selectionSignal,
  clearSelection,
  selectEntity,
} from '../state/selection-state';
import {triggerRenderSignal} from '../state/ui-state';
import {viewportSignal} from '../state/viewport-state';

export class SelectTool implements Tool {
  name = 'select';

  private draggingHandle: {
    entityId: string;
    pointKey: 'start' | 'end' | 'center' | 'p1' | 'p2' | 'position';
  } | null = null;
  private draggingEntities: Entity[] = [];
  private dragStartPos: Vec2 = {x: 0, y: 0};
  private dragLastPos: Vec2 = {x: 0, y: 0};
  private didDrag = false;

  // Box selection
  private boxStart: Vec2 | null = null;
  private boxEnd: Vec2 | null = null;

  activate() {
    this.reset();
  }

  deactivate() {
    this.reset();
  }

  private reset() {
    this.draggingHandle = null;
    this.draggingEntities = [];
    this.boxStart = null;
    this.boxEnd = null;
    this.didDrag = false;
  }

  onMouseDown(
    worldPos: Vec2,
    event: MouseEvent,
    snapResult: SnapResult | null,
  ) {
    this.dragStartPos = {...worldPos};
    this.dragLastPos = {...worldPos};
    this.didDrag = false;

    const page = activePageSignal.value;
    const selectedIds = selectionSignal.value;

    const zoom = viewportSignal.value?.zoom || 100;
    const handleRadius = 8 / zoom; // 8 screen pixels

    // 1. Check if clicked on any handles of selected entities
    for (const ent of page.entities) {
      if (selectedIds.has(ent.id)) {
        const handleKeys = this.getEntityHandleKeys(ent);
        for (const key of handleKeys) {
          let pt: Vec2 | undefined;
          if (
            key === 'position' &&
            (ent.type === 'door' || ent.type === 'window')
          ) {
            const wall = page.entities.find((e) => e.id === ent.wallId) as
              | WallEntity
              | undefined;
            if (wall) pt = lerp(wall.start, wall.end, ent.position);
          } else {
            pt = getEntityPoint(ent, key);
          }

          if (pt && dist(worldPos, pt) < handleRadius) {
            snapshotState(); // Save undo state before edit
            this.draggingHandle = {entityId: ent.id, pointKey: key};
            return;
          }
        }
      }
    }

    // 2. Check if clicked on any entity (selection / drag)
    const clickedEnt = findEntityAt(
      worldPos,
      page.entities,
      handleRadius,
      entityMap.value,
    );
    if (clickedEnt) {
      const isSelected = selectedIds.has(clickedEnt.id);

      if (!isSelected) {
        if (event.shiftKey) {
          selectEntity(clickedEnt.id, true);
        } else {
          selectEntity(clickedEnt.id, false);
        }
      }

      // Start drag entities
      snapshotState(); // Save undo state before drag
      const idsToDrag = selectionSignal.value;
      this.draggingEntities = page.entities
        .filter((e) => idsToDrag.has(e.id) && !e.locked)
        .map((e) => JSON.parse(JSON.stringify(e))); // deep copy starting state

      return;
    }

    // 3. Clicked empty space: start box selection
    if (!event.shiftKey) {
      clearSelection();
    }
    this.boxStart = {...worldPos};
    this.boxEnd = {...worldPos};
  }

  onMouseMove(
    worldPos: Vec2,
    event: MouseEvent,
    snapResult: SnapResult | null,
  ) {
    const deltaX = worldPos.x - this.dragLastPos.x;
    const deltaY = worldPos.y - this.dragLastPos.y;

    if (dist(worldPos, this.dragStartPos) > 0.02) {
      this.didDrag = true;
    }

    // A. Dragging Handle
    if (this.draggingHandle) {
      const page = activePageSignal.value;
      const targetPos = snapResult ? snapResult.point : worldPos;

      // Update the handle coordinate
      const updatedEntities = page.entities.map((ent) => {
        if (ent.id === this.draggingHandle!.entityId) {
          const copy = JSON.parse(JSON.stringify(ent));
          if (
            this.draggingHandle!.pointKey === 'position' &&
            (copy.type === 'door' || copy.type === 'window')
          ) {
            const wall = page.entities.find((w) => w.id === copy.wallId) as
              | WallEntity
              | undefined;
            if (wall) {
              const pT = projectPointT(worldPos, wall.start, wall.end);
              const wallLength = dist(wall.start, wall.end);
              const minT = copy.width / 2 / wallLength;
              const maxT = 1 - minT;
              copy.position = Math.max(minT, Math.min(maxT, pT));
            }
          } else {
            const key = this.draggingHandle!.pointKey;
            if (key === 'start' && 'start' in copy) copy.start = {...targetPos};
            else if (key === 'end' && 'end' in copy) copy.end = {...targetPos};
            else if (key === 'p1' && 'p1' in copy) copy.p1 = {...targetPos};
            else if (key === 'p2' && 'p2' in copy) copy.p2 = {...targetPos};
            else if (key === 'center' && 'center' in copy)
              copy.center = {...targetPos};
            else if (key === 'position' && copy.type === 'text')
              copy.position = {...targetPos};
          }
          return copy;
        }
        return ent;
      });

      // Pin the dragging handle during solving
      // If it's a door/window position, we don't need to run the solver on it, but we can safely skip pinning since it doesn't affect other things.
      const pinnedRef: PointRef | null =
        this.draggingHandle.pointKey === 'position' &&
        (updatedEntities.find((e) => e.id === this.draggingHandle!.entityId)
          ?.type === 'door' ||
          updatedEntities.find((e) => e.id === this.draggingHandle!.entityId)
            ?.type === 'window')
          ? null
          : {
              entityId: this.draggingHandle.entityId,
              pointKey: this.draggingHandle.pointKey,
            };

      // Run solver
      const solved = pinnedRef
        ? solveConstraints(updatedEntities, page.constraints, [pinnedRef])
        : updatedEntities;
      updateActivePage(solved, page.constraints);
      this.dragLastPos = {...worldPos};
      return;
    }

    // B. Dragging Entities
    if (this.draggingEntities.length > 0) {
      const page = activePageSignal.value;
      const totalDelta = sub(worldPos, this.dragStartPos);

      // Translate all points of dragged entities
      const updatedEntities = page.entities.map((ent) => {
        const dragStartEnt = this.draggingEntities.find((e) => e.id === ent.id);
        if (dragStartEnt) {
          const copy = JSON.parse(JSON.stringify(ent));
          // Move start/end points
          if ('start' in copy && 'start' in dragStartEnt)
            copy.start = add(dragStartEnt.start, totalDelta);
          if ('end' in copy && 'end' in dragStartEnt)
            copy.end = add(dragStartEnt.end, totalDelta);
          if ('p1' in copy && 'p1' in dragStartEnt)
            copy.p1 = add(dragStartEnt.p1, totalDelta);
          if ('p2' in copy && 'p2' in dragStartEnt)
            copy.p2 = add(dragStartEnt.p2, totalDelta);
          if ('center' in copy && 'center' in dragStartEnt)
            copy.center = add(dragStartEnt.center, totalDelta);
          if (copy.type === 'text' && dragStartEnt.type === 'text')
            copy.position = add(dragStartEnt.position, totalDelta);

          return copy;
        }
        return ent;
      });

      // Build list of pinned points (all start/end coordinates of translated entities)
      const pinnedRefs: PointRef[] = [];
      for (const ent of this.draggingEntities) {
        const keys = this.getEntityHandleKeys(ent);
        for (const k of keys) {
          pinnedRefs.push({entityId: ent.id, pointKey: k});
        }
      }

      // Solve constraints
      const solved = solveConstraints(
        updatedEntities,
        page.constraints,
        pinnedRefs,
      );
      updateActivePage(solved, page.constraints);
      this.dragLastPos = {...worldPos};
      return;
    }

    // C. Box Selection
    if (this.boxStart) {
      this.boxEnd = {...worldPos};
      triggerRenderSignal.value = {}; // force redraw to draw box overlay
    }
  }

  onMouseUp(worldPos: Vec2, event: MouseEvent, snapResult: SnapResult | null) {
    // End dragging
    this.draggingHandle = null;
    this.draggingEntities = [];

    // Handle selection click that didn't result in a drag
    if (!this.didDrag && !this.boxStart) {
      const page = activePageSignal.value;
      const zoom = viewportSignal.value?.zoom || 100;
      const handleRadius = 8 / zoom;
      const clickedEnt = findEntityAt(
        worldPos,
        page.entities,
        handleRadius,
        entityMap.value,
      );

      if (clickedEnt) {
        const isSelected = selectionSignal.value.has(clickedEnt.id);
        if (isSelected && event.shiftKey) {
          // Toggle off
          const newSet = new Set(selectionSignal.value);
          newSet.delete(clickedEnt.id);
          selectionSignal.value = newSet;
        } else if (
          isSelected &&
          !event.shiftKey &&
          selectionSignal.value.size > 1
        ) {
          // Clicked a single item within a multi-selection without dragging -> select only this
          selectEntity(clickedEnt.id, false);
        }
      }
    }

    // End Box select
    if (this.boxStart && this.boxEnd) {
      const page = activePageSignal.value;
      const x1 = Math.min(this.boxStart.x, this.boxEnd.x);
      const x2 = Math.max(this.boxStart.x, this.boxEnd.x);
      const y1 = Math.min(this.boxStart.y, this.boxEnd.y);
      const y2 = Math.max(this.boxStart.y, this.boxEnd.y);

      const withinBox = (pt: Vec2) =>
        pt.x >= x1 && pt.x <= x2 && pt.y >= y1 && pt.y <= y2;

      const newSelection = new Set<string>(
        event.shiftKey ? selectionSignal.value : [],
      );

      for (const ent of page.entities) {
        let matches = false;
        if (
          ent.type === 'wall' ||
          ent.type === 'line' ||
          ent.type === 'stairs'
        ) {
          matches = withinBox(ent.start) || withinBox(ent.end);
        } else if (ent.type === 'rect') {
          matches = withinBox(ent.p1) || withinBox(ent.p2);
        } else if (ent.type === 'circle' || ent.type === 'arc') {
          matches = withinBox(ent.center);
        } else if (ent.type === 'text') {
          matches = withinBox(ent.position);
        } else if (ent.type === 'door' || ent.type === 'window') {
          const wall = page.entities.find((e) => e.id === ent.wallId) as
            | WallEntity
            | undefined;
          if (wall) {
            matches = withinBox(lerp(wall.start, wall.end, ent.position));
          }
        }

        if (matches) {
          newSelection.add(ent.id);
        }
      }

      selectionSignal.value = newSelection;
      this.boxStart = null;
      this.boxEnd = null;
    }

    this.reset();
    triggerRenderSignal.value = {};
  }

  renderPreview(
    ctx: CanvasRenderingContext2D,
    viewport: ViewportMath,
    currentWorldPos: Vec2,
  ) {
    // Draw Box Selection rectangle
    if (this.boxStart && this.boxEnd) {
      ctx.save();
      ctx.strokeStyle = 'rgba(34, 211, 238, 0.6)';
      ctx.fillStyle = 'rgba(34, 211, 238, 0.05)';
      ctx.lineWidth = 1 / viewport.zoom;
      ctx.beginPath();
      ctx.rect(
        this.boxStart.x,
        this.boxStart.y,
        this.boxEnd.x - this.boxStart.x,
        this.boxEnd.y - this.boxStart.y,
      );
      ctx.fill();
      ctx.stroke();
      ctx.restore();
    }
  }

  private getEntityHandleKeys(
    entity: Entity,
  ): Array<'start' | 'end' | 'center' | 'p1' | 'p2' | 'position'> {
    switch (entity.type) {
      case 'wall':
      case 'line':
      case 'stairs':
        return ['start', 'end'];
      case 'rect':
      case 'dimension':
        return ['p1', 'p2'];
      case 'circle':
      case 'arc':
        return ['center'];
      case 'text':
        return ['position'];
      case 'door':
      case 'window':
        return ['position'];
      default:
        return [];
    }
  }
}
