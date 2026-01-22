import { animate, stagger, splitText, onScroll } from 'animejs';

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
  textAnimDuration: 1200,
  textStaggerDelay: 250,
  centerAdjustX: 0,
  centerAdjustY: 0,
  terminalCharDelay: 30,
};

let nodes = [];
let logoPositions = [];
let mouseX = -1000;
let mouseY = -1000;
let terminalAnimated = false;

document.addEventListener('DOMContentLoaded', init);

async function init() {
  logoPositions = await sampleLogoForNodes();
  createNodeElements(logoPositions);
  startHoverAnimation();
  setupMouseRepel();
  animateTextIn();
  setupScrollAnimation();
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
      color: ['#E5E5E5', '#1A1A1A'],
      duration: CONFIG.textAnimDuration,
      ease: 'outExpo',
      delay: stagger(CONFIG.textStaggerDelay)
    });
  }, CONFIG.textAnimDelay);
}

function setupScrollAnimation() {
  let isVisible = false;
  let clickTriggered = false;
  const terminalBox = document.querySelector('.terminal-box');
  const terminalText = document.querySelector('.terminal-text');

  if (!terminalBox || !terminalText) return;

  const { chars } = splitText(terminalText, { chars: true });

  chars.forEach(char => {
    char.style.opacity = '0';
  });

  let hasExited = false;
  let canExit = false;
  let exitTimeout;

  window.addEventListener('scroll', () => {
    const scrollY = window.scrollY;
    const startScroll = 60;
    const endScroll = 150;
    const clickThreshold = 160;
    const exitThreshold = 600;

    if (scrollY > 40 && !isVisible && !hasExited) {
      isVisible = true;
      terminalBox.classList.add('visible');
      animate(terminalBox, {
        opacity: [0, 1],
        scale: [0.95, 1],
        duration: 400,
        ease: 'outExpo'
      });
    }

    if (scrollY <= 40 && isVisible) {
      isVisible = false;
      clickTriggered = false;
      hasExited = false;
      canExit = false;
      if (exitTimeout) clearTimeout(exitTimeout);

      terminalBox.classList.remove('visible');
      terminalBox.style.opacity = '0';
      terminalBox.style.transform = '';
      terminalBox.style.boxShadow = 'none';
      chars.forEach(char => {
        char.style.opacity = '0';
      });

      const wordShit = document.querySelector('.word-shit');
      const wordDone = document.querySelector('.word-done');
      if (wordShit) {
        wordShit.style.transform = '';
        wordShit.style.opacity = '';
      }
      if (wordDone) {
        wordDone.style.transform = '';
        wordDone.style.opacity = '';
      }
    }

    if (!hasExited && scrollY >= startScroll && scrollY <= endScroll) {
      const progress = (scrollY - startScroll) / (endScroll - startScroll);
      const charsToShow = Math.floor(progress * chars.length);

      chars.forEach((char, index) => {
        char.style.opacity = index < charsToShow ? '1' : '0';
      });
    }

    if (!hasExited && scrollY > endScroll) {
      chars.forEach(char => {
        char.style.opacity = '1';
      });
    }

    if (!hasExited && scrollY >= clickThreshold && !clickTriggered) {
      clickTriggered = true;
      const corners = document.querySelectorAll('.corner');
      animate(terminalBox, {
        scale: [1, 1.02, 0.98, 1],
        duration: 300,
        ease: 'outElastic(1, 0.5)'
      });
      corners.forEach(corner => corner.classList.add('visible'));
      setTimeout(() => {
        corners.forEach(corner => corner.classList.remove('visible'));
      }, 500);

      // Enforce waiting for animation to finish before allowing exit
      if (exitTimeout) clearTimeout(exitTimeout);
      exitTimeout = setTimeout(() => {
        canExit = true;
        // Check if user already scrolled past threshold while waiting
        if (window.scrollY >= exitThreshold && !hasExited) {
          triggerExitAnimation();
        }
      }, 500);
    }

    if (clickTriggered && canExit && scrollY >= exitThreshold && !hasExited) {
      triggerExitAnimation();
    }
  });

  function triggerExitAnimation() {
    hasExited = true;

    const wordShit = document.querySelector('.word-shit');
    const wordDone = document.querySelector('.word-done');

    animate([wordShit, wordDone], {
      translateY: ['0%', '150%'],
      opacity: [1, 0],
      duration: 400,
      ease: 'inExpo'
    });

    animate(terminalBox, {
      opacity: [1, 0],
      translateY: [0, 20],
      duration: 400,
      ease: 'inExpo',
      onComplete: () => {
        terminalBox.classList.remove('visible');
      }
    });
  }
}
