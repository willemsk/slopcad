import {Tool} from './tool';
import {Vec2, SnapResult, Entity, PointRef} from '../core/types';
import {Viewport} from '../canvas/viewport';
import {
  dist,
  distToSegment,
  sub,
  add,
  normalize,
  scale,
} from '../core/geometry';
import {solveConstraints} from '../core/solver';
import {
  projectSignal,
  selectionSignal,
  clearSelection,
  selectEntity,
  updateActivePage,
  activePageSignal,
  runSolverOnActivePage,
  snapshotState,
  triggerRenderSignal,
  viewportSignal,
} from '../state/app-state';

export class SelectTool implements Tool {
  name = 'select';

  private draggingHandle: {entityId: string; pointKey: string} | null = null;
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
          const pt = (ent as any)[key];
          if (pt && dist(worldPos, pt) < handleRadius) {
            snapshotState(); // Save undo state before edit
            this.draggingHandle = {entityId: ent.id, pointKey: key};
            return;
          }
        }
      }
    }

    // 2. Check if clicked on any entity (selection / drag)
    const clickedEnt = this.findEntityAt(worldPos, page.entities, handleRadius);
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
        .filter(e => idsToDrag.has(e.id) && !e.locked)
        .map(e => JSON.parse(JSON.stringify(e))); // deep copy starting state

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
      const updatedEntities = page.entities.map(ent => {
        if (ent.id === this.draggingHandle!.entityId) {
          const copy = JSON.parse(JSON.stringify(ent));
          copy[this.draggingHandle!.pointKey] = {...targetPos};
          return copy;
        }
        return ent;
      });

      // Pin the dragging handle during solving
      const pinnedRef: PointRef = {
        entityId: this.draggingHandle.entityId,
        pointKey: this.draggingHandle.pointKey as any,
      };

      // Run solver
      const solved = solveConstraints(updatedEntities, page.constraints, [
        pinnedRef,
      ]);
      updateActivePage(solved, page.constraints);
      this.dragLastPos = {...worldPos};
      return;
    }

    // B. Dragging Entities
    if (this.draggingEntities.length > 0) {
      const page = activePageSignal.value;
      const totalDelta = sub(worldPos, this.dragStartPos);

      // Translate all points of dragged entities
      const updatedEntities = page.entities.map(ent => {
        const dragStartEnt = this.draggingEntities.find(e => e.id === ent.id);
        if (dragStartEnt) {
          const copy = JSON.parse(JSON.stringify(ent));
          const dragStartAny = dragStartEnt as any;

          // Move start/end points
          if (copy.start) copy.start = add(dragStartAny.start, totalDelta);
          if (copy.end) copy.end = add(dragStartAny.end, totalDelta);
          if (copy.p1) copy.p1 = add(dragStartAny.p1, totalDelta);
          if (copy.p2) copy.p2 = add(dragStartAny.p2, totalDelta);
          if (copy.center) copy.center = add(dragStartAny.center, totalDelta);
          if (copy.position && copy.type === 'text')
            copy.position = add(dragStartAny.position, totalDelta);

          return copy;
        }
        return ent;
      });

      // Build list of pinned points (all start/end coordinates of translated entities)
      const pinnedRefs: PointRef[] = [];
      for (const ent of this.draggingEntities) {
        const keys = this.getEntityHandleKeys(ent);
        for (const k of keys) {
          pinnedRefs.push({entityId: ent.id, pointKey: k as any});
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
          matches =
            withinBox((ent as any).start) || withinBox((ent as any).end);
        } else if (ent.type === 'rect') {
          matches = withinBox((ent as any).p1) || withinBox((ent as any).p2);
        } else if (ent.type === 'circle' || ent.type === 'arc') {
          matches = withinBox((ent as any).center);
        } else if (ent.type === 'text') {
          matches = withinBox(ent.position);
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
    viewport: Viewport,
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

  // Find entity under cursor
  private findEntityAt(
    pt: Vec2,
    entities: Entity[],
    hitRadius: number,
  ): Entity | null {
    let bestEnt: Entity | null = null;
    let bestDist = hitRadius;

    for (const ent of entities) {
      if (ent.type === 'wall' || ent.type === 'line' || ent.type === 'stairs') {
        const d = distToSegment(pt, (ent as any).start, (ent as any).end);
        if (d < bestDist) {
          bestDist = d;
          bestEnt = ent;
        }
      } else if (ent.type === 'rect') {
        const r = ent;
        const d1 = distToSegment(pt, r.p1, {x: r.p2.x, y: r.p1.y});
        const d2 = distToSegment(pt, {x: r.p2.x, y: r.p1.y}, r.p2);
        const d3 = distToSegment(pt, r.p2, {x: r.p1.x, y: r.p2.y});
        const d4 = distToSegment(pt, {x: r.p1.x, y: r.p2.y}, r.p1);
        const d = Math.min(d1, d2, d3, d4);
        if (d < bestDist) {
          bestDist = d;
          bestEnt = ent;
        }
      } else if (ent.type === 'circle' || ent.type === 'arc') {
        const c = ent;
        const d = Math.abs(dist(pt, c.center) - c.radius);
        if (d < bestDist) {
          bestDist = d;
          bestEnt = ent;
        }
      } else if (ent.type === 'dimension') {
        const dEnt = ent;
        const u = normalize(sub(dEnt.p2, dEnt.p1));
        const n = {x: -u.y, y: u.x};
        const d1 = add(dEnt.p1, scale(n, dEnt.offset));
        const d2 = add(dEnt.p2, scale(n, dEnt.offset));
        const d = distToSegment(pt, d1, d2);
        if (d < bestDist) {
          bestDist = d;
          bestEnt = ent;
        }
      } else if (ent.type === 'text') {
        const d = dist(pt, ent.position);
        if (d < bestDist) {
          bestDist = d;
          bestEnt = ent;
        }
      }
    }

    return bestEnt;
  }

  private getEntityHandleKeys(entity: Entity): string[] {
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
      default:
        return [];
    }
  }
}
