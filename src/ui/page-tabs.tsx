import {h} from 'preact';
import {
  projectSignal,
  selectionSignal,
  triggerRenderSignal,
  overlayPageIndexSignal,
  pushCommandMessage,
} from '../state/app-state';
import {generateId} from '../core/entity';
import './page-tabs.css';

export function PageTabs() {
  const project = projectSignal.value;

  const handleSelectPage = (index: number) => {
    projectSignal.value = {...project, activePageIndex: index};
    selectionSignal.value = new Set();
    triggerRenderSignal.value = {};
    const pageName = project.pages[index].name;
    pushCommandMessage(
      `Command: LAYOUT - Switched to floor layout "${pageName}".`,
    );
  };

  const handleAddPage = () => {
    const defaultName = `Floor ${project.pages.length}`;
    const name = window.prompt('Enter new floor name:', defaultName);
    if (name === null) return;
    const cleanName = name.trim() || defaultName;
    const newPage = {
      id: generateId(),
      name: cleanName,
      entities: [],
      constraints: [],
    };
    const newPages = [...project.pages, newPage];
    projectSignal.value = {
      ...project,
      pages: newPages,
      activePageIndex: newPages.length - 1,
    };
    selectionSignal.value = new Set();
    triggerRenderSignal.value = {};
    pushCommandMessage(
      `Command: LAYOUTNEW - Floor layout "${cleanName}" created.`,
    );
  };

  const handleRenamePage = (index: number) => {
    const page = project.pages[index];
    const name = window.prompt(`Rename floor "${page.name}":`, page.name);
    if (name === null) return;
    const cleanName = name.trim();
    if (!cleanName) return;
    const oldName = page.name;
    const newPages = [...project.pages];
    newPages[index] = {...newPages[index], name: cleanName};
    projectSignal.value = {...project, pages: newPages};
    triggerRenderSignal.value = {};
    pushCommandMessage(
      `Command: RENAME - Floor "${oldName}" renamed to "${cleanName}".`,
    );
  };

  const handleDeletePage = (index: number) => {
    if (project.pages.length <= 1) {
      window.alert('Cannot delete the last remaining floor.');
      return;
    }
    const page = project.pages[index];
    if (
      window.confirm(
        `Delete floor "${page.name}"? This action cannot be undone.`,
      )
    ) {
      const newPages = project.pages.filter((_, i) => i !== index);
      let newActiveIndex = project.activePageIndex;
      if (newActiveIndex >= newPages.length)
        newActiveIndex = newPages.length - 1;
      projectSignal.value = {
        ...project,
        pages: newPages,
        activePageIndex: newActiveIndex,
      };
      selectionSignal.value = new Set();
      if (overlayPageIndexSignal.value === index) {
        overlayPageIndexSignal.value = null;
      } else if (
        overlayPageIndexSignal.value !== null &&
        overlayPageIndexSignal.value > index
      ) {
        overlayPageIndexSignal.value -= 1;
      }
      triggerRenderSignal.value = {};
      pushCommandMessage(`Command: LAYOUTDEL - Floor "${page.name}" deleted.`);
    }
  };

  return (
    <footer className="page-tabs-container">
      <div className="tabs">
        {project.pages.map((page, idx) => {
          const isActive = idx === project.activePageIndex;
          return (
            <div
              key={page.id}
              className={`tab ${isActive ? 'active' : ''}`}
              onClick={() => handleSelectPage(idx)}
              onDblClick={() => handleRenamePage(idx)}
              title="Double click to rename"
            >
              <span className="tab-name">{page.name}</span>
              {project.pages.length > 1 && (
                <button
                  className="tab-close"
                  onClick={e => {
                    e.stopPropagation();
                    handleDeletePage(idx);
                  }}
                  title="Delete floor"
                >
                  ×
                </button>
              )}
            </div>
          );
        })}
        <button
          className="tab-add"
          onClick={handleAddPage}
          title="Add new floor"
        >
          +
        </button>
      </div>

      {/* Ghost overlay toggle */}
      <div className="overlay-control">
        <label htmlFor="overlay-select">Ghost Overlay:</label>
        <select
          id="overlay-select"
          value={
            overlayPageIndexSignal.value === null
              ? 'none'
              : overlayPageIndexSignal.value.toString()
          }
          onChange={e => {
            const val = e.currentTarget.value;
            if (val === 'none') {
              overlayPageIndexSignal.value = null;
              pushCommandMessage('Command: OVERLAY - Ghost overlay disabled.');
            } else {
              overlayPageIndexSignal.value = parseInt(val, 10);
              const name = project.pages[parseInt(val, 10)].name;
              pushCommandMessage(
                `Command: OVERLAY - Displaying "${name}" as background overlay.`,
              );
            }
            triggerRenderSignal.value = {};
          }}
        >
          <option value="none">None</option>
          {project.pages.map((page, idx) => {
            if (idx === project.activePageIndex) return null;
            return (
              <option key={page.id} value={idx.toString()}>
                {page.name}
              </option>
            );
          })}
        </select>
      </div>
    </footer>
  );
}
