import { initGlobe } from './globe.js';
import { sampleLogoForNodes, createNodeElements, startHoverAnimation, setupMouseRepel } from './nodes.js';
import { animateTextIn, setupScrollAnimation } from './animations.js';
import { initWebring } from './webring.js';

document.addEventListener('DOMContentLoaded', init);

async function init() {
  initGlobe();
  initWebring();
  const positions = await sampleLogoForNodes();
  createNodeElements(positions);
  startHoverAnimation();
  setupMouseRepel();
  animateTextIn();
  setupScrollAnimation();
}
