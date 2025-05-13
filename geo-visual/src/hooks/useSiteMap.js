// src/hooks/useSiteMap.js
import { useState, useRef, useCallback } from 'react';
import { useThreeJs } from '../contexts/ThreeJsContext';
import { SceneOperation } from '../App';

export const useSiteMap = () => {
  const [mapFileName, setMapFileName] = useState('');
  const [siteMapProps, setSiteMapProps] = useState({
    position: { x: 0, y: 0, z: 0 },
    scale: { x: 1, y: 1, z: 1 },
    visible: true,
    opacity: 1.0
  });
  
  const fileInputRef = useRef(null);
  const { sceneManager, queueOperation } = useThreeJs();

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
      
      // Queue operation to update site map
      queueOperation(new SceneOperation('UPDATE_SITE_MAP_PROPS', {
        props: newProps
      }));
      
      return newProps;
    });
  }, [queueOperation]);

  const handleFileChange = useCallback((event, callbacks = {}) => {
    const { onSuccess, onError } = callbacks;
    const file = event.target.files[0];
    if (!file) return;
    
    setMapFileName(file.name);
    
    const reader = new FileReader();
    
    reader.onload = (e) => {
      if (!e.target || !e.target.result) {
        const errorMsg = "Failed to read file.";
        if (onError) onError(errorMsg);
        else {
          alert(errorMsg);
          setMapFileName('');
        }
        return;
      }
      
      // Queue operation to load site map
      queueOperation(new SceneOperation('LOAD_SITE_MAP', {
        fileContent: e.target.result,
        onSuccess: (model) => {
          // Update initial position and scale based on loaded model
          if (model) {
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
          }
          
          if (onSuccess) onSuccess(model);
        },
        onError: (error) => {
          const errorMsg = `Failed to load map: ${error.message || 'Unknown error'}.`;
          if (onError) onError(errorMsg);
          else {
            alert(errorMsg);
            setMapFileName('');
          }
        }
      }));
    };
    
    reader.onerror = () => {
      const errorMsg = 'Failed to read the file.';
      if (onError) onError(errorMsg);
      else {
        alert(errorMsg);
        setMapFileName('');
      }
    };
    
    reader.readAsArrayBuffer(file);
  }, [queueOperation]);

  const handleRemoveMap = useCallback(() => {
    // Queue operation to remove site map
    queueOperation(new SceneOperation('LOAD_SITE_MAP', {
      fileContent: null,
      onSuccess: () => {
        setMapFileName('');
        setSiteMapProps({
          position: { x: 0, y: 0, z: 0 },
          scale: { x: 1, y: 1, z: 1 },
          visible: true,
          opacity: 1.0
        });
      }
    }));
  }, [queueOperation]);

  return {
    mapFileName,
    siteMapProps,
    fileInputRef,
    handleMapPropChange,
    handleFileChange,
    handleRemoveMap
  };
};