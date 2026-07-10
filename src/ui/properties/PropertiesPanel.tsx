import {h} from 'preact';
import {useEffect} from 'preact/hooks';
import {
  projectSignal,
  activePageSignal,
  selectionSignal,
  isPropertiesPanelOpenSignal,
} from '../../state/app-state';
import '../properties-panel.css';
import {usePropertyCommit} from './use-property-commit';
import {PageProperties} from './PageProperties';
import {GeneralProperties} from './GeneralProperties';
import {GeometryProperties} from './GeometryProperties';
import {ParamProperties} from './ParamProperties';
import {ConstraintProperties} from './ConstraintProperties';

export function PropertiesPanel() {
  const selection = selectionSignal.value;
  const project = projectSignal.value;
  const page = activePageSignal.value;
  const unitSystem = project.unitSystem;

  const selectedEntities = page.entities.filter(e => selection.has(e.id));
  const isSingleSelect = selectedEntities.length === 1;
  const activeEntity = isSingleSelect ? selectedEntities[0] : null;

  const {
    localVals,
    setLocalVals,
    getVal,
    handleInputChange,
    commitProperty,
    handleKeyDownCommit,
  } = usePropertyCommit(activeEntity);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === '1') {
        e.preventDefault();
        isPropertiesPanelOpenSignal.value = !isPropertiesPanelOpenSignal.value;
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  if (!activeEntity) {
    return (
      <aside className="properties-panel">
        <div className="properties-header">
          <h3>Properties</h3>
          <button
            className="properties-close-btn"
            onClick={() => (isPropertiesPanelOpenSignal.value = false)}
            aria-label="Close properties"
            aria-keyshortcuts="Escape"
            title="Close (Esc)"
          >
            ×
          </button>
        </div>
        <PageProperties />
      </aside>
    );
  }

  return (
    <aside className="properties-panel">
      <div className="properties-header">
        <h3>Properties</h3>
        <button
          className="properties-close-btn"
          onClick={() => (isPropertiesPanelOpenSignal.value = false)}
          aria-label="Close properties"
          aria-keyshortcuts="Escape"
          title="Close (Esc)"
        >
          ×
        </button>
      </div>

      <GeneralProperties
        activeEntity={activeEntity}
        localVals={localVals}
        getVal={getVal}
        handleInputChange={handleInputChange}
        commitProperty={commitProperty}
        handleKeyDownCommit={handleKeyDownCommit}
      />

      <GeometryProperties
        activeEntity={activeEntity}
        unitSystem={unitSystem}
        localVals={localVals}
        setLocalVals={setLocalVals}
        getVal={getVal}
        handleInputChange={handleInputChange}
        commitProperty={commitProperty}
        handleKeyDownCommit={handleKeyDownCommit}
      />

      <ParamProperties
        activeEntity={activeEntity}
        unitSystem={unitSystem}
        localVals={localVals}
        setLocalVals={setLocalVals}
        getVal={getVal}
        handleInputChange={handleInputChange}
        commitProperty={commitProperty}
        handleKeyDownCommit={handleKeyDownCommit}
      />

      <ConstraintProperties activeEntity={activeEntity} />
    </aside>
  );
}
