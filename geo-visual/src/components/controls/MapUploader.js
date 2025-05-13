// src/components/controls/MapUploader.js
import React, { useRef, useState, useCallback, useEffect } from 'react';
import { useSiteMap } from '../../hooks/useSiteMap';

const MapUploader = () => {
  const fileInputRef = useRef(null);
  const { 
    mapFileName, 
    siteMapProps, 
    handleMapPropChange, 
    handleFileChange: hookHandleFileChange, 
    handleRemoveMap 
  } = useSiteMap();
  
  const [isHoveringButton, setIsHoveringButton] = useState({
    loadMap: false,
    removeMap: false
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const loadingTimeoutRef = useRef(null);

  // File validation constants
  const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB
  const VALID_EXTENSIONS = ['.glb', '.gltf'];
  const LOADING_TIMEOUT = 30000; // 30 seconds

  // Clean up loading timeout on unmount
  useEffect(() => {
    return () => {
      if (loadingTimeoutRef.current) {
        clearTimeout(loadingTimeoutRef.current);
      }
    };
  }, []);

  const handleFileChange = useCallback((event) => {
    const file = event.target.files[0];
    if (!file) return;
    
    setError(null);
    
    // Validate file extension
    const extension = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
    if (!VALID_EXTENSIONS.includes(extension)) {
      setError(`Invalid file type. Please upload a GLTF (.glb or .gltf) file.`);
      if (fileInputRef.current) fileInputRef.current.value = null;
      return;
    }
    
    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      setError(`File too large (${(file.size / (1024 * 1024)).toFixed(1)}MB). Maximum size is ${MAX_FILE_SIZE / (1024 * 1024)}MB.`);
      if (fileInputRef.current) fileInputRef.current.value = null;
      return;
    }
    
    setIsLoading(true);
    
    // Set loading timeout
    loadingTimeoutRef.current = setTimeout(() => {
      setIsLoading(false);
      setError('File loading timed out. Try with a smaller file.');
      if (fileInputRef.current) fileInputRef.current.value = null;
    }, LOADING_TIMEOUT);
    
    // Call the original handler
    hookHandleFileChange(event, {
      onSuccess: () => {
        clearTimeout(loadingTimeoutRef.current);
        setIsLoading(false);
      },
      onError: (errorMsg) => {
        clearTimeout(loadingTimeoutRef.current);
        setIsLoading(false);
        setError(errorMsg);
        if (fileInputRef.current) fileInputRef.current.value = null;
      }
    });
  }, [hookHandleFileChange]);

  const handleRemoveMapWithReset = useCallback(() => {
    setError(null);
    handleRemoveMap();
  }, [handleRemoveMap]);

  return (
    <div>
      <input
        id="file-upload-input"
        type="file"
        accept=".glb, .gltf"
        ref={fileInputRef}
        style={{ display: 'none' }}
        onChange={handleFileChange}
        key={mapFileName || `file-input-${Date.now()}`}
        disabled={isLoading}
      />
      
      <label
        htmlFor="file-upload-input"
        className={`file-input-label ${isHoveringButton.loadMap && !isLoading ? 'file-input-label-hover' : ''}`}
        onMouseEnter={() => setIsHoveringButton(prev => ({ ...prev, loadMap: true }))}
        onMouseLeave={() => setIsHoveringButton(prev => ({ ...prev, loadMap: false }))}
        onClick={() => !isLoading && fileInputRef.current && fileInputRef.current.click()}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if ((e.key === 'Enter' || e.key === ' ') && !isLoading) 
            fileInputRef.current && fileInputRef.current.click();
        }}
        style={{ 
          opacity: isLoading ? 0.7 : 1,
          cursor: isLoading ? 'not-allowed' : 'pointer'
        }}
      >
        {isLoading ? 'Loading Site Map...' : 'Load Site Map (.glb/.gltf)'}
      </label>
      
      {error && (
        <p style={{ 
          fontSize: '12px', 
          color: '#d32f2f', 
          marginBottom: '10px', 
          wordBreak: 'break-all',
          fontWeight: 'bold'
        }}>
          Error: {error}
        </p>
      )}
      
      {mapFileName && !error && (
        <p style={{ fontSize: '12px', color: '#555', marginBottom: '10px', wordBreak: 'break-all' }}>
          Loaded: {mapFileName}
        </p>
      )}
      
      {siteMapProps && (
        <>
          <label className="map-control-label">Position (X, Y above ground, Z):</label>
          <div className="map-control-container">
            {['x', 'y', 'z'].map((axis, index) => (
              <input
                aria-label={`Map position ${axis.toUpperCase()}`}
                key={`pos-${axis}`}
                type="number"
                step="0.1"
                className="map-control-input"
                style={index === 2 ? { marginRight: 0 } : {}}
                value={siteMapProps.position[axis]}
                onChange={(e) => handleMapPropChange('position', axis, e.target.value)}
                placeholder={axis.toUpperCase()}
              />
            ))}
          </div>
          
          <label className="map-control-label">Scale (X, Y, Z):</label>
          <div className="map-control-container">
            {['x', 'y', 'z'].map((axis, index) => (
              <input
                aria-label={`Map scale ${axis.toUpperCase()}`}
                key={`scale-${axis}`}
                type="number"
                step="0.1"
                min="0.01"
                className="map-control-input"
                style={index === 2 ? { marginRight: 0 } : {}}
                value={siteMapProps.scale[axis]}
                onChange={(e) => handleMapPropChange('scale', axis, e.target.value)}
                placeholder={axis.toUpperCase()}
              />
            ))}
          </div>
          
          <label htmlFor="opacity-slider" className="map-control-label">
            Opacity:
          </label>
          <input
            id="opacity-slider"
            type="range"
            min="0"
            max="1"
            step="0.01"
            style={{ width: '100%', marginBottom: '10px', cursor: 'pointer' }}
            value={siteMapProps.opacity}
            onChange={(e) => handleMapPropChange('opacity', null, e.target.value)}
            aria-label="Map opacity slider"
          />
          
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={siteMapProps.visible}
              onChange={(e) => handleMapPropChange('visible', null, e.target.checked)}
              className="checkbox"
              aria-label="Show site map checkbox"
            />
            Show Site Map
          </label>
          
          <button
            onClick={handleRemoveMapWithReset}
            className={`action-button remove-button ${isHoveringButton.removeMap ? 'remove-button-hover' : ''}`}
            style={{ width: '100%', marginTop: '10px' }}
            onMouseEnter={() => setIsHoveringButton(prev => ({ ...prev, removeMap: true }))}
            onMouseLeave={() => setIsHoveringButton(prev => ({ ...prev, removeMap: false }))}
            disabled={isLoading}
          >
            Remove Site Map
          </button>
        </>
      )}
    </div>
  );
};

export default MapUploader;