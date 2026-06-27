import {h} from 'preact';
import {useState} from 'preact/hooks';
import {
  projectSignal,
  isLayerModalOpenSignal,
  addLayerAction,
  updateLayerAction,
  deleteLayerAction,
  setActiveLayerAction,
} from '../state/app-state';
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
                    aria-label={`Set active layer to ${layer.name}`}
                    checked={project.activeLayerId === layer.id}
                    onChange={() => setActiveLayerAction(layer.id)}
                  />
                </td>
                <td className="layer-cell-name">
                  <input
                    type="text"
                    value={layer.name}
                    className="layer-name-input"
                    aria-label={`Edit name for ${layer.name}`}
                    onChange={e =>
                      updateLayerAction(layer.id, {
                        name: (e.target as HTMLInputElement).value,
                      })
                    }
                  />
                </td>
                <td className="layer-cell-toggle">
                  <input
                    type="checkbox"
                    checked={layer.visible}
                    aria-label={`Toggle visibility for ${layer.name}`}
                    onChange={() =>
                      updateLayerAction(layer.id, {visible: !layer.visible})
                    }
                  />
                </td>
                <td className="layer-cell-toggle">
                  <input
                    type="checkbox"
                    checked={layer.locked}
                    aria-label={`Toggle lock for ${layer.name}`}
                    onChange={() =>
                      updateLayerAction(layer.id, {locked: !layer.locked})
                    }
                  />
                </td>
                <td className="layer-cell-color">
                  <input
                    type="color"
                    value={layer.color}
                    aria-label={`Choose color for ${layer.name}`}
                    onChange={e =>
                      updateLayerAction(layer.id, {
                        color: (e.target as HTMLInputElement).value,
                      })
                    }
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
