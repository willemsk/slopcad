import {Tool} from './tool';
import {Vec2, SnapResult, WallEntity, Constraint} from '../core/types';
import {ViewportMath} from '../core/viewport-math';
import {createWall, generateId} from '../core/entity';
import {dist} from '../core/geometry';
import {
  activePageSignal,
  updateActivePage,
  projectSignal,
} from '../state/project-state';
import {snapshotState} from '../state/history-actions';
import {previewEntitySignal, triggerRenderSignal} from '../state/ui-state';

export class WallTool implements Tool {
  name = 'wall';

  private startPt: Vec2 | null = null;
  private wallThickness = 0.2; // 20cm default thickness
  private lastClickTime = 0;
  private startSnapRef: {
    entityId: string;
    pointKey: 'start' | 'end';
  } | null = null;

  activate() {
    this.reset();
  }

  deactivate() {
    this.reset();
  }

  private reset() {
    this.startPt = null;
    this.startSnapRef = null;
    previewEntitySignal.value = null;
    triggerRenderSignal.value = {};
  }

  onMouseDown(
    worldPos: Vec2,
    event: MouseEvent,
    snapResult: SnapResult | null,
  ) {
    const now = Date.now();
    const isDoubleClick = now - this.lastClickTime < 300;
    this.lastClickTime = now;

    if (isDoubleClick || event.button === 2) {
      // End wall chain
      this.reset();
      return;
    }

    const targetPt = snapResult ? snapResult.point : worldPos;
    const page = activePageSignal.value;

    if (this.startPt === null) {
      // 1. Start new wall segment
      snapshotState();
      this.startPt = {...targetPt};

      // Remember snap reference for coincident constraint
      if (
        snapResult &&
        snapResult.entityId &&
        (snapResult.type === 'endpoint' || snapResult.type === 'midpoint')
      ) {
        this.startSnapRef = {
          entityId: snapResult.entityId,
          pointKey:
            snapResult.type === 'endpoint'
              ? this.isNearStart(targetPt, snapResult.entityId)
                ? 'start'
                : 'end'
              : 'start', // fallback
        };
      } else {
        this.startSnapRef = null;
      }
    } else {
      // 2. Place current segment, start next
      // Prevent zero-length walls
      if (dist(this.startPt, targetPt) < 0.02) {
        return;
      }

      const layerId = projectSignal.value.activeLayerId;
      const newWall = createWall(
        this.startPt,
        targetPt,
        this.wallThickness,
        layerId,
      );
      const newEntities = [...page.entities, newWall];
      const newConstraints = [...page.constraints];

      // Add coincident constraint at Start Point (if snapped)
      if (this.startSnapRef) {
        const c: Constraint = {
          id: generateId(),
          type: 'coincident',
          entityIds: [newWall.id, this.startSnapRef.entityId],
          pointRefs: [
            {entityId: newWall.id, pointKey: 'start'},
            {
              entityId: this.startSnapRef.entityId,
              pointKey: this.startSnapRef.pointKey,
            },
          ],
        };
        newConstraints.push(c);
      }

      // Add coincident constraint at End Point (if snapped)
      if (
        snapResult &&
        snapResult.entityId &&
        (snapResult.type === 'endpoint' || snapResult.type === 'midpoint')
      ) {
        const pointKey =
          snapResult.type === 'endpoint'
            ? this.isNearStart(targetPt, snapResult.entityId)
              ? 'start'
              : 'end'
            : 'start';
        const c: Constraint = {
          id: generateId(),
          type: 'coincident',
          entityIds: [newWall.id, snapResult.entityId],
          pointRefs: [
            {entityId: newWall.id, pointKey: 'end'},
            {entityId: snapResult.entityId, pointKey},
          ],
        };
        newConstraints.push(c);

        // Chain continues, but snap reference for next segment start is this end snap
        this.startSnapRef = {
          entityId: snapResult.entityId,
          pointKey: pointKey,
        };
      } else {
        // If not snapped to another wall, snap to this newly created wall's end
        this.startSnapRef = {
          entityId: newWall.id,
          pointKey: 'end',
        };
      }

      // Automatically chain wall endpoints: lock previous wall end to new wall start
      // But only if we had a previous wall in this chain that wasn't already locked by snap
      if (
        page.entities.length > 0 &&
        !newConstraints.some(c =>
          c.pointRefs?.some(
            r => r.entityId === newWall.id && r.pointKey === 'start',
          ),
        )
      ) {
        const lastEntity = page.entities[page.entities.length - 1];
        if (
          lastEntity.type === 'wall' &&
          dist(lastEntity.end, newWall.start) < 0.01
        ) {
          const c: Constraint = {
            id: generateId(),
            type: 'coincident',
            entityIds: [newWall.id, lastEntity.id],
            pointRefs: [
              {entityId: newWall.id, pointKey: 'start'},
              {entityId: lastEntity.id, pointKey: 'end'},
            ],
          };
          newConstraints.push(c);
        }
      }

      updateActivePage(newEntities, newConstraints);

      this.startPt = {...targetPt};
      previewEntitySignal.value = null;
    }
  }

  onMouseMove(
    worldPos: Vec2,
    event: MouseEvent,
    snapResult: SnapResult | null,
  ) {
    if (this.startPt) {
      const targetPt = snapResult ? snapResult.point : worldPos;
      // Constraint to horizontal/vertical if Shift key is held
      const finalPt = {...targetPt};
      if (event.shiftKey) {
        const dx = Math.abs(finalPt.x - this.startPt.x);
        const dy = Math.abs(finalPt.y - this.startPt.y);
        if (dx > dy) {
          finalPt.y = this.startPt.y; // Horizontal
        } else {
          finalPt.x = this.startPt.x; // Vertical
        }
      }

      const layerId = projectSignal.value.activeLayerId;
      previewEntitySignal.value = createWall(
        this.startPt,
        finalPt,
        this.wallThickness,
        layerId,
      );
    }
  }

  onMouseUp(worldPos: Vec2, event: MouseEvent, snapResult: SnapResult | null) {}

  onKeyDown(event: KeyboardEvent) {
    if (event.key === 'Escape' || event.key === 'Enter') {
      this.reset();
    }
  }

  // Check if click coordinate is closer to start or end of specified wall
  private isNearStart(pt: Vec2, wallId: string): boolean {
    const page = activePageSignal.value;
    const wall = page.entities.find(e => e.id === wallId);
    if (!wall || !('start' in wall)) return true;
    return dist(pt, wall.start) < dist(pt, wall.end);
  }
}
