import {Tool} from './tool';
import {SelectTool} from './select-tool';
import {WallTool} from './wall-tool';
import {DoorTool} from './door-tool';
import {WindowTool} from './window-tool';
import {StairsTool} from './stairs-tool';
import {LineTool} from './line-tool';
import {RectTool} from './rect-tool';
import {CircleTool} from './circle-tool';
import {DimensionTool} from './dimension-tool';
import {TextTool} from './text-tool';
import {
  activeToolSignal,
  previewEntitySignal,
  clearSelection,
  triggerRenderSignal,
} from '../state/app-state';

// Single instances of tools
export const selectTool = new SelectTool();
export const wallTool = new WallTool();
export const doorTool = new DoorTool();
export const windowTool = new WindowTool();
export const stairsTool = new StairsTool();
export const lineTool = new LineTool();
export const rectTool = new RectTool();
export const circleTool = new CircleTool();
export const dimensionTool = new DimensionTool();
export const textTool = new TextTool();

export const toolsMap: Record<string, Tool> = {
  select: selectTool,
  wall: wallTool,
  door: doorTool,
  window: windowTool,
  stairs: stairsTool,
  line: lineTool,
  rect: rectTool,
  circle: circleTool,
  dimension: dimensionTool,
  text: textTool,
};

export function setActiveToolByName(name: string) {
  const current = activeToolSignal.value;
  if (current) {
    current.deactivate();
  }

  const next = toolsMap[name];
  if (next) {
    // Clear dynamic previews on tool change
    previewEntitySignal.value = null;
    if (name !== 'select') {
      // Clear selection when choosing drawing tools
      clearSelection();
    }
    next.activate();
    activeToolSignal.value = next;
    triggerRenderSignal.value = {};
  }
}
