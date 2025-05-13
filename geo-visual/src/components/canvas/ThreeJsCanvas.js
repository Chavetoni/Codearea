// src/components/canvas/ThreeJsCanvas.js
import React, { useEffect, useRef, useState } from 'react';
import { useThreeJs } from '../../contexts/ThreeJsContext';
import { useLayers } from '../../contexts/LayersContext';
import { useBoreholes } from '../../contexts/BoreholeContext';
import { useDisplayOptions } from '../../contexts/DisplayOptionsContext';
import { SceneOperation } from '../../App';

const ThreeJsCanvas = () => {
  const canvasRef = useRef(null);
  const [canvasError, setCanvasError] = useState(null);
  
  const {
    initialize,
    sceneManager,
    isInitialized,
    error: threeJsError,
    queueOperation
  } = useThreeJs();
  
  const {
    layers,
    viewMode,
    verticalSpacing,
    strataDimensions
  } = useLayers();
  
  const {
    boreholes,
    isPlacingBorehole,
    handleCanvasClick
  } = useBoreholes();
  
  const {
    showLabels,
    showMarkers,
    showDepthMarkers,
    showConnectors,
    showStrata,
    showGroundGrid
  } = useDisplayOptions();
  
  // Initialize Three.js scene
  useEffect(() => {
    if (canvasRef.current) {
      try {
        const cleanup = initialize(canvasRef.current);
        return cleanup;
      } catch (error) {
        console.error("Failed to initialize canvas:", error);
        setCanvasError(`Failed to initialize 3D canvas: ${error.message || 'Unknown error'}`);
      }
    }
  }, [initialize]);
  
  // Handle canvas click for borehole placement
  useEffect(() => {
    const currentCanvas = canvasRef.current;
    
    if (isPlacingBorehole && currentCanvas) {
      try {
        const clickHandler = (event) => handleCanvasClick(event, currentCanvas);
        currentCanvas.addEventListener('mousedown', clickHandler);
        
        if (sceneManager && sceneManager.controls) {
          sceneManager.controls.enabled = false;
        }
        
        return () => {
          currentCanvas.removeEventListener('mousedown', clickHandler);
          if (sceneManager && sceneManager.controls) {
            sceneManager.controls.enabled = true;
          }
        };
      } catch (error) {
        console.error("Error setting up borehole placement:", error);
        setCanvasError(`Failed to set up borehole placement: ${error.message || 'Unknown error'}`);
      }
    }
    
    return undefined;
  }, [isPlacingBorehole, handleCanvasClick, sceneManager]);
  
  // Update ground grid
  useEffect(() => {
    if (isInitialized && !threeJsError) {
      try {
        queueOperation(new SceneOperation('CREATE_GROUND_GRID', {
          show: showGroundGrid
        }));
      } catch (error) {
        console.error("Error updating ground grid:", error);
      }
    }
  }, [isInitialized, queueOperation, showGroundGrid, threeJsError]);
  
  // Update soil layers
  useEffect(() => {
    if (isInitialized && !threeJsError) {
      try {
        queueOperation(new SceneOperation('CREATE_SOIL_LAYERS', {
          layers,
          options: {
            strataDimensions,
            viewMode,
            verticalSpacing,
            showLabels,
            showMarkers,
            showDepthMarkers,
            showConnectors,
            showStrata
          }
        }));
      } catch (error) {
        console.error("Error updating soil layers:", error);
      }
    }
  }, [
    isInitialized,
    queueOperation,
    layers,
    strataDimensions,
    viewMode,
    verticalSpacing,
    showLabels,
    showMarkers,
    showDepthMarkers,
    showConnectors,
    showStrata,
    threeJsError
  ]);
  
  // Update borehole markers
  useEffect(() => {
    if (isInitialized && !threeJsError) {
      try {
        queueOperation(new SceneOperation('CREATE_BOREHOLE_MARKERS', {
          boreholes
        }));
      } catch (error) {
        console.error("Error updating borehole markers:", error);
      }
    }
  }, [isInitialized, queueOperation, boreholes, threeJsError]);
  
  const localError = canvasError || threeJsError;
  
  return (
    <div
      ref={canvasRef}
      className={isPlacingBorehole ? "canvas-placing-borehole" : "canvas"}
    >
      {localError && (
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          backgroundColor: 'rgba(0, 0, 0, 0.7)',
          color: 'white',
          padding: '15px',
          borderRadius: '8px',
          maxWidth: '80%',
          textAlign: 'center',
          zIndex: 1000
        }}>
          {localError}
        </div>
      )}
    </div>
  );
};

export default ThreeJsCanvas;