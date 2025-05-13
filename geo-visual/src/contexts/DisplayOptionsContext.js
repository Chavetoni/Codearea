// src/contexts/DisplayOptionsContext.js
import React, { createContext, useContext, useState, useCallback } from 'react';

const DisplayOptionsContext = createContext(null);

export const useDisplayOptions = () => {
  const context = useContext(DisplayOptionsContext);
  if (!context) {
    throw new Error('useDisplayOptions must be used within a DisplayOptionsProvider');
  }
  return context;
};

export const DisplayOptionsProvider = ({ children }) => {
  const [showLayerPanel, setShowLayerPanel] = useState(true);
  const [showLabels, setShowLabels] = useState(true);
  const [showMarkers, setShowMarkers] = useState(true);
  const [showDepthMarkers, setShowDepthMarkers] = useState(true);
  const [showConnectors, setShowConnectors] = useState(true);
  const [showStrata, setShowStrata] = useState(true);
  const [showGroundGrid, setShowGroundGrid] = useState(true);
  const [openSections, setOpenSections] = useState({
    siteMap: true,
    strataModel: true,
    layerEditor: true,
    boreholes: false,
    displayOptions: false,
    legend: false
  });

  const toggleSection = useCallback((sectionName) => {
    setOpenSections(prev => ({
      ...prev,
      [sectionName]: !prev[sectionName]
    }));
  }, []);

  const value = {
    showLayerPanel,
    setShowLayerPanel,
    showLabels,
    setShowLabels,
    showMarkers,
    setShowMarkers,
    showDepthMarkers,
    setShowDepthMarkers,
    showConnectors,
    setShowConnectors,
    showStrata,
    setShowStrata,
    showGroundGrid,
    setShowGroundGrid,
    openSections,
    toggleSection
  };

  return (
    <DisplayOptionsContext.Provider value={value}>
      {children}
    </DisplayOptionsContext.Provider>
  );
};