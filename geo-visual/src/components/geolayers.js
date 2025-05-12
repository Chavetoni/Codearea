import React, { useRef, useState, useEffect, useCallback, useMemo } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

// --- Styles ---
// Assuming the existing 'styles' object is here.
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
    bottom: 0,
    fontFamily: 'Arial, sans-serif',
    overflow: 'hidden',  
  },
  header: {
    padding: '16px',
    backgroundColor: '#f3f4f6',
    borderBottom: '1px solid #e5e7eb',
    flexShrink: 0,
  },
  headerContent: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  controls: {
    display: 'flex',
    alignItems: 'center',
    marginBottom: '8px',
  },
  label: {
    marginRight: '12px',
    fontWeight: '600',
    fontSize: '16px'
  },
  input: {
    border: '1px solid #d1d5db',
    borderRadius: '4px',
    padding: '8px 12px',
    width: '80px',
    textAlign: 'center',
    fontSize: '16px',
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
    fontWeight: '600',
    transition: 'background-color 0.2s'
  },
  buttonHover: {
      backgroundColor: '#2563eb'
  },
  instructions: {
    fontSize: '14px',
    color: '#6b7280',
    textAlign: 'right',  
    marginBottom: '8px',
  },
  depthInfo: {
    marginTop: '12px',
    fontSize: '14px',
    color: '#4b5563',
    fontWeight: '500'
  },
  content: {
    display: 'flex',
    flex: 1,
    position: 'relative',
    overflow: 'hidden'
  },
  canvas: {
    flexGrow: 1,
    width: '100%',
    height: '100%',
    cursor: 'default', // Default cursor
  },
   canvasPlacingBorehole: { // Style for when placing boreholes
    flexGrow: 1,
    width: '100%',
    height: '100%',
    cursor: 'crosshair', 
  },
  editorPanel: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    width: '350px',
    maxWidth: '100%',
    backgroundColor: 'white',
    boxShadow: '-2px 0 10px rgba(0, 0, 0, 0.1)',
    padding: '20px',
    overflowY: 'auto',
    zIndex: 10,
    borderLeft: '1px solid #e5e7eb',
    boxSizing: 'border-box',
  },
  checkboxContainer: {
    marginBottom: '20px'
  },
  checkboxLabel: {
    display: 'flex',
    alignItems: 'center',
    marginBottom: '10px',
    cursor: 'pointer',
    fontSize: '16px'
  },
  checkbox: {
    marginRight: '10px',
    width: '16px',
    height: '16px',
    cursor: 'pointer',
  },
  editorSectionTitle: { 
    fontSize: '18px',
    fontWeight: 'bold',
    marginBottom: '15px',
    paddingBottom: '8px',
    borderBottom: '1px solid #e5e7eb'
  },
  editorSubSectionTitle: {
      fontSize: '16px',
      fontWeight: '600',
      marginBottom: '10px',
      marginTop: '15px'
  },
  editorButton: {
      padding: '8px 12px',
      backgroundColor: '#e5e7eb',
      color: 'black',
      border: 'none',
      borderRadius: '4px',
      cursor: 'pointer',
      marginRight: '8px',
      transition: 'background-color 0.2s'
  },
  editorButtonActive: {
      backgroundColor: '#3b82f6',
      color: 'white',
  },
  editorInput: {
      width: '100%',
      border: '1px solid #d1d5db',
      borderRadius: '4px',
      padding: '8px 12px',
      fontSize: '16px',
      marginBottom: '10px',
      boxSizing: 'border-box',
  },
  editorTextarea: {
      width: '100%',
      border: '1px solid #d1d5db',
      borderRadius: '4px',
      padding: '8px 12px',
      fontSize: '16px',
      height: '100px',
      resize: 'vertical',
      marginBottom: '10px',
      boxSizing: 'border-box',
  },
  layerSelectorGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(50px, 1fr))',
      gap: '8px',
      marginBottom: '12px'
  },
  layerSelectorItem: {
      height: '40px',
      cursor: 'pointer',
      border: '1px solid #d1d5db',
      borderRadius: '4px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
  },
  layerSelectorItemActive: {
      outline: '3px solid #3b82f6',
      outlineOffset: '2px'
  },
  legendItem: {
    display: 'flex',
    alignItems: 'center', 
    marginBottom: '10px',
    padding: '8px',
    backgroundColor: '#f9f9f9',
    borderRadius: '4px',
    border: '1px solid #eee',
  },
  legendColorBox: {
      width: '24px',
      height: '24px',
      marginRight: '12px',
      marginTop: '0px', 
      flexShrink: 0,
      border: '1px solid #ccc'
  },
  legendTextContainer: {
      flexGrow: 1,
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
  },
  legendLayerName: {
      fontWeight: '600',
      fontSize: '16px'
  },
  legendLayerDescription: {
      fontSize: '14px',
      color: '#6b7280',
      wordBreak: 'break-word',
  },
  legendLayerDepth: {
      fontSize: '14px',
      color: '#374151',
      fontWeight: '500'
  },
  actionButtonContainer: {
      display: 'flex',
      justifyContent: 'space-between',
      marginBottom: '20px'
  },
  actionButton: {  
      padding: '10px 20px',
      borderRadius: '6px',
      border: 'none',
      cursor: 'pointer',
      fontSize: '16px',
      fontWeight: '600',
      transition: 'background-color 0.2s'
  },
  addButton: {  
      backgroundColor: '#10b981',  
      color: 'white',
  },
  addButtonHover: {
      backgroundColor: '#059669',
  },
  removeButton: {  
      backgroundColor: '#ef4444',  
      color: 'white',
  },
  removeButtonHover: {
      backgroundColor: '#dc2626',
  },
  removeButtonDisabled: {
      backgroundColor: '#9ca3af',
      cursor: 'not-allowed',
  },
  fileInputLabel: {
    display: 'inline-block',
    padding: '10px 15px',
    backgroundColor: '#60a5fa',
    color: 'white',
    borderRadius: '6px',
    cursor: 'pointer',
    textAlign: 'center',
    fontWeight: '600',
    transition: 'background-color 0.2s',
    width: '100%',
    marginBottom: '10px',
    boxSizing: 'border-box',
  },
  fileInputLabelHover: {
    backgroundColor: '#3b82f6',
  },
  mapControlInput: {
    width: 'calc(33.333% - 8px)',  
    marginRight: '8px',
    marginBottom: '8px',
    padding: '6px 10px',
    fontSize: '14px',
    border: '1px solid #d1d5db',
    borderRadius: '4px',
    boxSizing: 'border-box',
  },
  mapControlContainer: {
    display: 'flex',
    flexWrap: 'wrap',
    alignItems: 'center',
    marginBottom: '10px'
  },
  mapControlLabel: {
    fontSize: '14px',
    fontWeight: '500',
    marginBottom: '4px',
    display: 'block',
    width: '100%'
  },
  collapsibleSectionHeader: {
    fontSize: '18px',
    fontWeight: 'bold',
    padding: '10px 0',
    borderBottom: '1px solid #e5e7eb',
    cursor: 'pointer',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '10px'
  },
  collapsibleSectionContent: {
    paddingLeft: '10px',  
    borderLeft: '2px solid #e0e0e0',  
    marginBottom: '15px',
    maxHeight: '0', 
    overflow: 'hidden',
    transition: 'max-height 0.3s ease-out, padding-top 0.3s ease-out, padding-bottom 0.3s ease-out'
  },
  collapsibleSectionContentOpen: {
    maxHeight: '2000px', 
    paddingTop: '10px',
    paddingBottom: '10px',
    transition: 'max-height 0.5s ease-in, padding-top 0.3s ease-in, padding-bottom 0.3s ease-in'
  },
  arrowIcon: {
    transition: 'transform 0.3s ease-out',
    fontSize: '16px',  
    userSelect: 'none' 
  },
  arrowIconOpen: {
    transform: 'rotate(90deg)' 
  },
  inlineInputContainer: { 
    display: 'flex',
    alignItems: 'center',
    marginBottom: '8px',
  },
  inlineInputLabel: { 
    marginRight: '8px',
    fontSize: '14px',
    fontWeight: '500',
    width: '80px', 
    flexShrink: 0,
  },
  inlineInputField: { 
    flexGrow: 1,
    border: '1px solid #d1d5db',
    borderRadius: '4px',
    padding: '6px 10px',
    fontSize: '14px',
  },
  toggleButton: { 
    backgroundColor: '#f0ad4e', 
    color: 'white',
    padding: '8px 15px',
    borderRadius: '6px',
    border: 'none',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '600',
    transition: 'background-color 0.2s',
    width: '100%',
    marginBottom: '10px',
  },
  toggleButtonActive: {
    backgroundColor: '#ec971f', 
  },
  toggleButtonHover: {
    backgroundColor: '#eea236',
  },
};

