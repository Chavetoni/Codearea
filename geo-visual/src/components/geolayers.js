import React, { useRef, useState, useEffect } from 'react';
import * as THREE from 'three';

// Inline styles would be here (omitted for brevity)
const styles = {
  container: {
    width: '100%',
    height: '100vh',
    display: 'flex',
    flexDirection: 'column',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0
  },
  header: {
    padding: '16px',
    backgroundColor: '#f3f4f6',
    borderBottom: '1px solid #e5e7eb'
  },
  headerContent: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  controls: {
    display: 'flex',
    alignItems: 'center'
  },
  label: {
    marginRight: '12px',
    fontWeight: '600',
    fontSize: '18px'
  },
  input: {
    border: '1px solid #d1d5db',
    borderRadius: '4px',
    padding: '8px 12px',
    width: '80px',
    textAlign: 'center',
    fontSize: '18px',
    fontWeight: '500'
  },
  button: {
    marginLeft: '20px',
    backgroundColor: '#3b82f6',
    color: 'white',
    padding: '10px 20px',
    borderRadius: '6px',
    border: 'none',
    cursor: 'pointer',
    fontSize: '16px',
    fontWeight: '600'
  },
  instructions: {
    fontSize: '16px',
    color: '#6b7280'
  },
  depthInfo: {
    marginTop: '12px',
    fontSize: '16px',
    color: '#6b7280',
    fontWeight: '500'
  },
  content: {
    display: 'flex',
    flex: 1,
    position: 'relative'
  },
  canvas: {
    flexGrow: 1,
    width: '100%',
    height: 'calc(100vh - 90px)',
    backgroundColor: '#000000'
  },
  editorPanel: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    width: '350px',
    backgroundColor: 'white',
    boxShadow: '-2px 0 10px rgba(0, 0, 0, 0.1)',
    padding: '20px',
    overflowY: 'auto',
    zIndex: 10
  },
  checkboxContainer: {
    marginBottom: '20px'
  },
  checkboxLabel: {
    display: 'flex',
    alignItems: 'center',
    marginBottom: '8px',
    cursor: 'pointer',
    fontSize: '16px'
  },
  checkbox: {
    marginRight: '8px'
  }
  // Additional styles would be here
};

