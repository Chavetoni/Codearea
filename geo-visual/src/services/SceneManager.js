// src/services/SceneManager.js
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import ThreeJsObjectFactory from './ThreeJsObjectFactory';

class SceneManager {
  constructor(container) {
    // Core Three.js objects
    this.scene = new THREE.Scene();
    this.camera = null;
    this.renderer = null;
    this.controls = null;
    this.container = container;
    this.factory = new ThreeJsObjectFactory();
    
    // Scene objects references
    this.soilCube = null;
    this.groundGrid = null;
    this.siteMap = null;
    this.boreholeMarkersGroup = null;
    
    // Constants
    this.GROUND_GRID_SIZE = 100;
    this.GROUND_GRID_DIVISIONS = 50;
    
    this.initialize();
  }
  
  initialize() {
    const width = this.container.clientWidth;
    const height = this.container.clientHeight;
    
    // Create scene with fog
    const backgroundColor = 0xd1d5db;
    this.scene.background = new THREE.Color(backgroundColor);
    const fogNear = this.GROUND_GRID_SIZE * 0.75;
    const fogFar = this.GROUND_GRID_SIZE * 2.5;
    this.scene.fog = new THREE.Fog(backgroundColor, fogNear, fogFar);
    
    // Create camera
    this.camera = new THREE.PerspectiveCamera(
      60, 
      width / height, 
      0.1, 
      this.GROUND_GRID_SIZE * 5
    );
    this.camera.position.set(
      this.GROUND_GRID_SIZE / 3, 
      this.GROUND_GRID_SIZE / 4, 
      this.GROUND_GRID_SIZE / 3
    );
    
    // Create renderer
    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.autoClear = true;
    
    // Clear container and add renderer
    while (this.container.firstChild) {
      this.container.removeChild(this.container.firstChild);
    }
    this.container.appendChild(this.renderer.domElement);
    
    // Setup lighting
    this.setupLights();
    
    // Setup controls
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.05;
    this.controls.minDistance = 1;
    this.controls.maxDistance = this.GROUND_GRID_SIZE * 2;
    this.controls.target.set(0, 0, 0);
    this.controls.panSpeed = 1.5;
    this.controls.update();
  }
  
  setupLights() {
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    this.scene.add(ambientLight);
    
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1.2);
    directionalLight.position.set(
      this.GROUND_GRID_SIZE / 2, 
      this.GROUND_GRID_SIZE / 1.5, 
      this.GROUND_GRID_SIZE / 2
    );
    this.scene.add(directionalLight);
    
