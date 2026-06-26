// @vitest-environment jsdom
import {describe, it, expect, beforeEach} from 'vitest';
import {
  projectSignal,
  activePageSignal,
  updateActivePage,
  runSolverOnActivePage,
  setUnitSystem,
} from './project-state';
import {Entity, WallEntity} from '../core/types';

describe('Project State', () => {
  beforeEach(() => {
    // Reset page before each test
    const initialPage = projectSignal.value.pages[0];
    initialPage.entities = [];
    initialPage.constraints = [];
    projectSignal.value = {...projectSignal.value};
  });

  it('updates page entities correctly via updateActivePage', () => {
    const line: Entity = {
      id: 'L1',
      type: 'line',
      start: {x: 0, y: 0},
      end: {x: 10, y: 10},
    };
    const page = activePageSignal.value;
    page.entities.push(line);
    updateActivePage(page.entities, page.constraints);

    expect(activePageSignal.value.entities.length).toBe(1);
    expect(activePageSignal.value.entities[0].id).toBe('L1');
  });

  it('runs solver on active page and updates coordinates', () => {
    const wall: Entity = {
      id: 'W1',
      type: 'wall',
      start: {x: 0, y: 0},
      end: {x: 5, y: 5},
      thickness: 0.2,
    };
    const page = activePageSignal.value;
    page.entities.push(wall);
    page.constraints.push({
      id: 'c1',
      type: 'horizontal',
      entityIds: ['W1'],
      pointRefs: [
        {entityId: 'W1', pointKey: 'start'},
        {entityId: 'W1', pointKey: 'end'},
      ],
    });
    updateActivePage(page.entities, page.constraints);

    runSolverOnActivePage();

    const solvedWall = activePageSignal.value.entities[0] as WallEntity;
    expect(solvedWall.start.y).toBeCloseTo(solvedWall.end.y); // start.y should equal end.y after horizontal constraint solve
  });

  it('sets unit system and triggers render signal', () => {
    setUnitSystem('imperial');
    expect(projectSignal.value.unitSystem).toBe('imperial');
  });
});
