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

// The input schemes a player can choose between.
//
// A scheme says what the keyboard and the mouse do in a run: what moves
// the ship, what aims it, what shoots and which keys fire the abilities.
// The screens take the mouse whatever the scheme is - this is about
// playing, not about the menus.
const INPUT_SCHEMES = {
  keyboard: {
    name: 'Keyboard Only',
    description: 'WASD moves, SPACE shoots, 1 and 2 fire',
    move: 'keyboard',
    aim: 'keyboard',
    shoot: 'space',
    abilityKeys: ['1', '2']
  },
  keyboard_mouse: {
    name: 'Keyboard + Mouse',
    description: 'WASD moves, the mouse aims, click shoots, 1 and 2 fire',
    move: 'keyboard',
    aim: 'mouse',
    shoot: 'mouse',
    abilityKeys: ['1', '2']
  },
  mouse_qer: {
    name: 'Mouse + QER',
    description: 'The mouse moves and aims, click shoots, Q and E fire',
    move: 'mouse',
    aim: 'mouse',
    shoot: 'mouse',
    abilityKeys: ['q', 'e']
  }
};

class GameSettings {
  constructor() {
    this.currentQuality = 'performance';
    this.settings = { ...QUALITY_PRESETS.performance.settings };
    this.currentInputScheme = 'keyboard';
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

  setInputScheme(schemeName) {
    if (!INPUT_SCHEMES[schemeName]) {
      console.warn(`Unknown input scheme: ${schemeName}`);
      return false;
    }
    this.currentInputScheme = schemeName;
    this.saveToStorage();
    return true;
  }

  getInputScheme() {
    return this.currentInputScheme;
  }

  // The scheme itself, not just its name.
  getInputSchemeConfig() {
    return INPUT_SCHEMES[this.currentInputScheme] || INPUT_SCHEMES.keyboard;
  }

  getSetting(key) {
    return this.settings[key];
  }

  saveToStorage() {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('gameQuality', this.currentQuality);
      localStorage.setItem('gameInputScheme', this.currentInputScheme);
    }
  }

  loadFromStorage() {
    if (typeof localStorage !== 'undefined') {
      const saved = localStorage.getItem('gameQuality');
      if (saved && QUALITY_PRESETS[saved]) {
        this.setQuality(saved);
      }
      const scheme = localStorage.getItem('gameInputScheme');
      if (scheme && INPUT_SCHEMES[scheme]) {
        this.currentInputScheme = scheme;
      }
    }
  }

  getPresets() {
    return QUALITY_PRESETS;
  }

  getSchemes() {
    return INPUT_SCHEMES;
  }
}

export { GameSettings, QUALITY_PRESETS, INPUT_SCHEMES };
