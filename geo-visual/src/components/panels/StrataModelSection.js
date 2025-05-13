// src/components/panels/StrataModelSection.js
import React from 'react';
import CollapsibleSection from '../ui/CollapsibleSection';
import { useLayers } from '../../contexts/LayersContext';

const StrataModelSection = ({ isOpen, onToggle }) => {
  const { strataDimensions, updateStrataDimensions } = useLayers();

  return (
    <CollapsibleSection
      title="Strata Model Settings (Below Ground)"
      sectionKey="strataModel"
      isOpen={isOpen}
      onToggle={onToggle}
    >
      <div style={{ marginBottom: '10px' }}>
        <label
          htmlFor="strata-width-input"
          style={{
            marginRight: '10px',
            display: 'block',
            marginBottom: '5px',
            fontWeight: '600'
          }}
        >
          Width (X-axis):
        </label>
        <input
          id="strata-width-input"
          type="number"
          step="0.5"
          min="1"
          className="editor-input"
          style={{ width: 'calc(100% - 24px)', marginBottom: '5px' }}
          value={strataDimensions.width}
          onChange={(e) => updateStrataDimensions('width', e.target.value)}
        />
      </div>
      
      <div style={{ marginBottom: '20px' }}>
        <label
          htmlFor="strata-depth-input"
          style={{
            marginRight: '10px',
            display: 'block',
            marginBottom: '5px',
            fontWeight: '600'
          }}
        >
          Depth (Z-axis):
        </label>
        <input
          id="strata-depth-input"
          type="number"
          step="0.5"
          min="1"
          className="editor-input"
          style={{ width: 'calc(100% - 24px)', marginBottom: '5px' }}
          value={strataDimensions.depth}
          onChange={(e) => updateStrataDimensions('depth', e.target.value)}
        />
      </div>
    </CollapsibleSection>
  );
};

export default StrataModelSection;