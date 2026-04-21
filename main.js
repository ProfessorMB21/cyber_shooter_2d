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

  // Replace body content with canvas
  document.body.innerHTML = '';
  document.body.style.margin = '0';
  document.body.style.padding = '0';
  document.body.style.overflow = 'hidden';
  document.body.appendChild(canvas);

  // Small delay to ensure canvas is in DOM before initializing game
  setTimeout(() => {
    // Create game
    const game = new Game(canvas);

    // Handle window resize - Keep internal width/height in sync with canvas
    window.addEventListener('resize', () => {
      const newWidth = window.innerWidth;
      const newHeight = window.innerHeight;

      canvas.width = newWidth;
      canvas.height = newHeight;

      // Update game dimensions
      game.width = newWidth;
      game.height = newHeight;

      // Update particle system bounds
      if (game.particles && game.particles.resize) {
        game.particles.resize(newWidth, newHeight);
      }
    });

    // Start menu loop - ensure proper context binding
    requestAnimationFrame((timestamp) => game.loop(timestamp));
  }, 0);
}

// Start
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
