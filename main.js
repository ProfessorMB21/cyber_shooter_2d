// Main Entry Point - Cyber Shooter Game

import { Game } from './game.js';

// Initialize when DOM is ready
function init() {
  // Create canvas - FULLSCREEN/BROWSER SIZE
  const canvas = document.createElement('canvas');
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  canvas.style.border = 'none';
  canvas.style.display = 'block';

  // Clear body and add canvas
  document.body.innerHTML = '';
  document.body.style.margin = '0';
  document.body.style.padding = '0';
  document.body.style.overflow = 'hidden';
  document.body.appendChild(canvas);

  // Create game
  const game = new Game(canvas);

  // Hide loading div
  const loadingDiv = document.getElementById('loading');
  if (loadingDiv) {
    loadingDiv.style.display = 'none';
  }

  // Handle window resize
  window.addEventListener('resize', () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    game.width = canvas.width;
    game.height = canvas.height;
    game.particles.resize(canvas.width, canvas.height);
  });

  // Start menu loop
  requestAnimationFrame(game.loop);
}

// Start
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
