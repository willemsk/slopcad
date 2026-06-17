import {h} from 'preact';
import {
  projectSignal,
  overlayPageIndexSignal,
  selectPageAction,
  addPageAction,
  renamePageAction,
  deletePageAction,
  setOverlayPageAction,
} from '../state/app-state';
import './page-tabs.css';

export function PageTabs() {
  const project = projectSignal.value;

  return (
    <footer className="page-tabs-container">
      <div className="tabs">
        {project.pages.map((page, idx) => {
          const isActive = idx === project.activePageIndex;
          return (
            <div
              key={page.id}
              className={`tab ${isActive ? 'active' : ''}`}
              onClick={() => selectPageAction(idx)}
              onDblClick={() => renamePageAction(idx)}
              title="Double click to rename"
            >
              <span className="tab-name">{page.name}</span>
              {project.pages.length > 1 && (
                <button
                  className="tab-close"
                  onClick={e => {
                    e.stopPropagation();
                    deletePageAction(idx);
                  }}
                  title="Delete floor"
                  aria-label="Delete floor"
                >
                  ×
                </button>
              )}
            </div>
          );
        })}
        <button
          className="tab-add"
          onClick={addPageAction}
          title="Add new floor"
          aria-label="Add new floor"
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
          onChange={e => setOverlayPageAction(e.currentTarget.value)}
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
