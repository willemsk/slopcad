import {h} from 'preact';
import {Entity, StairsEntity} from '../../core/types';

interface StairsParamsProps {
  activeEntity: Entity;
  setLocalVals: (vals: Record<string, string>) => void;
  getVal: (key: string, defaultVal: string) => string;
  handleInputChange: (key: string, val: string) => void;
  commitProperty: (updater: (ent: Entity) => void) => void;
  handleKeyDownCommit: (e: KeyboardEvent) => void;
}

export function StairsParams({
  activeEntity,
  setLocalVals,
  getVal,
  handleInputChange,
  commitProperty,
  handleKeyDownCommit,
}: StairsParamsProps) {
  if (activeEntity.type !== 'stairs') return null;

  return (
    <div>
      <div className="property-item">
        <span className="property-label">Tread Count</span>
        <div className="property-value">
          <input
            type="number"
            min="2"
            max="50"
            value={getVal(
              'treads',
              (activeEntity as StairsEntity).treadCount.toString(),
            )}
            onInput={e =>
              handleInputChange('treads', (e.target as HTMLInputElement).value)
            }
            onFocus={e => (e.target as HTMLInputElement).select()}
            onKeyDown={handleKeyDownCommit}
            onBlur={e => {
              const val = parseInt((e.target as HTMLInputElement).value);
              if (!isNaN(val) && val >= 2) {
                commitProperty(ent => {
                  (ent as StairsEntity).treadCount = val;
                });
              } else {
                setLocalVals({});
              }
            }}
          />
        </div>
      </div>

      <div className="property-item">
        <span className="property-label">Direction</span>
        <div className="property-value">
          <select
            value={(activeEntity as StairsEntity).direction}
            onChange={e => {
              commitProperty(ent => {
                (ent as StairsEntity).direction = (
                  e.target as HTMLSelectElement
                ).value as any;
              });
            }}
          >
            <option value="up">Going UP</option>
            <option value="down">Going DN (Down)</option>
          </select>
        </div>
      </div>
    </div>
  );
}
