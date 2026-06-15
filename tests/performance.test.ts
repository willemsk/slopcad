import {describe, it, expect} from 'vitest';
import {Project, Page, Layer, Entity} from '../src/core/types';

describe('Performance Baseline: visibleEntities filtering', () => {
  it('should measure the baseline and optimized performance', () => {
    // 1. Setup a large project
    const numLayers = 100;
    const numEntities = 10000;

    const layers: Layer[] = [];
    for (let i = 0; i < numLayers; i++) {
      layers.push({
        id: `layer_${i}`,
        name: `Layer ${i}`,
        color: '#ffffff',
        visible: i % 2 === 0, // Half visible, half not
        locked: false,
      });
    }

    const entities: Entity[] = [];
    for (let i = 0; i < numEntities; i++) {
      entities.push({
        id: `ent_${i}`,
        type: 'line', // Doesn't matter for this test
        layerId: `layer_${i % numLayers}`, // Distribute across layers
        // dummy points
        start: {x: 0, y: 0},
        end: {x: 10, y: 10},
      } as any);
    }

    const page: Page = {
      id: 'page_1',
      name: 'Page 1',
      entities,
      constraints: [],
    };

    const project: Project = {
      name: 'Test',
      created: Date.now(),
      modified: Date.now(),
      unitSystem: 'metric',
      scale: 100,
      layers,
      activeLayerId: layers[0].id,
      pages: [page],
      activePageIndex: 0,
    };

    const activePage = page;

    // --- Original Approach (Baseline) ---
    const originalStart = performance.now();
    // Simulate doing it multiple times, as happens during drag
    const iterations = 50;
    let originalVisibleCount = 0;
    for (let i = 0; i < iterations; i++) {
      const visibleEntitiesOriginal = activePage.entities.filter(ent => {
        const layer =
          project.layers.find(l => l.id === ent.layerId) || project.layers[0];
        return layer?.visible ?? true;
      });
      originalVisibleCount = visibleEntitiesOriginal.length;
    }
    const originalEnd = performance.now();
    const originalTime = originalEnd - originalStart;

    // --- Optimized Approach ---
    const optimizedStart = performance.now();
    let optimizedVisibleCount = 0;
    for (let i = 0; i < iterations; i++) {
      // 1. Build map
      const layerVisibilityMap = new Map<string, boolean>();
      for (const layer of project.layers) {
        layerVisibilityMap.set(layer.id, layer.visible);
      }
      const fallbackVisibility = project.layers[0]?.visible ?? true;

      // 2. Filter
      const visibleEntitiesOptimized = activePage.entities.filter(ent => {
        const isVisible = ent.layerId
          ? layerVisibilityMap.get(ent.layerId)
          : undefined;
        return isVisible !== undefined ? isVisible : fallbackVisibility;
      });
      optimizedVisibleCount = visibleEntitiesOptimized.length;
    }
    const optimizedEnd = performance.now();
    const optimizedTime = optimizedEnd - optimizedStart;

    console.log(`--- Performance Results (${iterations} iterations) ---`);
    console.log(`Original Time : ${originalTime.toFixed(2)} ms`);
    console.log(`Optimized Time: ${optimizedTime.toFixed(2)} ms`);
    console.log(
      `Improvement   : ${(originalTime / optimizedTime).toFixed(2)}x faster`,
    );

    expect(originalVisibleCount).toBe(optimizedVisibleCount);
  });
});
