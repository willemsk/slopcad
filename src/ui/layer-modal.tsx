import {h} from 'preact';
import {useState} from 'preact/hooks';
import {projectSignal} from '../state/project-state';
import {isLayerModalOpenSignal} from '../state/ui-state';
import {
  addLayerAction,
  updateLayerAction,
  deleteLayerAction,
  setActiveLayerAction,
} from '../state/layer-actions';
import './layer-modal.css';

export function LayerModal() {
  const project = projectSignal.value;
  const isOpen = isLayerModalOpenSignal.value;

  if (!isOpen) return null;

  const handleClose = () => {
    isLayerModalOpenSignal.value = false;
  };

  const handleAddLayer = () => {
    addLayerAction(`Layer ${project.layers.length + 1}`, '#ffffff');
  };

  return (
    <div className="layer-modal-overlay" onClick={handleClose}>
      <div className="layer-modal-content" onClick={e => e.stopPropagation()}>
        <div className="layer-modal-header">
          <h2>Layer Properties</h2>
          <button
            className="layer-modal-close"
            onClick={handleClose}
            aria-label="Close"
            title="Close"
          >
            ×
          </button>
        </div>

        <div className="layer-modal-toolbar">
          <button className="layer-modal-btn" onClick={handleAddLayer}>
            + New Layer
          </button>
        </div>

        <table className="layer-table">
          <thead>
            <tr>
              <th>Status</th>
              <th>Name</th>
              <th>On</th>
              <th>Lock</th>
              <th>Color</th>
            </tr>
          </thead>
          <tbody>
            {project.layers.map(layer => (
              <tr
                key={layer.id}
                className={project.activeLayerId === layer.id ? 'active' : ''}
              >
                <td className="layer-cell-status">
                  <input
                    type="radio"
                    name="activeLayer"
                    aria-label={`Set ${layer.name} as active layer`}
                    checked={project.activeLayerId === layer.id}
                    onChange={() => setActiveLayerAction(layer.id)}
                  />
                </td>
                <td className="layer-cell-name">
                  <input
                    type="text"
                    aria-label={'Rename layer ' + layer.name}
                    value={layer.name}
                    className="layer-name-input"
                    aria-label="Layer name"
                    onChange={e =>
                      updateLayerAction(layer.id, {
                        name: (e.target as HTMLInputElement).value,
                      })
                    }
                    aria-label={'Rename layer ' + layer.name}
                  />
                </td>
                <td className="layer-cell-toggle">
                  <input
                    type="checkbox"
                    aria-label={`Toggle visibility for ${layer.name}`}
                    checked={layer.visible}
                    onChange={() =>
                      updateLayerAction(layer.id, {visible: !layer.visible})
                    }
                    aria-label={'Toggle visibility for ' + layer.name}
                  />
                </td>
                <td className="layer-cell-toggle">
                  <input
                    type="checkbox"
                    aria-label={`Toggle lock for ${layer.name}`}
                    checked={layer.locked}
                    onChange={() =>
                      updateLayerAction(layer.id, {locked: !layer.locked})
                    }
                    aria-label={'Toggle lock for ' + layer.name}
                  />
                </td>
                <td className="layer-cell-color">
                  <input
                    type="color"
                    aria-label={`Change color for ${layer.name}`}
                    value={layer.color}
                    aria-label={'Color for ' + layer.name}
                    onChange={e =>
                      updateLayerAction(layer.id, {
                        color: (e.target as HTMLInputElement).value,
                      })
                    }
                    aria-label={'Change color for ' + layer.name}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
