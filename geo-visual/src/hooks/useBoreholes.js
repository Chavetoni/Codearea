// src/hooks/useBoreholes.js
import { useState, useCallback, useRef } from 'react';
import { useThreeJs } from '../contexts/ThreeJsContext';
import * as THREE from 'three';

export const useBoreholes = () => {
  const [boreholes, setBoreholes] = useState([]);
  const [isPlacingBorehole, setIsPlacingBorehole] = useState(false);
  const raycasterRef = useRef(new THREE.Raycaster());
  const { sceneManager } = useThreeJs();

  const addBorehole = useCallback((x, y, z, name) => {
    const boreholeId = Date.now();
    const newBorehole = {
      id: boreholeId,
      name: name || `BH-${boreholes.length + 1}`,
      x: parseFloat(parseFloat(x).toFixed(2)),
      y: parseFloat(parseFloat(y).toFixed(2)),
      z: parseFloat(parseFloat(z).toFixed(2))
    };

    setBoreholes(prev => [...prev, newBorehole]);
    return newBorehole;
  }, [boreholes.length]);

  const removeBorehole = useCallback((idToRemove) => {
    setBoreholes(prev => prev.filter(bh => bh.id !== idToRemove));
  }, []);

  const handleCanvasClick = useCallback((event, canvasElement) => {
    if (!isPlacingBorehole || !canvasElement || !sceneManager) {
      return;
    }

    const rect = canvasElement.getBoundingClientRect();
    const mouse = new THREE.Vector2();
    mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

    raycasterRef.current.setFromCamera(mouse, sceneManager.camera);

    let intersects = [];
    const potentialTargets = [];

    if (sceneManager.siteMap && sceneManager.siteMap.visible) {
      potentialTargets.push(sceneManager.siteMap);
    }

    if (sceneManager.groundGrid && sceneManager.groundGrid.visible) {
      potentialTargets.push(sceneManager.groundGrid);
    }

    if (potentialTargets.length > 0) {
      intersects = raycasterRef.current.intersectObjects(potentialTargets, true);
    }

    if (intersects.length > 0) {
      const intersectionPoint = intersects[0].point;
      const name = prompt("Enter Borehole Name/ID:", `BH-${boreholes.length + 1}`);
      
      if (name) {
        addBorehole(
          intersectionPoint.x,
          intersectionPoint.y,
          intersectionPoint.z,
          name
        );
      }
    } else {
      // Try Y=0 plane as fallback
      const plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
      const intersectionPoint = new THREE.Vector3();
      
      if (raycasterRef.current.ray.intersectPlane(plane, intersectionPoint)) {
        const name = prompt("Enter Borehole Name/ID (placed on Y=0 plane):", `BH-${boreholes.length + 1}`);
        
        if (name) {
          addBorehole(intersectionPoint.x, 0, intersectionPoint.z, name);
        }
      }
    }
    
    setIsPlacingBorehole(false);
  }, [isPlacingBorehole, boreholes.length, addBorehole, sceneManager]);

  return {
    boreholes,
    isPlacingBorehole,
    setIsPlacingBorehole,
    addBorehole,
    removeBorehole,
    handleCanvasClick
  };
};

export default useBoreholes;