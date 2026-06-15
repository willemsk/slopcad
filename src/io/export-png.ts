import {Page, UnitSystem} from '../core/types';

// TODO: Implement PNGRenderer using HTMLCanvasElement or OffscreenCanvas
// export class PNGRenderer implements Renderer { ... }

export async function exportPageToPNG(
  page: Page,
  unitSystem: UnitSystem,
): Promise<Blob> {
  // TODO: Use bounding-box to calculate bounds
  // TODO: Instantiate PNGRenderer
  // TODO: Call entity-renderers exactly like exportPageToSVG
  // TODO: return canvas.toBlob() or similar
  throw new Error('exportPageToPNG is not implemented yet.');
}

export function downloadPNGFile(page: Page, unitSystem: UnitSystem) {
  // TODO: Await exportPageToPNG and use URL.createObjectURL on the returned blob to download
  throw new Error('downloadPNGFile is not implemented yet.');
}
