import {describe, it, expect} from 'vitest';
import {Entity, Layer, Page, Project, LineEntity} from '../core/types';
import {getVisibleEntities} from '../core/entity';

describe('Canvas Entity Filtering Performance Benchmark', () => {
  it('measures the performance of filtering entities by layer visibility', () => {
    const layerCount = 100;
    const entityCount = 20000; // Increased to make the O(N) vs O(N^2) difference clearer

    const layers: Layer[] = [];
    for (let i = 0; i < layerCount; i++) {
      layers.push({
        id: `layer-${i}`,
        name: `Layer ${i}`,
        color: '#000000',
        visible: i % 2 === 0, // Half visible, half hidden
        locked: false,
      });
    }

    const entities: Entity[] = [];
    for (let i = 0; i < entityCount; i++) {
      entities.push({
        id: `entity-${i}`,
        type: 'line',
        layerId: `layer-${Math.floor(Math.random() * layerCount)}`,
        start: {x: 0, y: 0},
        end: {x: 10, y: 10},
      } as LineEntity);
    }

    const project: Project = {
      name: 'Benchmark Project',
      created: 0,
      modified: 0,
      unitSystem: 'metric',
      scale: 1,
      layers: layers,
      activeLayerId: layers[0].id,
      pages: [],
      activePageIndex: 0,
    };

    const activePage: Page = {
      id: 'page-0',
      name: 'Page 0',
      entities: entities,
      constraints: [],
    };

    // Warm up JS engine for both implementations
    for (let i = 0; i < 20; i++) {
      activePage.entities.filter((ent) => {
        const layer =
          project.layers.find((l) => l.id === ent.layerId) || project.layers[0];
        return layer?.visible ?? true;
      });
      getVisibleEntities(activePage.entities, project.layers);
    }

    // Benchmark unoptimized N^2 (taking min of 5 runs to avoid GC/scheduling spikes)
    let unoptimizedTime = Infinity;
    let visibleUnoptimizedCount = 0;
    for (let run = 0; run < 5; run++) {
      const start = performance.now();
      const visible = activePage.entities.filter((ent) => {
        const layer =
          project.layers.find((l) => l.id === ent.layerId) || project.layers[0];
        return layer?.visible ?? true;
      });
      const end = performance.now();
      unoptimizedTime = Math.min(unoptimizedTime, end - start);
      visibleUnoptimizedCount = visible.length;
    }

    // Benchmark optimized (taking min of 5 runs to avoid GC/scheduling spikes)
    let optimizedTime = Infinity;
    let visibleOptimizedCount = 0;
    for (let run = 0; run < 5; run++) {
      const start = performance.now();
      const visible = getVisibleEntities(activePage.entities, project.layers);
      const end = performance.now();
      optimizedTime = Math.min(optimizedTime, end - start);
      visibleOptimizedCount = visible.length;
    }

    console.log(`Unoptimized time: ${unoptimizedTime.toFixed(2)}ms`);
    console.log(`Optimized time: ${optimizedTime.toFixed(2)}ms`);
    console.log(
      `Speedup factor: ${(unoptimizedTime / optimizedTime).toFixed(2)}x`,
    );

    expect(visibleUnoptimizedCount).toBe(visibleOptimizedCount);
    expect(optimizedTime).toBeLessThan(unoptimizedTime);
  });
});
