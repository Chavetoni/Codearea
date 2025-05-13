// src/utils/threeJsHelpers.js
import * as THREE from 'three';

// Constants
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

export function createTextLabel(text, colorHexInput, strataScaleFactor = 1) {
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');
  
  const scaledFontSize = Math.max(10, Math.min(50, BASE_LABEL_FONT_SIZE * strataScaleFactor));
  const scaledPadding = BASE_LABEL_PADDING * strataScaleFactor;
  const scaledMaxWidth = BASE_LABEL_MAX_WIDTH * strataScaleFactor;
  const scaledLineHeight = scaledFontSize * 1.2;
  const scaledBorderRadius = BASE_LABEL_BORDER_RADIUS * strataScaleFactor;
  
  context.font = `bold ${scaledFontSize}px Arial`;
  
  // Word wrap
  const words = text.split(' ');
  let lines = [];
  let currentLine = '';
  
  for (let i = 0; i < words.length; i++) {
    const testLine = currentLine + words[i] + ' ';
    const metrics = context.measureText(testLine);
    
    if (metrics.width > scaledMaxWidth && i > 0) {
      lines.push(currentLine.trim());
      currentLine = words[i] + ' ';
    } else {
      currentLine = testLine;
    }
  }
  
  lines.push(currentLine.trim());
  
  const textHeight = lines.length * scaledLineHeight;
  const textWidth = Math.max(...lines.map(line => context.measureText(line).width));
  
  canvas.width = textWidth + scaledPadding * 2;
  canvas.height = textHeight + scaledPadding * 2;
  
  // Background
  let colorHex = colorHexInput;
  if (typeof colorHex !== 'string' || !colorHex.startsWith('#')) {
    colorHex = '#CCCCCC';
  }
  
  const rgbColor = new THREE.Color(colorHex);
  const backgroundColor = `rgba(${Math.floor(rgbColor.r * 255)}, ${Math.floor(rgbColor.g * 255)}, ${Math.floor(rgbColor.b * 255)}, 0.8)`;
  
  context.fillStyle = backgroundColor;
  context.beginPath();
  context.moveTo(scaledBorderRadius, 0);
  context.lineTo(canvas.width - scaledBorderRadius, 0);
  context.quadraticCurveTo(canvas.width, 0, canvas.width, scaledBorderRadius);
  context.lineTo(canvas.width, canvas.height - scaledBorderRadius);
  context.quadraticCurveTo(canvas.width, canvas.height, canvas.width - scaledBorderRadius, canvas.height);
  context.lineTo(scaledBorderRadius, canvas.height);
  context.quadraticCurveTo(0, canvas.height, 0, canvas.height - scaledBorderRadius);
  context.lineTo(0, scaledBorderRadius);
  context.quadraticCurveTo(0, 0, scaledBorderRadius, 0);
  context.closePath();
  context.fill();
  
  // Text
  context.font = `bold ${scaledFontSize}px Arial`;
  context.fillStyle = '#ffffff';
  context.textAlign = 'left';
  context.textBaseline = 'top';
  
  let currentY = scaledPadding;
  lines.forEach(line => {
    context.fillText(line, scaledPadding, currentY);
    currentY += scaledLineHeight;
  });
  
  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  
  const material = new THREE.SpriteMaterial({
    map: texture,
    transparent: true,
    depthTest: false
  });
  
  const sprite = new THREE.Sprite(material);
  sprite.scale.set(
    canvas.width * BASE_SPRITE_SCALE_FACTOR,
    canvas.height * BASE_SPRITE_SCALE_FACTOR,
    1
  );
  
  return sprite;
}

export function createMarker(number, strataScaleFactor = 1) {
  const group = new THREE.Group();
  
  const scaledRadius = BASE_MARKER_RADIUS * strataScaleFactor;
  const segments = 32;
  
  const circleGeometry = new THREE.CircleGeometry(scaledRadius, segments);
  const circleMaterial = new THREE.MeshBasicMaterial({
    color: 0x333333,
    side: THREE.DoubleSide
  });
  
  group.add(new THREE.Mesh(circleGeometry, circleMaterial));
  
  // Create text label
  const canvas = document.createElement('canvas');
  const textCanvasSize = BASE_MARKER_TEXT_CANVAS_SIZE * Math.sqrt(strataScaleFactor);
  
  canvas.width = textCanvasSize;
  canvas.height = textCanvasSize;
  
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#ffffff';
  
  const scaledFontSizeForMarker = Math.max(10, Math.min(48, BASE_MARKER_FONT_SIZE * Math.sqrt(strataScaleFactor)));
  
  ctx.font = `bold ${scaledFontSizeForMarker}px Arial`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(number.toString(), textCanvasSize / 2, textCanvasSize / 2);
  
  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  
  const labelMaterial = new THREE.MeshBasicMaterial({
    map: texture,
    side: THREE.DoubleSide,
    transparent: true,
    depthTest: false
  });
  
  const label = new THREE.Mesh(
    new THREE.CircleGeometry(scaledRadius, segments),
    labelMaterial
  );
  
  label.position.z = 0.01 * strataScaleFactor;
  group.add(label);
  
  return group;
}

