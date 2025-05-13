// src/components/controls/MapUploader.js
import React, { useRef, useState } from 'react';
import { useSiteMap } from '../../hooks/useSiteMap';

const MapUploader = () => {
  const fileInputRef = useRef(null);
  const { 
    mapFileName, 
    siteMapProps, 
    handleMapPropChange, 
    handleFileChange, 
    handleRemoveMap 
  } = useSiteMap();
  
  const [isHoveringButton, setIsHoveringButton] = useState({
    loadMap: false,
    removeMap: false
  });

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
      />
      
      <label
        htmlFor="file-upload-input"
        className={`file-input-label ${isHoveringButton.loadMap ? 'file-input-label-hover' : ''}`}
        onMouseEnter={() => setIsHoveringButton(prev => ({ ...prev, loadMap: true }))}
        onMouseLeave={() => setIsHoveringButton(prev => ({ ...prev, loadMap: false }))}
        onClick={() => fileInputRef.current && fileInputRef.current.click()}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') fileInputRef.current && fileInputRef.current.click();
        }}
      >
        Load Site Map (.glb/.gltf)
      </label>
      
      {mapFileName && (
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
            onClick={handleRemoveMap}
            className={`action-button remove-button ${isHoveringButton.removeMap ? 'remove-button-hover' : ''}`}
            style={{ width: '100%', marginTop: '10px' }}
            onMouseEnter={() => setIsHoveringButton(prev => ({ ...prev, removeMap: true }))}
            onMouseLeave={() => setIsHoveringButton(prev => ({ ...prev, removeMap: false }))}
          >
            Remove Site Map
          </button>
        </>
      )}
    </div>
  );
};

export default MapUploader;