// --- Reusable Collapsible Section Component ---
const CollapsibleSection = ({ title, sectionKey, children, isOpen, onToggle }) => (
  <div style={{marginBottom: '1px'}}> 
      <div 
          style={styles.collapsibleSectionHeader} 
          onClick={() => onToggle(sectionKey)}
          role="button" 
          tabIndex={0} 
          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onToggle(sectionKey);}} 
          aria-expanded={isOpen} 
          aria-controls={`section-content-${sectionKey}`} 
      >
        {title}
        <span style={{...styles.arrowIcon, ...(isOpen ? styles.arrowIconOpen : {})}}>&#9654;</span> 
      </div>
      <div 
          id={`section-content-${sectionKey}`}
          style={{...styles.collapsibleSectionContent, ...(isOpen ? styles.collapsibleSectionContentOpen : {})}}
          role="region" 
      >
        {children}
      </div>
  </div>
);

// --- Main React Component ---
const SoilLayersModel = () => {
  // --- Refs ---
  const mountRef = useRef(null);
  const sceneRef = useRef(null);
  const cameraRef = useRef(null);
  const rendererRef = useRef(null);
  const soilCubeRef = useRef(null);
  const controlsRef = useRef(null);
  const animationFrameId = useRef(null);
  const siteMapRef = useRef(null);
  const fileInputRef = useRef(null);
  const groundGridRef = useRef(null);
  const boreholeMarkersGroupRef = useRef(null); 
  const raycasterRef = useRef(new THREE.Raycaster()); 

  // --- State ---
  const [numLayers, setNumLayers] = useState(0); 
  const [layerInfo, setLayerInfo] = useState([]);
  const [activeLayerIndex, setActiveLayerIndex] = useState(0);
  const [showLayerPanel, setShowLayerPanel] = useState(true);
  const [showLabels, setShowLabels] = useState(true);
  const [showMarkers, setShowMarkers] = useState(true);
  const [showDepthMarkers, setShowDepthMarkers] = useState(true);
  const [viewMode, setViewMode] = useState('normal');
  const [verticalSpacing, setVerticalSpacing] = useState(0.5);
  const [showConnectors, setShowConnectors] = useState(true);
  const [showStrata, setShowStrata] = useState(true); 
  const [showGroundGrid, setShowGroundGrid] = useState(true);
  const [isPlacingBorehole, setIsPlacingBorehole] = useState(false); 
  const [isHoveringButton, setIsHoveringButton] = useState({
      edit: false, add: false, remove: false, loadMap: false, removeMap: false, placeBorehole: false,
  });
  const [siteMapProps, setSiteMapProps] = useState({
      position: { x: 0, y: 0, z: 0 }, scale: { x: 1, y: 1, z: 1 },
      visible: true, opacity: 1.0
  });
  const [mapFileName, setMapFileName] = useState('');
  const [strataDimensions, setStrataDimensions] = useState({ width: 5, depth: 5 });
  const [boreholes, setBoreholes] = useState([]);
  const [openSections, setOpenSections] = useState({
    siteMap: true, strataModel: true, layerEditor: true, 
    boreholes: false, displayOptions: false, legend: false 
  });

  // --- Constants ---
  const BASE_DIMENSION_FOR_SCALING = 5; 
  const GROUND_GRID_SIZE = 100;
  const GROUND_GRID_DIVISIONS = 50;
  const BASE_LABEL_FONT_SIZE = 18; 
  const BASE_LABEL_PADDING = 8;    
  const BASE_LABEL_MAX_WIDTH = 220; 
  const BASE_LABEL_BORDER_RADIUS = 4; 
  const BASE_SPRITE_SCALE_FACTOR = 0.012; 
  const BASE_MARKER_RADIUS = 0.20; 
  const BASE_MARKER_TEXT_CANVAS_SIZE = 64; 
  const BASE_MARKER_FONT_SIZE = 30; 
  const BASE_DEPTH_LABEL_FONT_SIZE = 18; 
  const BASE_DEPTH_LABEL_PADDING = 4;    
  const BASE_DEPTH_LABEL_PLANE_SCALE = 0.012; 
  const BASE_DEPTH_MARKER_MAIN_LINE_OFFSET = 0.5; 
  const BASE_DEPTH_MARKER_TICK_LENGTH = 0.25;    
  const BASE_DEPTH_MARKER_TEXT_GAP = 0.08;      

  const defaultSoilTypes = useMemo(() => [
    { name: "Topsoil", color: "#3b2e1e", description: "Dark, fertile surface layer with organic matter" },
    { name: "Clay Layer", color: "#5e4b37", description: "Dense, water-retaining layer with fine particles" },
    { name: "Sandy Layer", color: "#9b8569", description: "Loose, granular texture with good drainage" },
    { name: "Bedrock", color: "#c4c4c4", description: "Solid rock layer beneath soil horizons" },
    { name: "Gravelly Soil", color: "#a1917e", description: "Contains many small stones and pebbles" },
  ], []);

  // --- Effects ---
  useEffect(() => { 
    setLayerInfo(prevLayerInfo => {
        const currentLength = prevLayerInfo.length;
        if (numLayers > currentLength) {
            const layersToAdd = numLayers - currentLength;
            const newLayers = Array.from({ length: layersToAdd }, (_, i) => {
                const layerIndex = currentLength + i;
                const defaultLayer = defaultSoilTypes[layerIndex % defaultSoilTypes.length];
                return { 
                    id: `layer-${Date.now()}-${layerIndex}-${Math.random().toString(36).substr(2, 9)}`, 
                    name: defaultLayer.name, color: defaultLayer.color, 
                    description: defaultLayer.description, depth: layerIndex === 0 ? 1.0 : 2.0 
                };
            });
            return [...prevLayerInfo, ...newLayers];
        } else if (numLayers < currentLength) {
            return prevLayerInfo.slice(0, numLayers);
        } else { return prevLayerInfo; }
    });
    setActiveLayerIndex(prevIndex => Math.min(prevIndex, numLayers - 1 < 0 ? 0 : numLayers - 1));
  }, [numLayers, defaultSoilTypes]);

  const handleResize = useCallback(() => { 
    if (!mountRef.current || !rendererRef.current || !cameraRef.current) return;
    const { clientWidth: width, clientHeight: height } = mountRef.current;
    if (width > 0 && height > 0) {
        cameraRef.current.aspect = width / height;
        cameraRef.current.updateProjectionMatrix();
        rendererRef.current.setSize(width, height);
    }
  }, []);

  useEffect(() => { // Initial Scene Setup
    if (!mountRef.current) return;
    const scene = new THREE.Scene();
    const backgroundColor = 0xd1d5db; 
    scene.background = new THREE.Color(backgroundColor);
    const fogNear = GROUND_GRID_SIZE * 0.75; 
    const fogFar = GROUND_GRID_SIZE * 2.5;  
    scene.fog = new THREE.Fog(backgroundColor, fogNear, fogFar); 
    sceneRef.current = scene;
    const camera = new THREE.PerspectiveCamera(60, mountRef.current.clientWidth / mountRef.current.clientHeight, 0.1, GROUND_GRID_SIZE * 5);
    camera.position.set(GROUND_GRID_SIZE / 3, GROUND_GRID_SIZE / 4, GROUND_GRID_SIZE / 3);
    cameraRef.current = camera;
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.autoClear = true; 
    while (mountRef.current.firstChild) mountRef.current.removeChild(mountRef.current.firstChild);
    mountRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8); 
    scene.add(ambientLight);
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1.2); 
    directionalLight.position.set(GROUND_GRID_SIZE / 2, GROUND_GRID_SIZE / 1.5, GROUND_GRID_SIZE / 2);
    scene.add(directionalLight);
    const backLight = new THREE.DirectionalLight(0xffffff, 0.6);
    backLight.position.set(-GROUND_GRID_SIZE / 2, GROUND_GRID_SIZE / 3, -GROUND_GRID_SIZE / 2);
    scene.add(backLight);
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true; controls.dampingFactor = 0.05;
    controls.minDistance = 1; controls.maxDistance = GROUND_GRID_SIZE * 2; 
    controls.target.set(0, 0, 0); controls.panSpeed = 1.5; 
    controls.update();
    controlsRef.current = controls;
    const animate = () => {
      animationFrameId.current = requestAnimationFrame(animate);
      if (controlsRef.current) controlsRef.current.update();
      if (rendererRef.current && sceneRef.current && cameraRef.current) {
        rendererRef.current.render(sceneRef.current, cameraRef.current); 
      }
    };
    animate();
    const currentMountRef = mountRef.current;
    window.addEventListener('resize', handleResize);
    handleResize(); 
    return () => { // Cleanup
      if (animationFrameId.current) cancelAnimationFrame(animationFrameId.current);
      window.removeEventListener('resize', handleResize);
      if (controlsRef.current) { controlsRef.current.dispose(); controlsRef.current = null; }
      const disposeObject = (object) => { 
        if (!object) return;
        if (object.geometry) object.geometry.dispose();
        if (object.material) {
            if (Array.isArray(object.material)) {
                object.material.forEach(material => { if (material.map) material.map.dispose(); if(material.dispose) material.dispose(); });
            } else { if (object.material.map) object.material.map.dispose(); if(object.material.dispose) object.material.dispose(); }
        }
        while(object.children.length > 0){ disposeObject(object.children[0]); object.remove(object.children[0]); }
      };
      if (groundGridRef.current) { if(sceneRef.current?.children.includes(groundGridRef.current)) sceneRef.current.remove(groundGridRef.current); disposeObject(groundGridRef.current); groundGridRef.current = null; }
      if (siteMapRef.current) { if(sceneRef.current?.children.includes(siteMapRef.current)) sceneRef.current.remove(siteMapRef.current); disposeObject(siteMapRef.current); siteMapRef.current = null; }
      if (soilCubeRef.current) { if(sceneRef.current?.children.includes(soilCubeRef.current)) sceneRef.current.remove(soilCubeRef.current); disposeObject(soilCubeRef.current); soilCubeRef.current = null; }
      if (boreholeMarkersGroupRef.current) { if(sceneRef.current?.children.includes(boreholeMarkersGroupRef.current)) sceneRef.current.remove(boreholeMarkersGroupRef.current); disposeObject(boreholeMarkersGroupRef.current); boreholeMarkersGroupRef.current = null; }
      if (sceneRef.current) { sceneRef.current.remove(ambientLight, directionalLight, backLight); sceneRef.current.fog = null; sceneRef.current.clear(); sceneRef.current = null; }
      if (rendererRef.current) { if (currentMountRef?.contains(rendererRef.current.domElement)) currentMountRef.removeChild(rendererRef.current.domElement); rendererRef.current.dispose(); rendererRef.current = null; }
      cameraRef.current = null;
    };
  }, [handleResize, GROUND_GRID_SIZE]);

  useEffect(() => { // Site Map Props Update
    if (siteMapRef.current) {
        siteMapRef.current.position.set(siteMapProps.position.x, siteMapProps.position.y, siteMapProps.position.z);
        siteMapRef.current.scale.set(siteMapProps.scale.x, siteMapProps.scale.y, siteMapProps.scale.z);
        siteMapRef.current.visible = siteMapProps.visible;
        siteMapRef.current.traverse((object) => {
            if (object.isMesh) {
                const materials = Array.isArray(object.material) ? object.material : [object.material];
                materials.forEach(material => {
                    if (material) { material.transparent = siteMapProps.opacity < 1.0; material.opacity = siteMapProps.opacity; material.needsUpdate = true; }
                });
            }
        });
        siteMapRef.current.updateMatrixWorld(true);
    }
  }, [siteMapProps]); 

  const handleFileChange = (event) => { // GLTF Loading
    const file = event.target.files[0];
    if (!file || !sceneRef.current) return; 
    setMapFileName(file.name);
    const reader = new FileReader();
    reader.onload = (e) => {
        if (!e.target || !e.target.result) { alert("Failed to read file."); setMapFileName(''); if (fileInputRef.current) fileInputRef.current.value = null; return; }
        const loader = new GLTFLoader();
        try {
            loader.parse( e.target.result, '', (gltf) => { 
                    if (!gltf || !gltf.scene) { alert("Failed to load map: Invalid GLTF structure."); setMapFileName(''); if (fileInputRef.current) fileInputRef.current.value = null; return; }
                    if (siteMapRef.current && sceneRef.current?.children.includes(siteMapRef.current)) {
                        sceneRef.current.remove(siteMapRef.current);
                        siteMapRef.current.traverse(object => { if (object.geometry) object.geometry.dispose(); if (object.material) { if (Array.isArray(object.material)) object.material.forEach(m => { if(m.dispose) m.dispose();}); else if (object.material.dispose) object.material.dispose(); }});
                    }
                    siteMapRef.current = null; 
                    const modelScene = gltf.scene; let scaleFactor = 1.0; let initialMapPosition = { x: 0, y: 0, z: 0 }; 
                    try {
                        modelScene.updateMatrixWorld(true); const originalBox = new THREE.Box3().setFromObject(modelScene); 
                        const isValidBox = !originalBox.isEmpty() && originalBox.max instanceof THREE.Vector3 && originalBox.min instanceof THREE.Vector3 && Number.isFinite(originalBox.max.x) && Number.isFinite(originalBox.max.y) && Number.isFinite(originalBox.max.z) && Number.isFinite(originalBox.min.x) && Number.isFinite(originalBox.min.y) && Number.isFinite(originalBox.min.z);
                        if (!isValidBox) { console.warn("Loaded model has an invalid or empty bounding box."); } else {
                            const originalCenter = originalBox.getCenter(new THREE.Vector3()); modelScene.position.sub(originalCenter); modelScene.updateMatrixWorld(true); 
                            const centeredBox = new THREE.Box3().setFromObject(modelScene); const modelSize = centeredBox.getSize(new THREE.Vector3());
                            if (strataDimensions.width > 0 && (modelSize.x > 0.001 || modelSize.z > 0.001)) { const largerModelDim = Math.max(modelSize.x, modelSize.z); if (largerModelDim > 0) scaleFactor = strataDimensions.width / largerModelDim; }
                            modelScene.scale.set(scaleFactor, scaleFactor, scaleFactor); modelScene.updateMatrixWorld(true); 
                            const scaledMapBox = new THREE.Box3().setFromObject(modelScene); 
                            const isScaledBoxValid = !scaledMapBox.isEmpty() && scaledMapBox.max instanceof THREE.Vector3 && scaledMapBox.min instanceof THREE.Vector3 && Number.isFinite(scaledMapBox.max.y) && Number.isFinite(scaledMapBox.min.y);
                            initialMapPosition.y = isScaledBoxValid ? -scaledMapBox.min.y : 0;
                        }
                    } catch (calcError) { console.error("Error during map centering/scaling/positioning:", calcError); initialMapPosition.y = 0; }
                    modelScene.position.set(initialMapPosition.x, initialMapPosition.y, initialMapPosition.z); 
                    siteMapRef.current = modelScene; sceneRef.current.add(siteMapRef.current);
                    setSiteMapProps({ position: { ...initialMapPosition }, scale: { x: scaleFactor, y: scaleFactor, z: scaleFactor }, visible: true, opacity: 1.0, });
                    try { if (cameraRef.current && controlsRef.current) {
                            const combinedGroup = new THREE.Group(); if (soilCubeRef.current) combinedGroup.add(soilCubeRef.current.clone()); if (siteMapRef.current) combinedGroup.add(siteMapRef.current.clone());
                            if (combinedGroup.children.length > 0) {
                                const combinedBox = new THREE.Box3().setFromObject(combinedGroup);
                                if (!combinedBox.isEmpty() && Number.isFinite(combinedBox.max.x)) { 
                                    const combinedCenter = combinedBox.getCenter(new THREE.Vector3()); const combinedSize = combinedBox.getSize(new THREE.Vector3()); const maxDim = Math.max(combinedSize.x, combinedSize.y, combinedSize.z);
                                    if (maxDim > 0) { const fov = cameraRef.current.fov * (Math.PI / 180); let cameraDist = Math.abs(maxDim / 2 / Math.tan(fov / 2)); cameraDist = Math.max(cameraDist, 10) * 1.75; cameraRef.current.position.set( combinedCenter.x + cameraDist * 0.7, combinedCenter.y + cameraDist * 0.5, combinedCenter.z + cameraDist ); controlsRef.current.target.copy(combinedCenter); controlsRef.current.update(); }
                                } } }
                    } catch (cameraError) { console.error("Error adjusting camera view after map load:", cameraError); }
                }, 
                (error) => { alert(`Failed to parse the 3D map: ${error.message || 'Unknown error'}.`); setMapFileName(''); if (fileInputRef.current) fileInputRef.current.value = null; }
            );
        } catch (error) { alert(`Failed to load map: ${error.message || 'Unknown error'}.`); setMapFileName(''); if (fileInputRef.current) fileInputRef.current.value = null; 
        } finally { if (fileInputRef.current) fileInputRef.current.value = null; }
    }; 
    reader.onerror = (error) => { alert('Failed to read the file.'); setMapFileName(''); if (fileInputRef.current) fileInputRef.current.value = null; };
    reader.readAsArrayBuffer(file);
  }; 

  const handleMapPropChange = (prop, axis, value) => {
      const numValue = parseFloat(value);
      if (prop !== 'visible' && prop !== 'opacity' && isNaN(numValue)) return; 
      if (prop === 'opacity' && isNaN(numValue)) return;
      setSiteMapProps(prev => {
          const newProps = { ...prev };
          if (prop === 'position' || prop === 'scale') newProps[prop] = { ...prev[prop], [axis]: numValue };
          else if (prop === 'opacity') newProps[prop] = Math.max(0, Math.min(1, numValue));
          else newProps[prop] = value; 
          return newProps;
      });
  };

  const handleRemoveMap = () => {
    if (siteMapRef.current && sceneRef.current) {
        if (sceneRef.current.children.includes(siteMapRef.current)) sceneRef.current.remove(siteMapRef.current);
        siteMapRef.current.traverse(object => { if (object.geometry) object.geometry.dispose(); if (object.material) { if (Array.isArray(object.material)) object.material.forEach(m => { if(m.dispose) m.dispose(); }); else if (object.material.dispose) object.material.dispose(); }});
        siteMapRef.current = null; 
    }
    setMapFileName(''); if (fileInputRef.current) fileInputRef.current.value = null; 
    setSiteMapProps({ position: { x: 0, y: 0, z: 0 }, scale: { x: 1, y: 1, z: 1 }, visible: true, opacity: 1.0 });
  };

  // --- Borehole UI Handlers (Manual input part removed) ---
  const handleRemoveBorehole = (idToRemove) => setBoreholes(prev => prev.filter(bh => bh.id !== idToRemove));

  // --- Click-to-add Borehole Handler ---
  const handleCanvasClick = useCallback((event) => {
    console.log("handleCanvasClick triggered. isPlacingBorehole:", isPlacingBorehole);
    if (!isPlacingBorehole || !mountRef.current || !cameraRef.current || !sceneRef.current) {
        console.log("Conditions not met for placing borehole, returning.");
        return;
    }

    const rect = mountRef.current.getBoundingClientRect();
    const mouse = new THREE.Vector2();
    mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
    console.log("Mouse NDC:", mouse.x, mouse.y);

    raycasterRef.current.setFromCamera(mouse, cameraRef.current);

    let intersects = [];
    const potentialTargets = [];

    if (siteMapRef.current && siteMapRef.current.visible) {
        potentialTargets.push(siteMapRef.current); 
        console.log("Raycasting target: Site Map");
    }
    
    if (groundGridRef.current && groundGridRef.current.visible) {
        potentialTargets.push(groundGridRef.current); // Add grid as a potential target
        console.log("Raycasting target: Ground Grid also considered");
    }
    
    if (potentialTargets.length > 0) {
        intersects = raycasterRef.current.intersectObjects(potentialTargets, true); 
        console.log("Intersects with potential targets:", intersects);
    }

    if (intersects.length > 0) {
        const intersectionPoint = intersects[0].point; // Take the closest intersection
        console.log("Intersection point:", intersectionPoint);
        const name = prompt("Enter Borehole Name/ID:", `BH-${boreholes.length + 1}`);
        if (name) {
            setBoreholes(prev => [...prev, {
                id: Date.now(), name: name,
                x: parseFloat(intersectionPoint.x.toFixed(2)), 
                y: parseFloat(intersectionPoint.y.toFixed(2)), 
                z: parseFloat(intersectionPoint.z.toFixed(2))  
            }]);
            console.log("Borehole added:", name, intersectionPoint);
        } else {
            console.log("Borehole placement cancelled by user (no name).");
        }
    } else {
        console.log("No intersection with map or grid. Trying Y=0 plane as fallback.");
        const plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0); 
        const intersectionPoint = new THREE.Vector3();
        if (raycasterRef.current.ray.intersectPlane(plane, intersectionPoint)) {
            console.log("Intersection with Y=0 plane:", intersectionPoint);
            const name = prompt("Enter Borehole Name/ID (placed on Y=0 plane):", `BH-${boreholes.length + 1}`);
            if (name) {
               setBoreholes(prev => [...prev, { id: Date.now(), name: name, x: parseFloat(intersectionPoint.x.toFixed(2)), y: 0, z: parseFloat(intersectionPoint.z.toFixed(2)) }]);
               console.log("Borehole added on Y=0 plane:", name, intersectionPoint);
            } else {
                console.log("Borehole placement (on Y=0 plane) cancelled by user.");
            }
        } else {
            console.warn("No intersection found for borehole placement, even on Y=0 plane.");
        }
    }
    setIsPlacingBorehole(false); 
    console.log("Exited placing borehole mode.");
  }, [isPlacingBorehole, boreholes]); // Updated dependencies

  useEffect(() => { // Event listener for click-to-add
    const canvasElement = mountRef.current;
    if (isPlacingBorehole && canvasElement) {
        console.log("Adding mousedown listener for borehole placement.");
        canvasElement.addEventListener('mousedown', handleCanvasClick);
        if (controlsRef.current) {
            console.log("Disabling OrbitControls.");
            controlsRef.current.enabled = false;
        }
    } else if (canvasElement) {
        console.log("Removing mousedown listener.");
        canvasElement.removeEventListener('mousedown', handleCanvasClick);
        if (controlsRef.current) {
            console.log("Enabling OrbitControls.");
            controlsRef.current.enabled = true;
        }
    }
    return () => { 
        if (canvasElement) {
            console.log("Cleanup: Removing mousedown listener.");
            canvasElement.removeEventListener('mousedown', handleCanvasClick);
        }
        if (controlsRef.current) { 
            console.log("Cleanup: Ensuring OrbitControls are enabled.");
            controlsRef.current.enabled = true; 
        }
    };
  }, [isPlacingBorehole, handleCanvasClick]); 


  // --- Helper Functions for Creating 3D Objects (with dynamic scaling) ---
  const createTextLabel = useCallback((text, colorHexInput, strataScaleFactor = 1) => {
    const canvas = document.createElement('canvas'); const context = canvas.getContext('2d');
    const scaledFontSize = Math.max(10, Math.min(50, BASE_LABEL_FONT_SIZE * strataScaleFactor)); 
    const scaledPadding = BASE_LABEL_PADDING * strataScaleFactor; const scaledMaxWidth = BASE_LABEL_MAX_WIDTH * strataScaleFactor;
    const scaledLineHeight = scaledFontSize * 1.2; const scaledBorderRadius = BASE_LABEL_BORDER_RADIUS * strataScaleFactor;
    context.font = `bold ${scaledFontSize}px Arial`; const words = text.split(' '); let lines = []; let currentLine = '';
    for (let i = 0; i < words.length; i++) { const testLine = currentLine + words[i] + ' '; const metrics = context.measureText(testLine); if (metrics.width > scaledMaxWidth && i > 0) { lines.push(currentLine.trim()); currentLine = words[i] + ' '; } else { currentLine = testLine; }}
    lines.push(currentLine.trim()); const textHeight = lines.length * scaledLineHeight; const textWidth = Math.max(...lines.map(line => context.measureText(line).width)); 
    canvas.width = textWidth + scaledPadding * 2; canvas.height = textHeight + scaledPadding * 2;
    let colorHex = colorHexInput; if (typeof colorHex !== 'string' || !colorHex.startsWith('#')) colorHex = '#CCCCCC'; 
    const rgbColor = new THREE.Color(colorHex); const backgroundColor = `rgba(${Math.floor(rgbColor.r * 255)}, ${Math.floor(rgbColor.g * 255)}, ${Math.floor(rgbColor.b * 255)}, 0.8)`; 
    context.fillStyle = backgroundColor; context.beginPath(); context.moveTo(scaledBorderRadius, 0); context.lineTo(canvas.width - scaledBorderRadius, 0); context.quadraticCurveTo(canvas.width, 0, canvas.width, scaledBorderRadius); context.lineTo(canvas.width, canvas.height - scaledBorderRadius); context.quadraticCurveTo(canvas.width, canvas.height, canvas.width - scaledBorderRadius, canvas.height); context.lineTo(scaledBorderRadius, canvas.height); context.quadraticCurveTo(0, canvas.height, 0, canvas.height - scaledBorderRadius); context.lineTo(0, scaledBorderRadius); context.quadraticCurveTo(0, 0, scaledBorderRadius, 0); context.closePath(); context.fill();
    context.font = `bold ${scaledFontSize}px Arial`; context.fillStyle = '#ffffff'; context.textAlign = 'left'; context.textBaseline = 'top'; 
    let currentY = scaledPadding; lines.forEach(line => { context.fillText(line, scaledPadding, currentY); currentY += scaledLineHeight; });
    const texture = new THREE.CanvasTexture(canvas); texture.needsUpdate = true;
    const material = new THREE.SpriteMaterial({ map: texture, transparent: true, depthTest: false });
    const sprite = new THREE.Sprite(material); sprite.scale.set(canvas.width * BASE_SPRITE_SCALE_FACTOR, canvas.height * BASE_SPRITE_SCALE_FACTOR, 1);
    return sprite;
  }, [BASE_LABEL_FONT_SIZE, BASE_LABEL_PADDING, BASE_LABEL_MAX_WIDTH, BASE_LABEL_BORDER_RADIUS, BASE_SPRITE_SCALE_FACTOR]); 
  
  const createMarker = useCallback((number, strataScaleFactor = 1) => {
    const group = new THREE.Group(); const scaledRadius = BASE_MARKER_RADIUS * strataScaleFactor; const segments = 32;
    const circleGeometry = new THREE.CircleGeometry(scaledRadius, segments); const circleMaterial = new THREE.MeshBasicMaterial({ color: 0x333333, side: THREE.DoubleSide });
    group.add(new THREE.Mesh(circleGeometry, circleMaterial));
    const canvas = document.createElement('canvas'); const textCanvasSize = BASE_MARKER_TEXT_CANVAS_SIZE * Math.sqrt(strataScaleFactor); 
    canvas.width = textCanvasSize; canvas.height = textCanvasSize; const ctx = canvas.getContext('2d'); ctx.fillStyle = '#ffffff'; 
    const scaledFontSizeForMarker = Math.max(10, Math.min(48, BASE_MARKER_FONT_SIZE * Math.sqrt(strataScaleFactor))); 
    ctx.font = `bold ${scaledFontSizeForMarker}px Arial`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText(number.toString(), textCanvasSize / 2, textCanvasSize / 2);
    const texture = new THREE.CanvasTexture(canvas); texture.needsUpdate = true;
    const labelMaterial = new THREE.MeshBasicMaterial({ map: texture, side: THREE.DoubleSide, transparent: true, depthTest: false });
    const label = new THREE.Mesh(new THREE.CircleGeometry(scaledRadius, segments), labelMaterial); label.position.z = 0.01 * strataScaleFactor; 
    group.add(label); return group;
  }, [BASE_MARKER_RADIUS, BASE_MARKER_TEXT_CANVAS_SIZE, BASE_MARKER_FONT_SIZE]); 

  const createDepthMarkers = useCallback((group, adjustedModelHeight, totalActualDepth, layerData, currentCubeWidth, strataScaleFactor = 1) => {
    if (!group || adjustedModelHeight <=0 ) return; 
    const markerMaterial = new THREE.LineBasicMaterial({ color: 0xffffff });
    const scaledMainLineOffset = BASE_DEPTH_MARKER_MAIN_LINE_OFFSET * strataScaleFactor; const lineXPosition = -currentCubeWidth / 2 - scaledMainLineOffset; 
    const scaledTickLength = BASE_DEPTH_MARKER_TICK_LENGTH * strataScaleFactor;
    group.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints([ new THREE.Vector3(lineXPosition, 0, 0), new THREE.Vector3(lineXPosition, -adjustedModelHeight, 0) ]), markerMaterial));
    const depthPositions = []; let currentYForMarker = 0; let runningActualDepth = 0; depthPositions.push({ depth: 0, yPosition: currentYForMarker }); 
    const totalExplodedSpacingForCalc = (viewMode === 'exploded' && layerData.length > 1) ? (layerData.length - 1) * verticalSpacing : 0;
    const modelHeightWithoutSpacing = adjustedModelHeight - totalExplodedSpacingForCalc;
    for (let i = 0; i < layerData.length; i++) {
      const layerActualDepth = parseFloat(layerData[i]?.depth) || 1;
      const layerVisualHeight = (totalActualDepth > 0 ? (layerActualDepth / totalActualDepth) : (layerData.length > 0 ? 1 / layerData.length : 0)) * modelHeightWithoutSpacing;
      currentYForMarker -= layerVisualHeight; runningActualDepth += layerActualDepth; 
      depthPositions.push({ depth: parseFloat(runningActualDepth.toFixed(1)), yPosition: currentYForMarker }); 
      if (viewMode === 'exploded' && i < layerData.length - 1) currentYForMarker -= verticalSpacing; 
    }
    if (layerData.length === 0 && adjustedModelHeight > 0 && depthPositions.length === 1) depthPositions.push({ depth: 0, yPosition: -adjustedModelHeight});
    else if (layerData.length > 0 && Math.abs(currentYForMarker - (-adjustedModelHeight)) > 0.01) { if (Math.abs(depthPositions[depthPositions.length-1].yPosition - (-adjustedModelHeight)) > 0.01 ) depthPositions.push({ depth: parseFloat(totalActualDepth.toFixed(1)), yPosition: -adjustedModelHeight });}
    depthPositions.forEach(item => {
      group.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints([ new THREE.Vector3(lineXPosition, item.yPosition, 0), new THREE.Vector3(lineXPosition - scaledTickLength, item.yPosition, 0) ]), markerMaterial));
      const canvas = document.createElement('canvas'); const context = canvas.getContext('2d'); const text = `${item.depth.toFixed(1)}'`; 
      const scaledFontSize = Math.max(10, Math.min(50, BASE_DEPTH_LABEL_FONT_SIZE * strataScaleFactor)); const scaledPadding = BASE_DEPTH_LABEL_PADDING * strataScaleFactor;
      context.font = `bold ${scaledFontSize}px Arial`; const textWidth = context.measureText(text).width;
      canvas.width = textWidth + scaledPadding * 2; canvas.height = scaledFontSize + scaledPadding * 2; 
      context.font = `bold ${scaledFontSize}px Arial`; context.fillStyle = '#ffffff'; context.textAlign = 'center'; context.textBaseline = 'middle';
      context.fillText(text, canvas.width / 2, canvas.height / 2);
      const texture = new THREE.CanvasTexture(canvas); texture.needsUpdate = true;
      const labelMaterial = new THREE.MeshBasicMaterial({ map: texture, side: THREE.DoubleSide, transparent: true, depthTest: false });
      const labelMesh = new THREE.Mesh(new THREE.PlaneGeometry(canvas.width * BASE_DEPTH_LABEL_PLANE_SCALE, canvas.height * BASE_DEPTH_LABEL_PLANE_SCALE), labelMaterial);
      const labelWorldWidth = canvas.width * BASE_DEPTH_LABEL_PLANE_SCALE; const scaledGapFromTick = BASE_DEPTH_MARKER_TEXT_GAP * strataScaleFactor;
      labelMesh.position.set(lineXPosition - scaledTickLength - scaledGapFromTick - (labelWorldWidth / 2), item.yPosition, 0); 
      group.add(labelMesh);
    });
  }, [viewMode, verticalSpacing, BASE_DEPTH_LABEL_FONT_SIZE, BASE_DEPTH_LABEL_PADDING, BASE_DEPTH_LABEL_PLANE_SCALE, BASE_DEPTH_MARKER_MAIN_LINE_OFFSET, BASE_DEPTH_MARKER_TICK_LENGTH, BASE_DEPTH_MARKER_TEXT_GAP]); 

  const createSoilCube = useCallback((scene, layersCount, currentLayerData, currentStrataDimensions) => {
    if (!scene || !currentLayerData || !currentStrataDimensions) return;
    const currentMaxSize = Math.max(currentStrataDimensions.width, currentStrataDimensions.depth, BASE_DIMENSION_FOR_SCALING);
    const strataScaleFactor = Math.max(0.5, currentMaxSize / BASE_DIMENSION_FOR_SCALING); 
    if (soilCubeRef.current && scene.children.includes(soilCubeRef.current)) {
        soilCubeRef.current.traverse(object => { if (object.geometry) object.geometry.dispose(); if (object.material) { if (Array.isArray(object.material)) object.material.forEach(m => { if (m.map) m.map.dispose(); if (m.dispose) m.dispose(); }); else { if (object.material.map) object.material.map.dispose(); if (object.material.dispose) object.material.dispose(); } }});
        scene.remove(soilCubeRef.current);
    }
    const newSoilCube = new THREE.Group(); newSoilCube.visible = showStrata; 
    const totalActualDepth = currentLayerData.reduce((sum, layer) => sum + (parseFloat(layer.depth) || 1), 0);
    const minVisualDimensionForStrata = Math.max(currentStrataDimensions.width, currentStrataDimensions.depth, 5); 
    const modelVisualHeight = Math.max(minVisualDimensionForStrata, totalActualDepth); 
    const totalExplodedSpacing = (viewMode === 'exploded' && layersCount > 1) ? (layersCount - 1) * verticalSpacing : 0;
    const adjustedModelHeight = modelVisualHeight + totalExplodedSpacing; 
    if (showDepthMarkers && layersCount > 0) createDepthMarkers(newSoilCube, adjustedModelHeight, totalActualDepth, currentLayerData, currentStrataDimensions.width, strataScaleFactor);
    const layerPositionsForConnectors = []; let currentYPosition = 0; 
    for (let i = 0; i < layersCount; i++) {
      const currentLayerInfo = currentLayerData[i] || {}; const layerColorStr = currentLayerInfo.color || defaultSoilTypes[i % defaultSoilTypes.length].color;
      let colorHex = layerColorStr; try { new THREE.Color(colorHex); } catch (e) { colorHex = defaultSoilTypes[i % defaultSoilTypes.length].color; }
      const layerColor = new THREE.Color(colorHex); const layerActualDepth = parseFloat(currentLayerInfo.depth) || 1; 
      const layerVisualHeight = (totalActualDepth > 0 ? (layerActualDepth / totalActualDepth) : (layersCount > 0 ? 1 / layersCount : 0)) * modelVisualHeight;
      if (layerVisualHeight <= 0) continue;
      const layerGroup = new THREE.Group(); const layerCenterY = currentYPosition - layerVisualHeight / 2; 
      const geometry = new THREE.BoxGeometry(currentStrataDimensions.width, layerVisualHeight, currentStrataDimensions.depth);
      const material = new THREE.MeshStandardMaterial({ color: layerColor, roughness: 0.7, metalness: 0.1 });
      const layerMesh = new THREE.Mesh(geometry, material);
      layerMesh.position.y = layerCenterY; 
      layerGroup.add(layerMesh);

      if (viewMode === 'exploded' && layersCount > 1) layerPositionsForConnectors.push({ top: currentYPosition, bottom: currentYPosition - layerVisualHeight });
      const strataEdgeX = currentStrataDimensions.width / 2; const strataEdgeZ = currentStrataDimensions.depth / 2; const elementZOffset = 0.1 * strataScaleFactor; 
      if (showMarkers) { const marker = createMarker(i + 1, strataScaleFactor); const markerGapFromEdge = 0.4 * strataScaleFactor; marker.position.set(strataEdgeX + markerGapFromEdge, layerCenterY, strataEdgeZ + elementZOffset); layerGroup.add(marker); }
      if (showLabels) {
        const labelText = `${currentLayerInfo.name || 'Layer ' + (i + 1)}: ${currentLayerInfo.description || 'No description'}`;
        const labelSprite = createTextLabel(labelText, colorHex, strataScaleFactor); const labelSpriteWorldWidth = labelSprite.scale.x;
        const lineToElementGap = 0.1 * strataScaleFactor; const labelGapFromMarkerOrEdge = 0.2 * strataScaleFactor; let labelAttachX;
        if (showMarkers) {
            const markerRadiusWorld = BASE_MARKER_RADIUS * strataScaleFactor; const markerGapFromEdge = 0.4 * strataScaleFactor; const markerCenterX = strataEdgeX + markerGapFromEdge; const markerRightEdgeX = markerCenterX + markerRadiusWorld; const lineToMarkerEnd = markerCenterX - markerRadiusWorld - lineToElementGap;
            layerGroup.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints([ new THREE.Vector3(strataEdgeX, layerCenterY, strataEdgeZ + elementZOffset * 0.5), new THREE.Vector3(lineToMarkerEnd, layerCenterY, strataEdgeZ + elementZOffset * 0.5) ]), new THREE.LineBasicMaterial({color: 0xffffff})));
            labelAttachX = markerRightEdgeX + labelGapFromMarkerOrEdge; 
            layerGroup.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints([ new THREE.Vector3(markerRightEdgeX + lineToElementGap, layerCenterY, strataEdgeZ + elementZOffset * 0.5), new THREE.Vector3(labelAttachX - lineToElementGap, layerCenterY, strataEdgeZ + elementZOffset * 0.5) ]), new THREE.LineBasicMaterial({color: 0xffffff})));
        } else {
            labelAttachX = strataEdgeX + labelGapFromMarkerOrEdge; 
            layerGroup.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints([ new THREE.Vector3(strataEdgeX, layerCenterY, strataEdgeZ + elementZOffset * 0.5), new THREE.Vector3(labelAttachX - lineToElementGap, layerCenterY, strataEdgeZ + elementZOffset * 0.5) ]), new THREE.LineBasicMaterial({color: 0xffffff})));
        }
        labelSprite.position.set(labelAttachX + labelSpriteWorldWidth / 2, layerCenterY, strataEdgeZ + elementZOffset); layerGroup.add(labelSprite);
      }
      newSoilCube.add(layerGroup); currentYPosition = currentYPosition - layerVisualHeight;
      if (viewMode === 'exploded' && i < layersCount - 1 && layersCount > 1) currentYPosition -= verticalSpacing; 
    }
    if (viewMode === 'exploded' && showConnectors && layerPositionsForConnectors.length > 1) {
      for (let i = 0; i < layerPositionsForConnectors.length - 1; i++) {
        const upperLayer = layerPositionsForConnectors[i]; const lowerLayer = layerPositionsForConnectors[i+1]; const connectorStartY = upperLayer.bottom; const connectorEndY = lowerLayer.top;
        const lineMaterial = new THREE.LineBasicMaterial({ color: 0xaaaaaa, opacity: 0.7, transparent: true }); const connectorZ = currentStrataDimensions.depth / 2; 
        newSoilCube.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints([ new THREE.Vector3(currentStrataDimensions.width / 2, connectorStartY, connectorZ), new THREE.Vector3(currentStrataDimensions.width / 2, connectorEndY, connectorZ) ]), lineMaterial));
        newSoilCube.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints([ new THREE.Vector3(-currentStrataDimensions.width / 2, connectorStartY, connectorZ), new THREE.Vector3(-currentStrataDimensions.width / 2, connectorEndY, connectorZ) ]), lineMaterial));
      }
    }
    soilCubeRef.current = newSoilCube; scene.add(newSoilCube);
  }, [defaultSoilTypes, showDepthMarkers, showMarkers, showLabels, showConnectors, viewMode, verticalSpacing, createTextLabel, createMarker, createDepthMarkers, strataDimensions, showStrata, BASE_MARKER_RADIUS]); 

  const createGroundGrid = useCallback((scene) => {
    if (!scene) return;
    if (groundGridRef.current && scene.children.includes(groundGridRef.current)) {
        groundGridRef.current.geometry.dispose(); if (Array.isArray(groundGridRef.current.material)) groundGridRef.current.material.forEach(m => m.dispose()); else groundGridRef.current.material.dispose();
        scene.remove(groundGridRef.current); groundGridRef.current = null;
    }
    if (showGroundGrid) { const gridHelper = new THREE.GridHelper(GROUND_GRID_SIZE, GROUND_GRID_DIVISIONS, 0x888888, 0xbbbbbb); gridHelper.position.y = 0; groundGridRef.current = gridHelper; scene.add(gridHelper); }
  }, [showGroundGrid, GROUND_GRID_SIZE, GROUND_GRID_DIVISIONS]);

  const createBoreholeMarkers = useCallback((scene, currentBoreholes) => {
    if (!scene) return;
    if (boreholeMarkersGroupRef.current) {
        scene.remove(boreholeMarkersGroupRef.current);
        boreholeMarkersGroupRef.current.traverse(object => { 
            if (object.geometry) object.geometry.dispose(); 
            if (object.material) { 
                if (Array.isArray(object.material)) {
                    object.material.forEach(m => { if(m.map) m.map.dispose(); if(m.dispose) m.dispose(); });
                } else {
                    if (object.material.map) object.material.map.dispose();
                    if (object.material.dispose) object.material.dispose(); 
                }
            }
        });
        boreholeMarkersGroupRef.current = null; 
    }
    if (!currentBoreholes || currentBoreholes.length === 0) return; 

    const group = new THREE.Group(); 
    const markerRadius = 0.25; 
    const markerHeight = 1.5;  
    const markerMaterial = new THREE.MeshStandardMaterial({ color: 0xff0000, roughness: 0.5, metalness: 0.1 }); 

    currentBoreholes.forEach(bh => {
        const geometry = new THREE.CylinderGeometry(markerRadius, markerRadius, markerHeight, 16);
        const cylinder = new THREE.Mesh(geometry, markerMaterial);
        cylinder.position.set(bh.x, bh.y + markerHeight / 2, bh.z); 
        
        const boreholeLabelRenderScaleFactor = 1.0; 
        const labelSprite = createTextLabel(bh.name, '#cc0000', boreholeLabelRenderScaleFactor); 
        const yOffsetForLabel = markerHeight + (labelSprite.scale.y / 2) + 0.2; 
        labelSprite.position.set(bh.x, bh.y + yOffsetForLabel , bh.z); 
        
        group.add(labelSprite);
        group.add(cylinder);
    });
    boreholeMarkersGroupRef.current = group; 
    scene.add(group);
  }, [createTextLabel]); 


  const handleLayerChange = useCallback((e) => { const value = parseInt(e.target.value); if (!isNaN(value)) setNumLayers(Math.max(0, Math.min(value, 20))); }, []);
  const handleViewModeChange = useCallback((mode) => setViewMode(mode), []);
  const handleLayerSelect = useCallback((index) => setActiveLayerIndex(index), []);
  const handleLayerPropertyChange = useCallback((property, value) => {
    setLayerInfo(currentLayerInfo => {
      const updatedLayerInfo = [...currentLayerInfo];
      if (updatedLayerInfo[activeLayerIndex]) {
          if (property === 'depth') { const numericValue = parseFloat(value); updatedLayerInfo[activeLayerIndex] = { ...updatedLayerInfo[activeLayerIndex], [property]: isNaN(numericValue) || numericValue < 0.1 ? 0.1 : numericValue };
          } else { updatedLayerInfo[activeLayerIndex] = { ...updatedLayerInfo[activeLayerIndex], [property]: value }; }
      } return updatedLayerInfo;
    });
  }, [activeLayerIndex]);
  const handleAddLayer = useCallback(() => { if (numLayers === 0) { setNumLayers(1); setActiveLayerIndex(0); } else { setNumLayers(prevNum => { const newNum = Math.min(prevNum + 1, 20); setActiveLayerIndex(newNum - 1); return newNum; }); }}, [numLayers]); 
  const handleRemoveLayer = useCallback(() => {
    if (numLayers <= 0) return; 
    setLayerInfo(currentLayerInfo => currentLayerInfo.filter((_, index) => index !== activeLayerIndex));
    setNumLayers(prevNum => { const newNumLayers = prevNum - 1; setActiveLayerIndex(prevIndex => Math.min(prevIndex, newNumLayers - 1 < 0 ? 0 : newNumLayers - 1)); return newNumLayers; });
  }, [numLayers, activeLayerIndex]);
  const handleStrataDimensionChange = (axis, value) => { const numValue = parseFloat(value); if (isNaN(numValue) || numValue <= 0) return; setStrataDimensions(prev => ({ ...prev, [axis]: numValue })); };
  const toggleSection = (sectionName) => setOpenSections(prev => ({ ...prev, [sectionName]: !prev[sectionName] }));

  // --- Main useEffect for Re-rendering the 3D Model ---
  useEffect(() => {
    if (sceneRef.current && createSoilCube && createGroundGrid && strataDimensions && createBoreholeMarkers) { 
        createGroundGrid(sceneRef.current); 
        if (numLayers > 0 && layerInfo.length > 0) {
             createSoilCube(sceneRef.current, numLayers, layerInfo, strataDimensions);
        } else if (soilCubeRef.current && sceneRef.current?.children.includes(soilCubeRef.current)) {
            soilCubeRef.current.traverse(object => { if (object.geometry) object.geometry.dispose(); if (object.material) { if (Array.isArray(object.material)) object.material.forEach(m => { if(m.dispose) m.dispose(); }); else if (object.material.dispose) object.material.dispose(); }});
            sceneRef.current.remove(soilCubeRef.current); soilCubeRef.current = null;
        }
        createBoreholeMarkers(sceneRef.current, boreholes);
    }
  }, [ numLayers, layerInfo, showLabels, showMarkers, showDepthMarkers, viewMode, verticalSpacing, showConnectors, createSoilCube, strataDimensions, showStrata, showGroundGrid, createGroundGrid, boreholes, createBoreholeMarkers ]); 

  const totalProfileDepth = numLayers > 0 ? layerInfo.reduce((total, layer) => total + (parseFloat(layer.depth) || 1), 0).toFixed(1) : 0;

  return (
    <div style={styles.container}>
      <div style={styles.header}> {/* Header */}
        <div style={styles.headerContent}>
          <div style={styles.controls}> <label style={styles.label} htmlFor="layers-input-main">Soil Layers:</label> <input id="layers-input-main" type="number" min="0" max="20" value={numLayers} onChange={handleLayerChange} style={styles.input} /> <button onClick={() => setShowLayerPanel(!showLayerPanel)} style={{ ...styles.button, ...(isHoveringButton.edit ? styles.buttonHover : {}) }} onMouseEnter={() => setIsHoveringButton(prev => ({...prev, edit: true}))} onMouseLeave={() => setIsHoveringButton(prev => ({...prev, edit: false}))} > {showLayerPanel ? "Hide Editor" : "Show Editor"} </button> </div>
          <div style={styles.instructions}>L-Click+Drag: Rotate | R-Click+Drag: Pan | Scroll: Zoom</div>
        </div>
        {numLayers > 0 && (<div style={styles.depthInfo}><p>Total profile depth: {totalProfileDepth} feet (below ground)</p></div>)}
      </div>
      <div style={styles.content}> {/* Main Content */}
        <div ref={mountRef} style={isPlacingBorehole ? styles.canvasPlacingBorehole : styles.canvas} /> {/* Canvas with dynamic style */}
        {showLayerPanel && ( <div style={styles.editorPanel}> {/* Editor Panel */}
            <CollapsibleSection title="Site Map (on Ground)" sectionKey="siteMap" isOpen={openSections.siteMap} onToggle={toggleSection}>
                <input id="file-upload-input-editor" type="file" accept=".glb, .gltf" ref={fileInputRef} style={{ display: 'none' }} onChange={handleFileChange} key={mapFileName || `file-input-editor-${Date.now()}`} />
                <label htmlFor="file-upload-input-editor" style={{ ...styles.fileInputLabel, ...(isHoveringButton.loadMap ? styles.fileInputLabelHover : {})}} onMouseEnter={() => setIsHoveringButton(prev => ({...prev, loadMap: true}))} onMouseLeave={() => setIsHoveringButton(prev => ({...prev, loadMap: false}))} onClick={() => fileInputRef.current && fileInputRef.current.click()} role="button" tabIndex={0} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') fileInputRef.current && fileInputRef.current.click();}} > Load Site Map (.glb/.gltf) </label>
                {mapFileName && <p style={{fontSize: '12px', color: '#555', marginBottom: '10px', wordBreak: 'break-all'}}>Loaded: {mapFileName}</p>}
                {siteMapRef.current && ( <> <label style={styles.mapControlLabel}>Position (X, Y above ground, Z):</label> <div style={styles.mapControlContainer}> {['x', 'y', 'z'].map((axis, index) => ( <input aria-label={`Map position ${axis.toUpperCase()}`} key={`pos-${axis}`} type="number" step="0.1" style={{...styles.mapControlInput, ...(index === 2 ? {marginRight: 0} : {})}} value={siteMapProps.position[axis]} onChange={(e) => handleMapPropChange('position', axis, e.target.value)} placeholder={axis.toUpperCase()} /> ))} </div> <label style={styles.mapControlLabel}>Scale (X, Y, Z):</label> <div style={styles.mapControlContainer}> {['x', 'y', 'z'].map((axis, index) => ( <input aria-label={`Map scale ${axis.toUpperCase()}`} key={`scale-${axis}`} type="number" step="0.1" min="0.01" style={{...styles.mapControlInput, ...(index === 2 ? {marginRight: 0} : {})}} value={siteMapProps.scale[axis]} onChange={(e) => handleMapPropChange('scale', axis, e.target.value)} placeholder={axis.toUpperCase()} /> ))} </div> <label htmlFor="opacity-slider-editor" style={styles.mapControlLabel}>Opacity:</label> <input id="opacity-slider-editor" type="range" min="0" max="1" step="0.01" style={{width: '100%', marginBottom: '10px', cursor: 'pointer'}} value={siteMapProps.opacity} onChange={(e) => handleMapPropChange('opacity', null, e.target.value)} aria-label="Map opacity slider" /> <label style={styles.checkboxLabel}> <input type="checkbox" checked={siteMapProps.visible} onChange={(e) => handleMapPropChange('visible', null, e.target.checked)} style={styles.checkbox} aria-label="Show site map checkbox" /> Show Site Map </label> <button onClick={handleRemoveMap} style={{ ...styles.actionButton, ...styles.removeButton, width: '100%', marginTop: '10px', ...(isHoveringButton.removeMap ? styles.removeButtonHover : {})}} onMouseEnter={() => setIsHoveringButton(prev => ({...prev, removeMap: true}))} onMouseLeave={() => setIsHoveringButton(prev => ({...prev, removeMap: false}))} > Remove Site Map </button> </> )}
            </CollapsibleSection>
            <CollapsibleSection title="Strata Model Settings (Below Ground)" sectionKey="strataModel" isOpen={openSections.strataModel} onToggle={toggleSection}>
                 <div style={{marginBottom: '10px'}}> <label htmlFor="strata-width-input" style={{...styles.label, marginRight: '10px', display: 'block', marginBottom: '5px'}}>Width (X-axis):</label> <input id="strata-width-input" type="number" step="0.5" min="1" style={{...styles.editorInput, width: 'calc(100% - 24px)' , marginBottom:'5px'}} value={strataDimensions.width} onChange={(e) => handleStrataDimensionChange('width', e.target.value)} /> </div>
                <div style={{marginBottom: '20px'}}> <label htmlFor="strata-depth-input" style={{...styles.label, marginRight: '10px', display: 'block', marginBottom: '5px'}}>Depth (Z-axis):</label> <input id="strata-depth-input" type="number" step="0.5" min="1" style={{...styles.editorInput, width: 'calc(100% - 24px)', marginBottom:'5px'}} value={strataDimensions.depth} onChange={(e) => handleStrataDimensionChange('depth', e.target.value)} /> </div>
            </CollapsibleSection>
            <CollapsibleSection title="Borehole Markers" sectionKey="boreholes" isOpen={openSections.boreholes} onToggle={toggleSection}>
                <button onClick={() => setIsPlacingBorehole(prev => !prev)} style={{ ...styles.toggleButton, ...(isPlacingBorehole ? styles.toggleButtonActive : {}), ...(isHoveringButton.placeBorehole && !isPlacingBorehole ? styles.toggleButtonHover : {}) }} onMouseEnter={() => setIsHoveringButton(prev => ({...prev, placeBorehole: true}))} onMouseLeave={() => setIsHoveringButton(prev => ({...prev, placeBorehole: false}))} > {isPlacingBorehole ? "Cancel Placement (Click Canvas)" : "Place Borehole by Click"} </button>
                <p style={{fontSize: '12px', color: '#555', margin: '5px 0 15px 0', textAlign: 'center'}}> {isPlacingBorehole ? "Click on the map/grid to place a borehole." : "Toggle 'Place Borehole' then click on the 3D view."} </p>
                
                {boreholes.length > 0 && <h4 style={styles.editorSubSectionTitle}>Existing Boreholes</h4>}
                <div style={{maxHeight: '150px', overflowY: 'auto', paddingRight: '5px'}}> {boreholes.map(bh => ( <div key={bh.id} style={styles.legendItem}> <div style={styles.legendTextContainer}> <strong style={{fontSize: '15px'}}>{bh.name}</strong> <div style={{fontSize: '13px'}}>X: {bh.x}, Elev: {bh.y}, Z: {bh.z}</div> </div> <button onClick={() => handleRemoveBorehole(bh.id)} style={{...styles.actionButton, ...styles.removeButton, padding: '5px 10px', fontSize: '13px', marginLeft: '10px', flexShrink: 0}} >Remove</button> </div> ))} </div>
            </CollapsibleSection>
            <CollapsibleSection title="Layer Properties" sectionKey="layerEditor" isOpen={openSections.layerEditor} onToggle={toggleSection}>
                {numLayers > 0 ? ( <> <div style={{ marginBottom: '20px' }}> <h4 style={styles.editorSubSectionTitle}>View Mode</h4> <div style={{ display: 'flex', marginBottom: '15px' }}> <button onClick={() => handleViewModeChange('normal')} style={{ ...styles.editorButton, ...(viewMode === 'normal' ? styles.editorButtonActive : {}) }} aria-pressed={viewMode === 'normal'} > Normal </button> <button onClick={() => handleViewModeChange('exploded')} style={{ ...styles.editorButton, ...(viewMode === 'exploded' ? styles.editorButtonActive : {}) }} aria-pressed={viewMode === 'exploded'} > Exploded </button> </div> {viewMode === 'exploded' && ( <div style={{ marginTop: '10px' }}> <label htmlFor="vertical-spacing-slider-editor" style={{ display: 'block', marginBottom: '5px', fontSize: '14px' }}> Vertical Spacing: {verticalSpacing.toFixed(1)} </label> <input id="vertical-spacing-slider-editor" type="range" min="0.1" max="2" step="0.1" value={verticalSpacing} onChange={(e) => setVerticalSpacing(parseFloat(e.target.value))} style={{ width: '100%', cursor: 'pointer' }} aria-label="Vertical spacing slider" /> <label style={styles.checkboxLabel}> <input type="checkbox" checked={showConnectors} onChange={(e) => setShowConnectors(e.target.checked)} style={styles.checkbox} aria-label="Show layer connectors checkbox" /> Show Layer Connectors </label> </div> )} </div> <div style={styles.actionButtonContainer}> <button onClick={handleAddLayer} style={{ ...styles.actionButton, ...styles.addButton, ...(isHoveringButton.add ? styles.addButtonHover : {}) }} onMouseEnter={() => setIsHoveringButton(prev => ({...prev, add: true}))} onMouseLeave={() => setIsHoveringButton(prev => ({...prev, add: false}))} > Add Layer </button> <button onClick={handleRemoveLayer} style={{ ...styles.actionButton, ...(numLayers <= 0 ? styles.removeButtonDisabled : styles.removeButton), ...(numLayers > 0 && isHoveringButton.remove ? styles.removeButtonHover : {}) }} disabled={numLayers <= 0} onMouseEnter={() => setIsHoveringButton(prev => ({...prev, remove: true}))} onMouseLeave={() => setIsHoveringButton(prev => ({...prev, remove: false}))} > Remove Layer </button> </div> <div style={{ marginBottom: '16px' }}> <label style={{ display: 'block', marginBottom: '10px', fontWeight: '600', fontSize: '16px' }}> Select Layer: (Layer {activeLayerIndex + 1} selected) </label> <div style={styles.layerSelectorGrid} role="radiogroup" aria-label="Layer selector"> {layerInfo.map((layer, index) => ( <div role="radio" tabIndex={0} aria-checked={index === activeLayerIndex} key={layer.id || index} onClick={() => handleLayerSelect(index)} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleLayerSelect(index);}} style={{ ...styles.layerSelectorItem, backgroundColor: layer.color, ...(index === activeLayerIndex ? styles.layerSelectorItemActive : {}) }} title={`Layer ${index + 1}: ${layer.name}`} /> ))} </div> </div> {layerInfo[activeLayerIndex] && ( <div> <div style={{ marginBottom: '16px' }}> <label htmlFor={`layer-name-input-editor-${activeLayerIndex}`} style={{ display: 'block', marginBottom: '8px', fontWeight: '600', fontSize: '16px' }}> Layer Name: </label> <input id={`layer-name-input-editor-${activeLayerIndex}`} type="text" value={layerInfo[activeLayerIndex].name || ''} onChange={(e) => handleLayerPropertyChange('name', e.target.value)} style={styles.editorInput} /> </div> <div style={{ marginBottom: '16px' }}> <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', fontSize: '16px' }}> Layer Color: </label> <div style={{ display: 'flex', alignItems: 'center' }}> <input aria-label="Layer color picker" type="color" value={layerInfo[activeLayerIndex].color || '#ffffff'} onChange={(e) => handleLayerPropertyChange('color', e.target.value)} style={{ width: '50px', height: '50px', marginRight: '12px', border: '1px solid #d1d5db', padding: '2px', cursor: 'pointer' }} /> <input aria-label="Layer color hex input" type="text" value={layerInfo[activeLayerIndex].color || ''} onChange={(e) => handleLayerPropertyChange('color', e.target.value)} style={{ ...styles.editorInput, flexGrow: 1, marginBottom: 0 }} placeholder="#rrggbb" /> </div> </div> <div style={{ marginBottom: '16px' }}> <label htmlFor={`layer-desc-editor-${activeLayerIndex}`} style={{ display: 'block', marginBottom: '8px', fontWeight: '600', fontSize: '16px' }}> Description: </label> <textarea id={`layer-desc-editor-${activeLayerIndex}`} value={layerInfo[activeLayerIndex].description || ''} onChange={(e) => handleLayerPropertyChange('description', e.target.value)} style={styles.editorTextarea} /> </div> <div style={{ marginBottom: '16px' }}> <label htmlFor={`layer-depth-editor-${activeLayerIndex}`} style={{ display: 'block', marginBottom: '8px', fontWeight: '600', fontSize: '16px' }}> Depth (feet): </label> <input id={`layer-depth-editor-${activeLayerIndex}`} type="number" min="0.1" step="0.1" value={layerInfo[activeLayerIndex].depth || 1} onChange={(e) => handleLayerPropertyChange('depth', e.target.value)} style={styles.editorInput} /> </div> </div> )} </> ) : ( <div style={styles.actionButtonContainer}> <button onClick={handleAddLayer} style={{ ...styles.actionButton, ...styles.addButton, width: '100%', ...(isHoveringButton.add ? styles.addButtonHover : {}) }} onMouseEnter={() => setIsHoveringButton(prev => ({...prev, add: true}))} onMouseLeave={() => setIsHoveringButton(prev => ({...prev, add: false}))} > Initialize First Layer </button> </div> )}
            </CollapsibleSection>
            <CollapsibleSection title="Display Options" sectionKey="displayOptions" isOpen={openSections.displayOptions} onToggle={toggleSection}>
                <div style={styles.checkboxContainer}> <label style={styles.checkboxLabel}> <input type="checkbox" checked={showGroundGrid} onChange={(e) => setShowGroundGrid(e.target.checked)} style={styles.checkbox} aria-label="Show ground grid checkbox" /> Show Ground Grid </label> <label style={styles.checkboxLabel}> <input type="checkbox" checked={showStrata} onChange={(e) => setShowStrata(e.target.checked)} style={styles.checkbox} aria-label="Show strata model checkbox" disabled={numLayers === 0} title={numLayers === 0 ? "Initialize layers first" : ""} /> Show Strata Model </label> <label style={styles.checkboxLabel}> <input type="checkbox" checked={showLabels} onChange={(e) => setShowLabels(e.target.checked)} style={styles.checkbox} aria-label="Show layer labels checkbox" disabled={numLayers === 0}/> Show Layer Labels </label> <label style={styles.checkboxLabel}> <input type="checkbox" checked={showMarkers} onChange={(e) => setShowMarkers(e.target.checked)} style={styles.checkbox} aria-label="Show layer markers checkbox" disabled={numLayers === 0}/> Show Layer Markers </label> <label style={styles.checkboxLabel}> <input type="checkbox" checked={showDepthMarkers} onChange={(e) => setShowDepthMarkers(e.target.checked)} style={styles.checkbox} aria-label="Show depth scale checkbox" disabled={numLayers === 0}/> Show Depth Scale </label> </div>
            </CollapsibleSection>
             <CollapsibleSection title="Legend" sectionKey="legend" isOpen={openSections.legend} onToggle={toggleSection}>
                {numLayers > 0 ? ( <div> {layerInfo.map((layer, index) => ( <div key={layer.id || `legend-${index}`} style={styles.legendItem}> <div style={{...styles.legendColorBox, backgroundColor: layer.color}} /> <div style={styles.legendTextContainer}> <div style={styles.legendLayerName}> {layer.name || `Layer ${index + 1}`} </div> <div style={styles.legendLayerDescription}> {layer.description || 'No description'} </div> <div style={styles.legendLayerDepth}> Depth: {(parseFloat(layer.depth) || 1).toFixed(1)} ft </div> </div> </div> ))} </div> ) : ( <p style={{color: '#6b7280', fontStyle: 'italic'}}>No layers to display in legend.</p> )}
            </CollapsibleSection>
          </div> )}
      </div>
    </div>
  );
};

export default SoilLayersModel;
