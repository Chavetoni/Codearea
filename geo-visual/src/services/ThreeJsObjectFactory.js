// src/services/ThreeJsObjectFactory.js
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { createTextLabel, createMarker, createDepthMarkers } from '../utils/threeJsHelpers';

class ThreeJsObjectFactory {
  constructor() {
    // Constants for scaling
    this.BASE_DIMENSION_FOR_SCALING = 5;
  }
  
  createSoilCube(layers, options) {
    const {
      strataDimensions,
      viewMode,
      verticalSpacing,
      showLabels,
      showMarkers,
      showDepthMarkers,
      showConnectors
    } = options;
    
    if (!layers || layers.length === 0) return null;
    
    const currentMaxSize = Math.max(
      strataDimensions.width, 
      strataDimensions.depth, 
      this.BASE_DIMENSION_FOR_SCALING
    );
    
    const strataScaleFactor = Math.max(0.5, currentMaxSize / this.BASE_DIMENSION_FOR_SCALING);
    const soilCube = new THREE.Group();
    
    const totalActualDepth = layers.reduce(
      (sum, layer) => sum + (parseFloat(layer.depth) || 1), 
      0
    );
    
    const minVisualDimensionForStrata = Math.max(
      strataDimensions.width, 
      strataDimensions.depth, 
      5
    );
    
    const modelVisualHeight = Math.max(minVisualDimensionForStrata, totalActualDepth);
    const totalExplodedSpacing = (viewMode === 'exploded' && layers.length > 1) 
      ? (layers.length - 1) * verticalSpacing 
      : 0;
    
    const adjustedModelHeight = modelVisualHeight + totalExplodedSpacing;
    
    if (showDepthMarkers && layers.length > 0) {
      soilCube.add(
        createDepthMarkers(
          adjustedModelHeight,
          totalActualDepth,
          layers,
          strataDimensions.width,
          viewMode,
          verticalSpacing,
          strataScaleFactor
        )
      );
    }
    
    const layerPositionsForConnectors = [];
    let currentYPosition = 0;
    
    for (let i = 0; i < layers.length; i++) {
      const currentLayer = layers[i];
      const layerColorStr = currentLayer.color || '#CCCCCC';
      let colorHex = layerColorStr;
      
      try {
        new THREE.Color(colorHex);
      } catch (e) {
        colorHex = '#CCCCCC';
      }
      
      const layerColor = new THREE.Color(colorHex);
      const layerActualDepth = parseFloat(currentLayer.depth) || 1;
      
      const layerVisualHeight = (totalActualDepth > 0 
        ? (layerActualDepth / totalActualDepth) 
        : (layers.length > 0 ? 1 / layers.length : 0)) * modelVisualHeight;
      
      if (layerVisualHeight <= 0) continue;
      
      const layerGroup = new THREE.Group();
      const layerCenterY = currentYPosition - layerVisualHeight / 2;
      
      const geometry = new THREE.BoxGeometry(
        strataDimensions.width,
        layerVisualHeight,
        strataDimensions.depth
      );
      
      const material = new THREE.MeshStandardMaterial({
        color: layerColor,
        roughness: 0.7,
        metalness: 0.1
      });
      
      const layerMesh = new THREE.Mesh(geometry, material);
      layerMesh.position.y = layerCenterY;
      layerGroup.add(layerMesh);
      
      if (viewMode === 'exploded' && layers.length > 1) {
        layerPositionsForConnectors.push({
          top: currentYPosition,
          bottom: currentYPosition - layerVisualHeight
        });
      }
      
      const strataEdgeX = strataDimensions.width / 2;
      const strataEdgeZ = strataDimensions.depth / 2;
      const elementZOffset = 0.1 * strataScaleFactor;
      
      if (showMarkers) {
        const marker = createMarker(i + 1, strataScaleFactor);
        const markerGapFromEdge = 0.4 * strataScaleFactor;
        marker.position.set(
          strataEdgeX + markerGapFromEdge, 
          layerCenterY, 
          strataEdgeZ + elementZOffset
        );
        layerGroup.add(marker);
      }
      
      if (showLabels) {
        const labelText = `${currentLayer.name || 'Layer ' + (i + 1)}: ${currentLayer.description || 'No description'}`;
        const labelSprite = createTextLabel(labelText, colorHex, strataScaleFactor);
        
        // Position the label
        this.positionLayerLabel(
          layerGroup,
          labelSprite,
          showMarkers,
          strataEdgeX,
          strataEdgeZ,
          layerCenterY,
          elementZOffset,
          strataScaleFactor
        );
      }
      
      soilCube.add(layerGroup);
      currentYPosition = currentYPosition - layerVisualHeight;
      
      if (viewMode === 'exploded' && i < layers.length - 1 && layers.length > 1) {
        currentYPosition -= verticalSpacing;
      }
    }
    
    if (viewMode === 'exploded' && showConnectors && layerPositionsForConnectors.length > 1) {
      this.addLayerConnectors(
        soilCube,
        layerPositionsForConnectors,
        strataDimensions
      );
    }
    
    return soilCube;
  }
  
