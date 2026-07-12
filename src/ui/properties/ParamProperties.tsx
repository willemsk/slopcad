import {h} from 'preact';
import {useState} from 'preact/hooks';
import type {Entity} from '../../core/types';
import {ChevronDownIcon, ChevronRightIcon} from '../icons';
import {DimensionParams} from './DimensionParams';
import {DoorParams} from './DoorParams';
import {StairsParams} from './StairsParams';
import {TextParams} from './TextParams';
import {WindowParams} from './WindowParams';

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
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            setParamOpen(!paramOpen);
          }
        }}
        role="button"
        tabIndex={0}
        aria-expanded={paramOpen}
        aria-label={paramOpen ? 'Collapse Parameters' : 'Expand Parameters'}
      >
        {paramOpen ? <ChevronDownIcon /> : <ChevronRightIcon />}
        <span className="properties-category-title">Parameters</span>
      </div>

      {paramOpen && (
        <div className="properties-category-content">
          {activeEntity.type === 'door' && (
            <DoorParams
              activeEntity={activeEntity}
              unitSystem={unitSystem}
              setLocalVals={setLocalVals}
              getVal={getVal}
              handleInputChange={handleInputChange}
              commitProperty={commitProperty}
              handleKeyDownCommit={handleKeyDownCommit}
            />
          )}

          {activeEntity.type === 'window' && (
            <WindowParams
              activeEntity={activeEntity}
              unitSystem={unitSystem}
              setLocalVals={setLocalVals}
              getVal={getVal}
              handleInputChange={handleInputChange}
              commitProperty={commitProperty}
              handleKeyDownCommit={handleKeyDownCommit}
            />
          )}

          {activeEntity.type === 'stairs' && (
            <StairsParams
              activeEntity={activeEntity}
              setLocalVals={setLocalVals}
              getVal={getVal}
              handleInputChange={handleInputChange}
              commitProperty={commitProperty}
              handleKeyDownCommit={handleKeyDownCommit}
            />
          )}

          {activeEntity.type === 'dimension' && (
            <DimensionParams
              activeEntity={activeEntity}
              unitSystem={unitSystem}
              setLocalVals={setLocalVals}
              getVal={getVal}
              handleInputChange={handleInputChange}
              commitProperty={commitProperty}
              handleKeyDownCommit={handleKeyDownCommit}
            />
          )}

          {activeEntity.type === 'text' && (
            <TextParams
              activeEntity={activeEntity}
              unitSystem={unitSystem}
              setLocalVals={setLocalVals}
              getVal={getVal}
              handleInputChange={handleInputChange}
              commitProperty={commitProperty}
              handleKeyDownCommit={handleKeyDownCommit}
            />
          )}
        </div>
      )}
    </div>
  );
}
