import {useState, useEffect} from 'preact/hooks';
import {
  activePageSignal,
  snapshotState,
  updateActivePage,
  runSolverOnActivePage,
} from '../../state/project-state';
import {Entity} from '../../core/types';

export function usePropertyCommit(activeEntity: Entity | null) {
  const [localVals, setLocalVals] = useState<Record<string, string>>({});

  useEffect(() => {
    setLocalVals({});
  }, [activeEntity?.id]);

  const getVal = (key: string, defaultVal: string): string => {
    return localVals[key] !== undefined ? localVals[key] : defaultVal;
  };

  const handleInputChange = (key: string, val: string) => {
    setLocalVals({...localVals, [key]: val});
  };

  const commitProperty = (updater: (ent: Entity) => void) => {
    if (!activeEntity) return;
    snapshotState();
    const page = activePageSignal.value;
    const newEntities = page.entities.map(e => {
      if (e.id === activeEntity.id) {
        const copy = JSON.parse(JSON.stringify(e));
        updater(copy);
        return copy;
      }
      return e;
    });
    updateActivePage(newEntities, page.constraints);
    runSolverOnActivePage();
    setLocalVals({});
  };

  const handleKeyDownCommit = (e: KeyboardEvent) => {
    if (e.key === 'Enter') {
      (e.target as HTMLInputElement).blur();
    }
  };

  return {
    localVals,
    setLocalVals,
    getVal,
    handleInputChange,
    commitProperty,
    handleKeyDownCommit,
  };
}