const SoilLayersModel = () => {
  const mountRef = useRef(null);
  const [numLayers, setNumLayers] = useState(5);
  const [scene, setScene] = useState(null);
  const [camera, setCamera] = useState(null);
  const [renderer, setRenderer] = useState(null);
  const [soilCube, setSoilCube] = useState(null);
  const [layerInfo, setLayerInfo] = useState([]);
  const [activeLayerIndex, setActiveLayerIndex] = useState(0);
  const [showLayerPanel, setShowLayerPanel] = useState(false);
  const [showLabels, setShowLabels] = useState(true);
  const [showGrass, setShowGrass] = useState(true);
  const [showMarkers, setShowMarkers] = useState(true);
  const [showDepthMarkers, setShowDepthMarkers] = useState(true);
  const [viewMode, setViewMode] = useState('normal'); // 'normal', 'exploded'
  const [verticalSpacing, setVerticalSpacing] = useState(0.5); // Space between layers in exploded view
  const [showConnectors, setShowConnectors] = useState(true); // Show connecting lines in exploded view
  
  // Default colors and descriptions for soil layers
  const defaultSoilTypes = [
    { name: "Topsoil", color: "#3b2e1e", description: "Dark, fertile surface layer with organic matter" },
    { name: "Clay Layer", color: "#5e4b37", description: "Dense, water-retaining layer with fine particles" },
    { name: "Sandy Layer", color: "#9b8569", description: "Loose, granular texture with good drainage" },
    { name: "Rocky Layer", color: "#8f857a", description: "Contains stones and weathered parent material" },
    { name: "Bedrock", color: "#c4c4c4", description: "Solid rock layer beneath soil horizons" }
  ];

  // For custom controls
  const controlsRef = useRef({
    isMouseDown: false,
    mousePosition: { x: 0, y: 0 },
    rotationSpeed: 0.01,
    cameraRadius: 10,
    cameraTheta: Math.PI / 4,
    cameraPhi: Math.PI / 3,
    zoomSpeed: 0.1,
    minZoom: 2,
    maxZoom: 50
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

  // Initialize the 3D scene
  useEffect(() => {
    if (!mountRef.current) return;

    // Create scene
    const newScene = new THREE.Scene();
    newScene.background = new THREE.Color(0x000000); // Black background
    setScene(newScene);

    // Create camera with wider perspective
    const newCamera = new THREE.PerspectiveCamera(
      60, // Wider field of view
      mountRef.current.clientWidth / mountRef.current.clientHeight,
      0.1,
      1000
    );
    setCamera(newCamera);

    // Set initial camera position with better viewing angle
    controlsRef.current.cameraRadius = 10;
    controlsRef.current.cameraTheta = Math.PI / 4;
    controlsRef.current.cameraPhi = Math.PI / 3;
    const x = controlsRef.current.cameraRadius * Math.sin(controlsRef.current.cameraPhi) * Math.cos(controlsRef.current.cameraTheta);
    const y = controlsRef.current.cameraRadius * Math.cos(controlsRef.current.cameraPhi);
    const z = controlsRef.current.cameraRadius * Math.sin(controlsRef.current.cameraPhi) * Math.sin(controlsRef.current.cameraTheta);
    newCamera.position.set(x, y, z);
    newCamera.lookAt(0, 0, 0);

    // Create renderer with proper sizing
    const newRenderer = new THREE.WebGLRenderer({ antialias: true });
    newRenderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    
    // Clear any existing canvas
    while (mountRef.current.firstChild) {
      mountRef.current.removeChild(mountRef.current.firstChild);
    }
    
    mountRef.current.appendChild(newRenderer.domElement);
    setRenderer(newRenderer);

    // Add stronger lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
    newScene.add(ambientLight);

    // Add directional light from front
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1.0);
    directionalLight.position.set(2, 2, 4);
    newScene.add(directionalLight);

    // Add a second directional light from opposite direction
    const backLight = new THREE.DirectionalLight(0xffffff, 0.5);
    backLight.position.set(-2, 1, -2);
    newScene.add(backLight);

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

    // Ensure the component has a defined size
    handleResize();

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
    console.log("Creating soil cube with", layers, "layers in", viewMode, "mode");
    
    // Remove existing soil cube if it exists
    if (soilCube) {
      scene.remove(soilCube);
    }

    // Create a new group to hold all the layers
    const newSoilCube = new THREE.Group();
    setSoilCube(newSoilCube);

    const cubeWidth = 5;
    const cubeDepth = 5;
    
    // Calculate total depth and convert to model units
    const totalDepth = layerData.reduce((sum, layer) => sum + (parseFloat(layer.depth) || 1), 0);
    const modelHeight = Math.max(5, totalDepth);
    
    // Calculate the extra height needed for exploded view spacing
    const totalExplodedSpacing = viewMode === 'exploded' ? (layers - 1) * verticalSpacing : 0;
    const adjustedModelHeight = modelHeight + totalExplodedSpacing;
    
    // Create depth markers
    if (showDepthMarkers) {
      createDepthMarkers(newSoilCube, adjustedModelHeight, totalDepth);
    }
    
    // Store layer positions for connectors
    const layerPositions = [];
    
    // Track current position for stacking layers from top to bottom
    let currentPosition = adjustedModelHeight / 2; // Start from the top
    
    // Create each soil layer - first layer at the top, last layer at the bottom
    for (let i = 0; i < layers; i++) {
      const layerColor = layerData[i]?.color || defaultSoilTypes[i % defaultSoilTypes.length].color;
      const colorHex = layerColor.startsWith('#') ? layerColor : `#${layerColor}`;
      const color = new THREE.Color(colorHex);
      
      // Calculate layer height based on its depth proportion of total
      const layerDepth = parseFloat(layerData[i]?.depth) || 1;
      const layerHeight = (layerDepth / totalDepth) * modelHeight;
      
      // Create a group for this layer
      const layerGroup = new THREE.Group();
      
      // Calculate layer position with spacing if in exploded view
      const layerPosition = currentPosition - layerHeight / 2;
      
      // Create the layer geometry
      const geometry = new THREE.BoxGeometry(cubeWidth, layerHeight, cubeDepth);
      const material = new THREE.MeshStandardMaterial({
        color: color,
        roughness: 0.7,
        metalness: 0.1
      });
      const layer = new THREE.Mesh(geometry, material);
      layer.position.y = layerPosition;
      layerGroup.add(layer);
      
      if (viewMode === 'exploded') {
        // Store layer positions for connectors in exploded view
        layerPositions.push({
          top: layerPosition + layerHeight/2,
          bottom: layerPosition - layerHeight/2,
          offset: { x: 0, z: 0 }
        });
      }
      
      // Add the layer group to the soil cube
      newSoilCube.add(layerGroup);
      
      // Store current layer's bottom position
      const bottomPosition = layerPosition - layerHeight/2;
      
      // Add marker if enabled - position it on the right side
      if (showMarkers) {
        const marker = createMarker(i + 1);
        marker.position.set(cubeWidth/2 + 0.4, layerPosition, 0);
        newSoilCube.add(marker);
      }
      
      // Add text label if enabled
      if (showLabels) {
        const label = createTextLabel(`${layerData[i]?.name || 'Layer ' + (i+1)}: ${layerData[i]?.description || 'No description'}`, colorHex);
        // Position label on the right side
        label.position.set(cubeWidth/2 + 3.5, layerPosition, 0);
        newSoilCube.add(label);
        
        // Add connecting line from layer to label
        const lineMaterial = new THREE.LineBasicMaterial({ color: 0xffffff });
        const lineGeometry = new THREE.BufferGeometry().setFromPoints([
          new THREE.Vector3(cubeWidth/2, layerPosition, 0),
          new THREE.Vector3(cubeWidth/2 + 2.0, layerPosition, 0)
        ]);
        const line = new THREE.Line(lineGeometry, lineMaterial);
        newSoilCube.add(line);
      }
      
      // Move down by this layer's height plus spacing (if exploded) for the next layer
      currentPosition = bottomPosition - (viewMode === 'exploded' ? verticalSpacing : 0);
    }
    
    // Add connectors between layers in exploded view
    if (viewMode === 'exploded' && showConnectors && layerPositions.length > 1) {
      for (let i = 0; i < layerPositions.length - 1; i++) {
        const upper = layerPositions[i];
        const lower = layerPositions[i + 1];
        
        // Create connectors (vertical lines on left and right sides)
        const lineMaterial = new THREE.LineBasicMaterial({ color: 0xaaaaaa, opacity: 0.7, transparent: true });
        
        // Right side connector
        const rightLineGeometry = new THREE.BufferGeometry().setFromPoints([
          new THREE.Vector3(cubeWidth/2, upper.bottom, 0),
          new THREE.Vector3(cubeWidth/2, lower.top, 0)
        ]);
        const rightLine = new THREE.Line(rightLineGeometry, lineMaterial);
        newSoilCube.add(rightLine);
        
        // Left side connector
        const leftLineGeometry = new THREE.BufferGeometry().setFromPoints([
          new THREE.Vector3(-cubeWidth/2, upper.bottom, 0),
          new THREE.Vector3(-cubeWidth/2, lower.top, 0)
        ]);
        const leftLine = new THREE.Line(leftLineGeometry, lineMaterial);
        newSoilCube.add(leftLine);
      }
    }
    
    // Add grass to the top if enabled
    if (showGrass && layers > 0) {
      const grassPatch = createGrass(cubeWidth);
      
      // Position grass at the top of the model
      const grassY = viewMode === 'exploded' 
        ? (adjustedModelHeight / 2 + 0.1) 
        : (modelHeight / 2 + 0.1);
        
      grassPatch.position.y = grassY;
      newSoilCube.add(grassPatch);
    }

    // Add the soil cube to the scene
    scene.add(newSoilCube);
    console.log("Soil cube created and added to scene");
  };
  
  // Constants for geometry
  const cubeWidth = 5;
  const cubeDepth = 5;
  
  // Function to create depth markers
  const createDepthMarkers = (group, modelHeight, totalDepth) => {
    const markerMaterial = new THREE.LineBasicMaterial({ color: 0xffffff });
    
    // Create vertical line for scale on the left side
    const lineGeometry = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(-cubeWidth/2 - 0.5, -modelHeight/2, 0),
      new THREE.Vector3(-cubeWidth/2 - 0.5, modelHeight/2, 0)
    ]);
    const line = new THREE.Line(lineGeometry, markerMaterial);
    group.add(line);
    
    // Calculate actual display positions for each depth marker
    // In exploded view, we need to adjust these positions
    const depthPositions = [];
    
    if (viewMode === 'exploded') {
      // For exploded view, calculate the real position of each depth marker
      let runningDepth = 0;
      let position = modelHeight/2;
      
      // Start with 0 at the top
      depthPositions.push({ depth: 0, position: position });
      
      for (let i = 0; i < layerInfo.length; i++) {
        const layerDepth = parseFloat(layerInfo[i].depth) || 1;
        const layerHeight = (layerDepth / totalDepth) * modelHeight;
        
        // Move down to bottom of this layer
        position -= layerHeight;
        
        // Add accumulated depth
        runningDepth += layerDepth;
        
        // Store the position and depth
        depthPositions.push({ depth: runningDepth, position: position });
        
        // Add spacing if not the last layer
        if (i < layerInfo.length - 1) {
          position -= verticalSpacing;
        }
      }
    } else {
      // For normal and separated views, markers are evenly spaced
      for (let depth = 0; depth <= Math.ceil(totalDepth); depth++) {
        // Calculate position based on proportion of total depth
        const position = modelHeight/2 - (depth / totalDepth) * modelHeight;
        depthPositions.push({ depth: depth, position: position });
      }
    }
    
    // Create tick marks and labels for each calculated position
    depthPositions.forEach(item => {
      // Create tick mark
      const tickGeometry = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(-cubeWidth/2 - 0.5, item.position, 0),
        new THREE.Vector3(-cubeWidth/2 - 0.8, item.position, 0)
      ]);
      const tick = new THREE.Line(tickGeometry, markerMaterial);
      group.add(tick);
      
      // Add depth label
      const canvas = document.createElement('canvas');
      canvas.width = 64;
      canvas.height = 32;
      const ctx = canvas.getContext('2d');
      
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 24px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(`${item.depth}'`, 32, 16);
      
      const texture = new THREE.CanvasTexture(canvas);
      const labelMaterial = new THREE.MeshBasicMaterial({
        map: texture,
        side: THREE.DoubleSide,
        transparent: true
      });
      
      const labelGeometry = new THREE.PlaneGeometry(0.6, 0.3);
      const label = new THREE.Mesh(labelGeometry, labelMaterial);
      label.position.set(-cubeWidth/2 - 1.2, item.position, 0);
      
      group.add(label);
    });
  };
  
  // Function to create a simple grass patch
  const createGrass = (size) => {
    const group = new THREE.Group();
    
    // Create grass blades
    const bladesCount = 150;
    const grassArea = size * 0.8; // Slightly smaller than the soil width
    
    // Normal view - one continuous patch of grass
    for (let i = 0; i < bladesCount; i++) {
      const height = Math.random() * 0.5 + 0.2;
      const width = Math.random() * 0.1 + 0.02;
      
      const bladeGeometry = new THREE.PlaneGeometry(width, height);
      const greenShade = Math.random() * 0.5 + 0.3; // Varied green shades
      const bladeMaterial = new THREE.MeshBasicMaterial({
        color: new THREE.Color(0.1, greenShade, 0.1),
        side: THREE.DoubleSide,
        transparent: true
      });
      
      const blade = new THREE.Mesh(bladeGeometry, bladeMaterial);
      
      // Position randomly on the base
      const posX = (Math.random() - 0.5) * grassArea;
      const posZ = (Math.random() - 0.5) * grassArea;
      blade.position.set(posX, height / 2, posZ);
      
      // Random rotation for natural look
      blade.rotation.y = Math.random() * Math.PI;
      blade.rotation.x = (Math.random() * 0.2) - 0.1;
      
      group.add(blade);
    }
    
    return group;
  };
  
  // Function to create a marker with number
  const createMarker = (number) => {
    const group = new THREE.Group();
    
    // Create circle background
    const circleGeometry = new THREE.CircleGeometry(0.3, 32);
    const circleMaterial = new THREE.MeshBasicMaterial({ 
      color: 0x333333,
      side: THREE.DoubleSide
    });
    const circle = new THREE.Mesh(circleGeometry, circleMaterial);
    group.add(circle);
    
    // Create text for the number
    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 64;
    const ctx = canvas.getContext('2d');
    
    // Set background
    ctx.fillStyle = '#333333';
    ctx.beginPath();
    ctx.arc(32, 32, 30, 0, Math.PI * 2);
    ctx.fill();
    
    // Draw border
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(32, 32, 28, 0, Math.PI * 2);
    ctx.stroke();
    
    // Draw number
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 40px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(number.toString(), 32, 32);
    
    // Convert to texture
    const texture = new THREE.CanvasTexture(canvas);
    const labelMaterial = new THREE.MeshBasicMaterial({
      map: texture,
      side: THREE.DoubleSide,
      transparent: true
    });
    
    const labelGeometry = new THREE.CircleGeometry(0.3, 32);
    const label = new THREE.Mesh(labelGeometry, labelMaterial);
    label.position.z = 0.01;
    
    group.add(label);
    
    return group;
  };
  
  // Function to create text label for a layer
  const createTextLabel = (text, color) => {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 128;
    const ctx = canvas.getContext('2d');
    
    // Make color slightly transparent for better readability
    const rgbColor = new THREE.Color(color);
    const backgroundColor = `rgba(${Math.floor(rgbColor.r * 255)}, ${Math.floor(rgbColor.g * 255)}, ${Math.floor(rgbColor.b * 255)}, 0.8)`;
    
    // Background with rounded corners
    ctx.fillStyle = backgroundColor;
    
    // Use rounded rectangle path
    ctx.beginPath();
    ctx.moveTo(10, 0);
    ctx.lineTo(canvas.width - 10, 0);
    ctx.quadraticCurveTo(canvas.width, 0, canvas.width, 10);
    ctx.lineTo(canvas.width, canvas.height - 10);
    ctx.quadraticCurveTo(canvas.width, canvas.height, canvas.width - 10, canvas.height);
    ctx.lineTo(10, canvas.height);
    ctx.quadraticCurveTo(0, canvas.height, 0, canvas.height - 10);
    ctx.lineTo(0, 10);
    ctx.quadraticCurveTo(0, 0, 10, 0);
    ctx.closePath();
    ctx.fill();
    
    // Border
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.stroke();
    
    // Text
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 24px Arial';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    
    // Handle multi-line text
    const words = text.split(' ');
    let line = '';
    let y = 30;
    const lineHeight = 30;
    
    for (let i = 0; i < words.length; i++) {
      const testLine = line + words[i] + ' ';
      const metrics = ctx.measureText(testLine);
      
      if (metrics.width > canvas.width - 30 && i > 0) {
        ctx.fillText(line, 15, y);
        line = words[i] + ' ';
        y += lineHeight;
      } else {
        line = testLine;
      }
    }
    ctx.fillText(line, 15, y);
    
    // Convert to texture
    const texture = new THREE.CanvasTexture(canvas);
    
    const material = new THREE.MeshBasicMaterial({
      map: texture,
      side: THREE.DoubleSide,
      transparent: true
    });
    
    // Increased size of label
    const geometry = new THREE.PlaneGeometry(5, 1.2);
    const mesh = new THREE.Mesh(geometry, material);
    
    return mesh;
  };

  // Single view mode change handler
  const handleViewModeChange = (mode) => {
    setViewMode(mode);
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

  // Handle adding a new layer
  const handleAddLayer = () => {
    console.log("Adding new layer");
    const newLayerInfo = [...layerInfo];
    const defaultLayer = defaultSoilTypes[newLayerInfo.length % defaultSoilTypes.length];
    
    // Add the new layer at the bottom of the profile
    newLayerInfo.push({
      name: defaultLayer.name,
      color: defaultLayer.color,
      description: defaultLayer.description,
      depth: 2.0 // Default depth for new layers
    });
    
    setLayerInfo(newLayerInfo);
    setNumLayers(newLayerInfo.length);
    setActiveLayerIndex(newLayerInfo.length - 1); // Select the new layer
  };
  
  // Handle removing the currently selected layer
  const handleRemoveLayer = () => {
    if (numLayers <= 1) return; // Keep at least one layer
    
    console.log("Removing layer", activeLayerIndex);
    const newLayerInfo = [...layerInfo];
    newLayerInfo.splice(activeLayerIndex, 1);
    
    setLayerInfo(newLayerInfo);
    setNumLayers(newLayerInfo.length);
    setActiveLayerIndex(Math.min(activeLayerIndex, newLayerInfo.length - 1));
  };

  // Handle layer number changes
  const handleLayerChange = (e) => {
    const value = parseInt(e.target.value);
    if (value > 0 && value <= 20) {
      setNumLayers(value);
    }
  };

  // Update the soil cube when relevant state changes
  useEffect(() => {
    if (scene && layerInfo.length > 0) {
      createSoilCube(scene, numLayers, layerInfo);
    }
  }, [
    numLayers, 
    layerInfo, 
    scene, 
    showLabels, 
    showGrass, 
    showMarkers, 
    showDepthMarkers, 
    viewMode, 
    verticalSpacing,
    showConnectors
  ]);

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div style={styles.headerContent}>
          <div style={styles.controls}>
            <label style={styles.label} htmlFor="layers">Soil Layers:</label>
            <input
              id="layers"
              type="number"
              min="1"
              max="20"
              value={numLayers}
              onChange={handleLayerChange}
              style={styles.input}
            />
            <button 
              onClick={() => setShowLayerPanel(!showLayerPanel)}
              style={styles.button}
            >
              {showLayerPanel ? "Hide Layer Editor" : "Edit Layers"}
            </button>
          </div>
          <div style={styles.instructions}>
            Click & drag to rotate | Scroll to zoom
          </div>
        </div>
        
        <div style={styles.depthInfo}>
          <p>Total profile depth: {layerInfo.reduce((total, layer) => total + (parseFloat(layer.depth) || 1), 0).toFixed(1)} feet</p>
        </div>
      </div>
      
      <div style={styles.content}>
        {/* 3D Canvas */}
        <div 
          ref={mountRef} 
          style={styles.canvas}
        />
        
        {/* Layer Editor Panel */}
        {showLayerPanel && (
          <div style={styles.editorPanel}>
            <h3 style={{ fontSize: '22px', fontWeight: 'bold', marginBottom: '20px' }}>Layer Properties</h3>
            
            {/* View Mode Controls */}
            <div style={{ marginBottom: '20px' }}>
              <h4 style={{ fontSize: '18px', marginBottom: '10px' }}>View Mode</h4>
              <div style={{ display: 'flex', marginBottom: '15px' }}>
                <button 
                  onClick={() => handleViewModeChange('normal')}
                  style={{
                    padding: '8px 12px',
                    backgroundColor: viewMode === 'normal' ? '#3b82f6' : '#e5e7eb',
                    color: viewMode === 'normal' ? 'white' : 'black',
                    border: 'none',
                    borderRadius: '4px',
                    marginRight: '8px',
                    cursor: 'pointer'
                  }}
                >
                  Normal
                </button>
                <button 
                  onClick={() => handleViewModeChange('exploded')}
                  style={{
                    padding: '8px 12px',
                    backgroundColor: viewMode === 'exploded' ? '#3b82f6' : '#e5e7eb',
                    color: viewMode === 'exploded' ? 'white' : 'black',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer'
                  }}
                >
                  Exploded
                </button>
              </div>
              
              {/* Exploded view controls */}
              {viewMode === 'exploded' && (
                <div style={{ marginTop: '10px' }}>
                  <label style={{ display: 'block', marginBottom: '5px' }}>
                    Vertical Spacing:
                  </label>
                  <input
                    type="range"
                    min="0.1"
                    max="2"
                    step="0.1"
                    value={verticalSpacing}
                    onChange={(e) => setVerticalSpacing(parseFloat(e.target.value))}
                    style={{ width: '100%' }}
                  />
                  <div style={{ textAlign: 'center', fontSize: '14px', color: '#6b7280', marginTop: '4px' }}>
                    {verticalSpacing.toFixed(1)}
                  </div>
                  
                  <label style={styles.checkboxLabel}>
                    <input
                      type="checkbox"
                      checked={showConnectors}
                      onChange={(e) => setShowConnectors(e.target.checked)}
                      style={styles.checkbox}
                    />
                    Show Layer Connectors
                  </label>
                </div>
              )}
              
              {/* Display Options */}
              <h4 style={{ fontSize: '18px', marginTop: '15px', marginBottom: '10px' }}>Display Options</h4>
              <label style={styles.checkboxLabel}>
                <input
                  type="checkbox"
                  checked={showGrass}
                  onChange={(e) => setShowGrass(e.target.checked)}
                  style={styles.checkbox}
                />
                Show Vegetation
              </label>
              <label style={styles.checkboxLabel}>
                <input
                  type="checkbox"
                  checked={showLabels}
                  onChange={(e) => setShowLabels(e.target.checked)}
                  style={styles.checkbox}
                />
                Show Layer Labels
              </label>
              <label style={styles.checkboxLabel}>
                <input
                  type="checkbox"
                  checked={showMarkers}
                  onChange={(e) => setShowMarkers(e.target.checked)}
                  style={styles.checkbox}
                />
                Show Layer Markers
              </label>
              <label style={styles.checkboxLabel}>
                <input
                  type="checkbox"
                  checked={showDepthMarkers}
                  onChange={(e) => setShowDepthMarkers(e.target.checked)}
                  style={styles.checkbox}
                />
                Show Depth Scale
              </label>
            </div>
            
            {/* Add/Remove Layer Buttons */}
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
              <button 
                onClick={handleAddLayer}
                style={{
                  backgroundColor: '#10b981',
                  color: 'white',
                  padding: '10px 20px',
                  borderRadius: '6px',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '16px',
                  fontWeight: '600'
                }}
              >
                Add Layer
              </button>
              <button 
                onClick={handleRemoveLayer}
                style={{
                  backgroundColor: numLayers <= 1 ? '#9ca3af' : '#ef4444',
                  color: 'white',
                  padding: '10px 20px',
                  borderRadius: '6px',
                  border: 'none',
                  cursor: numLayers <= 1 ? 'not-allowed' : 'pointer',
                  fontSize: '16px',
                  fontWeight: '600'
                }}
                disabled={numLayers <= 1}
              >
                Remove Layer
              </button>
            </div>
            
            {/* Layer Selector */}
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', marginBottom: '10px', fontWeight: '600', fontSize: '16px' }}>
                Select Layer:
              </label>
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(4, 1fr)', 
                gap: '8px', 
                marginBottom: '12px' 
              }}>
                {layerInfo.map((layer, index) => (
                  <div 
                    key={index}
                    onClick={() => handleLayerSelect(index)}
                    style={{
                      height: '40px',
                      cursor: 'pointer',
                      backgroundColor: layer.color,
                      outline: index === activeLayerIndex ? '3px solid #3b82f6' : 'none',
                      outlineOffset: '2px'
                    }}
                    title={`Layer ${index + 1}: ${layer.name}`}
                  />
                ))}
              </div>
              <div style={{ fontSize: '16px', color: '#6b7280', marginBottom: '20px' }}>
                Layer {activeLayerIndex + 1} selected
              </div>
            </div>
            
            {/* Layer Properties Editor */}
            {layerInfo[activeLayerIndex] && (
              <div>
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ 
                    display: 'block', 
                    marginBottom: '8px', 
                    fontWeight: '600', 
                    fontSize: '16px' 
                  }}>
                    Layer Name:
                  </label>
                  <input 
                    type="text"
                    value={layerInfo[activeLayerIndex].name || ''}
                    onChange={(e) => handleLayerPropertyChange('name', e.target.value)}
                    style={{
                      width: '100%',
                      border: '1px solid #d1d5db',
                      borderRadius: '4px',
                      padding: '8px 12px',
                      fontSize: '16px'
                    }}
                  />
                </div>
                
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ 
                    display: 'block', 
                    marginBottom: '8px', 
                    fontWeight: '600', 
                    fontSize: '16px' 
                  }}>
                    Layer Color:
                  </label>
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <input 
                      type="color"
                      value={layerInfo[activeLayerIndex].color || '#000000'}
                      onChange={(e) => handleLayerPropertyChange('color', e.target.value)}
                      style={{
                        width: '50px',
                        height: '50px',
                        marginRight: '12px',
                        border: '1px solid #d1d5db'
                      }}
                    />
                    <input 
                      type="text"
                      value={layerInfo[activeLayerIndex].color || ''}
                      onChange={(e) => handleLayerPropertyChange('color', e.target.value)}
                      style={{
                        flexGrow: 1,
                        border: '1px solid #d1d5db',
                        borderRadius: '4px',
                        padding: '8px 12px',
                        fontSize: '16px'
                      }}
                    />
                  </div>
                </div>
                
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ 
                    display: 'block', 
                    marginBottom: '8px', 
                    fontWeight: '600', 
                    fontSize: '16px' 
                  }}>
                    Description:
                  </label>
                  <textarea
                    value={layerInfo[activeLayerIndex].description || ''}
                    onChange={(e) => handleLayerPropertyChange('description', e.target.value)}
                    style={{
                      width: '100%',
                      border: '1px solid #d1d5db',
                      borderRadius: '4px',
                      padding: '8px 12px',
                      height: '100px',
                      resize: 'vertical',
                      fontSize: '16px'
                    }}
                  />
                </div>
                
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ 
                    display: 'block', 
                    marginBottom: '8px', 
                    fontWeight: '600', 
                    fontSize: '16px' 
                  }}>
                    Depth (feet):
                  </label>
                  <input 
                    type="number"
                    min="0.1"
                    step="0.1"
                    value={layerInfo[activeLayerIndex].depth || 1}
                    onChange={(e) => handleLayerPropertyChange('depth', Math.max(0.1, parseFloat(e.target.value) || 0.1))}
                    style={{
                      width: '100%',
                      border: '1px solid #d1d5db',
                      borderRadius: '4px',
                      padding: '8px 12px',
                      fontSize: '16px'
                    }}
                  />
                </div>
              </div>
            )}
            
            {/* Legend */}
            <div style={{ marginTop: '30px' }}>
              <h4 style={{ fontWeight: 'bold', marginBottom: '12px', fontSize: '18px' }}>
                Soil Layers Legend
              </h4>
              <div>
                {layerInfo.map((layer, index) => (
                  <div key={index} style={{ 
                    display: 'flex', 
                    alignItems: 'flex-start', 
                    marginBottom: '10px' 
                  }}>
                    <div style={{ 
                      width: '24px', 
                      height: '24px', 
                      marginRight: '12px', 
                      marginTop: '2px', 
                      backgroundColor: layer.color,
                      flexShrink: 0
                    }} />
                    <div style={{ flexGrow: 1 }}>
                      <div style={{ fontWeight: '600', fontSize: '16px' }}>
                        {layer.name || `Layer ${index + 1}`}
                      </div>
                      <div style={{ fontSize: '14px', color: '#6b7280' }}>
                        {layer.description || 'No description'}
                      </div>
                      <div style={{ fontSize: '14px', color: '#374151', fontWeight: '500' }}>
                        Depth: {layer.depth || 1} ft
                      </div>
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