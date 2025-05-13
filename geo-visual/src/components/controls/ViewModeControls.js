// src/components/controls/ViewModeControls.js
import React from 'react';
import { useLayers } from '../../contexts/LayersContext';
import { useDisplayOptions } from '../../contexts/DisplayOptionsContext';

const ViewModeControls = () => {
  const { viewMode, setViewMode, verticalSpacing, setVerticalSpacing } = useLayers();
  const { showConnectors, setShowConnectors } = useDisplayOptions();

  return (
    <div style={{ marginBottom: '20px' }}>
      <h4 className="editor-sub-section-title">View Mode</h4>
      <div style={{ display: 'flex', marginBottom: '15px' }}>
        <button
          onClick={() => setViewMode('normal')}
          className={`editor-button ${viewMode === 'normal' ? 'editor-button-active' : ''}`}
          aria-pressed={viewMode === 'normal'}
        >
          Normal
        </button>
        <button
          onClick={() => setViewMode('exploded')}
          className={`editor-button ${viewMode === 'exploded' ? 'editor-button-active' : ''}`}
          aria-pressed={viewMode === 'exploded'}
        >
          Exploded
        </button>
      </div>
      
      {viewMode === 'exploded' && (
        <div style={{ marginTop: '10px' }}>
          <label htmlFor="vertical-spacing-slider" style={{ display: 'block', marginBottom: '5px', fontSize: '14px' }}>
            Vertical Spacing: {verticalSpacing.toFixed(1)}
          </label>
          <input
            id="vertical-spacing-slider"
            type="range"
            min="0.1"
            max="2"
            step="0.1"
            value={verticalSpacing}
            onChange={(e) => setVerticalSpacing(parseFloat(e.target.value))}
            style={{ width: '100%', cursor: 'pointer' }}
            aria-label="Vertical spacing slider"
          />
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={showConnectors}
              onChange={(e) => setShowConnectors(e.target.checked)}
              className="checkbox"
              aria-label="Show layer connectors checkbox"
            />
            Show Layer Connectors
          </label>
        </div>
      )}
    </div>
  );
};

export default ViewModeControls;