export function createDepthMarkers(
  adjustedModelHeight,
  totalActualDepth,
  layerData,
  currentCubeWidth,
  viewMode,
  verticalSpacing,
  strataScaleFactor = 1
) {
  if (adjustedModelHeight <= 0) return new THREE.Group();
  
  const group = new THREE.Group();
  const markerMaterial = new THREE.LineBasicMaterial({ color: 0xffffff });
  
  const scaledMainLineOffset = BASE_DEPTH_MARKER_MAIN_LINE_OFFSET * strataScaleFactor;
  const lineXPosition = -currentCubeWidth / 2 - scaledMainLineOffset;
  const scaledTickLength = BASE_DEPTH_MARKER_TICK_LENGTH * strataScaleFactor;
  
  // Add main vertical line
  group.add(new THREE.Line(
    new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(lineXPosition, 0, 0),
      new THREE.Vector3(lineXPosition, -adjustedModelHeight, 0)
    ]),
    markerMaterial
  ));
  
  // Calculate positions for depth markers
  const depthPositions = [];
  let currentYForMarker = 0;
  let runningActualDepth = 0;
  
  depthPositions.push({ depth: 0, yPosition: currentYForMarker });
  
  const totalExplodedSpacingForCalc = (viewMode === 'exploded' && layerData.length > 1)
    ? (layerData.length - 1) * verticalSpacing
    : 0;
    
  const modelHeightWithoutSpacing = adjustedModelHeight - totalExplodedSpacingForCalc;
  
  for (let i = 0; i < layerData.length; i++) {
    const layerActualDepth = parseFloat(layerData[i]?.depth) || 1;
    
    const layerVisualHeight = (totalActualDepth > 0
      ? (layerActualDepth / totalActualDepth)
      : (layerData.length > 0 ? 1 / layerData.length : 0)) * modelHeightWithoutSpacing;
      
    currentYForMarker -= layerVisualHeight;
    runningActualDepth += layerActualDepth;
    
    depthPositions.push({
      depth: parseFloat(runningActualDepth.toFixed(1)),
      yPosition: currentYForMarker
    });
    
    if (viewMode === 'exploded' && i < layerData.length - 1) {
      currentYForMarker -= verticalSpacing;
    }
  }
  
  // Special case handling for edge cases
  if (layerData.length === 0 && adjustedModelHeight > 0 && depthPositions.length === 1) {
    depthPositions.push({ depth: 0, yPosition: -adjustedModelHeight });
  } else if (layerData.length > 0 && Math.abs(currentYForMarker - (-adjustedModelHeight)) > 0.01) {
    if (Math.abs(depthPositions[depthPositions.length - 1].yPosition - (-adjustedModelHeight)) > 0.01) {
      depthPositions.push({
        depth: parseFloat(totalActualDepth.toFixed(1)),
        yPosition: -adjustedModelHeight
      });
    }
  }
  
  // Create tick marks and labels for all depth positions
  depthPositions.forEach(item => {
    // Add tick mark
    group.add(new THREE.Line(
      new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(lineXPosition, item.yPosition, 0),
        new THREE.Vector3(lineXPosition - scaledTickLength, item.yPosition, 0)
      ]),
      markerMaterial
    ));
    
    // Create depth label
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    const text = `${item.depth.toFixed(1)}'`;
    
    const scaledFontSize = Math.max(10, Math.min(50, BASE_DEPTH_LABEL_FONT_SIZE * strataScaleFactor));
    const scaledPadding = BASE_DEPTH_LABEL_PADDING * strataScaleFactor;
    
    context.font = `bold ${scaledFontSize}px Arial`;
    const textWidth = context.measureText(text).width;
    
    canvas.width = textWidth + scaledPadding * 2;
    canvas.height = scaledFontSize + scaledPadding * 2;
    
    context.font = `bold ${scaledFontSize}px Arial`;
    context.fillStyle = '#ffffff';
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    context.fillText(text, canvas.width / 2, canvas.height / 2);
    
    const texture = new THREE.CanvasTexture(canvas);
    texture.needsUpdate = true;
    
    const labelMaterial = new THREE.MeshBasicMaterial({
      map: texture,
      side: THREE.DoubleSide,
      transparent: true,
      depthTest: false
    });
    
    const labelMesh = new THREE.Mesh(
      new THREE.PlaneGeometry(
        canvas.width * BASE_DEPTH_LABEL_PLANE_SCALE,
        canvas.height * BASE_DEPTH_LABEL_PLANE_SCALE
      ),
      labelMaterial
    );
    
    const labelWorldWidth = canvas.width * BASE_DEPTH_LABEL_PLANE_SCALE;
    const scaledGapFromTick = BASE_DEPTH_MARKER_TEXT_GAP * strataScaleFactor;
    
    labelMesh.position.set(
      lineXPosition - scaledTickLength - scaledGapFromTick - (labelWorldWidth / 2),
      item.yPosition,
      0
    );
    
    group.add(labelMesh);
  });
  
  return group;
}