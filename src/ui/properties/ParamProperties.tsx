import {h} from 'preact';
import {useState} from 'preact/hooks';
import {
  Entity,
  DoorEntity,
  StairsEntity,
  DimensionEntity,
  TextEntity,
} from '../../core/types';
import {dist} from '../../core/geometry';
import {formatLength, parseLength} from '../../core/units';
import {ChevronDownIcon, ChevronRightIcon} from '../icons';
import {activePageSignal} from '../../state/app-state';

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

export function ParamProperties({
  activeEntity,
  unitSystem,
  localVals,
  setLocalVals,
  getVal,
  handleInputChange,
  commitProperty,
  handleKeyDownCommit,
}: Props) {
  const [paramOpen, setParamOpen] = useState(true);
  const [distFromStart, setDistFromStart] = useState(true);
  const page = activePageSignal.value;

  if (
    !['door', 'window', 'stairs', 'dimension', 'text'].includes(
      activeEntity.type,
    )
  ) {
    return null;
  }

  return (
    <div className="properties-category">
      <div
        className="properties-category-header"
        onClick={() => setParamOpen(!paramOpen)}
      >
        {paramOpen ? <ChevronDownIcon /> : <ChevronRightIcon />}
        <span className="properties-category-title">Parameters</span>
      </div>

      {paramOpen && (
        <div className="properties-category-content">
          {/* DOOR & WINDOW PARAMETERS */}
          {(activeEntity.type === 'door' || activeEntity.type === 'window') && (
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
                        const wallLength = wall
                          ? dist(wall.start, wall.end)
                          : 0;
                        const pos = (activeEntity as any).position;
                        const currentDist = distFromStart
                          ? pos * wallLength
                          : (1 - pos) * wallLength;
                        return formatLength(currentDist, unitSystem);
                      })(),
                    )}
                    onInput={e =>
                      handleInputChange(
                        'posDist',
                        (e.target as HTMLInputElement).value,
                      )
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
                        const minT =
                          (activeEntity as any).width / 2 / wallLength;
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

              {activeEntity.type === 'door' && (
                <div>
                  <div className="property-item">
                    <span className="property-label">Flip Left/Right</span>
                    <div className="property-value">
                      <input
                        type="checkbox"
                        checked={!!(activeEntity as DoorEntity).flipX}
                        onChange={e => {
                          commitProperty(ent => {
                            (ent as DoorEntity).flipX = (
                              e.target as HTMLInputElement
                            ).checked;
                          });
                        }}
                      />
                    </div>
                  </div>

                  <div className="property-item">
                    <span className="property-label">Flip In/Out</span>
                    <div className="property-value">
                      <input
                        type="checkbox"
                        checked={!!(activeEntity as DoorEntity).flipY}
                        onChange={e => {
                          commitProperty(ent => {
                            (ent as DoorEntity).flipY = (
                              e.target as HTMLInputElement
                            ).checked;
                          });
                        }}
                      />
                    </div>
                  </div>

                  <div className="property-item">
                    <span className="property-label">Opening Angle</span>
                    <div className="property-value">
                      <input
                        type="number"
                        min="0"
                        max="180"
                        value={getVal(
                          'openingAngle',
                          (
                            (activeEntity as DoorEntity).openingAngle ?? 90
                          ).toString(),
                        )}
                        onInput={e =>
                          handleInputChange(
                            'openingAngle',
                            (e.target as HTMLInputElement).value,
                          )
                        }
                        onFocus={e => (e.target as HTMLInputElement).select()}
                        onKeyDown={handleKeyDownCommit}
                        onBlur={e => {
                          const val = parseFloat(
                            (e.target as HTMLInputElement).value,
                          );
                          if (!isNaN(val)) {
                            commitProperty(ent => {
                              (ent as DoorEntity).openingAngle = val;
                            });
                          } else {
                            setLocalVals({});
                          }
                        }}
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* STAIRS PARAMETERS */}
          {activeEntity.type === 'stairs' && (
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
                      handleInputChange(
                        'treads',
                        (e.target as HTMLInputElement).value,
                      )
                    }
                    onFocus={e => (e.target as HTMLInputElement).select()}
                    onKeyDown={handleKeyDownCommit}
                    onBlur={e => {
                      const val = parseInt(
                        (e.target as HTMLInputElement).value,
                      );
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
          )}

          {/* DIMENSION PARAMETERS */}
          {activeEntity.type === 'dimension' && (
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
                      handleInputChange(
                        'label',
                        (e.target as HTMLInputElement).value,
                      )
                    }
                    onFocus={e => (e.target as HTMLInputElement).select()}
                    onKeyDown={handleKeyDownCommit}
                    onBlur={e => {
                      commitProperty(ent => {
                        (ent as DimensionEntity).label =
                          (e.target as HTMLInputElement).value.trim() ||
                          undefined;
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
                      (
                        activeEntity as DimensionEntity
                      ).valueOverride?.toString() || '',
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
                      const valStr = (
                        e.target as HTMLInputElement
                      ).value.trim();
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
          )}

          {/* TEXT PARAMETERS */}
          {activeEntity.type === 'text' && (
            <div>
              <div className="property-item" style={{minHeight: 60}}>
                <span className="property-label">Text Content</span>
                <div className="property-value">
                  <textarea
                    rows={3}
                    value={getVal('text', (activeEntity as TextEntity).text)}
                    onInput={e =>
                      handleInputChange(
                        'text',
                        (e.target as HTMLTextAreaElement).value,
                      )
                    }
                    onFocus={e => (e.target as HTMLInputElement).select()}
                    onKeyDown={handleKeyDownCommit}
                    onBlur={e => {
                      commitProperty(ent => {
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
                      formatLength(
                        (activeEntity as TextEntity).fontSize,
                        unitSystem,
                      ),
                    )}
                    onInput={e =>
                      handleInputChange(
                        'fontSize',
                        (e.target as HTMLInputElement).value,
                      )
                    }
                    onFocus={e => (e.target as HTMLInputElement).select()}
                    onKeyDown={handleKeyDownCommit}
                    onBlur={e => {
                      const m = parseLength(
                        (e.target as HTMLInputElement).value,
                        unitSystem,
                      );
                      if (m !== null && m > 0) {
                        commitProperty(ent => {
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
          )}
        </div>
      )}
    </div>
  );
}
