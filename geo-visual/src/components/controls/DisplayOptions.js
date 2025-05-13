// src/components/controls/DisplayOptions.js
import React from 'react';
import { useDisplayOptions } from '../../contexts/DisplayOptionsContext';
import { useLayers } from '../../contexts/LayersContext';

const DisplayOptions = () => {
  const {
    showGroundGrid, setShowGroundGrid,
    showStrata, setShowStrata,
    showLabels, setShowLabels,
    showMarkers, setShowMarkers,
    showDepthMarkers, setShowDepthMarkers
  } = useDisplayOptions();
  
  const { layers } = useLayers();
  const hasLayers = layers.length > 0;

  return (
    <div className="checkbox-container">
      <label className="checkbox-label">
        <input
          type="checkbox"
          checked={showGroundGrid}
          onChange={(e) => setShowGroundGrid(e.target.checked)}
          className="checkbox"
          aria-label="Show ground grid checkbox"
        />
        Show Ground Grid
      </label>
      
      <label className="checkbox-label">
        <input
          type="checkbox"
          checked={showStrata}
          onChange={(e) => setShowStrata(e.target.checked)}
          className="checkbox"
          aria-label="Show strata model checkbox"
          disabled={!hasLayers}
          title={!hasLayers ? "Initialize layers first" : ""}
        />
        Show Strata Model
      </label>
      
      <label className="checkbox-label">
        <input
          type="checkbox"
          checked={showLabels}
          onChange={(e) => setShowLabels(e.target.checked)}
          className="checkbox"
          aria-label="Show layer labels checkbox"
          disabled={!hasLayers}
        />
        Show Layer Labels
      </label>
      
      <label className="checkbox-label">
        <input
          type="checkbox"
          checked={showMarkers}
          onChange={(e) => setShowMarkers(e.target.checked)}
          className="checkbox"
          aria-label="Show layer markers checkbox"
          disabled={!hasLayers}
        />
        Show Layer Markers
      </label>
      
      <label className="checkbox-label">
        <input
          type="checkbox"
          checked={showDepthMarkers}
          onChange={(e) => setShowDepthMarkers(e.target.checked)}
          className="checkbox"
          aria-label="Show depth scale checkbox"
          disabled={!hasLayers}
        />
        Show Depth Scale
      </label>
    </div>
  );
};

export default DisplayOptions;