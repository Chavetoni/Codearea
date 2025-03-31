import React, { useRef, useState, useEffect } from 'react';
import * as THREE from 'three';

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
  const [viewMode, setViewMode] = useState('normal');
  const [verticalSpacing, setVerticalSpacing] = useState(0.5);
  const [showConnectors, setShowConnectors] = useState(true);
  
  const defaultSoilTypes = [
    { name: "Topsoil", color: "#3b2e1e", description: "Dark, fertile surface layer with organic matter" },
    { name: "Clay Layer", color: "#5e4b37", description: "Dense, water-retaining layer with fine particles" },
    { name: "Sandy Layer", color: "#9b8569", description: "Loose, granular texture with good drainage" },
    { name: "Rocky Layer", color: "#8f857a", description: "Contains stones and weathered parent material" },
    { name: "Bedrock", color: "#c4c4c4", description: "Solid rock layer beneath soil horizons" }
  ];

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

  useEffect(() => {
    const newLayerInfo = Array.from({ length: numLayers }, (_, i) => {
      const defaultLayer = defaultSoilTypes[i % defaultSoilTypes.length];
      return {
        name: defaultLayer.name,
        color: defaultLayer.color,
        description: defaultLayer.description,
        depth: i === 0 ? 1.0 : 2.0
      };
    });
    setLayerInfo(newLayerInfo);
    setActiveLayerIndex(Math.min(activeLayerIndex, numLayers - 1));
  }, [numLayers]);

  useEffect(() => {
    if (!mountRef.current) return;

    const newScene = new THREE.Scene();
    newScene.background = new THREE.Color(0x00000);
    setScene(newScene);

    const newCamera = new THREE.PerspectiveCamera(
      60,
      mountRef.current.clientWidth / mountRef.current.clientHeight,
      0.1,
      1000
    );
    setCamera(newCamera);

    controlsRef.current.cameraRadius = 10;
    controlsRef.current.cameraTheta = Math.PI / 4;
    controlsRef.current.cameraPhi = Math.PI / 3;
    const x = controlsRef.current.cameraRadius * Math.sin(controlsRef.current.cameraPhi) * Math.cos(controlsRef.current.cameraTheta);
    const y = controlsRef.current.cameraRadius * Math.cos(controlsRef.current.cameraPhi);
    const z = controlsRef.current.cameraRadius * Math.sin(controlsRef.current.cameraPhi) * Math.sin(controlsRef.current.cameraTheta);
    newCamera.position.set(x, y, z);
    newCamera.lookAt(0, 0, 0);

    const newRenderer = new THREE.WebGLRenderer({ antialias: true });
    newRenderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    while (mountRef.current.firstChild) {
      mountRef.current.removeChild(mountRef.current.firstChild);
    }
    mountRef.current.appendChild(newRenderer.domElement);
    setRenderer(newRenderer);

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
    newScene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1.0);
    directionalLight.position.set(2, 2, 4);
    newScene.add(directionalLight);

    const backLight = new THREE.DirectionalLight(0xffffff, 0.5);
    backLight.position.set(-2, 1, -2);
    newScene.add(backLight);

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
      const radius = controlsRef.current.cameraRadius;
      const theta = controlsRef.current.cameraTheta;
      const phi = controlsRef.current.cameraPhi;
      const x = radius * Math.sin(phi) * Math.cos(theta);
      const y = radius * Math.cos(phi);
      const z = radius * Math.sin(phi) * Math.sin(theta);
      newCamera.position.set(x, y, z);
      newCamera.lookAt(0, 0, 0);
    };

    const canvasElement = newRenderer.domElement;
    canvasElement.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    canvasElement.addEventListener('wheel', handleWheel, { passive: false });

    const animate = () => {
      requestAnimationFrame(animate);
      newRenderer.render(newScene, newCamera);
    };
    animate();

    const handleResize = () => {
      if (!mountRef.current) return;
      newCamera.aspect = mountRef.current.clientWidth / mountRef.current.clientHeight;
      newCamera.updateProjectionMatrix();
      newRenderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    };
    window.addEventListener('resize', handleResize);
    handleResize();

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

  const createSoilCube = (scene, layers, layerData = []) => {
    if (soilCube) scene.remove(soilCube);
    const newSoilCube = new THREE.Group();
    setSoilCube(newSoilCube);

    const cubeWidth = 5;
    const cubeDepth = 5;
    const totalDepth = layerData.reduce((sum, layer) => sum + (parseFloat(layer.depth) || 1), 0);
    const modelHeight = Math.max(5, totalDepth);
    const totalExplodedSpacing = viewMode === 'exploded' ? (layers - 1) * verticalSpacing : 0;
    const adjustedModelHeight = modelHeight + totalExplodedSpacing;

    if (showDepthMarkers) {
      createDepthMarkers(newSoilCube, adjustedModelHeight, totalDepth);
    }
    
    const layerPositions = [];
    let currentPosition = adjustedModelHeight / 2;
    
    for (let i = 0; i < layers; i++) {
      const layerColor = layerData[i]?.color || defaultSoilTypes[i % defaultSoilTypes.length].color;
      const colorHex = layerColor.startsWith('#') ? layerColor : `#${layerColor}`;
      const color = new THREE.Color(colorHex);
      const layerDepth = parseFloat(layerData[i]?.depth) || 1;
      const layerHeight = (layerDepth / totalDepth) * modelHeight;
      const layerGroup = new THREE.Group();
      const layerPosition = currentPosition - layerHeight / 2;
      const geometry = new THREE.BoxGeometry(cubeWidth, layerHeight, cubeDepth);
      const material = new THREE.MeshStandardMaterial({
        color,
        roughness: 0.7,
        metalness: 0.1
      });
      const layer = new THREE.Mesh(geometry, material);
      layer.position.y = layerPosition;
      layerGroup.add(layer);
      
      if (viewMode === 'exploded') {
        layerPositions.push({
          top: layerPosition + layerHeight / 2,
          bottom: layerPosition - layerHeight / 2,
          offset: { x: 0, z: 0 }
        });
      }
      
      newSoilCube.add(layerGroup);
      const bottomPosition = layerPosition - layerHeight / 2;
      
      if (showMarkers) {
        const marker = createMarker(i + 1);
        marker.position.set(cubeWidth / 2 + 0.4, layerPosition, 0);
        newSoilCube.add(marker);
      }
      
      if (showLabels) {
        const label = createTextLabel(
          `${layerData[i]?.name || 'Layer ' + (i + 1)}: ${layerData[i]?.description || 'No description'}`,
          colorHex
        );
        label.position.set(cubeWidth / 2 + 3.5, layerPosition, 0);
        newSoilCube.add(label);
        
        const lineMaterial = new THREE.LineBasicMaterial({ color: 0xffffff });
        const lineGeometry = new THREE.BufferGeometry().setFromPoints([
          new THREE.Vector3(cubeWidth / 2, layerPosition, 0),
          new THREE.Vector3(cubeWidth / 2 + 2.0, layerPosition, 0)
        ]);
        const line = new THREE.Line(lineGeometry, lineMaterial);
        newSoilCube.add(line);
      }
      currentPosition = bottomPosition - (viewMode === 'exploded' ? verticalSpacing : 0);
    }
    
    if (viewMode === 'exploded' && showConnectors && layerPositions.length > 1) {
      for (let i = 0; i < layerPositions.length - 1; i++) {
        const upper = layerPositions[i];
        const lower = layerPositions[i + 1];
        const lineMaterial = new THREE.LineBasicMaterial({ color: 0xaaaaaa, opacity: 0.7, transparent: true });
        const rightLineGeometry = new THREE.BufferGeometry().setFromPoints([
          new THREE.Vector3(cubeWidth / 2, upper.bottom, 0),
          new THREE.Vector3(cubeWidth / 2, lower.top, 0)
        ]);
        const rightLine = new THREE.Line(rightLineGeometry, lineMaterial);
        newSoilCube.add(rightLine);
        
        const leftLineGeometry = new THREE.BufferGeometry().setFromPoints([
          new THREE.Vector3(-cubeWidth / 2, upper.bottom, 0),
          new THREE.Vector3(-cubeWidth / 2, lower.top, 0)
        ]);
        const leftLine = new THREE.Line(leftLineGeometry, lineMaterial);
        newSoilCube.add(leftLine);
      }
    }
    
    if (showGrass && layers > 0) {
      const grassPatch = createGrass(cubeWidth);
      const grassY = viewMode === 'exploded'
        ? (adjustedModelHeight / 2 + 0.1)
        : (modelHeight / 2 + 0.1);
      grassPatch.position.y = grassY;
      newSoilCube.add(grassPatch);
    }
    
    scene.add(newSoilCube);
  };

  const cubeWidth = 5;
  const cubeDepth = 5;
  
  const createDepthMarkers = (group, modelHeight, totalDepth) => {
    const markerMaterial = new THREE.LineBasicMaterial({ color: 0xffffff });
    const lineGeometry = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(-cubeWidth / 2 - 0.5, -modelHeight / 2, 0),
      new THREE.Vector3(-cubeWidth / 2 - 0.5, modelHeight / 2, 0)
    ]);
    const line = new THREE.Line(lineGeometry, markerMaterial);
    group.add(line);
    
    const depthPositions = [];
    if (viewMode === 'exploded') {
      let runningDepth = 0;
      let position = modelHeight / 2;
      depthPositions.push({ depth: 0, position });
      for (let i = 0; i < layerInfo.length; i++) {
        const layerDepth = parseFloat(layerInfo[i].depth) || 1;
        const layerHeight = (layerDepth / totalDepth) * modelHeight;
        position -= layerHeight;
        runningDepth += layerDepth;
        depthPositions.push({ depth: runningDepth, position });
        if (i < layerInfo.length - 1) position -= verticalSpacing;
      }
    } else {
      for (let depth = 0; depth <= Math.ceil(totalDepth); depth++) {
        const position = modelHeight / 2 - (depth / totalDepth) * modelHeight;
        depthPositions.push({ depth, position });
      }
    }
    
    depthPositions.forEach(item => {
      const tickGeometry = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(-cubeWidth / 2 - 0.5, item.position, 0),
        new THREE.Vector3(-cubeWidth / 2 - 0.8, item.position, 0)
      ]);
      const tick = new THREE.Line(tickGeometry, markerMaterial);
      group.add(tick);
      
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
      label.position.set(-cubeWidth / 2 - 1.2, item.position, 0);
      group.add(label);
    });
  };

  const createGrass = (size) => {
    const group = new THREE.Group();
    const bladesCount = 150;
    const grassArea = size * 0.8;
    for (let i = 0; i < bladesCount; i++) {
      const height = Math.random() * 0.5 + 0.2;
      const width = Math.random() * 0.1 + 0.02;
      const bladeGeometry = new THREE.PlaneGeometry(width, height);
      const greenShade = Math.random() * 0.5 + 0.3;
      const bladeMaterial = new THREE.MeshBasicMaterial({
        color: new THREE.Color(0.1, greenShade, 0.1),
        side: THREE.DoubleSide,
        transparent: true
      });
      const blade = new THREE.Mesh(bladeGeometry, bladeMaterial);
      const posX = (Math.random() - 0.5) * grassArea;
      const posZ = (Math.random() - 0.5) * grassArea;
      blade.position.set(posX, height / 2, posZ);
      blade.rotation.y = Math.random() * Math.PI;
      blade.rotation.x = (Math.random() * 0.2) - 0.1;
      group.add(blade);
    }
    return group;
  };

  const createMarker = (number) => {
    const group = new THREE.Group();
    const circleGeometry = new THREE.CircleGeometry(0.3, 32);
    const circleMaterial = new THREE.MeshBasicMaterial({ color: 0x333333, side: THREE.DoubleSide });
    const circle = new THREE.Mesh(circleGeometry, circleMaterial);
    group.add(circle);
    
    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 64;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#333333';
    ctx.beginPath();
    ctx.arc(32, 32, 30, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(32, 32, 28, 0, Math.PI * 2);
    ctx.stroke();
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 40px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(number.toString(), 32, 32);
    
    const texture = new THREE.CanvasTexture(canvas);
    const labelMaterial = new THREE.MeshBasicMaterial({ map: texture, side: THREE.DoubleSide, transparent: true });
    const labelGeometry = new THREE.CircleGeometry(0.3, 32);
    const label = new THREE.Mesh(labelGeometry, labelMaterial);
    label.position.z = 0.01;
    group.add(label);
    return group;
  };

  const createTextLabel = (text, color) => {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 128;
    const ctx = canvas.getContext('2d');
    const rgbColor = new THREE.Color(color);
    const backgroundColor = `rgba(${Math.floor(rgbColor.r * 255)}, ${Math.floor(rgbColor.g * 255)}, ${Math.floor(rgbColor.b * 255)}, 0.8)`;
    ctx.fillStyle = backgroundColor;
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
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 24px Arial';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    
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
    
    const texture = new THREE.CanvasTexture(canvas);
    const material = new THREE.MeshBasicMaterial({ map: texture, side: THREE.DoubleSide, transparent: true });
    const geometry = new THREE.PlaneGeometry(5, 1.2);
    return new THREE.Mesh(geometry, material);
  };

  const handleViewModeChange = (mode) => setViewMode(mode);
  const handleLayerSelect = (index) => setActiveLayerIndex(index);
  const handleLayerPropertyChange = (property, value) => {
    const updatedLayerInfo = [...layerInfo];
    updatedLayerInfo[activeLayerIndex] = { ...updatedLayerInfo[activeLayerIndex], [property]: value };
    setLayerInfo(updatedLayerInfo);
  };

  const handleAddLayer = () => {
    const newLayerInfo = [...layerInfo];
    const defaultLayer = defaultSoilTypes[newLayerInfo.length % defaultSoilTypes.length];
    newLayerInfo.push({
      name: defaultLayer.name,
      color: defaultLayer.color,
      description: defaultLayer.description,
      depth: 2.0
    });
    setLayerInfo(newLayerInfo);
    setNumLayers(newLayerInfo.length);
    setActiveLayerIndex(newLayerInfo.length - 1);
  };

  const handleRemoveLayer = () => {
    if (numLayers <= 1) return;
    const newLayerInfo = [...layerInfo];
    newLayerInfo.splice(activeLayerIndex, 1);
    setLayerInfo(newLayerInfo);
    setNumLayers(newLayerInfo.length);
    setActiveLayerIndex(Math.min(activeLayerIndex, newLayerInfo.length - 1));
  };

  const handleLayerChange = (e) => {
    const value = parseInt(e.target.value);
    if (value > 0 && value <= 20) {
      setNumLayers(value);
    }
  };

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
        <div ref={mountRef} style={styles.canvas} />
        {showLayerPanel && (
          <div style={styles.editorPanel}>
            <h3 style={{ fontSize: '22px', fontWeight: 'bold', marginBottom: '20px' }}>Layer Properties</h3>
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
            <div style={{ marginTop: '30px' }}>
              <h4 style={{ fontWeight: 'bold', marginBottom: '12px', fontSize: '18px' }}>
                Soil Layers Legend
              </h4>
              <div>
                {layerInfo.map((layer, index) => (
                  <div key={index} style={{ display: 'flex', alignItems: 'flex-start', marginBottom: '10px' }}>
                    <div style={{ width: '24px', height: '24px', marginRight: '12px', marginTop: '2px', backgroundColor: layer.color, flexShrink: 0 }} />
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
