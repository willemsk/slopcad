import {h} from 'preact';
import {useState} from 'preact/hooks';
import type {Entity} from '../../core/types';
import {snapshotState} from '../../state/history-actions';
import {activePageSignal, updateActivePage} from '../../state/project-state';
import {ChevronDownIcon, ChevronRightIcon} from '../icons';

interface Props {
  activeEntity: Entity;
}

export function ConstraintProperties({activeEntity}: Props) {
  const [constraintsOpen, setConstraintsOpen] = useState(true);
  const page = activePageSignal.value;

  const relevantConstraints = page.constraints.filter((c) =>
    c.entityIds.includes(activeEntity.id),
  );

  return (
    <div className="properties-category">
      <div
        className="properties-category-header"
        onClick={() => setConstraintsOpen(!constraintsOpen)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            setConstraintsOpen(!constraintsOpen);
          }
        }}
        tabIndex={0}
        role="button"
        aria-expanded={constraintsOpen}
        aria-controls="constraint-properties-content"
      >
        {constraintsOpen ? <ChevronDownIcon /> : <ChevronRightIcon />}
        <span className="properties-category-title">Constraints</span>
      </div>

      {constraintsOpen && (
        <div
          id="constraint-properties-content"
          className="properties-category-content"
        >
          {relevantConstraints.map((c) => (
            <div
              key={c.id}
              className="property-item"
              style={{justifyContent: 'space-between'}}
            >
              <span
                className="property-label"
                style={{textTransform: 'capitalize'}}
              >
                {c.type.replace('_', ' ')}
              </span>
              <div className="property-value" style={{flex: 'none'}}>
                <button
                  onClick={() => {
                    snapshotState();
                    const newConstraints = page.constraints.filter(
                      (oc) => oc.id !== c.id,
                    );
                    updateActivePage(page.entities, newConstraints);
                  }}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: 'var(--text-color)',
                    cursor: 'pointer',
                    opacity: 0.5,
                  }}
                  title="Delete constraint"
                  aria-label="Delete constraint"
                  onMouseEnter={(e) => (e.currentTarget.style.opacity = '1')}
                  onMouseLeave={(e) => (e.currentTarget.style.opacity = '0.5')}
                >
                  ×
                </button>
              </div>
            </div>
          ))}
          {relevantConstraints.length === 0 && (
            <div className="property-item">
              <span className="property-label" style={{opacity: 0.5}}>
                No constraints
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
