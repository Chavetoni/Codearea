// src/App.js
import React, { useRef } from 'react';
import './App.css';
import AppLayout from './components/layout/AppLayout';
import { ThreeJsProvider } from './contexts/ThreeJsContext';
import { LayersProvider } from './contexts/LayersContext';
import { BoreholeProvider } from './contexts/BoreholeContext';
import { DisplayOptionsProvider } from './contexts/DisplayOptionsContext';

// SceneManager operation class for command pattern
export class SceneOperation {
  constructor(type, params = {}) {
    this.type = type;
    this.params = params;
  }
  
  execute(sceneManager) {
    if (!sceneManager) return;
    
    switch(this.type) {
      case 'CREATE_GROUND_GRID':
        sceneManager.createGroundGrid(this.params.show);
        break;
      case 'CREATE_SOIL_LAYERS':
        sceneManager.createSoilLayers(this.params.layers, this.params.options);
        break;
      case 'CREATE_BOREHOLE_MARKERS':
        sceneManager.createBoreholeMarkers(this.params.boreholes);
        break;
      case 'LOAD_SITE_MAP':
        sceneManager.loadSiteMap(
          this.params.fileContent, 
          this.params.onSuccess, 
          this.params.onError
        );
        break;
      case 'UPDATE_SITE_MAP_PROPS':
        sceneManager.updateSiteMapProps(this.params.props);
        break;
      default:
        console.warn(`Unknown operation type: ${this.type}`);
    }
  }
}

function App() {
  // Create a shared reference object for component communication
  const sharedStateRef = useRef({
    sceneManager: null,
    operationQueue: []
  });
  
  return (
    <ThreeJsProvider>
      <LayersProvider>
        <BoreholeProvider>
          <DisplayOptionsProvider>
            <AppLayout sharedStateRef={sharedStateRef} />
          </DisplayOptionsProvider>
        </BoreholeProvider>
      </LayersProvider>
    </ThreeJsProvider>
  );
}

export default App;