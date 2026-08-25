// Game Settings and Quality Configuration

const QUALITY_PRESETS = {
  performance: {
    name: 'Performance Mode',
    description: '120+ fps - Minimal visuals',
    settings: {
      buildVisuals: false,
      particleCount: 200,
      uiFrames: false,
      starGlow: false,
      particleVariety: false,
      entityCulling: true,
      objectPooling: true
    }
  },
  balanced: {
    name: 'Balanced Mode',
    description: '60 fps - Good visuals',
    settings: {
      buildVisuals: true,
      particleCount: 300,
      uiFrames: true,
      starGlow: false,
      particleVariety: true,
      entityCulling: true,
      objectPooling: true
    }
  },
  quality: {
    name: 'Quality Mode',
    description: '30-45 fps - Full visuals',
    settings: {
      buildVisuals: true,
      particleCount: 400,
      uiFrames: true,
      starGlow: true,
      particleVariety: true,
      entityCulling: false,
      objectPooling: true
    }
  }
};

class GameSettings {
  constructor() {
    this.currentQuality = 'performance';
    this.settings = { ...QUALITY_PRESETS.performance.settings };
    this.loadFromStorage();
  }

  setQuality(qualityName) {
    if (!QUALITY_PRESETS[qualityName]) {
      console.warn(`Unknown quality preset: ${qualityName}`);
      return false;
    }
    this.currentQuality = qualityName;
    this.settings = { ...QUALITY_PRESETS[qualityName].settings };
    this.saveToStorage();
    return true;
  }

  getQuality() {
    return this.currentQuality;
  }

  getSetting(key) {
    return this.settings[key];
  }

  saveToStorage() {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('gameQuality', this.currentQuality);
    }
  }

  loadFromStorage() {
    if (typeof localStorage !== 'undefined') {
      const saved = localStorage.getItem('gameQuality');
      if (saved && QUALITY_PRESETS[saved]) {
        this.setQuality(saved);
      }
    }
  }

  getPresets() {
    return QUALITY_PRESETS;
  }
}

export { GameSettings, QUALITY_PRESETS };
