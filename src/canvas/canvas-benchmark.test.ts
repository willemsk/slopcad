import {describe, it, expect} from 'vitest';
import {Entity, Layer, Page, Project} from '../core/types';

describe('Canvas Entity Filtering Performance Benchmark', () => {
  it('measures the performance of filtering entities by layer visibility', () => {
    const layerCount = 100;
    const entityCount = 10000;

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
      } as any);
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

    // Warm up JS engine
    for (let i = 0; i < 10; i++) {
      activePage.entities.filter(ent => {
        const layer =
          project.layers.find(l => l.id === ent.layerId) || project.layers[0];
        return layer?.visible ?? true;
      });
    }

    // Benchmark unoptimized N^2
    const startUnoptimized = performance.now();
    const visibleUnoptimized = activePage.entities.filter(ent => {
      const layer =
        project.layers.find(l => l.id === ent.layerId) || project.layers[0];
      return layer?.visible ?? true;
    });
    const endUnoptimized = performance.now();

    // Benchmark optimized (Map)
    const startOptimized = performance.now();
    const layerMap = new Map<string, Layer>();
    for (const l of project.layers) {
      layerMap.set(l.id, l);
    }

    const visibleOptimized = activePage.entities.filter(ent => {
      const layerId = ent.layerId;
      const layer = layerId
        ? layerMap.get(layerId) || project.layers[0]
        : project.layers[0];
      return layer?.visible ?? true;
    });
    const endOptimized = performance.now();

    const unoptimizedTime = endUnoptimized - startUnoptimized;
    const optimizedTime = endOptimized - startOptimized;

    console.log(`Unoptimized time: ${unoptimizedTime.toFixed(2)}ms`);
    console.log(`Optimized time: ${optimizedTime.toFixed(2)}ms`);
    console.log(
      `Speedup factor: ${(unoptimizedTime / optimizedTime).toFixed(2)}x`,
    );

    expect(visibleUnoptimized.length).toBe(visibleOptimized.length);
    expect(optimizedTime).toBeLessThan(unoptimizedTime);
  });
});
