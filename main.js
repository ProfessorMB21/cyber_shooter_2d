// Main Entry Point - Cyber Shooter Game

import { Game } from './game.js';

// Initialize when DOM is ready
function init() {
  // Create canvas
  const canvas = document.createElement('canvas');
  canvas.width = 800;
  canvas.height = 600;
  canvas.style.border = '2px solid #333';

  // Clear body and add canvas
  document.body.innerHTML = '';
  document.body.appendChild(canvas);

  // Create game
  const game = new Game(canvas);

  // Start menu loop
  requestAnimationFrame(game.loop);
}

// Start
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
