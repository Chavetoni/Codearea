import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

const FlatGeologicalLayers = () => {
  const mountRef = useRef(null);
  
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
    mountRef.current.appendChild(renderer.domElement);
    
    // Lighting
    const ambientLight = new THREE.AmbientLight(0x606060, 1.5);
    scene.add(ambientLight);
    
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(1, 1, 1);
    scene.add(directionalLight);
    
    // Terrain dimensions
    const width = 100;
    const depth = 100;
    const crossSectionWidth = width;
    const crossSectionDepth = depth / 2;
    
    // Define geological strata layers - simple flat layers with improved colors
    const strata = [
      { height: -30, color: new THREE.Color(0x2F2F2F), name: "Bedrock (Granite)" },
      { height: -24, color: new THREE.Color(0x4D4D4D), name: "Basalt" },
      { height: -18, color: new THREE.Color(0x804000), name: "Shale" },
      { height: -12, color: new THREE.Color(0xDEB887), name: "Sandstone" },
      { height: -6, color: new THREE.Color(0x9B2D06), name: "Clay" },
      { height: -2, color: new THREE.Color(0x3A5311), name: "Soil" },
      { height: 0, color: new THREE.Color(0x228B22), name: "Topsoil/Vegetation" }
    ];
    
    // Create flat terrain surface
    const createTerrainSurface = () => {
      // Make the surface slightly larger than the cross-section for better coverage
      const geometry = new THREE.PlaneGeometry(width * 1.1, depth * 1.1);
      const material = new THREE.MeshPhongMaterial({
        color: 0x228B22, // Green surface (topsoil/vegetation)
        side: THREE.DoubleSide,
        flatShading: true
      });
      
      const terrain = new THREE.Mesh(geometry, material);
      terrain.rotation.x = -Math.PI / 2; // Rotate to horizontal
      terrain.position.y = 0.01; // Slightly above zero to avoid z-fighting
      
      return terrain;
    };
    
    // Create cross-section to show geological strata - completely redesigned for stability
    const createCrossSection = () => {
      // Create the group to hold all strata layers
      const crossSectionGroup = new THREE.Group();
      
      // Use a different approach - create a single geometry for each layer
      // This avoids z-fighting and provides better visual consistency
      for (let i = 0; i < strata.length - 1; i++) {
        const currentLayer = strata[i];
        const nextLayer = strata[i + 1];
        
        const layerHeight = nextLayer.height - currentLayer.height;
        const layerY = (currentLayer.height + nextLayer.height) / 2;
        
        // Create solid block geometry
        const geometry = new THREE.BoxGeometry(
          width * 1.2,  // Make wider to ensure full coverage
          layerHeight,
          depth / 2 * 1.2  // Half depth but ensure full coverage
        );
        
        // Create material with no transparency for better rendering
        const material = new THREE.MeshPhongMaterial({
          color: currentLayer.color,
          flatShading: true,
          shininess: 5,
          transparent: false
        });
        
        // Create mesh and position it - ensure precise positioning
        const layer = new THREE.Mesh(geometry, material);
        layer.position.set(0, layerY, depth / 4);
        
        // Set render order to prevent z-fighting
        layer.renderOrder = i;
        
        // Add to the group
        crossSectionGroup.add(layer);
      }
      
      // Add cutaway plane at the bottom with opacity 0 so it's invisible
      // but still creates the "cut" effect properly
      const cutPlaneGeometry = new THREE.PlaneGeometry(width * 2, Math.abs(strata[0].height) * 3);
      const cutPlaneMaterial = new THREE.MeshBasicMaterial({
        color: 0xc0e0ff,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0 // Completely invisible
      });
      
      const cutPlane = new THREE.Mesh(cutPlaneGeometry, cutPlaneMaterial);
      cutPlane.position.set(0, strata[0].height / 2, 0);
      cutPlane.rotation.x = Math.PI / 2;
      
      // Add cut plane to the group
      crossSectionGroup.add(cutPlane);
      
      return crossSectionGroup;
    };
    
    // Create and add terrain elements
    const terrain = createTerrainSurface();
    scene.add(terrain);
    
    const crossSection = createCrossSection();
    scene.add(crossSection);
    
    // No grid helper - we'll use just the solid green surface
    
    // No axis helper
    
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
    renderer.domElement.addEventListener('mousedown', handleMouseDown);
    renderer.domElement.addEventListener('mousemove', handleMouseMove);
    renderer.domElement.addEventListener('mouseup', handleMouseUp);
    renderer.domElement.addEventListener('wheel', handleWheel);
    renderer.domElement.addEventListener('contextmenu', handleContextMenu);
    
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
      renderer.domElement.removeEventListener('mousedown', handleMouseDown);
      renderer.domElement.removeEventListener('mousemove', handleMouseMove);
      renderer.domElement.removeEventListener('mouseup', handleMouseUp);
      renderer.domElement.removeEventListener('wheel', handleWheel);
      renderer.domElement.removeEventListener('contextmenu', handleContextMenu);
      
      if (mountRef.current) {
        mountRef.current.removeChild(renderer.domElement);
      }
    };
  }, []);
  
  return (
    <div className="w-full h-screen" ref={mountRef}>
      <div className="absolute top-4 left-4 bg-black bg-opacity-70 text-white p-4 rounded">
        <h3 className="text-lg font-bold mb-2">Flat Terrain with Geological Layers</h3>
        <div className="text-sm">
          <p className="mb-2"><span className="font-bold">Controls:</span></p>
          <ul className="list-disc pl-4">
            <li>Left-click + drag: Rotate view</li>
            <li>Right-click + drag: Pan view</li>
            <li>Scroll wheel: Zoom in/out</li>
          </ul>
          
          <p className="mt-4 mb-2"><span className="font-bold">Geological Strata:</span></p>
          <div className="grid grid-cols-1 gap-1">
            <div><span className="inline-block w-3 h-3 bg-green-600 mr-2"></span> Topsoil/Vegetation (0m)</div>
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

export default FlatGeologicalLayers;