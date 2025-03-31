import React, { useRef, useState, useEffect } from 'react';
import * as THREE from 'three';

const SoilLayersModel = () => {
  const mountRef = useRef(null);
  const [numLayers, setNumLayers] = useState(3);
  const [scene, setScene] = useState(null);
  const [camera, setCamera] = useState(null);
  const [renderer, setRenderer] = useState(null);
  const [soilCube, setSoilCube] = useState(null);
  const [layerInfo, setLayerInfo] = useState([]);
  const [activeLayerIndex, setActiveLayerIndex] = useState(0);
  const [showLayerPanel, setShowLayerPanel] = useState(false);

  // Default colors and descriptions for soil layers
  const defaultSoilTypes = [
    { name: "Topsoil", color: "#3b2e1e", description: "Dark, fertile surface layer" },
    { name: "Sandy Loam", color: "#5e4b37", description: "Mixed sand and clay with good drainage" },
    { name: "Clay", color: "#7a6951", description: "Dense, water-retaining layer" },
    { name: "Sandy Layer", color: "#9b8569", description: "Loose, granular texture" },
    { name: "Silt", color: "#4c453a", description: "Fine sediment with moderate drainage" },
    { name: "Rocky Layer", color: "#8f857a", description: "Contains stones and pebbles" },
    { name: "Chalk", color: "#dcd5c7", description: "White/gray calcium carbonate layer" },
    { name: "Clay Loam", color: "#b0a183", description: "Mixed clay with improved drainage" }
  ];

  // For custom controls
  const controlsRef = useRef({
    isMouseDown: false,
    mousePosition: { x: 0, y: 0 },
    rotationSpeed: 0.01,
    cameraRadius: 5,
    cameraTheta: Math.PI / 4,
    cameraPhi: Math.PI / 3,
    zoomSpeed: 0.1,
    minZoom: 2,
    maxZoom: 10
  });

  // Initialize layer data when numLayers changes
  useEffect(() => {
    // Create initial layer information based on number of layers
    const newLayerInfo = Array.from({ length: numLayers }, (_, i) => {
      const defaultLayer = defaultSoilTypes[i % defaultSoilTypes.length];
      return {
        name: defaultLayer.name,
        color: defaultLayer.color,
        description: defaultLayer.description,
        depth: i === 0 ? 1.0 : 2.0 // Default depths in feet
      };
    });
    
    setLayerInfo(newLayerInfo);
    setActiveLayerIndex(Math.min(activeLayerIndex, numLayers - 1));
  }, [numLayers]);

  // We'll handle camera position updates directly in the event handlers
  // instead of using this function to ensure immediate visual feedback

  // Initialize the 3D scene
  useEffect(() => {
    if (!mountRef.current) return;

    // Create scene
    const newScene = new THREE.Scene();
    newScene.background = new THREE.Color(0xf0f0f0);
    setScene(newScene);

    // Create camera
    const newCamera = new THREE.PerspectiveCamera(
      75,
      mountRef.current.clientWidth / mountRef.current.clientHeight,
      0.1,
      1000
    );
    setCamera(newCamera);

    // Set initial camera position
    controlsRef.current.cameraRadius = 5;
    controlsRef.current.cameraTheta = Math.PI / 4;
    controlsRef.current.cameraPhi = Math.PI / 3;
    const x = controlsRef.current.cameraRadius * Math.sin(controlsRef.current.cameraPhi) * Math.cos(controlsRef.current.cameraTheta);
    const y = controlsRef.current.cameraRadius * Math.cos(controlsRef.current.cameraPhi);
    const z = controlsRef.current.cameraRadius * Math.sin(controlsRef.current.cameraPhi) * Math.sin(controlsRef.current.cameraTheta);
    newCamera.position.set(x, y, z);
    newCamera.lookAt(0, 0, 0);

    // Create renderer
    const newRenderer = new THREE.WebGLRenderer({ antialias: true });
    newRenderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    mountRef.current.appendChild(newRenderer.domElement);
    setRenderer(newRenderer);

    // Add ambient light
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    newScene.add(ambientLight);

    // Add directional light
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(1, 1, 1);
    newScene.add(directionalLight);

    // Grid removed as requested

    // Create initial soil cube
    createSoilCube(newScene, numLayers, layerInfo);

    // Implement custom mouse controls
    const handleMouseDown = (e) => {
      controlsRef.current.isMouseDown = true;
      controlsRef.current.mousePosition = { x: e.clientX, y: e.clientY };
    };

    const handleMouseMove = (e) => {
      if (!controlsRef.current.isMouseDown) return;
      
      const deltaX = e.clientX - controlsRef.current.mousePosition.x;
      const deltaY = e.clientY - controlsRef.current.mousePosition.y;
      
      controlsRef.current.cameraTheta -= deltaX * 0.01;
      controlsRef.current.cameraPhi = Math.min(
        Math.max(controlsRef.current.cameraPhi - deltaY * 0.01, 0.1),
        Math.PI - 0.1
      );
      
      controlsRef.current.mousePosition = { x: e.clientX, y: e.clientY };
      
      // Update camera position directly
      const radius = controlsRef.current.cameraRadius;
      const theta = controlsRef.current.cameraTheta;
      const phi = controlsRef.current.cameraPhi;
      
      const x = radius * Math.sin(phi) * Math.cos(theta);
      const y = radius * Math.cos(phi);
      const z = radius * Math.sin(phi) * Math.sin(theta);
      
      newCamera.position.set(x, y, z);
      newCamera.lookAt(0, 0, 0);
    };

    const handleMouseUp = () => {
      controlsRef.current.isMouseDown = false;
    };

    const handleWheel = (e) => {
      e.preventDefault();
      const zoomAmount = e.deltaY * 0.001;
      controlsRef.current.cameraRadius = Math.min(
        Math.max(controlsRef.current.cameraRadius + zoomAmount, controlsRef.current.minZoom),
        controlsRef.current.maxZoom
      );
      
      // Update camera position directly
      const radius = controlsRef.current.cameraRadius;
      const theta = controlsRef.current.cameraTheta;
      const phi = controlsRef.current.cameraPhi;
      
      const x = radius * Math.sin(phi) * Math.cos(theta);
      const y = radius * Math.cos(phi);
      const z = radius * Math.sin(phi) * Math.sin(theta);
      
      newCamera.position.set(x, y, z);
      newCamera.lookAt(0, 0, 0);
    };

    // Add event listeners directly to the DOM element
    const canvasElement = newRenderer.domElement;
    canvasElement.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    canvasElement.addEventListener('wheel', handleWheel, { passive: false });

    // Animation loop
    const animate = () => {
      requestAnimationFrame(animate);
      newRenderer.render(newScene, newCamera);
    };
    animate();

    // Handle resize
    const handleResize = () => {
      if (!mountRef.current) return;
      newCamera.aspect = mountRef.current.clientWidth / mountRef.current.clientHeight;
      newCamera.updateProjectionMatrix();
      newRenderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    };
    window.addEventListener('resize', handleResize);

    // Cleanup function
    return () => {
      window.removeEventListener('resize', handleResize);
      canvasElement.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      canvasElement.removeEventListener('wheel', handleWheel);
      if (mountRef.current && mountRef.current.contains(newRenderer.domElement)) {
        mountRef.current.removeChild(newRenderer.domElement);
      }
    };
  }, []);

  // Function to create the soil cube with layers
  const createSoilCube = (scene, layers, layerData = []) => {
    // Remove existing soil cube if it exists
    if (soilCube) {
      scene.remove(soilCube);
    }

    // Create a new group to hold all the layers
    const newSoilCube = new THREE.Group();
    setSoilCube(newSoilCube);

    const cubeWidth = 3;  // Increased from 2 to 3
    const cubeDepth = 3;  // Increased from 2 to 3
    
    // Calculate total depth and convert to model units
    const totalDepth = layerData.reduce((sum, layer) => sum + (parseFloat(layer.depth) || 1), 0);
    const modelHeight = Math.max(2, totalDepth); // Ensure minimum height for visibility
    
    // Create depth markers
    createDepthMarkers(newSoilCube, modelHeight, totalDepth);

    // Track current position for stacking layers from top to bottom
    let currentPosition = modelHeight / 2; // Start from the top
    
    // Create each soil layer - first layer at the top, last layer at the bottom
    for (let i = 0; i < layers; i++) {
      const layerColor = layerData[i]?.color || defaultSoilTypes[i % defaultSoilTypes.length].color;
      const colorHex = layerColor.startsWith('#') ? layerColor : `#${layerColor}`;
      const color = new THREE.Color(colorHex);
      
      // Calculate layer height based on its depth proportion of total
      const layerDepth = parseFloat(layerData[i]?.depth) || 1;
      const layerHeight = (layerDepth / totalDepth) * modelHeight;
      
      const layerGeometry = new THREE.BoxGeometry(cubeWidth, layerHeight, cubeDepth);
      
      // Create different material for each side for better visibility
      const materials = [
        new THREE.MeshStandardMaterial({ color: color, roughness: 0.8 }), // right
        new THREE.MeshStandardMaterial({ color: color, roughness: 0.8 }), // left
        new THREE.MeshStandardMaterial({ color: color, roughness: 0.8 }), // top
        new THREE.MeshStandardMaterial({ color: color, roughness: 0.8 }), // bottom
        new THREE.MeshStandardMaterial({ color: color, roughness: 0.8 }), // front
        new THREE.MeshStandardMaterial({ color: color, roughness: 0.8 })  // back
      ];

      const layer = new THREE.Mesh(layerGeometry, materials);
      
      // Position the layer from top to bottom
      // Calculate the midpoint of this layer
      currentPosition -= layerHeight / 2;
      layer.position.y = currentPosition;
      
      // Move position down by the other half of this layer for the next layer's starting point
      currentPosition -= layerHeight / 2;
      
      // Add layer to the group
      newSoilCube.add(layer);
    }

    // Add the soil cube to the scene
    scene.add(newSoilCube);
  };
  
  // Function to create depth markers
  const createDepthMarkers = (group, modelHeight, totalDepth) => {
    const markerMaterial = new THREE.LineBasicMaterial({ color: 0x000000 });
    
    // Create vertical line for scale
    const lineGeometry = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(-1.6, -modelHeight/2, -1.6),
      new THREE.Vector3(-1.6, modelHeight/2, -1.6)
    ]);
    const line = new THREE.Line(lineGeometry, markerMaterial);
    group.add(line);
    
    // Create tick marks at 1-foot intervals
    const tickSize = 0.1;
    
    for (let depth = 0; depth <= Math.ceil(totalDepth); depth++) {
      // Calculate position based on proportion of total depth
      const position = -modelHeight/2 + (depth / totalDepth) * modelHeight;
      
      // Create tick mark
      const tickGeometry = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(-1.6, position, -1.6),
        new THREE.Vector3(-1.6 - tickSize, position, -1.6)
      ]);
      const tick = new THREE.Line(tickGeometry, markerMaterial);
      group.add(tick);
    }
  };

  // Update the soil cube when the number of layers or layer info changes
  useEffect(() => {
    if (scene && layerInfo.length > 0) {
      createSoilCube(scene, numLayers, layerInfo);
    }
  }, [numLayers, layerInfo, scene]);

  // Handle layer number changes
  const handleLayerChange = (e) => {
    const value = parseInt(e.target.value);
    if (value > 0 && value <= 20) {
      setNumLayers(value);
    }
  };

  // Handle layer selection
  const handleLayerSelect = (index) => {
    setActiveLayerIndex(index);
  };

  // Handle layer property changes
  const handleLayerPropertyChange = (property, value) => {
    const updatedLayerInfo = [...layerInfo];
    updatedLayerInfo[activeLayerIndex] = {
      ...updatedLayerInfo[activeLayerIndex],
      [property]: value
    };
    setLayerInfo(updatedLayerInfo);
  };

  return (
    <div className="w-full h-full flex flex-col">
      <div className="p-4 bg-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <label htmlFor="layers" className="mr-2 font-medium">Soil Layers:</label>
            <input
              id="layers"
              type="number"
              min="1"
              max="20"
              value={numLayers}
              onChange={handleLayerChange}
              className="border border-gray-300 rounded px-2 py-1 w-16 text-center"
            />
            <button 
              onClick={() => setShowLayerPanel(!showLayerPanel)}
              className="ml-4 bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
            >
              {showLayerPanel ? "Hide Layer Editor" : "Edit Layers"}
            </button>
          </div>
          <div className="text-sm text-gray-600">
            Click & drag to rotate | Scroll to zoom
          </div>
        </div>
        
        <div className="mt-2 text-sm text-gray-500">
          <p>Total profile depth: {layerInfo.reduce((total, layer) => total + (parseFloat(layer.depth) || 1), 0).toFixed(1)} feet</p>
        </div>
      </div>
      
      <div className="flex flex-1 relative">
        {/* 3D Canvas */}
        <div 
          ref={mountRef} 
          className="flex-grow w-full bg-gray-50"
          style={{ minHeight: '400px' }}
        />
        
        {/* Layer Editor Panel */}
        {showLayerPanel && (
          <div className="absolute right-0 top-0 bottom-0 w-64 bg-white shadow-lg p-4 overflow-y-auto">
            <h3 className="font-bold text-lg mb-4">Layer Properties</h3>
            
            {/* Layer Selector */}
            <div className="mb-4">
              <label className="block mb-2 font-medium">Select Layer:</label>
              <div className="grid grid-cols-4 gap-1 mb-2">
                {layerInfo.map((layer, index) => (
                  <div 
                    key={index}
                    onClick={() => handleLayerSelect(index)}
                    className={`h-8 cursor-pointer ${index === activeLayerIndex ? 'ring-2 ring-blue-500' : ''}`}
                    style={{ backgroundColor: layer.color }}
                    title={`Layer ${index + 1}: ${layer.name}`}
                  />
                ))}
              </div>
              <div className="text-sm text-gray-500">Layer {activeLayerIndex + 1} selected</div>
            </div>
            
            {/* Layer Properties Editor */}
            {layerInfo[activeLayerIndex] && (
              <div>
                <div className="mb-3">
                  <label className="block mb-1 font-medium">Layer Name:</label>
                  <input 
                    type="text"
                    value={layerInfo[activeLayerIndex].name || ''}
                    onChange={(e) => handleLayerPropertyChange('name', e.target.value)}
                    className="w-full border border-gray-300 rounded px-2 py-1"
                  />
                </div>
                
                <div className="mb-3">
                  <label className="block mb-1 font-medium">Layer Color:</label>
                  <div className="flex items-center">
                    <input 
                      type="color"
                      value={layerInfo[activeLayerIndex].color || '#000000'}
                      onChange={(e) => handleLayerPropertyChange('color', e.target.value)}
                      className="w-10 h-10 border border-gray-300 mr-2"
                    />
                    <input 
                      type="text"
                      value={layerInfo[activeLayerIndex].color || ''}
                      onChange={(e) => handleLayerPropertyChange('color', e.target.value)}
                      className="flex-grow border border-gray-300 rounded px-2 py-1"
                    />
                  </div>
                </div>
                
                <div className="mb-3">
                  <label className="block mb-1 font-medium">Description:</label>
                  <textarea
                    value={layerInfo[activeLayerIndex].description || ''}
                    onChange={(e) => handleLayerPropertyChange('description', e.target.value)}
                    className="w-full border border-gray-300 rounded px-2 py-1 h-20"
                  />
                </div>
                
                <div className="mb-3">
                  <label className="block mb-1 font-medium">Depth (feet):</label>
                  <input 
                    type="number"
                    min="0.1"
                    step="0.1"
                    value={layerInfo[activeLayerIndex].depth || 1}
                    onChange={(e) => handleLayerPropertyChange('depth', Math.max(0.1, parseFloat(e.target.value) || 0.1))}
                    className="w-full border border-gray-300 rounded px-2 py-1"
                  />
                </div>
              </div>
            )}
            
            {/* Legend */}
            <div className="mt-6">
              <h4 className="font-bold mb-2">Soil Layers Legend</h4>
              <div className="text-sm">
                {layerInfo.map((layer, index) => (
                  <div key={index} className="flex items-center mb-1">
                    <div className="w-4 h-4 mr-2" style={{ backgroundColor: layer.color }} />
                    <div className="flex-grow">
                      <div className="font-medium">{layer.name || `Layer ${index + 1}`}</div>
                      <div className="text-xs text-gray-500">{layer.description || 'No description'}</div>
                      <div className="text-xs text-gray-700">Depth: {layer.depth || 1} ft</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SoilLayersModel;