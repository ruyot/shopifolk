// Shopifolk - Animation Script
import { animate } from 'animejs';

// Configuration
const CONFIG = {
  nodeSize: 3.5,          // Diameter of each node circle
  samplingGap: 5,       // Distance between sample points
  logoScale: 4,          // Scale up the logo for more detail
  // Hover animation settings
  hoverRadius: 2,      // Max distance nodes float from center
  hoverDurationMin: 2000, // Minimum animation duration (ms)
  hoverDurationMax: 4000, // Maximum animation duration (ms)
  // Colors from the SVG
  lightGreen: '#95BF47', // Main bag color
  darkGreen: '#5E8E3E',  // Shadow/side color
};

// Store all node elements and their positions
let nodes = [];
let logoPositions = []; // Original positions forming the logo

// Wait for DOM to be ready
document.addEventListener('DOMContentLoaded', init);

async function init() {
  console.log('Initializing Shopifolk...');

  // Sample the logo to get node positions
  logoPositions = await sampleLogoForNodes();
  console.log(`Found ${logoPositions.length} node positions`);

  // Create DOM elements for each node
  createNodeElements(logoPositions);

  // Start the floating/hover animation
  startHoverAnimation();
}

/**
 * Load the SVG logo, render to canvas, and sample pixel positions
 * Returns array of {x, y, color} with positions and colors for nodes
 */
async function sampleLogoForNodes() {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';

    img.onload = () => {
      // Create offscreen canvas
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      // Scale up for more detail
      const width = img.width * CONFIG.logoScale;
      const height = img.height * CONFIG.logoScale;
      canvas.width = width;
      canvas.height = height;

      // Draw the logo
      ctx.drawImage(img, 0, 0, width, height);

      // Sample pixels
      const positions = [];
      const imageData = ctx.getImageData(0, 0, width, height);
      const data = imageData.data;

      for (let y = 0; y < height; y += CONFIG.samplingGap) {
        for (let x = 0; x < width; x += CONFIG.samplingGap) {
          const index = (y * width + x) * 4;
          const r = data[index];
          const g = data[index + 1];
          const b = data[index + 2];
          const a = data[index + 3];

          // Skip transparent pixels
          if (a < 128) continue;

          // Skip white pixels (the S cutout) - check if it's close to white
          if (r > 240 && g > 240 && b > 240) continue;

          // Determine if this is dark green (shadow) or light green (main)
          // Dark green in SVG is #5E8E3E (R:94, G:142, B:62)
          // Light green is #95BF47 (R:149, G:191, B:71)
          const isDarkGreen = r < 120 && g < 160;
          const color = isDarkGreen ? CONFIG.darkGreen : CONFIG.lightGreen;

          positions.push({
            x,
            y,
            color
          });
        }
      }

      resolve(positions);
    };

    img.src = 'shopify_glyph.svg';
  });
}

/**
 * Create DOM elements for each node and position them
 */
function createNodeElements(positions) {
  const container = document.querySelector('.container');

  // Calculate offset to center the logo
  const logoWidth = 109.5 * CONFIG.logoScale;
  const logoHeight = 124.5 * CONFIG.logoScale;
  const offsetX = (window.innerWidth - logoWidth) / 2;
  const offsetY = (window.innerHeight - logoHeight) / 2;

  positions.forEach((pos, index) => {
    const node = document.createElement('div');
    node.className = 'node';
    node.style.left = `${pos.x + offsetX}px`;
    node.style.top = `${pos.y + offsetY}px`;
    node.style.width = `${CONFIG.nodeSize}px`;
    node.style.height = `${CONFIG.nodeSize}px`;
    node.style.backgroundColor = pos.color;
    node.dataset.index = index;

    container.appendChild(node);
    nodes.push({
      element: node,
      logoX: pos.x + offsetX,
      logoY: pos.y + offsetY,
      color: pos.color
    });
  });

  console.log(`Created ${nodes.length} node elements`);
}

/**
 * Start subtle floating animation for all nodes
 * Each node oscillates within its hover radius with random timing
 */
function startHoverAnimation() {
  nodes.forEach((nodeData) => {
    animateNodeHover(nodeData);
  });
}

/**
 * Animate a single node's hover/float motion
 */
function animateNodeHover(nodeData) {
  // Random target offset within hover radius
  const angle = Math.random() * Math.PI * 2;
  const distance = Math.random() * CONFIG.hoverRadius;
  const targetX = nodeData.logoX + Math.cos(angle) * distance;
  const targetY = nodeData.logoY + Math.sin(angle) * distance;

  // Random duration for organic feel
  const duration = CONFIG.hoverDurationMin +
    Math.random() * (CONFIG.hoverDurationMax - CONFIG.hoverDurationMin);

  animate(nodeData.element, {
    left: `${targetX}px`,
    top: `${targetY}px`,
    duration: duration,
    ease: 'inOutSine',
    onComplete: () => {
      // Continue with next random position
      animateNodeHover(nodeData);
    }
  });
}
