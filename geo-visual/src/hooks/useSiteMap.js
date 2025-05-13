// src/hooks/useSiteMap.js
import { useState, useRef, useCallback } from 'react';
import { useThreeJs } from '../contexts/ThreeJsContext';

export const useSiteMap = () => {
  const [mapFileName, setMapFileName] = useState('');
  const [siteMapProps, setSiteMapProps] = useState({
    position: { x: 0, y: 0, z: 0 },
    scale: { x: 1, y: 1, z: 1 },
    visible: true,
    opacity: 1.0
  });
  
  const fileInputRef = useRef(null);
  const { sceneManager } = useThreeJs();

  const handleMapPropChange = useCallback((prop, axis, value) => {
    const numValue = parseFloat(value);
    
    if (prop !== 'visible' && prop !== 'opacity' && isNaN(numValue)) return;
    if (prop === 'opacity' && isNaN(numValue)) return;
    
    setSiteMapProps(prev => {
      const newProps = { ...prev };
      
      if (prop === 'position' || prop === 'scale') {
        newProps[prop] = { ...prev[prop], [axis]: numValue };
      } else if (prop === 'opacity') {
        newProps[prop] = Math.max(0, Math.min(1, numValue));
      } else {
        newProps[prop] = value;
      }
      
      if (sceneManager) {
        sceneManager.updateSiteMapProps(newProps);
      }
      
      return newProps;
    });
  }, [sceneManager]);

  const handleFileChange = useCallback((event) => {
    const file = event.target.files[0];
    if (!file || !sceneManager) return;
    
    setMapFileName(file.name);
    
    const reader = new FileReader();
    
    reader.onload = (e) => {
      if (!e.target || !e.target.result) {
        alert("Failed to read file.");
        setMapFileName('');
        if (fileInputRef.current) fileInputRef.current.value = null;
        return;
      }
      
      sceneManager.loadSiteMap(
        e.target.result,
        (model) => {
          // Get model's properties for initial settings
          const initialScale = model.scale.x;
          
          const initialPosition = {
            x: model.position.x,
            y: model.position.y,
            z: model.position.z
          };
          
          setSiteMapProps({
            position: initialPosition,
            scale: { x: initialScale, y: initialScale, z: initialScale },
            visible: true,
            opacity: 1.0
          });
        },
        (error) => {
          alert(`Failed to load map: ${error.message || 'Unknown error'}.`);
          setMapFileName('');
          if (fileInputRef.current) fileInputRef.current.value = null;
        }
      );
    };
    
    reader.onerror = () => {
      alert('Failed to read the file.');
      setMapFileName('');
      if (fileInputRef.current) fileInputRef.current.value = null;
    };
    
    reader.readAsArrayBuffer(file);
  }, [sceneManager]);

  const handleRemoveMap = useCallback(() => {
    if (sceneManager && sceneManager.siteMap) {
      sceneManager.loadSiteMap(null);
    }
    
    setMapFileName('');
    if (fileInputRef.current) fileInputRef.current.value = null;
    
    setSiteMapProps({
      position: { x: 0, y: 0, z: 0 },
      scale: { x: 1, y: 1, z: 1 },
      visible: true,
      opacity: 1.0
    });
  }, [sceneManager]);

  return {
    mapFileName,
    siteMapProps,
    fileInputRef,
    handleMapPropChange,
    handleFileChange,
    handleRemoveMap
  };
};