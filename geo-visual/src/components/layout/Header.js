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
        <h2 className="header-title">Map Visualizer</h2>
        {/* Editor toggle button moved to the right */}
        <button
          onClick={() => setShowLayerPanel(!showLayerPanel)}
          className={`header-button ${isHoveringButton ? 'header-button-hover' : ''}`}
          onMouseEnter={() => setIsHoveringButton(true)}
          onMouseLeave={() => setIsHoveringButton(false)}
        >
          {showLayerPanel ? "Hide Editor" : "Show Editor"}
        </button>
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