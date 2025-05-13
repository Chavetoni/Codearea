// src/components/controls/LayerControls.js
import React, { useState } from 'react';
import { useLayers } from '../../contexts/LayersContext';

const LayerControls = ({ layer, index, isActive }) => {
  const { updateLayer } = useLayers();
  const [isHoveringColorInput, setIsHoveringColorInput] = useState(false);

  const handlePropertyChange = (property, value) => {
    updateLayer(index, property, value);
  };

  return (
    <div>
      <div style={{ marginBottom: '16px' }}>
        <label htmlFor={`layer-name-input-${index}`} style={{ display: 'block', marginBottom: '8px', fontWeight: '600', fontSize: '16px' }}>
          Layer Name:
        </label>
        <input
          id={`layer-name-input-${index}`}
          type="text"
          value={layer.name || ''}
          onChange={(e) => handlePropertyChange('name', e.target.value)}
          className="editor-input"
        />
      </div>
      
      <div style={{ marginBottom: '16px' }}>
        <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', fontSize: '16px' }}>
          Layer Color:
        </label>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <input
            aria-label="Layer color picker"
            type="color"
            value={layer.color || '#ffffff'}
            onChange={(e) => handlePropertyChange('color', e.target.value)}
            style={{
              width: '50px',
              height: '50px',
              marginRight: '12px',
              border: '1px solid #d1d5db',
              padding: '2px',
              cursor: 'pointer'
            }}
          />
          <input
            aria-label="Layer color hex input"
            type="text"
            value={layer.color || ''}
            onChange={(e) => handlePropertyChange('color', e.target.value)}
            style={{
              flexGrow: 1,
              border: '1px solid #d1d5db',
              borderRadius: '4px',
              padding: '8px 12px',
              fontSize: '16px',
              marginBottom: 0
            }}
            placeholder="#rrggbb"
            onMouseEnter={() => setIsHoveringColorInput(true)}
            onMouseLeave={() => setIsHoveringColorInput(false)}
          />
        </div>
      </div>
      
      <div style={{ marginBottom: '16px' }}>
        <label htmlFor={`layer-desc-${index}`} style={{ display: 'block', marginBottom: '8px', fontWeight: '600', fontSize: '16px' }}>
          Description:
        </label>
        <textarea
          id={`layer-desc-${index}`}
          value={layer.description || ''}
          onChange={(e) => handlePropertyChange('description', e.target.value)}
          className="editor-textarea"
        />
      </div>
      
      <div style={{ marginBottom: '16px' }}>
        <label htmlFor={`layer-depth-${index}`} style={{ display: 'block', marginBottom: '8px', fontWeight: '600', fontSize: '16px' }}>
          Depth (feet):
        </label>
        <input
          id={`layer-depth-${index}`}
          type="number"
          min="0.1"
          step="0.1"
          value={layer.depth || 1}
          onChange={(e) => handlePropertyChange('depth', e.target.value)}
          className="editor-input"
        />
      </div>
    </div>
  );
};

export default LayerControls;