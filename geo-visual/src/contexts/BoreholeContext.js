// src/contexts/BoreholeContext.js
import React, { createContext, useContext, useState, useCallback, useRef } from 'react';
import { useThreeJs } from './ThreeJsContext';

const BoreholeContext = createContext(null);

export const useBoreholes = () => {
  const context = useContext(BoreholeContext);
  if (!context) {
    throw new Error('useBoreholes must be used within a BoreholeProvider');
  }
  return context;
};

export const BoreholeProvider = ({ children }) => {
  const [boreholes, setBoreholes] = useState([]);
  const [isPlacingBorehole, setIsPlacingBorehole] = useState(false);
  const raycasterRef = useRef(null);
  const { sceneManager } = useThreeJs();
  
  // Initialize raycaster once the scene manager is available
  if (sceneManager && !raycasterRef.current) {
    raycasterRef.current = sceneManager.createRaycaster();
  }

  const addBorehole = useCallback((x, y, z, name) => {
    const newBorehole = {
      id: Date.now(),
      name: name || `BH-${boreholes.length + 1}`,
      x: parseFloat(x.toFixed(2)),
      y: parseFloat(y.toFixed(2)),
      z: parseFloat(z.toFixed(2))
    };
    
    setBoreholes(prev => [...prev, newBorehole]);
    return newBorehole;
  }, [boreholes.length]);

  const removeBorehole = useCallback((id) => {
    setBoreholes(prev => prev.filter(bh => bh.id !== id));
  }, []);

  const handleCanvasClick = useCallback((event, canvasElement) => {
    if (!isPlacingBorehole || !sceneManager || !raycasterRef.current) {
      return;
    }

    const intersectionPoint = sceneManager.getIntersectionPoint(event, canvasElement, raycasterRef.current);
    
    if (intersectionPoint) {
      const name = prompt("Enter Borehole Name/ID:", `BH-${boreholes.length + 1}`);
      if (name) {
        addBorehole(intersectionPoint.x, intersectionPoint.y, intersectionPoint.z, name);
      }
    }
    
    setIsPlacingBorehole(false);
  }, [isPlacingBorehole, boreholes.length, sceneManager, addBorehole]);

  const value = {
    boreholes,
    isPlacingBorehole,
    setIsPlacingBorehole,
    addBorehole,
    removeBorehole,
    handleCanvasClick
  };

  return (
    <BoreholeContext.Provider value={value}>
      {children}
    </BoreholeContext.Provider>
  );
};