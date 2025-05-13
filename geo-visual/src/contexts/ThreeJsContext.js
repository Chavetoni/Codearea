// src/contexts/ThreeJsContext.js
import React, { createContext, useContext, useRef, useState, useCallback } from 'react';
import SceneManager from '../services/SceneManager';

const ThreeJsContext = createContext(null);

export const useThreeJs = () => {
  const context = useContext(ThreeJsContext);
  if (!context) {
    throw new Error('useThreeJs must be used within a ThreeJsProvider');
  }
  return context;
};

export const ThreeJsProvider = ({ children }) => {
  const [isInitialized, setIsInitialized] = useState(false);
  const sceneManagerRef = useRef(null);
  const rendererRef = useRef(null);
  const cameraRef = useRef(null);
  const canvasRef = useRef(null);
  const animationFrameId = useRef(null);

  const initialize = useCallback((container) => {
    if (!container) return;
    
    try {
      const manager = new SceneManager(container);
      sceneManagerRef.current = manager;
      rendererRef.current = manager.renderer;
      cameraRef.current = manager.camera;
      canvasRef.current = container;
      setIsInitialized(true);
      
      const animate = () => {
        animationFrameId.current = requestAnimationFrame(animate);
        manager.render();
      };
      
      animate();
      
      const handleResize = () => manager.handleResize();
      window.addEventListener('resize', handleResize);
      
      return () => {
        window.removeEventListener('resize', handleResize);
        if (animationFrameId.current) {
          cancelAnimationFrame(animationFrameId.current);
        }
        manager.dispose();
        setIsInitialized(false);
      };
    } catch (error) {
      console.error("Failed to initialize Three.js scene:", error);
      setIsInitialized(false);
    }
  }, []);

  const value = {
    sceneManager: sceneManagerRef.current,
    renderer: rendererRef.current,
    camera: cameraRef.current,
    canvasRef,
    isInitialized,
    initialize
  };

  return (
    <ThreeJsContext.Provider value={value}>
      {children}
    </ThreeJsContext.Provider>
  );
};