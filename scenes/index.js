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
  }

  register(name, scene) {
    this.scenes[name] = scene;
  }

  switchTo(name) {
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