  positionLayerLabel(layerGroup, labelSprite, showMarkers, strataEdgeX, strataEdgeZ, 
                     layerCenterY, elementZOffset, strataScaleFactor) {
    const labelSpriteWorldWidth = labelSprite.scale.x;
    const lineToElementGap = 0.1 * strataScaleFactor;
    const labelGapFromMarkerOrEdge = 0.2 * strataScaleFactor;
    let labelAttachX;
    
    const lineMaterial = new THREE.LineBasicMaterial({color: 0xffffff});
    
    if (showMarkers) {
      const markerRadiusWorld = 0.2 * strataScaleFactor;
      const markerGapFromEdge = 0.4 * strataScaleFactor;
      const markerCenterX = strataEdgeX + markerGapFromEdge;
      const markerRightEdgeX = markerCenterX + markerRadiusWorld;
      const lineToMarkerEnd = markerCenterX - markerRadiusWorld - lineToElementGap;
      
      // Connect strata edge to marker
      layerGroup.add(new THREE.Line(
        new THREE.BufferGeometry().setFromPoints([
          new THREE.Vector3(strataEdgeX, layerCenterY, strataEdgeZ + elementZOffset * 0.5),
          new THREE.Vector3(lineToMarkerEnd, layerCenterY, strataEdgeZ + elementZOffset * 0.5)
        ]),
        lineMaterial
      ));
      
      labelAttachX = markerRightEdgeX + labelGapFromMarkerOrEdge;
      
      // Connect marker to label
      layerGroup.add(new THREE.Line(
        new THREE.BufferGeometry().setFromPoints([
          new THREE.Vector3(markerRightEdgeX + lineToElementGap, layerCenterY, strataEdgeZ + elementZOffset * 0.5),
          new THREE.Vector3(labelAttachX - lineToElementGap, layerCenterY, strataEdgeZ + elementZOffset * 0.5)
        ]),
        lineMaterial
      ));
    } else {
      labelAttachX = strataEdgeX + labelGapFromMarkerOrEdge;
      
      // Connect strata edge directly to label
      layerGroup.add(new THREE.Line(
        new THREE.BufferGeometry().setFromPoints([
          new THREE.Vector3(strataEdgeX, layerCenterY, strataEdgeZ + elementZOffset * 0.5),
          new THREE.Vector3(labelAttachX - lineToElementGap, layerCenterY, strataEdgeZ + elementZOffset * 0.5)
        ]),
        lineMaterial
      ));
    }
    
    labelSprite.position.set(
      labelAttachX + labelSpriteWorldWidth / 2,
      layerCenterY,
      strataEdgeZ + elementZOffset
    );
    
    layerGroup.add(labelSprite);
  }
  
  addLayerConnectors(soilCube, layerPositions, strataDimensions) {
    const lineMaterial = new THREE.LineBasicMaterial({
      color: 0xaaaaaa,
      opacity: 0.7,
      transparent: true
    });
    
    const connectorZ = strataDimensions.depth / 2;
    
    for (let i = 0; i < layerPositions.length - 1; i++) {
      const upperLayer = layerPositions[i];
      const lowerLayer = layerPositions[i+1];
      const connectorStartY = upperLayer.bottom;
      const connectorEndY = lowerLayer.top;
      
      // Right side connector
      soilCube.add(new THREE.Line(
        new THREE.BufferGeometry().setFromPoints([
          new THREE.Vector3(strataDimensions.width / 2, connectorStartY, connectorZ),
          new THREE.Vector3(strataDimensions.width / 2, connectorEndY, connectorZ)
        ]),
        lineMaterial
      ));
      
      // Left side connector
      soilCube.add(new THREE.Line(
        new THREE.BufferGeometry().setFromPoints([
          new THREE.Vector3(-strataDimensions.width / 2, connectorStartY, connectorZ),
          new THREE.Vector3(-strataDimensions.width / 2, connectorEndY, connectorZ)
        ]),
        lineMaterial
      ));
    }
  }
  
  createBoreholeMarkers(boreholes) {
    const group = new THREE.Group();
    const markerRadius = 0.25;
    const markerHeight = 1.5;
    const markerMaterial = new THREE.MeshStandardMaterial({
      color: 0xff0000,
      roughness: 0.5,
      metalness: 0.1
    });
    
    boreholes.forEach(bh => {
      const geometry = new THREE.CylinderGeometry(
        markerRadius,
        markerRadius,
        markerHeight,
        16
      );
      
      const cylinder = new THREE.Mesh(geometry, markerMaterial);
      cylinder.position.set(bh.x, bh.y + markerHeight / 2, bh.z);
      
      const boreholeLabelRenderScaleFactor = 1.0;
      const labelSprite = createTextLabel(bh.name, '#cc0000', boreholeLabelRenderScaleFactor);
      const yOffsetForLabel = markerHeight + (labelSprite.scale.y / 2) + 0.2;
      
      labelSprite.position.set(bh.x, bh.y + yOffsetForLabel, bh.z);
      
      group.add(labelSprite);
      group.add(cylinder);
    });
    
    return group;
  }
  
  loadGLTF(fileContent, onSuccess, onError) {
    const loader = new GLTFLoader();
    
    try {
      loader.parse(
        fileContent,
        '',
        (gltf) => {
          if (!gltf || !gltf.scene) {
            if (onError) onError(new Error("Invalid GLTF structure"));
            return;
          }
          
          const modelScene = gltf.scene;
          
          try {
            // Center and scale the model
            modelScene.updateMatrixWorld(true);
            const box = new THREE.Box3().setFromObject(modelScene);
            
            if (!box.isEmpty() &&
                box.max instanceof THREE.Vector3 &&
                box.min instanceof THREE.Vector3 &&
                Number.isFinite(box.max.x) &&
                Number.isFinite(box.min.x)) {
              
              const center = box.getCenter(new THREE.Vector3());
              modelScene.position.sub(center);
              modelScene.updateMatrixWorld(true);
            }
          } catch (calcError) {
            console.error("Error during map processing:", calcError);
          }
          
          if (onSuccess) onSuccess(modelScene);
        },
        (error) => {
          if (onError) onError(error);
        }
      );
    } catch (error) {
      if (onError) onError(error);
    }
  }
}

export default ThreeJsObjectFactory;