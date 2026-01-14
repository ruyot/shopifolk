// Shopifolk - Animation Script
// Using anime.js v4.0

// Configuration
const CONFIG = {
  nodeSize: 6,           // Diameter of each node circle
  samplingGap: 6,        // Distance between sample points
  logoScale: 4,          // Scale up the logo for more detail
  nodeColor: '#95BF47',  // Shopify green
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
}

/**
 * Load the SVG logo, render to canvas, and sample pixel positions
 * Returns array of {x, y} positions where nodes should be placed
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

          // This is a green pixel - add a node position
          positions.push({ x, y });
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
    node.dataset.index = index;

    container.appendChild(node);
    nodes.push({
      element: node,
      logoX: pos.x + offsetX,
      logoY: pos.y + offsetY
    });
  });

  console.log(`Created ${nodes.length} node elements`);
}
