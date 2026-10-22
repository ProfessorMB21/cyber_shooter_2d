// Scenes Module - Re-exports all scene classes

export { MenuScene } from './menu.js';
export { GameOverScene } from './gameover.js';
export { PauseScene } from './pause.js';
export { SettingsScene } from './settings.js';
export { LobbyScene } from './lobby.js';

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

  // Switch to a scene. A scene that is being left is told so, and the one
  // being shown is told too - the lobby needs both, since it opens a
  // socket when it is shown and closes it when it is left.
  switchTo(name) {
    const next = this.scenes[name] || null;
    if (next === this.currentScene) return;
    if (this.currentScene && this.currentScene.exit) this.currentScene.exit();
    this.currentScene = next;
    if (this.currentScene && this.currentScene.enter) this.currentScene.enter();
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
