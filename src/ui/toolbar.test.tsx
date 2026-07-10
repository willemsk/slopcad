import {h, render} from 'preact';
import {act} from 'preact/test-utils';
import {afterEach, beforeEach, describe, expect, it} from 'vitest';
import {projectSignal} from '../state/project-state';
import {gridEnabledSignal} from '../state/ui-state';
import {Toolbar} from './toolbar';

describe('Toolbar Component', () => {
  let container: HTMLDivElement;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);

    // Set up projectSignal so HomePanel's Layers panel rendering doesn't crash
    projectSignal.value = {
      name: 'Test Project',
      created: 0,
      modified: 0,
      activeLayerId: 'layer1',
      unitSystem: 'metric',
      scale: 100,
      activePageIndex: 0,
      pages: [
        {
          id: 'page1',
          name: 'Floor 1',
          entities: [],
          constraints: [],
        },
      ],
      layers: [
        {
          id: 'layer1',
          name: 'Default',
          visible: true,
          locked: false,
          color: '#ffffff',
        },
      ],
    };
  });

  afterEach(async () => {
    await act(() => {
      render(null, container);
    });
    container.remove();
  });

  it('renders active tab content and switches tabs on click', async () => {
    await act(() => {
      render(<Toolbar />, container);
    });

    const homeTab = Array.from(container.querySelectorAll('.ribbon-tab')).find(
      (el) => el.textContent === 'Home',
    );
    expect(homeTab?.className).toContain('active');

    const viewTab = Array.from(container.querySelectorAll('.ribbon-tab')).find(
      (el) => el.textContent === 'View',
    ) as HTMLButtonElement;

    expect(viewTab).toBeDefined();

    await act(() => {
      viewTab.click();
    });

    expect(viewTab.className).toContain('active');
    expect(homeTab?.className).not.toContain('active');
  });

  it('toggles grid display signal when Grid button is clicked under View tab', async () => {
    gridEnabledSignal.value = false;

    await act(() => {
      render(<Toolbar />, container);
    });

    const viewTab = Array.from(container.querySelectorAll('.ribbon-tab')).find(
      (el) => el.textContent === 'View',
    ) as HTMLButtonElement;

    await act(() => {
      viewTab.click();
    });

    const gridBtn = Array.from(
      container.querySelectorAll('.ribbon-btn-large'),
    ).find((el) => el.textContent?.includes('Grid')) as HTMLButtonElement;

    expect(gridBtn).toBeDefined();

    await act(() => {
      gridBtn.click();
    });

    expect(gridEnabledSignal.value).toBe(true);
  });
});
