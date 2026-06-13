import { h } from 'preact';
import { useState, useEffect } from 'preact/hooks';
import {
  projectSignal,
  activePageSignal,
  selectionSignal,
  updateActivePage,
  snapshotState,
  runSolverOnActivePage,
  gridSpacingSignal,
} from '../state/app-state';
import { Entity, WallEntity, DoorEntity, WindowEntity, StairsEntity, DimensionEntity, TextEntity, CircleEntity, RectEntity, LineEntity } from '../core/types';
import { dist, sub } from '../core/geometry';
import { formatLength, parseLength } from '../core/units';
import { ChevronDownIcon, ChevronRightIcon } from './icons';
import './properties-panel.css';

export function PropertiesPanel() {
  const selection = selectionSignal.value;
  const project = projectSignal.value;
  const page = activePageSignal.value;
  const unitSystem = project.unitSystem;

  const selectedEntities = page.entities.filter((e) => selection.has(e.id));
  const isSingleSelect = selectedEntities.length === 1;
  const activeEntity = isSingleSelect ? selectedEntities[0] : null;

  // Local state for inputs to avoid lag while typing
  const [localVals, setLocalVals] = useState<Record<string, string>>({});

  // Category collapsible toggles
  const [generalOpen, setGeneralOpen] = useState(true);
  const [geometryOpen, setGeometryOpen] = useState(true);
  const [paramOpen, setParamOpen] = useState(true);
  const [pageOpen, setPageOpen] = useState(true);

  useEffect(() => {
    // Reset local inputs when selection changes
    setLocalVals({});
  }, [selection]);

  const getVal = (key: string, defaultVal: string): string => {
    return localVals[key] !== undefined ? localVals[key] : defaultVal;
  };

  const handleInputChange = (key: string, val: string) => {
    setLocalVals({ ...localVals, [key]: val });
  };

  const commitProperty = (updater: (ent: Entity) => void) => {
    if (!activeEntity) return;
    snapshotState(); // Save undo state

    const newEntities = page.entities.map((e) => {
      if (e.id === activeEntity.id) {
        const copy = JSON.parse(JSON.stringify(e));
        updater(copy);
        return copy;
      }
      return e;
    });

    updateActivePage(newEntities, page.constraints);
    runSolverOnActivePage();
  };

  const handleToggleLock = () => {
    commitProperty((e) => {
      e.locked = !e.locked;
    });
  };

  // Render Page Settings (When nothing is selected)
  if (!activeEntity) {
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

    return (
      <aside className="properties-panel">
        <div className="properties-header">
          <h3>Properties</h3>
        </div>

        <div className="properties-category">
          <div className="properties-category-header" onClick={() => setPageOpen(!pageOpen)}>
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
                    value={getVal('pageName', page.name)}
                    onInput={(e) => handleInputChange('pageName', (e.target as HTMLInputElement).value)}
                    onBlur={(e) => handlePageNameChange((e.target as HTMLInputElement).value)}
                  />
                </div>
              </div>

              <div className="property-item">
                <span className="property-label">Grid Spacing</span>
                <div className="property-value">
                  <select
                    value={gridSpacingSignal.value.toString()}
                    onChange={(e) => {
                      gridSpacingSignal.value = parseFloat((e.target as HTMLSelectElement).value);
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
                        scale: parseInt((e.target as HTMLSelectElement).value),
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

        {selectedEntities.length > 1 && (
          <div className="properties-empty">
            <span className="properties-empty-text">{selectedEntities.length} elements selected</span>
          </div>
        )}

        {selectedEntities.length === 0 && (
          <div className="properties-empty">
            <span className="properties-empty-text">No Selection</span>
          </div>
        )}
      </aside>
    );
  }

  const fmt = (m: number) => formatLength(m, unitSystem);

  return (
    <aside className="properties-panel">
      <div className="properties-header">
        <h3>Properties</h3>
      </div>

      {/* CATEGORY: GENERAL */}
      <div className="properties-category">
        <div className="properties-category-header" onClick={() => setGeneralOpen(!generalOpen)}>
          {generalOpen ? <ChevronDownIcon /> : <ChevronRightIcon />}
          <span className="properties-category-title">General</span>
        </div>

        {generalOpen && (
          <div className="properties-category-content">
            <div className="property-item">
              <span className="property-label">Type</span>
              <div className="property-value">
                <span className="property-value-text" style={{ fontWeight: 'bold', textTransform: 'capitalize' }}>
                  {activeEntity.type}
                </span>
              </div>
            </div>

            <div className="property-item">
              <span className="property-label">ID</span>
              <div className="property-value">
                <span className="property-value-text" style={{ fontFamily: 'var(--font-mono)', opacity: 0.6 }}>
                  {activeEntity.id.slice(0, 8)}
                </span>
              </div>
            </div>

            <div className="property-item">
              <span className="property-label">Lock Geometry</span>
              <div className="property-value">
                <input type="checkbox" checked={!!activeEntity.locked} onChange={handleToggleLock} />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* CATEGORY: GEOMETRY */}
      <div className="properties-category">
        <div className="properties-category-header" onClick={() => setGeometryOpen(!geometryOpen)}>
          {geometryOpen ? <ChevronDownIcon /> : <ChevronRightIcon />}
          <span className="properties-category-title">Geometry</span>
        </div>

        {geometryOpen && (
          <div className="properties-category-content">
            {/* WALL & LINE GEOMETRY */}
            {(activeEntity.type === 'wall' || activeEntity.type === 'line') && (
              <div>
                <div className="property-item">
                  <span className="property-label">Start X</span>
                  <div className="property-value">
                    <span className="property-value-text">{fmt((activeEntity as any).start.x)}</span>
                  </div>
                </div>

                <div className="property-item">
                  <span className="property-label">Start Y</span>
                  <div className="property-value">
                    <span className="property-value-text">{fmt((activeEntity as any).start.y)}</span>
                  </div>
                </div>

                <div className="property-item">
                  <span className="property-label">End X</span>
                  <div className="property-value">
                    <span className="property-value-text">{fmt((activeEntity as any).end.x)}</span>
                  </div>
                </div>

                <div className="property-item">
                  <span className="property-label">End Y</span>
                  <div className="property-value">
                    <span className="property-value-text">{fmt((activeEntity as any).end.y)}</span>
                  </div>
                </div>

                {activeEntity.type === 'wall' && (
                  <div className="property-item">
                    <span className="property-label">Thickness</span>
                    <div className="property-value">
                      <input
                        type="text"
                        value={getVal('thickness', (activeEntity as WallEntity).thickness.toString())}
                        onInput={(e) => handleInputChange('thickness', (e.target as HTMLInputElement).value)}
                        onBlur={(e) => {
                          const m = parseLength((e.target as HTMLInputElement).value, unitSystem);
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
                      value={getVal('length', formatLength(dist((activeEntity as any).start, (activeEntity as any).end), unitSystem))}
                      onInput={(e) => handleInputChange('length', (e.target as HTMLInputElement).value)}
                      onBlur={(e) => {
                        const m = parseLength((e.target as HTMLInputElement).value, unitSystem);
                        if (m !== null && m > 0) {
                          commitProperty((ent) => {
                            const start = (ent as any).start;
                            const end = (ent as any).end;
                            const dir = sub(end, start);
                            const currentL = dist(start, end);
                            if (currentL > 0) {
                              const u = { x: dir.x / currentL, y: dir.y / currentL };
                              (ent as any).end = {
                                x: start.x + u.x * m,
                                y: start.y + u.y * m,
                              };
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
            )}

            {/* RECTANGLE GEOMETRY */}
            {activeEntity.type === 'rect' && (
              <div>
                <div className="property-item">
                  <span className="property-label">Width</span>
                  <div className="property-value">
                    <input
                      type="text"
                      value={getVal('w', formatLength(Math.abs((activeEntity as RectEntity).p2.x - (activeEntity as RectEntity).p1.x), unitSystem))}
                      onInput={(e) => handleInputChange('w', (e.target as HTMLInputElement).value)}
                      onBlur={(e) => {
                        const m = parseLength((e.target as HTMLInputElement).value, unitSystem);
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
                      value={getVal('h', formatLength(Math.abs((activeEntity as RectEntity).p2.y - (activeEntity as RectEntity).p1.y), unitSystem))}
                      onInput={(e) => handleInputChange('h', (e.target as HTMLInputElement).value)}
                      onBlur={(e) => {
                        const m = parseLength((e.target as HTMLInputElement).value, unitSystem);
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
            )}

            {/* CIRCLE GEOMETRY */}
            {activeEntity.type === 'circle' && (
              <div className="property-item">
                <span className="property-label">Radius</span>
                <div className="property-value">
                  <input
                    type="text"
                    value={getVal('radius', formatLength((activeEntity as CircleEntity).radius, unitSystem))}
                    onInput={(e) => handleInputChange('radius', (e.target as HTMLInputElement).value)}
                    onBlur={(e) => {
                      const m = parseLength((e.target as HTMLInputElement).value, unitSystem);
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
            )}

            {/* DOOR / WINDOW / STAIRS / DIMENSION GEOMETRY */}
            {(activeEntity.type === 'door' || activeEntity.type === 'window' || activeEntity.type === 'stairs' || activeEntity.type === 'dimension') && (
              <div>
                <div className="property-item">
                  <span className="property-label">Width</span>
                  <div className="property-value">
                    <input
                      type="text"
                      value={getVal('width', formatLength((activeEntity as any).width || (activeEntity as any).measuredLength || 0, unitSystem))}
                      onInput={(e) => handleInputChange('width', (e.target as HTMLInputElement).value)}
                      onBlur={(e) => {
                        const m = parseLength((e.target as HTMLInputElement).value, unitSystem);
                        if (m !== null && m > 0 && activeEntity.type !== 'dimension') {
                          commitProperty((ent) => {
                            (ent as any).width = m;
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
                        {fmt(dist((activeEntity as StairsEntity).start, (activeEntity as StairsEntity).end))}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* CATEGORY: PARAMETERS */}
      {['door', 'window', 'stairs', 'dimension', 'text'].includes(activeEntity.type) && (
        <div className="properties-category">
          <div className="properties-category-header" onClick={() => setParamOpen(!paramOpen)}>
            {paramOpen ? <ChevronDownIcon /> : <ChevronRightIcon />}
            <span className="properties-category-title">Parameters</span>
          </div>

          {paramOpen && (
            <div className="properties-category-content">
              {/* DOOR & WINDOW PARAMETERS */}
              {(activeEntity.type === 'door' || activeEntity.type === 'window') && (
                <div>
                  <div className="property-item">
                    <span className="property-label">Position (%)</span>
                    <div className="property-value" style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                      <input
                        type="range"
                        min="0.05"
                        max="0.95"
                        step="0.01"
                        value={(activeEntity as any).position}
                        onInput={(e) => {
                          const val = parseFloat((e.target as HTMLInputElement).value);
                          const newEntities = page.entities.map((ent) => {
                            if (ent.id === activeEntity.id) {
                              const copy = { ...ent };
                              (copy as any).position = val;
                              return copy;
                            }
                            return ent;
                          });
                          updateActivePage(newEntities, page.constraints);
                        }}
                        onChange={(e) => {
                          const val = parseFloat((e.target as HTMLInputElement).value);
                          commitProperty((ent) => {
                            (ent as any).position = val;
                          });
                        }}
                      />
                      <span style={{ fontSize: 10, width: 30, textAlign: 'right' }}>
                        {Math.round((activeEntity as any).position * 100)}%
                      </span>
                    </div>
                  </div>

                  {activeEntity.type === 'door' && (
                    <div>
                      <div className="property-item">
                        <span className="property-label">Hinge Side</span>
                        <div className="property-value">
                          <select
                            value={(activeEntity as DoorEntity).hingeSide}
                            onChange={(e) => {
                              commitProperty((ent) => {
                                (ent as DoorEntity).hingeSide = (e.target as HTMLSelectElement).value as any;
                              });
                            }}
                          >
                            <option value="left">Left Hinge</option>
                            <option value="right">Right Hinge</option>
                          </select>
                        </div>
                      </div>

                      <div className="property-item">
                        <span className="property-label">Swing Direction</span>
                        <div className="property-value">
                          <select
                            value={(activeEntity as DoorEntity).openSide}
                            onChange={(e) => {
                              commitProperty((ent) => {
                                (ent as DoorEntity).openSide = (e.target as HTMLSelectElement).value as any;
                              });
                            }}
                          >
                            <option value="in">Inward Swing</option>
                            <option value="out">Outward Swing</option>
                          </select>
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
                        value={getVal('treads', (activeEntity as StairsEntity).treadCount.toString())}
                        onInput={(e) => handleInputChange('treads', (e.target as HTMLInputElement).value)}
                        onBlur={(e) => {
                          const val = parseInt((e.target as HTMLInputElement).value);
                          if (!isNaN(val) && val >= 2) {
                            commitProperty((ent) => {
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
                        onChange={(e) => {
                          commitProperty((ent) => {
                            (ent as StairsEntity).direction = (e.target as HTMLSelectElement).value as any;
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
                        value={getVal('label', (activeEntity as DimensionEntity).label || '')}
                        onInput={(e) => handleInputChange('label', (e.target as HTMLInputElement).value)}
                        onBlur={(e) => {
                          commitProperty((ent) => {
                            (ent as DimensionEntity).label = (e.target as HTMLInputElement).value.trim() || undefined;
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
                        value={getVal('override', (activeEntity as DimensionEntity).valueOverride?.toString() || '')}
                        onInput={(e) => handleInputChange('override', (e.target as HTMLInputElement).value)}
                        onBlur={(e) => {
                          const valStr = (e.target as HTMLInputElement).value.trim();
                          if (valStr === '') {
                            commitProperty((ent) => {
                              (ent as DimensionEntity).valueOverride = undefined;
                            });
                          } else {
                            const m = parseLength(valStr, unitSystem);
                            if (m !== null && m > 0) {
                              commitProperty((ent) => {
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
                  <div className="property-item" style={{ minHeight: 60 }}>
                    <span className="property-label">Text Content</span>
                    <div className="property-value">
                      <textarea
                        rows={3}
                        value={getVal('text', (activeEntity as TextEntity).text)}
                        onInput={(e) => handleInputChange('text', (e.target as HTMLTextAreaElement).value)}
                        onBlur={(e) => {
                          commitProperty((ent) => {
                            (ent as TextEntity).text = (e.target as HTMLTextAreaElement).value;
                          });
                        }}
                        style={{ textAlign: 'left', fontFamily: 'inherit' }}
                      />
                    </div>
                  </div>

                  <div className="property-item">
                    <span className="property-label">Font Size</span>
                    <div className="property-value">
                      <input
                        type="text"
                        value={getVal('fontSize', formatLength((activeEntity as TextEntity).fontSize, unitSystem))}
                        onInput={(e) => handleInputChange('fontSize', (e.target as HTMLInputElement).value)}
                        onBlur={(e) => {
                          const m = parseLength((e.target as HTMLInputElement).value, unitSystem);
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
              )}
            </div>
          )}
        </div>
      )}
    </aside>
  );
}
