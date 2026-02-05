import { initGlobe } from './globe.js';
import { sampleLogoForNodes, createNodeElements, startHoverAnimation, setupMouseRepel } from './nodes.js';
import { animateTextIn, setupScrollAnimation } from './animations.js';

document.addEventListener('DOMContentLoaded', init);

async function init() {
  initGlobe();
  const positions = await sampleLogoForNodes();
  createNodeElements(positions);
  startHoverAnimation();
  setupMouseRepel();
  animateTextIn();
  setupScrollAnimation();
  initThemeToggle();
}

function initThemeToggle() {
  const toggle = document.getElementById('theme-toggle');

  toggle.addEventListener('click', () => {
    document.body.classList.toggle('dark-mode');
  });
}
