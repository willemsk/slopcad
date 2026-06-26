import {describe, it, expect, vi, beforeEach, afterEach} from 'vitest';
import {exportPageToSVG, downloadSVGFile} from './export-svg';
import {Page, WallEntity} from '../core/types';

describe('SVG Exporter', () => {
  beforeEach(() => {
    vi.stubGlobal('URL', {
      createObjectURL: vi.fn(() => 'blob:mock-url'),
      revokeObjectURL: vi.fn(),
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('exports a page to a valid SVG string', () => {
    const page: Page = {
      id: 'p1',
      name: 'Test Page',
      entities: [
        {
          id: 'w1',
          type: 'wall',
          start: {x: 0, y: 0},
          end: {x: 4, y: 0},
          thickness: 0.2,
        } as WallEntity,
      ],
      constraints: [],
    };

    const svg = exportPageToSVG(page, 'metric');
    expect(svg).toContain('<?xml version="1.0" encoding="utf-8"?>');
    expect(svg).toContain('<svg');
    expect(svg).toContain('viewBox="-1 -1 6 2"'); // based on bounding box + default 1.0 padding
    expect(svg).toContain('<polygon points="0,0.1 4,0.1 4,-0.1 0,-0.1"'); // wall fill polygon points
    expect(svg).toContain('fill="#1e2028"'); // canvas bg
  });

  it('downloads the SVG file by creating an anchor element and clicking it', () => {
    const page: Page = {
      id: 'p1',
      name: 'My Custom Plan',
      entities: [],
      constraints: [],
    };

    const clickSpy = vi.fn();
    const anchorMock = {
      href: '',
      download: '',
      click: clickSpy,
    };

    const createElementSpy = vi
      .spyOn(document, 'createElement')
      .mockReturnValue(anchorMock as any);

    vi.useFakeTimers();

    downloadSVGFile(page, 'metric');

    expect(createElementSpy).toHaveBeenCalledWith('a');
    expect(anchorMock.href).toBe('blob:mock-url');
    expect(anchorMock.download).toBe('my_custom_plan.svg');
    expect(clickSpy).toHaveBeenCalled();

    vi.runAllTimers();
    expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:mock-url');

    vi.useRealTimers();
  });
});
