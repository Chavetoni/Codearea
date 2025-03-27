import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

const TexturedGeologicalLayers = () => {
  const mountRef = useRef(null);
  const [isInteractive, setIsInteractive] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    // Scene setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xc0e0ff); // Light blue sky
    
    // Camera setup
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 40, 80);
    camera.lookAt(0, 0, 0);
    
    // Renderer setup
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    
    if (mountRef.current) {
      // Clear any existing children first
      while (mountRef.current.firstChild) {
        mountRef.current.removeChild(mountRef.current.firstChild);
      }
      mountRef.current.appendChild(renderer.domElement);
    }
    
    // Texture loading manager to track progress
    const loadingManager = new THREE.LoadingManager();
    loadingManager.onProgress = (url, loaded, total) => {
      const progress = Math.round((loaded / total) * 100);
      setLoadingProgress(progress);
    };
    
    loadingManager.onLoad = () => {
      setIsLoading(false);
    };
    
    // Texture loader
    const textureLoader = new THREE.TextureLoader(loadingManager);
    
    // Enhanced lighting for better material visualization
    const ambientLight = new THREE.AmbientLight(0x909090, 1);
    scene.add(ambientLight);
    
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1.2);
    directionalLight.position.set(1, 1, 1);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    directionalLight.shadow.camera.near = 0.5;
    directionalLight.shadow.camera.far = 500;
    scene.add(directionalLight);
    
    // Terrain dimensions - consistent for all layers
    const width = 100;
    const depth = 100;
    
    // Define geological strata layers
    const strata = [
      { 
        height: -30, 
        color: new THREE.Color(0x2F2F2F), 
        name: "Bedrock (Granite)",
        shininess: 30,
        roughness: 0.9,
        metalness: 0.2
      },
      { 
        height: -24, 
        color: new THREE.Color(0x4D4D4D), 
        name: "Basalt",
        shininess: 20,
        roughness: 0.8,
        metalness: 0.1
      },
      { 
        height: -18, 
        color: new THREE.Color(0x804000), 
        name: "Shale",
        shininess: 5,
        roughness: 0.85,
        metalness: 0.05
      },
      { 
        height: -12, 
        color: new THREE.Color(0xDEB887), 
        name: "Sandstone",
        shininess: 0,
        roughness: 0.95,
        metalness: 0.0
      },
      { 
        height: -6, 
        color: new THREE.Color(0x9B2D06), 
        name: "Clay",
        shininess: 0,
        roughness: 0.9,
        metalness: 0.0
      },
      { 
        height: -2, 
        color: new THREE.Color(0x3A5311), 
        name: "Soil",
        shininess: 0,
        roughness: 1.0,
        metalness: 0.0
      },
      { 
        height: 0, 
        color: new THREE.Color(0x594D32), // Using the averageColor from the JSON
        name: "Topsoil/Vegetation (Mud)",
        shininess: 0,
        roughness: 0.9,
        metalness: 0.0,
        textured: true // Flag to indicate we'll use textures for this layer
      }
    ];
    
    // Load PBR textures for the topsoil (mud) layer
    const mudTextures = {
      basecolor: textureLoader.load('/textures/seymaixa_8K_Basecolor.jpg'),
      normal: textureLoader.load('/textures/seymaixa_8K_Normal.jpg'),
      roughness: textureLoader.load('/textures/seymaixa_8K_Roughness.jpg'),
      displacement: textureLoader.load('/textures/seymaixa_8K_Displacement.jpg'),
      ao: textureLoader.load('/textures/seymaixa_8K_AO.jpg'),
      specular: textureLoader.load('/textures/seymaixa_8K_Specular.jpg')
    };
    
    // Configure texture settings
    Object.values(mudTextures).forEach(texture => {
      texture.wrapS = THREE.RepeatWrapping;
      texture.wrapT = THREE.RepeatWrapping;
      texture.repeat.set(2, 2); // Repeat texture 2x2 times over the surface
    });
    
    // Create flat terrain surface (top layer) with PBR textures
    const createTerrainSurface = () => {
      // Create more detailed geometry for better displacement effect
      const geometry = new THREE.PlaneGeometry(width, depth, 128, 128);
      
      // Use PBR materials for the top layer
      const material = new THREE.MeshStandardMaterial({
        map: mudTextures.basecolor,
        normalMap: mudTextures.normal,
        roughnessMap: mudTextures.roughness,
        aoMap: mudTextures.ao,
        displacementMap: mudTextures.displacement,
        displacementScale: 2.0, // Adjust this value based on your needs
        displacementBias: -1.0, // Adjust to ensure displacement is above zero level
        metalness: 0.0,
        side: THREE.DoubleSide
      });
      
      // Ensure UV2 is defined for aoMap to work
      geometry.setAttribute('uv2', new THREE.BufferAttribute(geometry.attributes.uv.array, 2));
      
      const terrain = new THREE.Mesh(geometry, material);
      terrain.rotation.x = -Math.PI / 2; // Rotate to horizontal
      terrain.position.y = 0; // Exactly at zero level
      terrain.receiveShadow = true;
      
      return terrain;
    };
    
    // Create cross-section to show geological strata
    const createCrossSection = () => {
      const crossSectionGroup = new THREE.Group();
      
      for (let i = 0; i < strata.length - 1; i++) {
        const currentLayer = strata[i];
        const nextLayer = strata[i + 1];
        
        const layerHeight = nextLayer.height - currentLayer.height;
        const layerY = (currentLayer.height + nextLayer.height) / 2;
        
        // Create geometry for each layer
        const geometry = new THREE.BoxGeometry(width, layerHeight, depth);
        
        // Create appropriate material based on layer type
        let material;
        
        if (i < 2) { // Bedrock and Basalt - more reflective
          material = new THREE.MeshStandardMaterial({
            color: currentLayer.color,
            roughness: currentLayer.roughness,
            metalness: currentLayer.metalness,
            flatShading: true
          });
        } else {
          material = new THREE.MeshStandardMaterial({
            color: currentLayer.color,
            roughness: currentLayer.roughness,
            metalness: currentLayer.metalness,
            flatShading: true
          });
        }
        
        // Create mesh and position it
        const layer = new THREE.Mesh(geometry, material);
        layer.position.set(0, layerY, 0);
        layer.castShadow = true;
        layer.receiveShadow = true;
        
        // Add to the group
        crossSectionGroup.add(layer);
      }
      
      return crossSectionGroup;
    };
    
    // Create and add terrain elements
    const terrain = createTerrainSurface();
    scene.add(terrain);
    
    const crossSection = createCrossSection();
    scene.add(crossSection);
    
    // Camera controls setup
    let isRotating = false;
    let isPanning = false;
    let prevMouseX = 0;
    let prevMouseY = 0;
    let targetRotationY = 0;
    let targetRotationX = 0;
    let cameraDistance = 80;
    const cameraTarget = new THREE.Vector3(0, -5, 0); // Aim at the middle layers
    
    // Mouse event handlers
    const handleMouseDown = (event) => {
      if (event.button === 0) { // Left click
        isRotating = true;
      } else if (event.button === 2) { // Right click
        isPanning = true;
      }
      prevMouseX = event.clientX;
      prevMouseY = event.clientY;
      setIsInteractive(true);
    };
    
    const handleMouseMove = (event) => {
      if (isRotating) {
        const deltaX = event.clientX - prevMouseX;
        const deltaY = event.clientY - prevMouseY;
        
        targetRotationY += deltaX * 0.01;
        targetRotationX += deltaY * 0.01;
        
        // Limit vertical rotation
        targetRotationX = Math.max(-Math.PI / 2 + 0.1, Math.min(Math.PI / 2 - 0.1, targetRotationX));
        
        updateCameraPosition();
      } else if (isPanning) {
        const deltaX = (event.clientX - prevMouseX) * 0.1;
        const deltaY = (event.clientY - prevMouseY) * 0.1;
        
        // Calculate pan direction based on camera orientation
        const right = new THREE.Vector3();
        const up = new THREE.Vector3(0, 1, 0);
        camera.getWorldDirection(right);
        right.cross(up).normalize();
        
        cameraTarget.add(right.multiplyScalar(-deltaX));
        cameraTarget.y += deltaY * 0.5;
        
        updateCameraPosition();
      }
      
      prevMouseX = event.clientX;
      prevMouseY = event.clientY;
    };
    
    const handleMouseUp = () => {
      isRotating = false;
      isPanning = false;
    };
    
    const handleWheel = (event) => {
      cameraDistance += event.deltaY * 0.1;
      cameraDistance = Math.max(10, Math.min(150, cameraDistance));
      updateCameraPosition();
    };
    
    const handleContextMenu = (event) => {
      event.preventDefault();
    };
    
    const updateCameraPosition = () => {
      // Calculate camera position based on spherical coordinates
      const x = cameraDistance * Math.sin(targetRotationY) * Math.cos(targetRotationX);
      const y = cameraDistance * Math.sin(targetRotationX);
      const z = cameraDistance * Math.cos(targetRotationY) * Math.cos(targetRotationX);
      
      camera.position.set(
        x + cameraTarget.x,
        y + cameraTarget.y,
        z + cameraTarget.z
      );
      
      camera.lookAt(cameraTarget);
    };
    
    // Add event listeners
    if (renderer.domElement) {
      renderer.domElement.addEventListener('mousedown', handleMouseDown);
      renderer.domElement.addEventListener('mousemove', handleMouseMove);
      renderer.domElement.addEventListener('mouseup', handleMouseUp);
      window.addEventListener('mouseup', handleMouseUp); // Catch mouse up even outside the canvas
      renderer.domElement.addEventListener('wheel', handleWheel);
      renderer.domElement.addEventListener('contextmenu', handleContextMenu);
      
      // Ensure the canvas has the correct positioning
      renderer.domElement.style.position = 'absolute';
      renderer.domElement.style.top = '0';
      renderer.domElement.style.left = '0';
      renderer.domElement.style.zIndex = '0';
    }
    
    // Animation loop
    const animate = () => {
      renderer.render(scene, camera);
      requestAnimationFrame(animate);
    };
    
    animate();
    
    // Handle window resizing
    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    
    window.addEventListener('resize', handleResize);
    
    // Clean up
    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mouseup', handleMouseUp);
      
      if (renderer.domElement) {
        renderer.domElement.removeEventListener('mousedown', handleMouseDown);
        renderer.domElement.removeEventListener('mousemove', handleMouseMove);
        renderer.domElement.removeEventListener('mouseup', handleMouseUp);
        renderer.domElement.removeEventListener('wheel', handleWheel);
        renderer.domElement.removeEventListener('contextmenu', handleContextMenu);
      }
      
      if (mountRef.current && renderer.domElement) {
        mountRef.current.removeChild(renderer.domElement);
      }
      
      // Dispose of Three.js resources
      Object.values(mudTextures).forEach(texture => texture.dispose());
      renderer.dispose();
    };
  }, []);
  
  return (
    <div className="relative w-full h-screen" ref={mountRef}>
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-70 z-20">
          <div className="text-white text-center">
            <h3 className="text-xl mb-4">Loading Textures</h3>
            <div className="w-64 h-4 bg-gray-700 rounded-full overflow-hidden">
              <div 
                className="h-full bg-green-500 transition-all duration-300"
                style={{ width: `${loadingProgress}%` }}
              ></div>
            </div>
            <p className="mt-2">{loadingProgress}%</p>
          </div>
        </div>
      )}
      
      <div className="absolute top-4 left-4 bg-black bg-opacity-70 text-white p-4 rounded z-10 pointer-events-none">
        <h3 className="text-lg font-bold mb-2">Geological Layers</h3>
        <div className="text-sm">
          {isInteractive && <p className="text-green-400">✓ Interactivity working</p>}
          <p className="mb-2"><span className="font-bold">Controls:</span></p>
          <ul className="list-disc pl-4">
            <li>Left-click + drag: Rotate view</li>
            <li>Right-click + drag: Pan view</li>
            <li>Scroll wheel: Zoom in/out</li>
          </ul>
          
          <p className="mt-4 mb-2"><span className="font-bold">Geological Strata:</span></p>
          <div className="grid grid-cols-1 gap-1">
            <div><span className="inline-block w-3 h-3 bg-yellow-800 mr-2"></span> Topsoil/Mud (0m) ✓ Textured</div>
            <div><span className="inline-block w-3 h-3 bg-green-900 mr-2"></span> Soil (-2m)</div>
            <div><span className="inline-block w-3 h-3 bg-yellow-800 mr-2"></span> Clay (-6m)</div>
            <div><span className="inline-block w-3 h-3 bg-yellow-600 mr-2"></span> Sandstone (-12m)</div>
            <div><span className="inline-block w-3 h-3 bg-yellow-900 mr-2"></span> Shale (-18m)</div>
            <div><span className="inline-block w-3 h-3 bg-gray-600 mr-2"></span> Basalt (-24m)</div>
            <div><span className="inline-block w-3 h-3 bg-gray-700 mr-2"></span> Bedrock/Granite (-30m)</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TexturedGeologicalLayers;