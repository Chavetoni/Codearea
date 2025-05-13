// src/components/panels/LegendSection.js
import React from 'react';
import CollapsibleSection from '../ui/CollapsibleSection';
import LegendItem from '../ui/LegendItem';
import { useLayers } from '../../contexts/LayersContext';

const LegendSection = ({ isOpen, onToggle }) => {
  const { layers } = useLayers();

  return (
    <CollapsibleSection
      title="Legend"
      sectionKey="legend"
      isOpen={isOpen}
      onToggle={onToggle}
    >
      {layers.length > 0 ? (
        <div>
          {layers.map((layer, index) => (
            <LegendItem 
              key={layer.id || `legend-${index}`} 
              layer={layer} 
              index={index} 
            />
          ))}
        </div>
      ) : (
        <p style={{ color: '#6b7280', fontStyle: 'italic' }}>
          No layers to display in legend.
        </p>
      )}
    </CollapsibleSection>
  );
};

export default LegendSection;