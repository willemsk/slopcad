import {h} from 'preact';
import {useState} from 'preact/hooks';
import {Entity} from '../../core/types';
import {ChevronDownIcon, ChevronRightIcon} from '../icons';
import {DoorWindowParams} from './DoorWindowParams';
import {StairsParams} from './StairsParams';
import {DimensionParams} from './DimensionParams';
import {TextParams} from './TextParams';

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
      >
        {paramOpen ? <ChevronDownIcon /> : <ChevronRightIcon />}
        <span className="properties-category-title">Parameters</span>
      </div>

      {paramOpen && (
        <div className="properties-category-content">
          {(activeEntity.type === 'door' || activeEntity.type === 'window') && (
            <DoorWindowParams
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
