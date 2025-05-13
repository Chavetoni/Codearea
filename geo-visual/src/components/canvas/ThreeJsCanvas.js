// src/components/canvas/ThreeJsCanvas.js
import React, { useEffect, useRef } from 'react';
import { useThreeJs } from '../../contexts/ThreeJsContext';
import { useLayers } from '../../contexts/LayersContext';
import { useBoreholes } from '../../contexts/BoreholeContext';
import { useDisplayOptions } from '../../contexts/DisplayOptionsContext';

const ThreeJsCanvas = () => {
  const canvasRef = useRef(null);
  const {
    initialize,
    sceneManager,
    isInitialized
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
      const cleanup = initialize(canvasRef.current);
      return cleanup;
    }
  }, [initialize]);
  
  // Handle canvas click for borehole placement
  useEffect(() => {
    const currentCanvas = canvasRef.current;
    
    if (isPlacingBorehole && currentCanvas) {
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
    }
    
    return undefined;
  }, [isPlacingBorehole, handleCanvasClick, sceneManager]);
  
  // Update ground grid
  useEffect(() => {
    if (isInitialized && sceneManager) {
      sceneManager.createGroundGrid(showGroundGrid);
    }
  }, [isInitialized, sceneManager, showGroundGrid]);
  
  // Update soil layers
  useEffect(() => {
    if (isInitialized && sceneManager) {
      sceneManager.createSoilLayers(layers, {
        strataDimensions,
        viewMode,
        verticalSpacing,
        showLabels,
        showMarkers,
        showDepthMarkers,
        showConnectors,
        showStrata
      });
    }
  }, [
    isInitialized,
    sceneManager,
    layers,
    strataDimensions,
    viewMode,
    verticalSpacing,
    showLabels,
    showMarkers,
    showDepthMarkers,
    showConnectors,
    showStrata
  ]);
  
  // Update borehole markers
  useEffect(() => {
    if (isInitialized && sceneManager) {
      sceneManager.createBoreholeMarkers(boreholes);
    }
  }, [isInitialized, sceneManager, boreholes]);
  
  return (
    <div
      ref={canvasRef}
      className={isPlacingBorehole ? "canvas-placing-borehole" : "canvas"}
    />
  );
};

export default ThreeJsCanvas;