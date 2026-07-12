import {h} from 'preact';
import {useState} from 'preact/hooks';
import {dist, sub} from '../../core/geometry';
import type {
  CircleEntity,
  Entity,
  RectEntity,
  StairsEntity,
  WallEntity,
} from '../../core/types';
import {formatLength, parseLength} from '../../core/units';
import {ChevronDownIcon, ChevronRightIcon} from '../icons';

interface Props {
  activeEntity: Entity;
  unitSystem: 'metric' | 'imperial';
  localVals: Record<string, string>;
  setLocalVals: (vals: Record<string, string>) => void;
  getVal: (key: string, defaultVal: string) => string;
  handleInputChange: (key: string, val: string) => void;
  commitProperty: (updater: (ent: Entity) => void) => void;
  handleKeyDownCommit: (e: KeyboardEvent) => void;
}

function WallLineGeometry({
  activeEntity,
  unitSystem,
  getVal,
  handleInputChange,
  commitProperty,
  handleKeyDownCommit,
  setLocalVals,
}: Props) {
  if (activeEntity.type !== 'wall' && activeEntity.type !== 'line') return null;
  const fmt = (v: number) => formatLength(v, unitSystem);
  return (
    <div>
      <div className="property-item">
        <span className="property-label">Start X</span>
        <div className="property-value">
          <span className="property-value-text">
            {fmt(activeEntity.start.x)}
          </span>
        </div>
      </div>

      <div className="property-item">
        <span className="property-label">Start Y</span>
        <div className="property-value">
          <span className="property-value-text">
            {fmt(activeEntity.start.y)}
          </span>
        </div>
      </div>

      <div className="property-item">
        <span className="property-label">End X</span>
        <div className="property-value">
          <span className="property-value-text">{fmt(activeEntity.end.x)}</span>
        </div>
      </div>

      <div className="property-item">
        <span className="property-label">End Y</span>
        <div className="property-value">
          <span className="property-value-text">{fmt(activeEntity.end.y)}</span>
        </div>
      </div>

      {activeEntity.type === 'wall' && (
        <div className="property-item">
          <span className="property-label">Thickness</span>
          <div className="property-value">
            <input
              type="text"
              value={getVal(
                'thickness',
                formatLength(
                  (activeEntity as WallEntity).thickness,
                  unitSystem,
                ),
              )}
              onInput={(e) =>
                handleInputChange(
                  'thickness',
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
                    (ent as WallEntity).thickness = m;
                  });
                } else {
                  setLocalVals({});
                }
              }}
            />
          </div>
        </div>
      )}

      <div className="property-item">
        <span className="property-label">Length</span>
        <div className="property-value">
          <input
            type="text"
            value={getVal(
              'length',
              formatLength(
                dist(activeEntity.start, activeEntity.end),
                unitSystem,
              ),
            )}
            onInput={(e) =>
              handleInputChange('length', (e.target as HTMLInputElement).value)
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
                  if (ent.type === 'wall' || ent.type === 'line') {
                    const start = ent.start;
                    const end = ent.end;
                    const dir = sub(end, start);
                    const currentL = dist(start, end);
                    if (currentL > 0) {
                      const u = {
                        x: dir.x / currentL,
                        y: dir.y / currentL,
                      };
                      ent.end = {
                        x: start.x + u.x * m,
                        y: start.y + u.y * m,
                      };
                    }
                  }
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

function RectGeometry({
  activeEntity,
  unitSystem,
  getVal,
  handleInputChange,
  commitProperty,
  handleKeyDownCommit,
  setLocalVals,
}: Props) {
  return (
    <div>
      <div className="property-item">
        <span className="property-label">Width</span>
        <div className="property-value">
          <input
            type="text"
            value={getVal(
              'w',
              formatLength(
                Math.abs(
                  (activeEntity as RectEntity).p2.x -
                    (activeEntity as RectEntity).p1.x,
                ),
                unitSystem,
              ),
            )}
            onInput={(e) =>
              handleInputChange('w', (e.target as HTMLInputElement).value)
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
                  const r = ent as RectEntity;
                  const sign = Math.sign(r.p2.x - r.p1.x) || 1;
                  r.p2.x = r.p1.x + sign * m;
                });
              } else {
                setLocalVals({});
              }
            }}
          />
        </div>
      </div>

      <div className="property-item">
        <span className="property-label">Height</span>
        <div className="property-value">
          <input
            type="text"
            value={getVal(
              'h',
              formatLength(
                Math.abs(
                  (activeEntity as RectEntity).p2.y -
                    (activeEntity as RectEntity).p1.y,
                ),
                unitSystem,
              ),
            )}
            onInput={(e) =>
              handleInputChange('h', (e.target as HTMLInputElement).value)
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
                  const r = ent as RectEntity;
                  const sign = Math.sign(r.p2.y - r.p1.y) || 1;
                  r.p2.y = r.p1.y + sign * m;
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

function CircleGeometry({
  activeEntity,
  unitSystem,
  getVal,
  handleInputChange,
  commitProperty,
  handleKeyDownCommit,
  setLocalVals,
}: Props) {
  return (
    <div className="property-item">
      <span className="property-label">Radius</span>
      <div className="property-value">
        <input
          type="text"
          value={getVal(
            'radius',
            formatLength((activeEntity as CircleEntity).radius, unitSystem),
          )}
          onInput={(e) =>
            handleInputChange('radius', (e.target as HTMLInputElement).value)
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
                (ent as CircleEntity).radius = m;
              });
            } else {
              setLocalVals({});
            }
          }}
        />
      </div>
    </div>
  );
}

