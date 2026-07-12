import {h} from 'preact';
import {useState} from 'preact/hooks';
import {activePageSignal, projectSignal} from '../../state/project-state';
import {gridSpacingSignal} from '../../state/ui-state';
import {ChevronDownIcon, ChevronRightIcon} from '../icons';

export function PageProperties() {
  const project = projectSignal.value;
  const page = activePageSignal.value;

  const [pageOpen, setPageOpen] = useState(true);
  const [localPageName, setLocalPageName] = useState(page.name);

  const handlePageNameChange = (val: string) => {
    const newPages = [...project.pages];
    newPages[project.activePageIndex] = {
      ...newPages[project.activePageIndex],
      name: val,
    };
    projectSignal.value = {
      ...project,
      pages: newPages,
    };
  };

  const handleKeyDownCommit = (e: KeyboardEvent) => {
    if (e.key === 'Enter') {
      (e.target as HTMLInputElement).blur();
    }
  };

  return (
    <div className="properties-category">
      <div
        className="properties-category-header"
        onClick={() => setPageOpen(!pageOpen)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            setPageOpen(!pageOpen);
          }
        }}
        role="button"
        tabIndex={0}
        aria-expanded={pageOpen}
        aria-label={
          pageOpen ? 'Collapse Page Settings' : 'Expand Page Settings'
        }
      >
        {pageOpen ? <ChevronDownIcon /> : <ChevronRightIcon />}
        <span className="properties-category-title">Page Settings</span>
      </div>

      {pageOpen && (
        <div className="properties-category-content">
          <div className="property-item">
            <span className="property-label">Floor Name</span>
            <div className="property-value">
              <input
                type="text"
                value={localPageName}
                onInput={(e) =>
                  setLocalPageName((e.target as HTMLInputElement).value)
                }
                onFocus={(e) => (e.target as HTMLInputElement).select()}
                onKeyDown={handleKeyDownCommit}
                onBlur={(e) =>
                  handlePageNameChange((e.target as HTMLInputElement).value)
                }
              />
            </div>
          </div>

          <div className="property-item">
            <span className="property-label">Grid Spacing</span>
            <div className="property-value">
              <select
                value={gridSpacingSignal.value.toString()}
                onChange={(e) => {
                  gridSpacingSignal.value = Number.parseFloat(
                    (e.target as HTMLSelectElement).value,
                  );
                }}
              >
                <option value="0.05">5 cm</option>
                <option value="0.1">10 cm</option>
                <option value="0.2">20 cm</option>
                <option value="0.5">50 cm</option>
                <option value="1.0">1 m</option>
              </select>
            </div>
          </div>

          <div className="property-item">
            <span className="property-label">Drawing Scale</span>
            <div className="property-value">
              <select
                value={project.scale.toString()}
                onChange={(e) => {
                  projectSignal.value = {
                    ...project,
                    scale: Number.parseInt(
                      (e.target as HTMLSelectElement).value,
                    ),
                  };
                }}
              >
                <option value="20">1:20</option>
                <option value="50">1:50</option>
                <option value="100">1:100</option>
                <option value="200">1:200</option>
              </select>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
