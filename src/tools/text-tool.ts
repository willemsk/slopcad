import {createText} from '../core/entity';
import type {SnapResult, Vec2} from '../core/types';
import {ViewportMath} from '../core/viewport-math';
import {snapshotState} from '../state/history-actions';
import {
  activePageSignal,
  projectSignal,
  updateActivePage,
} from '../state/project-state';
import {selectEntity} from '../state/selection-state';
import {requestPrompt} from '../state/ui-state';
import type {Tool} from './tool';

export class TextTool implements Tool {
  name = 'text';

  activate() {}

  deactivate() {}

  async onMouseDown(
    worldPos: Vec2,
    event: MouseEvent,
    snapResult: SnapResult | null,
  ) {
    snapshotState();

    const page = activePageSignal.value;
    const textVal = await requestPrompt('Text:', 'Text Annotation', {
      x: event.clientX,
      y: event.clientY,
    });
    if (textVal === null) return; // cancelled

    const cleanText = textVal.trim() || 'Text';

    // FontSize in world units: e.g. 0.25 meters (25cm tall letters)
    const layerId = projectSignal.value.activeLayerId;
    const newText = createText(worldPos, cleanText, 0.25, layerId);

    const newEntities = [...page.entities, newText];
    updateActivePage(newEntities, page.constraints);

    // Auto select it so they can configure it in properties
    selectEntity(newText.id);
  }

  onMouseMove(
    worldPos: Vec2,
    event: MouseEvent,
    snapResult: SnapResult | null,
  ) {}

  onMouseUp(worldPos: Vec2, event: MouseEvent, snapResult: SnapResult | null) {}
}
