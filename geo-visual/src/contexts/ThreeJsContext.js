// src/contexts/ThreeJsContext.js
import React, { createContext, useContext, useRef, useState, useCallback, useEffect } from 'react';
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
  const [error, setError] = useState(null);
  const [operationQueue, setOperationQueue] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const sceneManagerRef = useRef(null);
  const rendererRef = useRef(null);
  const cameraRef = useRef(null);
  const canvasRef = useRef(null);
  const animationFrameId = useRef(null);

  // Cleanup function - extracted for reuse in recovery
  const cleanup = useCallback(() => {
    if (animationFrameId.current) {
      cancelAnimationFrame(animationFrameId.current);
      animationFrameId.current = null;
    }
    
    if (sceneManagerRef.current) {
      sceneManagerRef.current.dispose();
      sceneManagerRef.current = null;
    }
    
    rendererRef.current = null;
    cameraRef.current = null;
    setIsInitialized(false);
  }, []);

  const initialize = useCallback((container) => {
    if (!container) return;
    
    try {
      setError(null);
      const manager = new SceneManager(container);
      
      // Setup context recovery
      manager.onContextRestored = () => {
        setIsInitialized(true);
      };
      
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
        cleanup();
      };
    } catch (error) {
      console.error("Failed to initialize Three.js scene:", error);
      setError(`Failed to initialize 3D viewer: ${error.message || 'Unknown error'}. Try refreshing the page.`);
      setIsInitialized(false);
      return () => {}; // Return empty cleanup function
    }
  }, [cleanup]);

  // Process operations in queue
  useEffect(() => {
    if (operationQueue.length > 0 && !isProcessing && isInitialized && sceneManagerRef.current) {
      setIsProcessing(true);
      
      const operation = operationQueue[0];
      try {
        operation.execute(sceneManagerRef.current);
      } catch (error) {
        console.error("Operation failed:", error);
        setError(`An operation failed: ${error.message || 'Unknown error'}. Try refreshing if issues persist.`);
      } finally {
        setOperationQueue(prev => prev.slice(1));
        setIsProcessing(false);
      }
    }
  }, [operationQueue, isProcessing, isInitialized]);

  // Add an operation to the queue
  const queueOperation = useCallback((operation) => {
    setOperationQueue(prev => [...prev, operation]);
  }, []);

  // Attempt recovery if there's an error
  const attemptRecovery = useCallback(() => {
    if (canvasRef.current) {
      setError(null);
      cleanup();
      
      // Small delay to ensure cleanup is complete
      setTimeout(() => {
        initialize(canvasRef.current);
      }, 500);
    }
  }, [cleanup, initialize]);

  const value = {
    sceneManager: sceneManagerRef.current,
    renderer: rendererRef.current,
    camera: cameraRef.current,
    canvasRef,
    isInitialized,
    error,
    initialize,
    attemptRecovery,
    queueOperation
  };

  return (
    <ThreeJsContext.Provider value={value}>
      {error && (
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          backgroundColor: 'rgba(255, 0, 0, 0.1)',
          padding: '15px',
          borderRadius: '8px',
          textAlign: 'center',
          zIndex: 1000
        }}>
          <p style={{ marginBottom: '10px' }}>{error}</p>
          <button 
            onClick={attemptRecovery}
            style={{
              padding: '8px 16px',
              backgroundColor: '#3b82f6',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Retry
          </button>
        </div>
      )}
      {children}
    </ThreeJsContext.Provider>
  );
};