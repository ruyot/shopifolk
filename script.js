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
}
