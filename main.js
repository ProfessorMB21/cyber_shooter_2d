// Main Entry Point - Cyber Shooter Game

import { Game } from './game.js';

// Initialize when DOM is ready
async function init() {
  try {
    console.log('[INIT] Starting game initialization...');

    // Get loading element (don't remove yet, keep for diagnostics)
    const loading = document.getElementById('loading');
    if (loading) {
      loading.textContent = 'Initializing canvas...';
      console.log('[INIT] Loading element found');
    }

    // Create canvas - FULLSCREEN/BROWSER SIZE
    const canvas = document.createElement('canvas');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    canvas.style.border = 'none';
    canvas.style.display = 'block';
    canvas.style.margin = '0';
    canvas.style.padding = '0';
    console.log('[INIT] Canvas created:', canvas.width, 'x', canvas.height);

    // Set body styles first (before clearing innerHTML)
    document.body.style.margin = '0';
    document.body.style.padding = '0';
    document.body.style.overflow = 'hidden';
    document.body.style.width = '100%';
    document.body.style.height = '100%';
    document.body.style.display = 'flex';
    document.body.style.justifyContent = 'center';
    document.body.style.alignItems = 'center';

    // Clear body and add canvas
    document.body.innerHTML = '';
    document.body.appendChild(canvas);
    console.log('[INIT] Canvas added to DOM');

    // Wait for next frame to ensure canvas is rendered
    await new Promise(resolve => setTimeout(resolve, 16));
    console.log('[INIT] Canvas rendered to screen');

    // Verify canvas context
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      throw new Error('Failed to get canvas 2D context');
    }
    console.log('[INIT] Canvas context obtained');

    // Create game instance
    console.log('[INIT] Creating Game instance...');
    const game = new Game(canvas);
    console.log('[INIT] Game instance created successfully');

    // Handle window resize
    window.addEventListener('resize', () => {
      const newWidth = window.innerWidth;
      const newHeight = window.innerHeight;
      canvas.width = newWidth;
      canvas.height = newHeight;
      game.width = newWidth;
      game.height = newHeight;
      if (game.particles && game.particles.resize) {
        game.particles.resize(newWidth, newHeight);
      }
    });

    // Start game loop
    let frameCount = 0;
    const loop = (timestamp) => {
      try {
        frameCount++;
        if (frameCount === 1) {
          console.log('[LOOP] First frame executing');
        }
        game.loop(timestamp);
        requestAnimationFrame(loop);
      } catch (e) {
        console.error('Game loop error:', e);
        console.error('Stack:', e.stack);
      }
    };

    console.log('[INIT] Starting requestAnimationFrame loop');
    requestAnimationFrame(loop);
  } catch (e) {
    console.error('Game initialization error:', e);
    console.error('Error stack:', e.stack);
    const loading = document.getElementById('loading');
    if (loading) {
      loading.textContent = 'Error: ' + e.message;
      loading.style.color = '#f00';
    }
  }
}

console.log('[MAIN] Module loaded, document.readyState:', document.readyState);

// Start when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
