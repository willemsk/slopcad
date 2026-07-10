import {h} from 'preact';
import {useState} from 'preact/hooks';
import {
  addLayerAction,
  deleteLayerAction,
  setActiveLayerAction,
  updateLayerAction,
} from '../state/layer-actions';
import {projectSignal} from '../state/project-state';
import {isLayerModalOpenSignal} from '../state/ui-state';
import {DeleteIcon} from './icons';
import './layer-modal.css';

export function LayerModal() {
  const project = projectSignal.value;
  const isOpen = isLayerModalOpenSignal.value;

  if (!isOpen) return null;

  const handleClose = () => {
    isLayerModalOpenSignal.value = false;
  };

  const handleDeleteLayer = (layer: {id: string; name: string}) => {
    if (layer.id === '0' || project.layers.length <= 1) return;
    if (
      window.confirm(
        `Delete layer "${layer.name}"? This action cannot be undone.`,
      )
    ) {
      deleteLayerAction(layer.id);
    }
  };

  const handleAddLayer = () => {
    addLayerAction(`Layer ${project.layers.length + 1}`, '#ffffff');
  };

  return (
    <div className="layer-modal-overlay" onClick={handleClose}>
      <div className="layer-modal-content" onClick={(e) => e.stopPropagation()}>
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
              <th />
            </tr>
          </thead>
          <tbody>
            {project.layers.map((layer) => (
              <tr
                key={layer.id}
                className={project.activeLayerId === layer.id ? 'active' : ''}
              >
                <td className="layer-cell-status">
                  <input
                    type="radio"
                    name="activeLayer"
                    checked={project.activeLayerId === layer.id}
                    onChange={() => setActiveLayerAction(layer.id)}
                    aria-label={`Set active layer: ${layer.name}`}
                  />
                </td>
                <td className="layer-cell-name">
                  <input
                    type="text"
                    value={layer.name}
                    className="layer-name-input"
                    onChange={(e) =>
                      updateLayerAction(layer.id, {
                        name: (e.target as HTMLInputElement).value,
                      })
                    }
                    aria-label={`Rename layer: ${layer.name}`}
                  />
                </td>
                <td className="layer-cell-toggle">
                  <input
                    type="checkbox"
                    checked={layer.visible}
                    onChange={() =>
                      updateLayerAction(layer.id, {visible: !layer.visible})
                    }
                    aria-label={`Toggle visibility for layer: ${layer.name}`}
                  />
                </td>
                <td className="layer-cell-toggle">
                  <input
                    type="checkbox"
                    checked={layer.locked}
                    onChange={() =>
                      updateLayerAction(layer.id, {locked: !layer.locked})
                    }
                    aria-label={`Toggle lock for layer: ${layer.name}`}
                  />
                </td>
                <td className="layer-cell-color">
                  <input
                    type="color"
                    value={layer.color}
                    onChange={(e) =>
                      updateLayerAction(layer.id, {
                        color: (e.target as HTMLInputElement).value,
                      })
                    }
                    aria-label={`Color for layer: ${layer.name}`}
                  />
                </td>
                <td
                  className="layer-cell-delete"
                  style={{textAlign: 'center', width: '32px'}}
                >
                  <button
                    className="layer-delete-btn"
                    onClick={() => handleDeleteLayer(layer)}
                    aria-label={`Delete layer ${layer.name}`}
                    title={`Delete layer ${layer.name}`}
                    disabled={layer.id === '0' || project.layers.length <= 1}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'inherit',
                      cursor:
                        layer.id === '0' || project.layers.length <= 1
                          ? 'not-allowed'
                          : 'pointer',
                      opacity:
                        layer.id === '0' || project.layers.length <= 1
                          ? 0.3
                          : 0.7,
                      padding: '4px',
                    }}
                  >
                    <DeleteIcon />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
