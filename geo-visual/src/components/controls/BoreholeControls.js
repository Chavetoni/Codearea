// src/components/controls/BoreholeControls.js
import React, { useState } from 'react';
import { useBoreholes } from '../../contexts/BoreholeContext';

const BoreholeControls = () => {
  const { boreholes, isPlacingBorehole, setIsPlacingBorehole, removeBorehole } = useBoreholes();
  const [isHoveringButton, setIsHoveringButton] = useState(false);

  return (
    <div>
      <button
        onClick={() => setIsPlacingBorehole(prev => !prev)}
        className={`toggle-button ${isPlacingBorehole ? 'toggle-button-active' : ''} ${isHoveringButton && !isPlacingBorehole ? 'toggle-button-hover' : ''}`}
        onMouseEnter={() => setIsHoveringButton(true)}
        onMouseLeave={() => setIsHoveringButton(false)}
      >
        {isPlacingBorehole ? "Cancel Placement (Click Canvas)" : "Place Borehole by Click"}
      </button>
      
      <p style={{ fontSize: '12px', color: '#555', margin: '5px 0 15px 0', textAlign: 'center' }}>
        {isPlacingBorehole
          ? "Click on the map/grid to place a borehole."
          : "Toggle 'Place Borehole' then click on the 3D view."}
      </p>
      
      {boreholes.length > 0 && (
        <div>
          <h4 className="editor-sub-section-title">Existing Boreholes</h4>
          <div style={{ maxHeight: '150px', overflowY: 'auto', paddingRight: '5px' }}>
            {boreholes.map(bh => (
              <div key={bh.id} className="legend-item">
                <div className="legend-text-container">
                  <strong style={{ fontSize: '15px' }}>{bh.name}</strong>
                  <div style={{ fontSize: '13px' }}>
                    X: {bh.x}, Elev: {bh.y}, Z: {bh.z}
                  </div>
                </div>
                <button
                  onClick={() => removeBorehole(bh.id)}
                  className="action-button remove-button"
                  style={{
                    padding: '5px 10px',
                    fontSize: '13px',
                    marginLeft: '10px',
                    flexShrink: 0
                  }}
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default BoreholeControls;