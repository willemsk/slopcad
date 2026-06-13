import { Tool } from './tool';
import { Vec2, SnapResult, DoorEntity } from '../core/types';
import { Viewport } from '../canvas/viewport';
import { createDoor } from '../core/entity';
import {
  activePageSignal,
  updateActivePage,
  previewEntitySignal,
  snapshotState,
} from '../state/app-state';

export class DoorTool implements Tool {
  name = 'door';

  private hingeSide: 'left' | 'right' = 'left';
  private openSide: 'in' | 'out' = 'in';
  private width = 0.90; // 90cm default width

  activate() {
    this.reset();
  }

  deactivate() {
    this.reset();
  }

  private reset() {
    previewEntitySignal.value = null;
  }

  onMouseDown(worldPos: Vec2, event: MouseEvent, snapResult: SnapResult | null) {
    if (snapResult && snapResult.type === 'wall-align' && snapResult.entityId) {
      snapshotState();

      const page = activePageSignal.value;
      const t = snapResult.extra?.t ?? 0.5;

      const newDoor = createDoor(
        snapResult.entityId,
        t,
        this.width,
        this.hingeSide,
        this.openSide
      );

      const newEntities = [...page.entities, newDoor];
      updateActivePage(newEntities, page.constraints);

      // Re-init preview
      this.updatePreview(snapResult);
    }
  }

  onMouseMove(worldPos: Vec2, event: MouseEvent, snapResult: SnapResult | null) {
    this.updatePreview(snapResult);
  }

  onMouseUp(worldPos: Vec2, event: MouseEvent, snapResult: SnapResult | null) {}

  onKeyDown(event: KeyboardEvent) {
    // Tab flips hinge side
    if (event.key === 'Tab') {
      event.preventDefault();
      this.hingeSide = this.hingeSide === 'left' ? 'right' : 'left';
      this.updatePreview(null); // Force refresh
    }
    // 'F' or 'f' flips open side (in/out)
    if (event.key.toLowerCase() === 'f') {
      event.preventDefault();
      this.openSide = this.openSide === 'in' ? 'out' : 'in';
      this.updatePreview(null); // Force refresh
    }
  }

  private updatePreview(snapResult: SnapResult | null) {
    // If no snapResult is provided, we try to use the last active preview wallId and position
    if (snapResult && snapResult.type === 'wall-align' && snapResult.entityId) {
      const t = snapResult.extra?.t ?? 0.5;
      const ghost = createDoor(
        snapResult.entityId,
        t,
        this.width,
        this.hingeSide,
        this.openSide
      );
      // Give ghost a temporary ID
      ghost.id = 'door-preview';
      previewEntitySignal.value = ghost;
    } else if (previewEntitySignal.value && previewEntitySignal.value.type === 'door') {
      // Update existing preview properties
      const copy = { ...(previewEntitySignal.value as DoorEntity) };
      copy.hingeSide = this.hingeSide;
      copy.openSide = this.openSide;
      previewEntitySignal.value = copy;
    } else {
      previewEntitySignal.value = null;
    }
  }
}
