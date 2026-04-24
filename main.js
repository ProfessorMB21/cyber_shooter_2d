// Main Entry Point - Cyber Shooter Game

import { Game } from './game.js';

// Store reference to game instance for cleanup
let gameInstance = null;
let resizeHandler = null;

// Initialize when DOM is ready
function init() {
  // Create canvas - FULLSCREEN/BROWSER SIZE
  const canvas = document.createElement('canvas');
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  canvas.style.border = 'none';
  canvas.style.display = 'block';
  canvas.id = 'game-canvas';

  // Safely clear body content by removing children instead of using innerHTML
  while (document.body.firstChild) {
    document.body.removeChild(document.body.firstChild);
  }
  document.body.style.margin = '0';
  document.body.style.padding = '0';
  document.body.style.overflow = 'hidden';
  document.body.appendChild(canvas);

  // Small delay to ensure canvas is in DOM before initializing game
  setTimeout(() => {
    // Create game
    gameInstance = new Game(canvas);

    // Handle window resize - Keep internal width/height in sync with canvas
    resizeHandler = () => {
      const newWidth = window.innerWidth;
      const newHeight = window.innerHeight;

      canvas.width = newWidth;
      canvas.height = newHeight;

      // Update game dimensions
      gameInstance.width = newWidth;
      gameInstance.height = newHeight;

      // Update particle system bounds
      if (gameInstance.particles && gameInstance.particles.resize) {
        gameInstance.particles.resize(newWidth, newHeight);
      }
    };

    window.addEventListener('resize', resizeHandler);

    // Start menu loop - ensure proper context binding
    requestAnimationFrame((timestamp) => gameInstance.loop(timestamp));
  }, 0);
}

// Start
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}

// Cleanup function for proper resource management
export function cleanup() {
  if (resizeHandler) {
    window.removeEventListener('resize', resizeHandler);
    resizeHandler = null;
  }
  if (gameInstance && gameInstance.input) {
    gameInstance.input.destroy();
    gameInstance = null;
  }
}
