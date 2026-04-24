// Scenes Module - Re-exports all scene classes

export { MenuScene } from './menu.js';
export { GameOverScene } from './gameover.js';
export { LevelUpScene } from './levelup.js';
export { PauseScene } from './pause.js';

// Scene Manager class to handle scene transitions
class SceneManager {
  constructor(game) {
    this.game = game;
    this.scenes = {};
    this.currentScene = null;
    // Whitelist of valid scene names
    this.validScenes = new Set(['menu', 'gameover', 'levelup', 'pause']);
  }

  register(name, scene) {
    // Validate scene name against whitelist
    if (!this.validScenes.has(name)) {
      console.warn(`Attempted to register invalid scene: ${name}`);
      return;
    }
    this.scenes[name] = scene;
  }

  switchTo(name) {
    // Validate scene name before switching
    if (!this.validScenes.has(name)) {
      console.warn(`Attempted to switch to invalid scene: ${name}`);
      name = 'menu'; // Default to menu for invalid scenes
    }
    this.currentScene = this.scenes[name] || null;
  }

  update(input) {
    if (this.currentScene && this.currentScene.update) {
      return this.currentScene.update(input);
    }
    return null;
  }

  render(ctx, width, height, ...args) {
    if (this.currentScene && this.currentScene.render) {
      this.currentScene.render(ctx, width, height, ...args);
    }
  }
}

export { SceneManager };
