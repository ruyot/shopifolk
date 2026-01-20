import { animate, stagger, splitText } from 'animejs';

const CONFIG = {
  nodeSize: 3.5,
  samplingGap: 5,
  logoScale: 4,
  hoverRadius: 2,
  hoverDurationMin: 2000,
  hoverDurationMax: 4000,
  mouseRadius: 35,
  repelStrength: 25,
  repelDuration: 150,
  returnDuration: 400,
  lightGreen: '#95BF47',
  darkGreen: '#5E8E3E',
  textAnimDelay: 500,
  textAnimDuration: 600,
  textStaggerDelay: 150,
  centerAdjustX: 0,
  centerAdjustY: 0,
};

let nodes = [];
let logoPositions = [];
let mouseX = -1000;
let mouseY = -1000;

document.addEventListener('DOMContentLoaded', init);

async function init() {
  logoPositions = await sampleLogoForNodes();
  createNodeElements(logoPositions);
  startHoverAnimation();
  setupMouseRepel();
  animateTextIn();
}

async function sampleLogoForNodes() {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';

    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const width = img.width * CONFIG.logoScale;
      const height = img.height * CONFIG.logoScale;
      canvas.width = width;
      canvas.height = height;
      ctx.drawImage(img, 0, 0, width, height);

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

          if (a < 128) continue;
          if (r > 240 && g > 240 && b > 240) continue;

          const isDarkGreen = r < 120 && g < 160;
          const color = isDarkGreen ? CONFIG.darkGreen : CONFIG.lightGreen;

          positions.push({ x, y, color });
        }
      }

      resolve(positions);
    };

    img.src = 'shopify_glyph.svg';
  });
}

function createNodeElements(positions) {
  const container = document.querySelector('.container');

  const minX = Math.min(...positions.map(p => p.x));
  const maxX = Math.max(...positions.map(p => p.x));
  const minY = Math.min(...positions.map(p => p.y));
  const maxY = Math.max(...positions.map(p => p.y));

  const logoWidth = maxX - minX;
  const logoHeight = maxY - minY;

  const viewW = window.innerWidth;
  const viewH = window.innerHeight;

  const offsetX = (viewW - logoWidth) / 2 - minX + CONFIG.centerAdjustX;
  const offsetY = (viewH - logoHeight) / 2 - minY + CONFIG.centerAdjustY;

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
      currentX: pos.x + offsetX,
      currentY: pos.y + offsetY,
      color: pos.color,
      isRepelled: false
    });
  });
}

function startHoverAnimation() {
  nodes.forEach((nodeData) => {
    animateNodeHover(nodeData);
  });
}

function animateNodeHover(nodeData) {
  if (nodeData.isRepelled) {
    setTimeout(() => animateNodeHover(nodeData), 100);
    return;
  }

  const angle = Math.random() * Math.PI * 2;
  const distance = Math.random() * CONFIG.hoverRadius;
  const targetX = nodeData.logoX + Math.cos(angle) * distance;
  const targetY = nodeData.logoY + Math.sin(angle) * distance;

  nodeData.currentX = targetX;
  nodeData.currentY = targetY;

  const duration = CONFIG.hoverDurationMin +
    Math.random() * (CONFIG.hoverDurationMax - CONFIG.hoverDurationMin);

  animate(nodeData.element, {
    left: `${targetX}px`,
    top: `${targetY}px`,
    duration: duration,
    ease: 'inOutSine',
    onComplete: () => {
      animateNodeHover(nodeData);
    }
  });
}

function setupMouseRepel() {
  document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    applyMouseRepel();
  });

  document.addEventListener('mouseleave', () => {
    mouseX = -1000;
    mouseY = -1000;
    nodes.forEach(nodeData => {
      if (nodeData.isRepelled) {
        returnNode(nodeData);
      }
    });
  });
}

function applyMouseRepel() {
  nodes.forEach((nodeData) => {
    const dx = nodeData.logoX - mouseX;
    const dy = nodeData.logoY - mouseY;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance < CONFIG.mouseRadius) {
      if (!nodeData.isRepelled) {
        nodeData.isRepelled = true;
      }

      const strength = (1 - distance / CONFIG.mouseRadius) * CONFIG.repelStrength;
      const normalX = dx / distance || 0;
      const normalY = dy / distance || 0;
      const repelX = nodeData.logoX + normalX * strength;
      const repelY = nodeData.logoY + normalY * strength;

      animate(nodeData.element, {
        left: `${repelX}px`,
        top: `${repelY}px`,
        duration: CONFIG.repelDuration,
        ease: 'outQuad'
      });
    } else if (nodeData.isRepelled) {
      returnNode(nodeData);
    }
  });
}

function returnNode(nodeData) {
  nodeData.isRepelled = false;

  animate(nodeData.element, {
    left: `${nodeData.logoX}px`,
    top: `${nodeData.logoY}px`,
    duration: CONFIG.returnDuration,
    ease: 'outElastic(1, 0.5)',
    onComplete: () => {
      animateNodeHover(nodeData);
    }
  });
}

function animateTextIn() {
  const words = Array.from(document.querySelectorAll('.word'));
  words.sort((a, b) => parseInt(a.dataset.order) - parseInt(b.dataset.order));

  setTimeout(() => {
    animate(words, {
      color: ['#D0D0D0', '#1A1A1A'],
      duration: CONFIG.textAnimDuration,
      ease: 'outExpo',
      delay: stagger(CONFIG.textStaggerDelay)
    });
  }, CONFIG.textAnimDelay);
}
