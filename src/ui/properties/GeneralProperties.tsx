import {h} from 'preact';
import {useState} from 'preact/hooks';
import {Entity} from '../../core/types';
import {projectSignal} from '../../state/app-state';
import {ChevronDownIcon, ChevronRightIcon} from '../icons';

interface Props {
  activeEntity: Entity;
  localVals: Record<string, string>;
  getVal: (key: string, defaultVal: string) => string;
  handleInputChange: (key: string, val: string) => void;
  commitProperty: (updater: (ent: Entity) => void) => void;
  handleKeyDownCommit: (e: KeyboardEvent) => void;
}

export function GeneralProperties({
  activeEntity,
  localVals,
  getVal,
  handleInputChange,
  commitProperty,
  handleKeyDownCommit,
}: Props) {
  const project = projectSignal.value;
  const [generalOpen, setGeneralOpen] = useState(true);

  return (
    <div className="properties-category">
      <div
        className="properties-category-header"
        onClick={() => setGeneralOpen(!generalOpen)}
      >
        {generalOpen ? <ChevronDownIcon /> : <ChevronRightIcon />}
        <span className="properties-category-title">General</span>
      </div>

      {generalOpen && (
        <div className="properties-category-content">
          <div className="property-item">
            <span className="property-label">Type</span>
            <div className="property-value">
              <span className="property-value-text">{activeEntity.type}</span>
            </div>
          </div>

          <div className="property-item">
            <span className="property-label">Layer</span>
            <div className="property-value">
              <select
                value={activeEntity.layerId}
                onChange={e => {
                  commitProperty(ent => {
                    ent.layerId = (e.target as HTMLSelectElement).value;
                  });
                }}
              >
                {project.layers.map(l => (
                  <option key={l.id} value={l.id}>
                    {l.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="property-item">
            <span className="property-label">Lock Geometry</span>
            <div className="property-value">
              <input
                type="checkbox"
                checked={!!activeEntity.locked}
                onChange={() => {
                  commitProperty(e => {
                    e.locked = !e.locked;
                  });
                }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
