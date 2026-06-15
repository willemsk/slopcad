import {h} from 'preact';
import {Entity, DimensionEntity} from '../../core/types';
import {parseLength} from '../../core/units';

interface DimensionParamsProps {
  activeEntity: Entity;
  unitSystem: 'metric' | 'imperial';
  setLocalVals: (vals: Record<string, string>) => void;
  getVal: (key: string, defaultVal: string) => string;
  handleInputChange: (key: string, val: string) => void;
  commitProperty: (updater: (ent: Entity) => void) => void;
  handleKeyDownCommit: (e: KeyboardEvent) => void;
}

export function DimensionParams({
  activeEntity,
  unitSystem,
  setLocalVals,
  getVal,
  handleInputChange,
  commitProperty,
  handleKeyDownCommit,
}: DimensionParamsProps) {
  if (activeEntity.type !== 'dimension') return null;

  return (
    <div>
      <div className="property-item">
        <span className="property-label">Label Override</span>
        <div className="property-value">
          <input
            type="text"
            placeholder="Auto Length"
            value={getVal(
              'label',
              (activeEntity as DimensionEntity).label || '',
            )}
            onInput={e =>
              handleInputChange('label', (e.target as HTMLInputElement).value)
            }
            onFocus={e => (e.target as HTMLInputElement).select()}
            onKeyDown={handleKeyDownCommit}
            onBlur={e => {
              commitProperty(ent => {
                (ent as DimensionEntity).label =
                  (e.target as HTMLInputElement).value.trim() || undefined;
              });
            }}
          />
        </div>
      </div>

      <div className="property-item">
        <span className="property-label">Fixed length (m)</span>
        <div className="property-value">
          <input
            type="text"
            placeholder="Not Constrained"
            value={getVal(
              'override',
              (activeEntity as DimensionEntity).valueOverride?.toString() || '',
            )}
            onInput={e =>
              handleInputChange(
                'override',
                (e.target as HTMLInputElement).value,
              )
            }
            onFocus={e => (e.target as HTMLInputElement).select()}
            onKeyDown={handleKeyDownCommit}
            onBlur={e => {
              const valStr = (e.target as HTMLInputElement).value.trim();
              if (valStr === '') {
                commitProperty(ent => {
                  (ent as DimensionEntity).valueOverride = undefined;
                });
              } else {
                const m = parseLength(valStr, unitSystem);
                if (m !== null && m > 0) {
                  commitProperty(ent => {
                    (ent as DimensionEntity).valueOverride = m;
                  });
                } else {
                  setLocalVals({});
                }
              }
            }}
          />
        </div>
      </div>
    </div>
  );
}