function GeneralElementGeometry({
  activeEntity,
  unitSystem,
  getVal,
  handleInputChange,
  commitProperty,
  handleKeyDownCommit,
  setLocalVals,
}: Props) {
  const fmt = (v: number) => formatLength(v, unitSystem);
  return (
    <div>
      <div className="property-item">
        <span className="property-label">Width</span>
        <div className="property-value">
          <input
            type="text"
            value={getVal(
              'width',
              formatLength(
                activeEntity.type === 'door' ||
                  activeEntity.type === 'window' ||
                  activeEntity.type === 'stairs'
                  ? activeEntity.width
                  : 0,
                unitSystem,
              ),
            )}
            onInput={(e) =>
              handleInputChange('width', (e.target as HTMLInputElement).value)
            }
            onFocus={(e) => (e.target as HTMLInputElement).select()}
            onKeyDown={handleKeyDownCommit}
            onBlur={(e) => {
              const m = parseLength(
                (e.target as HTMLInputElement).value,
                unitSystem,
              );
              if (m !== null && m > 0 && activeEntity.type !== 'dimension') {
                commitProperty((ent) => {
                  if (
                    ent.type === 'door' ||
                    ent.type === 'window' ||
                    ent.type === 'stairs'
                  ) {
                    ent.width = m;
                  }
                });
              } else {
                setLocalVals({});
              }
            }}
            readOnly={activeEntity.type === 'dimension'}
          />
        </div>
      </div>

      {activeEntity.type === 'stairs' && (
        <div className="property-item">
          <span className="property-label">Stair Length</span>
          <div className="property-value">
            <span className="property-value-text">
              {fmt(
                dist(
                  (activeEntity as StairsEntity).start,
                  (activeEntity as StairsEntity).end,
                ),
              )}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

export function GeometryProperties(props: Props) {
  const [geometryOpen, setGeometryOpen] = useState(true);
  const {activeEntity} = props;

  return (
    <div className="properties-category">
      <div
        className="properties-category-header"
        onClick={() => setGeometryOpen(!geometryOpen)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            setGeometryOpen(!geometryOpen);
          }
        }}
        role="button"
        tabIndex={0}
        aria-expanded={geometryOpen}
        aria-label={geometryOpen ? "Collapse Geometry" : "Expand Geometry"}
      >
        {geometryOpen ? <ChevronDownIcon /> : <ChevronRightIcon />}
        <span className="properties-category-title">Geometry</span>
      </div>

      {geometryOpen && (
        <div className="properties-category-content">
          {(activeEntity.type === 'wall' || activeEntity.type === 'line') && (
            <WallLineGeometry {...props} />
          )}

          {activeEntity.type === 'rect' && <RectGeometry {...props} />}

          {activeEntity.type === 'circle' && <CircleGeometry {...props} />}

          {(activeEntity.type === 'door' ||
            activeEntity.type === 'window' ||
            activeEntity.type === 'stairs' ||
            activeEntity.type === 'dimension') && (
            <GeneralElementGeometry {...props} />
          )}
        </div>
      )}
    </div>
  );
}
