import { animate, stagger, splitText, onScroll } from 'animejs';
import Globe from 'globe.gl';

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
let mouseRepelDisabled = false;

document.addEventListener('DOMContentLoaded', init);

async function init() {
  logoPositions = await sampleLogoForNodes();
  createNodeElements(logoPositions);
  startHoverAnimation();
  setupMouseRepel();
  animateTextIn();
  setupScrollAnimation();
  initGlobe();
}

function initGlobe() {
  setTimeout(() => {
    const container = document.getElementById('globe-container');

    const globe = new Globe(container)
      .backgroundColor('rgba(0,0,0,0)')
      .showGlobe(false)
      .showAtmosphere(false)
      .width(700)
      .height(700);

    globe.controls().autoRotate = true;
    globe.controls().autoRotateSpeed = 1.5;
    globe.controls().enableZoom = false;
    globe.controls().enablePan = false;
    globe.controls().enableRotate = false;

    // Load pre-computed land points
    fetch('/landPoints.json')
      .then(res => res.json())
      .then(landPoints => {
        globe
          .pointsData(landPoints)
          .pointLat('lat')
          .pointLng('lng')
          .pointColor(() => '#95BF47')
          .pointAltitude(0.001)
          .pointRadius(0.4);
      });
  }, 100);
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
  if (mouseRepelDisabled) return;

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
  window.scrollTo(0, 0);

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
  let hasExited2 = false;
  let hasExited3 = false;
  let hasNodesExited = false;
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
      hasExited2 = false;
      hasExited3 = false;
      hasNodesExited = false;
      canExit = false;
      if (exitTimeout) clearTimeout(exitTimeout);

      nodes.forEach(node => {
        node.element.style.left = `${node.logoX}px`;
        node.element.style.top = `${node.logoY}px`;
        node.element.style.backgroundColor = node.color;
      });

      terminalBox.classList.remove('visible');
      terminalBox.style.opacity = '0';
      terminalBox.style.transform = '';
      terminalBox.style.boxShadow = 'none';
      chars.forEach(char => {
        char.style.opacity = '0';
      });

      const wordShit = document.querySelector('.word-shit');
      const wordDone = document.querySelector('.word-done');
      const wordWho = document.querySelector('.word-who');
      const wordGet = document.querySelector('.word-get');
      const wordThe = document.querySelector('.word-the');
      const wordPpl = document.querySelector('.word-ppl');
      if (wordShit) {
        wordShit.style.transform = '';
        wordShit.style.opacity = '';
      }
      if (wordDone) {
        wordDone.style.transform = '';
        wordDone.style.opacity = '';
      }
      if (wordWho) {
        wordWho.style.transform = '';
        wordWho.style.opacity = '';
      }
      if (wordGet) {
        wordGet.style.transform = '';
        wordGet.style.opacity = '';
      }
      if (wordThe) {
        wordThe.style.transform = '';
        wordThe.style.opacity = '';
      }
      if (wordPpl) {
        wordPpl.style.transform = '';
        wordPpl.style.opacity = '';
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

    const exitThreshold2 = 750;

    if (hasExited && scrollY >= exitThreshold2 && !hasExited2) {
      hasExited2 = true;
      const wordWho = document.querySelector('.word-who');
      const wordGet = document.querySelector('.word-get');

      animate([wordWho, wordGet], {
        translateY: ['0%', '150%'],
        opacity: [1, 0],
        duration: 400,
        ease: 'inExpo'
      });
    }

    if (hasExited2 && scrollY < exitThreshold2 - 100) {
      hasExited2 = false;
      const wordWho = document.querySelector('.word-who');
      const wordGet = document.querySelector('.word-get');

      animate([wordWho, wordGet], {
        translateY: ['150%', '0%'],
        opacity: [0, 1],
        duration: 400,
        ease: 'outExpo'
      });
    }

    const exitThreshold3 = 900;

    if (hasExited2 && scrollY >= exitThreshold3 && !hasExited3) {
      hasExited3 = true;
      mouseRepelDisabled = true;
      const wordThe = document.querySelector('.word-the');
      const wordPpl = document.querySelector('.word-ppl');

      animate([wordThe, wordPpl], {
        translateY: ['0%', '150%'],
        opacity: [1, 0],
        duration: 400,
        ease: 'inExpo'
      });
    }

    if (hasExited3 && scrollY < exitThreshold3 - 100) {
      hasExited3 = false;
      mouseRepelDisabled = false;
      const wordThe = document.querySelector('.word-the');
      const wordPpl = document.querySelector('.word-ppl');

      animate([wordThe, wordPpl], {
        translateY: ['150%', '0%'],
        opacity: [0, 1],
        duration: 400,
        ease: 'outExpo'
      });
    }

    if (hasExited && scrollY < exitThreshold - 100) {
      hasExited = false;

      const wordShit = document.querySelector('.word-shit');
      const wordDone = document.querySelector('.word-done');

      animate([wordShit, wordDone], {
        translateY: ['150%', '0%'],
        opacity: [0, 1],
        duration: 400,
        ease: 'outExpo'
      });

      terminalBox.classList.add('visible');
      animate(terminalBox, {
        opacity: [0, 1],
        translateY: [20, 0],
        duration: 400,
        ease: 'outExpo'
      });
    }

    const nodesExitThreshold = 200; // TEMP: lowered for testing
    const targetX = window.innerWidth * 0.75;
    const targetY = window.innerHeight / 2;

    if (hasExited3 && scrollY >= nodesExitThreshold && !hasNodesExited) {
      hasNodesExited = true;

      const sortedNodes = [...nodes].sort((a, b) => {
        if (b.logoY !== a.logoY) return b.logoY - a.logoY;
        return a.logoX - b.logoX;
      });

      const globeContainer = document.getElementById('globe-container');

      sortedNodes.forEach((node, i) => {
        const isLast = i === sortedNodes.length - 1;
        animate(node.element, {
          left: [`${node.logoX}px`, `${targetX}px`],
          top: [`${node.logoY}px`, `${targetY}px`],
          backgroundColor: [node.color, CONFIG.lightGreen],
          duration: 600,
          delay: i * 2,
          ease: 'inOutQuad',
          onComplete: isLast ? () => {
            animate(globeContainer, {
              opacity: [0, 1],
              duration: 500,
              ease: 'outQuad'
            });
          } : undefined
        });
      });
    }

    if (hasNodesExited && scrollY < nodesExitThreshold - 100) {
      hasNodesExited = false;

      const globeContainer = document.getElementById('globe-container');
      animate(globeContainer, {
        opacity: [1, 0],
        duration: 300,
        ease: 'inQuad'
      });

      const sortedNodes = [...nodes].sort((a, b) => {
        if (a.logoY !== b.logoY) return a.logoY - b.logoY;
        return b.logoX - a.logoX;
      });

      sortedNodes.forEach((node, i) => {
        animate(node.element, {
          left: [`${targetX}px`, `${node.logoX}px`],
          top: [`${targetY}px`, `${node.logoY}px`],
          backgroundColor: [CONFIG.lightGreen, node.color],
          duration: 600,
          delay: i * 2,
          ease: 'outQuad'
        });
      });
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
