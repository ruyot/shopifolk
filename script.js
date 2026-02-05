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
  const moonIcon = toggle.querySelector('.moon-icon');
  const sunIcon = toggle.querySelector('.sun-icon');

  toggle.addEventListener('click', () => {
    const isDark = document.body.classList.toggle('dark-mode');

    if (isDark) {
      moonIcon.style.display = 'none';
      sunIcon.style.display = 'inline';
    } else {
      moonIcon.style.display = 'inline';
      sunIcon.style.display = 'none';
    }
  });
}
