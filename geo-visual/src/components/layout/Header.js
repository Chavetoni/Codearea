// src/components/layout/Header.js
import React, { useState } from 'react';
import { useLayers } from '../../contexts/LayersContext';
import { useDisplayOptions } from '../../contexts/DisplayOptionsContext';

const Header = ({ totalProfileDepth }) => {
  const { layers, addLayer, removeLayer } = useLayers();
  const { showLayerPanel, setShowLayerPanel } = useDisplayOptions();
  const [isHoveringButton, setIsHoveringButton] = useState(false);
  
  const handleLayerChange = (e) => {
    const value = parseInt(e.target.value);
    const currentLayers = layers.length;
    
    if (!isNaN(value)) {
      const newValue = Math.max(0, Math.min(value, 20));
      
      if (newValue > currentLayers) {
        // Add layers
        for (let i = 0; i < newValue - currentLayers; i++) {
          addLayer();
        }
      } else if (newValue < currentLayers) {
        // Remove layers from the end
        for (let i = 0; i < currentLayers - newValue; i++) {
          removeLayer(currentLayers - 1 - i);
        }
      }
    }
  };
  
  return (
    <div className="app-header">
      <div className="header-content">
        <div className="controls">
          <label className="header-label" htmlFor="layers-input-main">
            Soil Layers:
          </label>
          <input
            id="layers-input-main"
            type="number"
            min="0"
            max="20"
            value={layers.length}
            onChange={handleLayerChange}
            className="header-input"
          />
          <button
            onClick={() => setShowLayerPanel(!showLayerPanel)}
            className={`header-button ${isHoveringButton ? 'header-button-hover' : ''}`}
            onMouseEnter={() => setIsHoveringButton(true)}
            onMouseLeave={() => setIsHoveringButton(false)}
          >
            {showLayerPanel ? "Hide Editor" : "Show Editor"}
          </button>
        </div>
        <div className="instructions">
          L-Click+Drag: Rotate | R-Click+Drag: Pan | Scroll: Zoom
        </div>
      </div>
      {layers.length > 0 && (
        <div className="depth-info">
          <p>Total profile depth: {totalProfileDepth} feet (below ground)</p>
        </div>
      )}
    </div>
  );
};

export default Header;