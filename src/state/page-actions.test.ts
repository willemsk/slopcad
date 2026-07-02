// @vitest-environment jsdom
import {describe, it, expect, beforeEach, vi} from 'vitest';
import {projectSignal} from './project-state';
import {
  selectPageAction,
  addPageAction,
  renamePageAction,
  deletePageAction,
  setOverlayPageAction,
} from './page-actions';
import {activePromptSignal, overlayPageIndexSignal} from './ui-state';

describe('Page Actions', () => {
  beforeEach(() => {
    // Reset pages before each test
    const defaultPage = {
      id: 'page1',
      name: 'Ground Floor',
      entities: [],
      constraints: [],
    };
    projectSignal.value = {
      name: 'Test Project',
      created: Date.now(),
      modified: Date.now(),
      unitSystem: 'metric',
      scale: 100,
      layers: [],
      activeLayerId: '0',
      pages: [defaultPage],
      activePageIndex: 0,
    };
    overlayPageIndexSignal.value = null;
  });

  it('switches between pages', () => {
    projectSignal.value.pages.push({
      id: 'page2',
      name: 'First Floor',
      entities: [],
      constraints: [],
    });
    projectSignal.value = {...projectSignal.value};

    selectPageAction(1);
    expect(projectSignal.value.activePageIndex).toBe(1);
  });

  it('adds a page when prompt is resolved', async () => {
    const promise = addPageAction();

    // Verify prompt is displayed
    expect(activePromptSignal.value).not.toBeNull();
    // Simulate user entering floor name
    activePromptSignal.value?.resolve('First Floor');

    await promise;

    expect(projectSignal.value.pages.length).toBe(2);
    expect(projectSignal.value.pages[1].name).toBe('First Floor');
    expect(projectSignal.value.activePageIndex).toBe(1);
  });

  it('renames a page when prompt is resolved', async () => {
    const promise = renamePageAction(0);

    expect(activePromptSignal.value).not.toBeNull();
    activePromptSignal.value?.resolve('Renamed Floor');

    await promise;

    expect(projectSignal.value.pages[0].name).toBe('Renamed Floor');
  });

  it('deletes a page when confirmed', () => {
    projectSignal.value.pages.push({
      id: 'page2',
      name: 'First Floor',
      entities: [],
      constraints: [],
    });
    projectSignal.value = {...projectSignal.value};

    vi.spyOn(window, 'confirm').mockReturnValue(true);

    deletePageAction(1);

    expect(projectSignal.value.pages.length).toBe(1);
    expect(projectSignal.value.pages[0].name).toBe('Ground Floor');
  });

  it('sets the ghost page overlay correctly', () => {
    projectSignal.value.pages.push({
      id: 'page2',
      name: 'First Floor',
      entities: [],
      constraints: [],
    });
    projectSignal.value = {...projectSignal.value};

    setOverlayPageAction('1');
    expect(overlayPageIndexSignal.value).toBe(1);

    setOverlayPageAction('none');
    expect(overlayPageIndexSignal.value).toBeNull();
  });
});
