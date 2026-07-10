import {h} from 'preact';
import type {Entity, TextEntity} from '../../core/types';
import {formatLength, parseLength} from '../../core/units';

interface TextParamsProps {
  activeEntity: Entity;
  unitSystem: 'metric' | 'imperial';
  setLocalVals: (vals: Record<string, string>) => void;
  getVal: (key: string, defaultVal: string) => string;
  handleInputChange: (key: string, val: string) => void;
  commitProperty: (updater: (ent: Entity) => void) => void;
  handleKeyDownCommit: (e: KeyboardEvent) => void;
}

export function TextParams({
  activeEntity,
  unitSystem,
  setLocalVals,
  getVal,
  handleInputChange,
  commitProperty,
  handleKeyDownCommit,
}: TextParamsProps) {
  if (activeEntity.type !== 'text') return null;

  return (
    <div>
      <div className="property-item" style={{minHeight: 60}}>
        <span className="property-label">Text Content</span>
        <div className="property-value">
          <textarea
            rows={3}
            value={getVal('text', (activeEntity as TextEntity).text)}
            onInput={(e) =>
              handleInputChange('text', (e.target as HTMLTextAreaElement).value)
            }
            onFocus={(e) => (e.target as HTMLInputElement).select()}
            onKeyDown={handleKeyDownCommit}
            onBlur={(e) => {
              commitProperty((ent) => {
                (ent as TextEntity).text = (
                  e.target as HTMLTextAreaElement
                ).value;
              });
            }}
            style={{textAlign: 'left', fontFamily: 'inherit'}}
          />
        </div>
      </div>

      <div className="property-item">
        <span className="property-label">Font Size</span>
        <div className="property-value">
          <input
            type="text"
            value={getVal(
              'fontSize',
              formatLength((activeEntity as TextEntity).fontSize, unitSystem),
            )}
            onInput={(e) =>
              handleInputChange(
                'fontSize',
                (e.target as HTMLInputElement).value,
              )
            }
            onFocus={(e) => (e.target as HTMLInputElement).select()}
            onKeyDown={handleKeyDownCommit}
            onBlur={(e) => {
              const m = parseLength(
                (e.target as HTMLInputElement).value,
                unitSystem,
              );
              if (m !== null && m > 0) {
                commitProperty((ent) => {
                  (ent as TextEntity).fontSize = m;
                });
              } else {
                setLocalVals({});
              }
            }}
          />
        </div>
      </div>
    </div>
  );
}
