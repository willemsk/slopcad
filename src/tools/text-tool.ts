import {Tool} from './tool';
import {Vec2, SnapResult} from '../core/types';
import {ViewportMath} from '../core/viewport-math';
import {createText} from '../core/entity';
import {
  activePageSignal,
  updateActivePage,
  selectEntity,
  snapshotState,
  requestPrompt,
  projectSignal,
} from '../state/app-state';

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
