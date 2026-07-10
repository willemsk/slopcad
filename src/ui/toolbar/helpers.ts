import {pushCommandMessage} from '../../state/ui-state';
import {setActiveToolByName} from '../../tools/tool-registry';

export const TOOL_PROMPTS: Record<string, string> = {
  select:
    'Command: SELECT - Select entities, drag to move, drag handles to resize. Press Del to delete.',
  wall: 'Command: WALL - Click canvas to start drawing wall segment. Press Esc to finish.',
  door: 'Command: DOOR - Hover over a wall to place door. Tab = flip hinge, F = flip swing side.',
  window:
    'Command: WINDOW - Hover over a wall to place window. Press Esc to cancel.',
  stairs:
    'Command: STAIRS - Click and drag to draw stair footprint, then change tread count in properties.',
  line: 'Command: LINE - Click to start line, click again to place end. Press Esc to cancel.',
  rect: 'Command: RECTANGLE - Click to place first corner, click again for opposite corner.',
  circle: 'Command: CIRCLE - Click center point, move and click to set radius.',
  dimension:
    'Command: DIMENSION - Click first point, click second point, then offset and click to place.',
  text: 'Command: TEXT - Click canvas to place text element, edit text inside properties panel.',
};

export function selectTool(name: string) {
  setActiveToolByName(name);
  const prompt = TOOL_PROMPTS[name] || `Command: ${name.toUpperCase()}`;
  pushCommandMessage(prompt);
}
