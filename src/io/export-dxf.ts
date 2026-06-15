import {Page, UnitSystem} from '../core/types';

// TODO: Implement DXFRenderer writing DXF formatted strings using a library like makerjs or a custom writer
// export class DXFRenderer implements Renderer { ... }

export function exportPageToDXF(page: Page, unitSystem: UnitSystem): string {
  // TODO: Use bounding-box to calculate bounds
  // TODO: Instantiate DXFRenderer
  // TODO: Call entity-renderers exactly like exportPageToSVG
  // TODO: return DXF string output
  throw new Error('exportPageToDXF is not implemented yet.');
}

export function downloadDXFFile(page: Page, unitSystem: UnitSystem) {
  // TODO: Generate DXF string, create blob, and trigger download
  throw new Error('downloadDXFFile is not implemented yet.');
}
