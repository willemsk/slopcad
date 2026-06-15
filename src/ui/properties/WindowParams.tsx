import {h} from 'preact';
import {useState} from 'preact/hooks';
import {Entity} from '../../core/types';
import {dist} from '../../core/geometry';
import {formatLength, parseLength} from '../../core/units';
import {activePageSignal} from '../../state/app-state';

interface WindowParamsProps {
  activeEntity: Entity;
  unitSystem: 'metric' | 'imperial';
  setLocalVals: (vals: Record<string, string>) => void;
  getVal: (key: string, defaultVal: string) => string;
  handleInputChange: (key: string, val: string) => void;
  commitProperty: (updater: (ent: Entity) => void) => void;
  handleKeyDownCommit: (e: KeyboardEvent) => void;
}

export function WindowParams({
  activeEntity,
  unitSystem,
  setLocalVals,
  getVal,
  handleInputChange,
  commitProperty,
  handleKeyDownCommit,
}: WindowParamsProps) {
  const [distFromStart, setDistFromStart] = useState(true);
  const page = activePageSignal.value;

  if (activeEntity.type !== 'window') return null;

  return (
    <div>
      <div className="property-item">
        <span className="property-label">
          Distance from{' '}
          <span
            style={{
              cursor: 'pointer',
              textDecoration: 'underline',
              fontWeight: 'bold',
            }}
            onClick={() => setDistFromStart(!distFromStart)}
          >
            {distFromStart ? 'Start' : 'End'}
          </span>
        </span>
        <div className="property-value">
          <input
            type="text"
            value={getVal(
              'posDist',
              (() => {
                const wall = page.entities.find(
                  e => e.id === (activeEntity as any).wallId,
                ) as any;
                const wallLength = wall ? dist(wall.start, wall.end) : 0;
                const pos = (activeEntity as any).position;
                const currentDist = distFromStart
                  ? pos * wallLength
                  : (1 - pos) * wallLength;
                return formatLength(currentDist, unitSystem);
              })(),
            )}
            onInput={e =>
              handleInputChange('posDist', (e.target as HTMLInputElement).value)
            }
            onFocus={e => (e.target as HTMLInputElement).select()}
            onKeyDown={handleKeyDownCommit}
            onBlur={e => {
              const m = parseLength(
                (e.target as HTMLInputElement).value,
                unitSystem,
              );
              const wall = page.entities.find(
                w => w.id === (activeEntity as any).wallId,
              ) as any;
              const wallLength = wall ? dist(wall.start, wall.end) : 0;

              if (m !== null && wallLength > 0) {
                let newPos = distFromStart
                  ? m / wallLength
                  : 1 - m / wallLength;
                const minT = (activeEntity as any).width / 2 / wallLength;
                const maxT = 1 - minT;
                newPos = Math.max(minT, Math.min(maxT, newPos));

                commitProperty(ent => {
                  (ent as any).position = newPos;
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
