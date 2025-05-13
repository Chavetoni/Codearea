// src/components/layout/AppLayout.js
import React from 'react';
import Header from './Header';
import ThreeJsCanvas from '../canvas/ThreeJsCanvas';
import SidePanel from './SidePanel';
import { useDisplayOptions } from '../../contexts/DisplayOptionsContext';
import { useLayers } from '../../contexts/LayersContext';
import '../../App.css';

const AppLayout = () => {
  const { showLayerPanel } = useDisplayOptions();
  const { totalProfileDepth } = useLayers();
  
  return (
    <div className="app-container">
      <Header totalProfileDepth={totalProfileDepth} />
      <div className="app-content">
        <ThreeJsCanvas />
        {showLayerPanel && <SidePanel />}
      </div>
    </div>
  );
};

export default AppLayout;