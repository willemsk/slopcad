import {
  Page,
  WallEntity,
  DoorEntity,
  WindowEntity,
  StairsEntity,
  LineEntity,
  RectEntity,
  CircleEntity,
  ArcEntity,
  DimensionEntity,
  TextEntity,
  UnitSystem,
} from '../core/types';
import {calculateBoundingBox} from './bounding-box';
import {SVGRenderer} from './svg-renderer';
import {
  renderWall,
  renderDoor,
  renderWindow,
  renderStairs,
  renderLine,
  renderRect,
  renderCircle,
  renderArc,
  renderDimension,
  renderText,
} from './entity-renderers';

export function exportPageToSVG(page: Page, unitSystem: UnitSystem): string {
  const bbox = calculateBoundingBox(page.entities);

  const renderer = new SVGRenderer();
  renderer.begin(bbox.minX, bbox.minY, bbox.width, bbox.height);

  // Pass 1: Draw walls first
  for (const ent of page.entities) {
    if (ent.type === 'wall') {
      renderWall(ent as WallEntity, renderer);
    }
  }

  // Pass 2: Draw doors & windows (with background masks that cut walls)
  for (const ent of page.entities) {
    if (ent.type === 'door') {
      const door = ent as DoorEntity;
      const wall = page.entities.find(e => e.id === door.wallId) as WallEntity;
      if (wall) {
        renderDoor(door, wall, renderer);
      }
    } else if (ent.type === 'window') {
      const wind = ent as WindowEntity;
      const wall = page.entities.find(e => e.id === wind.wallId) as WallEntity;
      if (wall) {
        renderWindow(wind, wall, renderer);
      }
    }
  }

  // Pass 3: Draw stairs, shapes, dimensions, text
  for (const ent of page.entities) {
    switch (ent.type) {
      case 'stairs':
        renderStairs(ent as StairsEntity, renderer);
        break;
      case 'line':
        renderLine(ent as LineEntity, renderer);
        break;
      case 'rect':
        renderRect(ent as RectEntity, renderer);
        break;
      case 'circle':
        renderCircle(ent as CircleEntity, renderer);
        break;
      case 'arc':
        renderArc(ent as ArcEntity, renderer);
        break;
      case 'dimension':
        renderDimension(ent as DimensionEntity, unitSystem, renderer);
        break;
      case 'text':
        renderText(ent as TextEntity, renderer);
        break;
    }
  }

  return renderer.end();
}

export function downloadSVGFile(page: Page, unitSystem: UnitSystem) {
  const svgStr = exportPageToSVG(page, unitSystem);
  const blob = new Blob([svgStr], {type: 'image/svg+xml'});
  const url = URL.createObjectURL(blob);

  const a = document.createElement('a');
  const filename =
    page.name.trim().toLowerCase().replace(/\s+/g, '_') || 'floor_plan';
  a.href = url;
  a.download = `${filename}.svg`;
  a.click();

  setTimeout(() => URL.revokeObjectURL(url), 100);
}