    const backLight = new THREE.DirectionalLight(0xffffff, 0.6);
    backLight.position.set(
      -this.GROUND_GRID_SIZE / 2, 
      this.GROUND_GRID_SIZE / 3, 
      -this.GROUND_GRID_SIZE / 2
    );
    this.scene.add(backLight);
  }
  
  render() {
    if (this.controls) this.controls.update();
    if (this.renderer && this.scene && this.camera) {
      this.renderer.render(this.scene, this.camera);
    }
  }
  
  handleResize() {
    if (!this.container || !this.renderer || !this.camera) return;
    
    const width = this.container.clientWidth;
    const height = this.container.clientHeight;
    
    if (width > 0 && height > 0) {
      this.camera.aspect = width / height;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(width, height);
    }
  }
  
  createGroundGrid(showGrid) {
    if (this.groundGrid) {
      this.scene.remove(this.groundGrid);
      this.groundGrid.geometry.dispose();
      if (Array.isArray(this.groundGrid.material)) {
        this.groundGrid.material.forEach(m => m.dispose());
      } else {
        this.groundGrid.material.dispose();
      }
      this.groundGrid = null;
    }
    
    if (showGrid) {
      const gridHelper = new THREE.GridHelper(
        this.GROUND_GRID_SIZE, 
        this.GROUND_GRID_DIVISIONS, 
        0x888888, 
        0xbbbbbb
      );
      gridHelper.position.y = 0;
      this.groundGrid = gridHelper;
      this.scene.add(gridHelper);
    }
  }
  
  createSoilLayers(layers, options) {
    const {
      strataDimensions,
      viewMode,
      verticalSpacing,
      showLabels,
      showMarkers,
      showDepthMarkers,
      showConnectors,
      showStrata
    } = options;
    
    // Remove existing soil cube
    if (this.soilCube) {
      this.scene.remove(this.soilCube);
      this.disposeObject(this.soilCube);
      this.soilCube = null;
    }
    
    if (layers.length === 0 || !showStrata) return;
    
    // Create new soil layers
    this.soilCube = this.factory.createSoilCube(
      layers,
      {
        strataDimensions,
        viewMode,
        verticalSpacing,
        showLabels,
        showMarkers,
        showDepthMarkers,
        showConnectors
      }
    );
    
    this.scene.add(this.soilCube);
  }
  
  createBoreholeMarkers(boreholes) {
    if (this.boreholeMarkersGroup) {
      this.scene.remove(this.boreholeMarkersGroup);
      this.disposeObject(this.boreholeMarkersGroup);
      this.boreholeMarkersGroup = null;
    }
    
    if (!boreholes || boreholes.length === 0) return;
    
    this.boreholeMarkersGroup = this.factory.createBoreholeMarkers(boreholes);
    this.scene.add(this.boreholeMarkersGroup);
  }
  
  loadSiteMap(fileContent, onSuccess, onError) {
    try {
      // Remove existing site map
      if (this.siteMap) {
        this.scene.remove(this.siteMap);
        this.disposeObject(this.siteMap);
        this.siteMap = null;
      }
      
      this.factory.loadGLTF(
        fileContent,
        (model) => {
          this.siteMap = model;
          this.scene.add(this.siteMap);
          if (onSuccess) onSuccess(model);
        },
        onError
      );
    } catch (error) {
      if (onError) onError(error);
    }
  }
  
  updateSiteMapProps(props) {
    if (!this.siteMap) return;
    
    const { position, scale, visible, opacity } = props;
    
    this.siteMap.position.set(position.x, position.y, position.z);
    this.siteMap.scale.set(scale.x, scale.y, scale.z);
    this.siteMap.visible = visible;
    
    this.siteMap.traverse((object) => {
      if (object.isMesh) {
        const materials = Array.isArray(object.material) 
          ? object.material 
          : [object.material];
        
        materials.forEach(material => {
          if (material) {
            material.transparent = opacity < 1.0;
            material.opacity = opacity;
            material.needsUpdate = true;
          }
        });
      }
    });
    
    this.siteMap.updateMatrixWorld(true);
  }
  
  createRaycaster() {
    return new THREE.Raycaster();
  }
  
  getIntersectionPoint(event, canvasElement, raycaster) {
    if (!canvasElement || !this.camera) return null;
    
    const rect = canvasElement.getBoundingClientRect();
    const mouse = new THREE.Vector2();
    mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
    
    raycaster.setFromCamera(mouse, this.camera);
    
    const potentialTargets = [];
    
    if (this.siteMap && this.siteMap.visible) {
      potentialTargets.push(this.siteMap);
    }
    
    if (this.groundGrid && this.groundGrid.visible) {
      potentialTargets.push(this.groundGrid);
    }
    
    if (potentialTargets.length > 0) {
      const intersects = raycaster.intersectObjects(potentialTargets, true);
      
      if (intersects.length > 0) {
        return intersects[0].point;
      }
    }
    
    // Try Y=0 plane as fallback
    const plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
    const intersectionPoint = new THREE.Vector3();
    
    if (raycaster.ray.intersectPlane(plane, intersectionPoint)) {
      return intersectionPoint;
    }
    
    return null;
  }
  
  disposeObject(object) {
    if (!object) return;
    
    object.traverse(child => {
      if (child.geometry) {
        child.geometry.dispose();
      }
      
      if (child.material) {
        if (Array.isArray(child.material)) {
          child.material.forEach(material => {
            if (material.map) material.map.dispose();
            if (material.dispose) material.dispose();
          });
        } else {
          if (child.material.map) child.material.map.dispose();
          if (child.material.dispose) child.material.dispose();
        }
      }
    });
  }
  
  dispose() {
    // Dispose all objects
    if (this.soilCube) {
      this.scene.remove(this.soilCube);
      this.disposeObject(this.soilCube);
    }
    
    if (this.groundGrid) {
      this.scene.remove(this.groundGrid);
      this.disposeObject(this.groundGrid);
    }
    
    if (this.siteMap) {
      this.scene.remove(this.siteMap);
      this.disposeObject(this.siteMap);
    }
    
    if (this.boreholeMarkersGroup) {
      this.scene.remove(this.boreholeMarkersGroup);
      this.disposeObject(this.boreholeMarkersGroup);
    }
    
    // Dispose renderer
    if (this.renderer) {
      if (this.container && this.container.contains(this.renderer.domElement)) {
        this.container.removeChild(this.renderer.domElement);
      }
      this.renderer.dispose();
    }
    
    // Dispose controls
    if (this.controls) {
      this.controls.dispose();
    }
    
    // Clear references
    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.controls = null;
    this.soilCube = null;
    this.groundGrid = null;
    this.siteMap = null;
    this.boreholeMarkersGroup = null;
  }
}

export default SceneManager;