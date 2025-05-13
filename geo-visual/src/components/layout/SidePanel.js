// src/components/layout/SidePanel.js
import React from 'react';
import SiteMapSection from '../panels/SiteMapSection';
import StrataModelSection from '../panels/StrataModelSection';
import BoreholeSection from '../panels/BoreholeSection';
import LayerEditorSection from '../panels/LayerEditorSection';
import DisplayOptionsSection from '../panels/DisplayOptionsSection';
import LegendSection from '../panels/LegendSection';
import { useDisplayOptions } from '../../contexts/DisplayOptionsContext';

const SidePanel = () => {
  const { openSections, toggleSection } = useDisplayOptions();
  
  return (
    <div className="editor-panel">
      <SiteMapSection
        isOpen={openSections.siteMap}
        onToggle={() => toggleSection('siteMap')}
      />
      
      <StrataModelSection
        isOpen={openSections.strataModel}
        onToggle={() => toggleSection('strataModel')}
      />
      
      <BoreholeSection
        isOpen={openSections.boreholes}
        onToggle={() => toggleSection('boreholes')}
      />
      
      <LayerEditorSection
        isOpen={openSections.layerEditor}
        onToggle={() => toggleSection('layerEditor')}
      />
      
      <DisplayOptionsSection
        isOpen={openSections.displayOptions}
        onToggle={() => toggleSection('displayOptions')}
      />
      
      <LegendSection
        isOpen={openSections.legend}
        onToggle={() => toggleSection('legend')}
      />
    </div>
  );
};

export default SidePanel;