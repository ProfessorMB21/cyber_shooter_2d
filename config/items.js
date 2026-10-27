// Item Definitions - 35 Unique Items with SVG Icons, Stats, and Passives

const RARITY_CHANCES = {
  normal: { rare: 0.45, epic: 0.35, unique: 0.15, legendary: 0.05, cosmic: 0 },
  level3n: { rare: 0.25, epic: 0.35, unique: 0.25, legendary: 0.10, cosmic: 0.05 }
};

const RARITY_MULTIPLIERS = {
  rare: 1.0,
  epic: 1.5,
  unique: 2.5,
  legendary: 4.0,
  cosmic: 8.0
};

const ITEM_SLOTS = ['weapon', 'armor', 'ring', 'amulet', 'belt', 'boots'];

const RARITY_COLORS = {
  rare: '#4a90d9',
  epic: '#a335ee',
  unique: '#ff8000',
  legendary: '#ffcc00',
  cosmic: '#ff69b4'
};

const RARITY_STARS = {
  rare: 3,
  epic: 4,
  unique: 5,
  legendary: 6,
  cosmic: 7
};

// SVG Icon Generator - Creates themed icons for each item
function createSVGIcon(type, color, details = '') {
  const icons = {
    sword: `<svg viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
      <path d="M5 35 L15 25 L12 22 L35 5 L30 12 L32 15 L18 28 L22 32 L25 28 L35 35"
            fill="${color}" stroke="#222" stroke-width="1.5"/>
      ${details}
    </svg>`,
    shield: `<svg viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
      <path d="M20 5 L35 10 L35 25 Q35 35 20 38 Q5 35 5 25 L5 10 Z"
            fill="${color}" stroke="#222" stroke-width="1.5"/>
      ${details}
    </svg>`,
    ring: `<svg viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
      <circle cx="20" cy="20" r="12" fill="none" stroke="${color}" stroke-width="4"/>
      <circle cx="20" cy="8" r="5" fill="${color}" stroke="#222" stroke-width="1"/>
      ${details}
    </svg>`,
    amulet: `<svg viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
      <path d="M20 5 L23 15 L33 15 L25 22 L28 32 L20 26 L12 32 L15 22 L7 15 L17 15 Z"
            fill="${color}" stroke="#222" stroke-width="1.5"/>
      ${details}
    </svg>`,
    belt: `<svg viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
      <rect x="5" y="16" width="30" height="8" rx="2" fill="${color}" stroke="#222" stroke-width="1.5"/>
      <rect x="16" y="14" width="8" height="12" rx="1" fill="${color}" stroke="#222" stroke-width="1.5"/>
      ${details}
    </svg>`,
    boots: `<svg viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 5 L12 22 L8 28 L8 35 L32 35 L32 28 L28 22 L28 5 Z"
            fill="${color}" stroke="#222" stroke-width="1.5"/>
      ${details}
    </svg>`
  };
  return icons[type] || icons.sword;
}

const ITEMS = {
  // === WEAPONS (6 items) ===
  void_blade: {
    id: 'void_blade',
    name: 'Void Blade',
    description: 'Cuts through dimensions, ignoring armor.',
    rarity: 'legendary',
    slot: 'weapon',
    stackable: false,
    maxStacks: 1,
    currentStacks: 0,
    stats: {
      atkDmg: 25,
      armorPenetration: 15
    },
    passives: [
      {
        id: 'void_strike',
        name: 'Void Strike',
        description: '20% chance to ignore all armor on hit.',
        trigger: 'on_hit',
        chance: 0.2,
        effect: { ignoreArmor: true }
      }
    ],
    synergies: ['void_shell', 'ring_of_the_void'],
    counters: [],
    iconType: 'sword',
    iconColor: '#8b00ff'
  },

  crimson_edge: {
    id: 'crimson_edge',
    name: 'Crimson Edge',
    description: 'Feeds on blood, healing its wielder.',
    rarity: 'unique',
    slot: 'weapon',
    stackable: true,
    maxStacks: 3,
    currentStacks: 0,
    stats: {
      atkDmg: 18
    },
    passives: [
      {
        id: 'blood_price',
        name: 'Blood Price',
        description: 'Deal 5% of damage dealt as self-healing.',
        trigger: 'on_damage_dealt',
        healPercent: 0.05
      }
    ],
    synergies: ['bloodstone_band', 'transfusion_belt'],
    counters: [],
    iconType: 'sword',
    iconColor: '#dc143c'
  },

  stormcaller: {
    id: 'stormcaller',
    name: 'Stormcaller',
    description: 'Channels lightning that arcs between enemies.',
    rarity: 'epic',
    slot: 'weapon',
    stackable: false,
    maxStacks: 1,
    currentStacks: 0,
    stats: {
      atkDmg: 12,
      ap: 10
    },
    passives: [
      {
        id: 'chain_lightning',
        name: 'Chain Lightning',
        description: 'Every 3rd attack chains to nearby enemy for 50% damage.',
        trigger: 'on_attack',
        hitCount: 3,
        chainDamage: 0.5
      }
    ],
    synergies: ['storm_signet', 'stormrunner_boots'],
    counters: [],
    iconType: 'sword',
    iconColor: '#00bfff'
  },

  pestilence: {
    id: 'pestilence',
    name: 'Pestilence',
    description: 'Spreads corruption that eats away at enemies.',
    rarity: 'legendary',
    slot: 'weapon',
    stackable: false,
    maxStacks: 1,
    currentStacks: 0,
    stats: {
      atkDmg: 20
    },
    passives: [
      {
        id: 'infect',
        name: 'Infect',
        description: 'On hit, apply poison dealing 2% max HP over 3s, stacks infinitely.',
        trigger: 'on_hit',
        poisonPercent: 0.02,
        duration: 3
      }
    ],
    synergies: ['plague_bearer'],
    counters: ['adaptive_matrix'],
    iconType: 'sword',
    iconColor: '#32cd32'
  },

  annihilator: {
    id: 'annihilator',
    name: 'Annihilator',
    description: 'Brings absolute destruction to the weak.',
    rarity: 'cosmic',
    slot: 'weapon',
    stackable: false,
    maxStacks: 1,
    currentStacks: 0,
    stats: {
      atkDmg: 40,
      ap: 20
    },
    passives: [
      {
        id: 'execute',
        name: 'Execute',
        description: 'Enemies below 20% HP take double damage.',
        trigger: 'passive',
        threshold: 0.2,
        damageMultiplier: 2.0
      },
      {
        id: 'devastation',
        name: 'Devastation',
        description: 'Kills grant +2% ATK permanently (resets on death).',
        trigger: 'on_kill',
        atkBonus: 0.02
      }
    ],
    synergies: [],
    counters: ['rebirth_amulet'],
    iconType: 'sword',
    iconColor: '#ff4500'
  },

  whisper_of_the_end: {
    id: 'whisper_of_the_end',
    name: 'Whisper of the End',
    description: 'Speaks death to those who hear it.',
    rarity: 'unique',
    slot: 'weapon',
    stackable: false,
    maxStacks: 1,
    currentStacks: 0,
    stats: {
      atkDmg: 15,
      critChance: 0.05
    },
    passives: [
      {
        id: 'silent_killer',
        name: 'Silent Killer',
        description: 'Crits deal 50% additional damage as true damage.',
        trigger: 'on_crit',
        trueDamagePercent: 0.5
      }
    ],
    synergies: ['berserker_signet'],
    counters: [],
    iconType: 'sword',
    iconColor: '#4b0082'
  },

  // === ARMOR (6 items) ===
  bastion_of_eternity: {
    id: 'bastion_of_eternity',
    name: 'Bastion of Eternity',
    description: 'Unbreakable protection from beyond time.',
    rarity: 'cosmic',
    slot: 'armor',
    stackable: false,
    maxStacks: 1,
    currentStacks: 0,
    stats: {
      hpPercent: 0.30,
      armor: 25,
      magicResist: 20
    },
    passives: [
      {
        id: 'eternal_guard',
        name: 'Eternal Guard',
        description: 'When HP drops below 30%, become invulnerable for 2s (60s cooldown).',
        trigger: 'on_low_hp',
        threshold: 0.3,
        invulnDuration: 2,
        cooldown: 60
      },
      {
        id: 'aegis',
        name: 'Aegis',
        description: 'Allies within range gain +10% of your armor.',
        trigger: 'passive',
        auraRadius: 200,
        armorShare: 0.1
      }
    ],
    synergies: ['goliath_girdle', 'crown_of_thorns'],
    counters: [],
    iconType: 'shield',
    iconColor: '#ffd700'
  },

  void_shell: {
    id: 'void_shell',
    name: 'Void Shell',
    description: 'Phase through attacks from another dimension.',
    rarity: 'legendary',
    slot: 'armor',
    stackable: false,
    maxStacks: 1,
    currentStacks: 0,
    stats: {
      hpPercent: 0.20,
      magicResist: 15
    },
    passives: [
      {
        id: 'phase_shift',
        name: 'Phase Shift',
        description: '15% chance to completely avoid damage.',
        trigger: 'on_damage_taken',
        dodgeChance: 0.15
      }
    ],
    synergies: ['void_blade', 'ring_of_the_void'],
    counters: [],
    iconType: 'shield',
    iconColor: '#8b00ff'
  },

  titans_heart: {
    id: 'titans_heart',
    name: "Titan's Heart",
    description: 'The heart of a giant, growing ever stronger.',
    rarity: 'epic',
    slot: 'armor',
    stackable: true,
    maxStacks: 3,
    currentStacks: 0,
    stats: {
      hpPercent: 0.25,
      hpRegen: 2
    },
    passives: [
      {
        id: 'growth',
        name: 'Growth',
        description: 'Gain +1% max HP per level permanently.',
        trigger: 'passive',
        hpPerLevel: 0.01
      }
    ],
    synergies: ['goliath_girdle'],
    counters: [],
    iconType: 'shield',
    iconColor: '#cd853f'
  },

  spectral_plate: {
    id: 'spectral_plate',
    name: 'Spectral Plate',
    description: 'Ghostly armor that bends attacks away.',
    rarity: 'unique',
    slot: 'armor',
    stackable: false,
    maxStacks: 1,
    currentStacks: 0,
    stats: {
      hpPercent: 0.15,
      evasion: 10
    },
    passives: [
      {
        id: 'ghost_form',
        name: 'Ghost Form',
        description: 'Evasion grants 5% chance to reflect attacks.',
        trigger: 'on_dodge',
        reflectChance: 0.05
      }
    ],
    synergies: ['phantom_striders'],
    counters: [],
    iconType: 'shield',
    iconColor: '#778899'
  },

  infernal_carapace: {
    id: 'infernal_carapace',
    name: 'Infernal Carapace',
    description: 'Burns those who dare strike it.',
    rarity: 'rare',
    slot: 'armor',
    stackable: true,
    maxStacks: 3,
    currentStacks: 0,
    stats: {
      armor: 10,
      magicResist: 5
    },
    passives: [
      {
        id: 'burn_back',
        name: 'Burn Back',
        description: '10% of damage taken is dealt to attacker as fire damage.',
        trigger: 'on_damage_taken',
        reflectPercent: 0.1
      }
    ],
    synergies: [],
    counters: [],
    iconType: 'shield',
    iconColor: '#ff4500'
  },

  adaptive_matrix: {
    id: 'adaptive_matrix',
    name: 'Adaptive Matrix',
    description: 'Learns from every blow, adapting to survive.',
    rarity: 'legendary',
    slot: 'armor',
    stackable: false,
    maxStacks: 1,
    currentStacks: 0,
    stats: {
      armor: 12,
      magicResist: 12
    },
    passives: [
      {
        id: 'evolve',
        name: 'Evolve',
        description: 'After taking damage of one type 5 times, gain +5 resistance to that type.',
        trigger: 'on_damage_taken',
        thresholdHits: 5,
        resistanceGain: 5
      }
    ],
    synergies: [],
    counters: ['pestilence'],
    infiniteScaling: true,
    iconType: 'shield',
    iconColor: '#00ff7f'
  },

  // === RINGS (8 items) ===
  ring_of_the_void: {
    id: 'ring_of_the_void',
    name: 'Ring of the Void',
    description: 'Touches the void between worlds.',
    rarity: 'epic',
    slot: 'ring',
    stackable: false,
    maxStacks: 1,
    currentStacks: 0,
    stats: {
      atkDmg: 8,
      ap: 8,
      cdReduction: 0.05
    },
    passives: [
      {
        id: 'void_tap',
        name: 'Void Tap',
        description: 'Abilities have 10% chance to reset cooldown.',
        trigger: 'on_ability_use',
        resetChance: 0.1
      }
    ],
    synergies: ['void_blade', 'void_shell'],
    counters: [],
    iconType: 'ring',
    iconColor: '#8b00ff'
  },

  chrono_band: {
    id: 'chrono_band',
    name: 'Chrono Band',
    description: 'Time flows differently around it.',
    rarity: 'unique',
    slot: 'ring',
    stackable: true,
    maxStacks: 2,
    currentStacks: 0,
    stats: {
      cdReduction: 0.15
    },
    passives: [
      {
        id: 'time_dilation',
        name: 'Time Dilation',
        description: 'Abilities slow nearby enemies by 20% for 1s.',
        trigger: 'on_ability_use',
        slowPercent: 0.2,
        slowDuration: 1
      }
    ],
    synergies: ['chrono_heart', 'temporal_treads'],
    counters: [],
    iconType: 'ring',
    iconColor: '#00ced1'
  },

  catalyst_ring: {
    id: 'catalyst_ring',
    name: 'Catalyst Ring',
    description: 'Amplifies magical energy.',
    rarity: 'rare',
    slot: 'ring',
    stackable: true,
    maxStacks: 3,
    currentStacks: 0,
    stats: {
      ap: 10
    },
    passives: [
      {
        id: 'amplify',
        name: 'Amplify',
        description: 'Ability damage increased by 8%.',
        trigger: 'passive',
        apDamageBonus: 0.08
      }
    ],
    synergies: [],
    counters: [],
    iconType: 'ring',
    iconColor: '#9370db'
  },

  storm_signet: {
    id: 'storm_signet',
    name: 'Storm Signet',
    description: 'Crackles with contained lightning.',
    rarity: 'legendary',
    slot: 'ring',
    stackable: false,
    maxStacks: 1,
    currentStacks: 0,
    stats: {
      atkDmg: 10,
      ap: 15
    },
    passives: [
      {
        id: 'overload',
        name: 'Overload',
        description: 'Every 5th ability cast deals 50% bonus damage.',
        trigger: 'on_ability_use',
        abilityCount: 5,
        bonusDamage: 0.5
      }
    ],
    synergies: ['stormcaller'],
    counters: [],
    iconType: 'ring',
    iconColor: '#ffd700'
  },

  bloodstone_band: {
    id: 'bloodstone_band',
    name: 'Bloodstone Band',
    description: 'Stores life force for later use.',
    rarity: 'epic',
    slot: 'ring',
    stackable: false,
    maxStacks: 1,
    currentStacks: 0,
    stats: {
      hpPercent: 0.05,
      lifesteal: 0.03
    },
    passives: [
      {
        id: 'bloodwell',
        name: 'Bloodwell',
        description: 'Store 10% of damage taken, release as healing on next ability use.',
        trigger: 'on_damage_taken',
        storePercent: 0.1
      }
    ],
    synergies: ['crimson_edge', 'transfusion_belt'],
    counters: [],
    iconType: 'ring',
    iconColor: '#8b0000'
  },

  null_ring: {
    id: 'null_ring',
    name: 'Null Ring',
    description: 'Nullifies magical attacks.',
    rarity: 'unique',
    slot: 'ring',
    stackable: false,
    maxStacks: 1,
    currentStacks: 0,
    stats: {
      magicResist: 10,
      cdReduction: 0.10
    },
    passives: [
      {
        id: 'spell_shield',
        name: 'Spell Shield',
        description: '25% chance to nullify magic damage completely.',
        trigger: 'on_magic_damage',
        nullifyChance: 0.25
      }
    ],
    synergies: [],
    counters: [],
    iconType: 'ring',
    iconColor: '#708090'
  },

  berserker_signet: {
    id: 'berserker_signet',
    name: "Berserker's Signet",
    description: 'Fuels the fires of fury.',
    rarity: 'legendary',
    slot: 'ring',
    stackable: false,
    maxStacks: 1,
    currentStacks: 0,
    stats: {
      atkDmg: 15,
      critChance: 0.10
    },
    passives: [
      {
        id: 'fury',
        name: 'Fury',
        description: 'Each crit grants +3% ATK for 5s, stacks infinitely.',
        trigger: 'on_crit',
        atkBonus: 0.03,
        duration: 5
      },
      {
        id: 'bloodlust',
        name: 'Bloodlust',
        description: 'Below 50% HP, +20% ATK speed.',
        trigger: 'passive',
        threshold: 0.5,
        atkSpeedBonus: 0.2
      }
    ],
    synergies: ['whisper_of_the_end'],
    counters: [],
    infiniteScaling: true,
    iconType: 'ring',
    iconColor: '#ff0000'
  },

  harmony_loop: {
    id: 'harmony_loop',
    name: 'Harmony Loop',
    description: 'Perfect balance yields perfect power.',
    rarity: 'cosmic',
    slot: 'ring',
    stackable: false,
    maxStacks: 1,
    currentStacks: 0,
    stats: {
      allStats: 8
    },
    passives: [
      {
        id: 'balance',
        name: 'Balance',
        description: 'For every 10 stat points difference between highest and lowest stat, gain +2% to all stats.',
        trigger: 'passive',
        balanceThreshold: 10,
        bonusPercent: 0.02
      }
    ],
    synergies: ['cosmic_heart'],
    counters: [],
    iconType: 'ring',
    iconColor: '#ff69b4'
  },

  // === AMULETS (5 items) ===
  rebirth_amulet: {
    id: 'rebirth_amulet',
    name: 'Rebirth Amulet',
    description: 'Grants a second chance at life.',
    rarity: 'cosmic',
    slot: 'amulet',
    stackable: false,
    maxStacks: 1,
    currentStacks: 0,
    stats: {
      hpPercent: 0.20,
      allResistances: 10
    },
    passives: [
      {
        id: 'second_chance',
        name: 'Second Chance',
        description: 'On death, revive with 30% HP (180s cooldown).',
        trigger: 'on_death',
        reviveHP: 0.3,
        cooldown: 180
      },
      {
        id: 'resilience',
        name: 'Resilience',
        description: 'Damage below 30% HP is halved.',
        trigger: 'passive',
        threshold: 0.3,
        damageReduction: 0.5
      }
    ],
    synergies: [],
    counters: ['annihilator'],
    iconType: 'amulet',
    iconColor: '#ffd700'
  },

  crown_of_thorns: {
    id: 'crown_of_thorns',
    name: 'Crown of Thorns',
    description: 'Pain shared is pain doubled.',
    rarity: 'legendary',
    slot: 'amulet',
    stackable: false,
    maxStacks: 1,
    currentStacks: 0,
    stats: {
      hpPercent: 0.15
    },
    passives: [
      {
        id: 'retaliate',
        name: 'Retaliate',
        description: '25% of damage taken is reflected.',
        trigger: 'on_damage_taken',
        reflectPercent: 0.25
      },
      {
        id: 'thorns',
        name: 'Thorns',
        description: 'Attackers take 5% of their max HP as damage.',
        trigger: 'on_hit_received',
        returnDamagePercent: 0.05
      }
    ],
    synergies: ['bastion_of_eternity'],
    counters: [],
    iconType: 'amulet',
    iconColor: '#8b4513'
  },

  chrono_heart: {
    id: 'chrono_heart',
    name: 'Chrono Heart',
    description: 'Beats outside of time.',
    rarity: 'unique',
    slot: 'amulet',
    stackable: true,
    maxStacks: 2,
    currentStacks: 0,
    stats: {
      cdReduction: 0.20,
      ap: 10
    },
    passives: [
      {
        id: 'time_warp',
        name: 'Time Warp',
        description: 'Using abilities reduces all other cooldowns by 0.5s.',
        trigger: 'on_ability_use',
        cdReduction: 0.5
      }
    ],
    synergies: ['chrono_band', 'temporal_treads'],
    counters: [],
    iconType: 'amulet',
    iconColor: '#00ced1'
  },

  plague_bearer: {
    id: 'plague_bearer',
    name: 'Plague Bearer',
    description: 'Spreads affliction to all nearby.',
    rarity: 'epic',
    slot: 'amulet',
    stackable: false,
    maxStacks: 1,
    currentStacks: 0,
    stats: {
      ap: 10,
      magicResist: 10
    },
    passives: [
      {
        id: 'contagion',
        name: 'Contagion',
        description: 'Status effects spread to 1 nearby enemy within 2s.',
        trigger: 'passive',
        spreadDelay: 2
      }
    ],
    synergies: ['pestilence'],
    counters: [],
    iconType: 'amulet',
    iconColor: '#556b2f'
  },

  executioners_pendant: {
    id: 'executioners_pendant',
    name: "Executioner's Pendant",
    description: 'Mercy is not in its vocabulary.',
    rarity: 'rare',
    slot: 'amulet',
    stackable: true,
    maxStacks: 3,
    currentStacks: 0,
    stats: {
      atkDmg: 12
    },
    passives: [
      {
        id: 'execution',
        name: 'Execution',
        description: 'Deal 15% bonus damage to enemies below 40% HP.',
        trigger: 'passive',
        threshold: 0.4,
        damageBonus: 0.15
      }
    ],
    synergies: [],
    counters: [],
    iconType: 'amulet',
    iconColor: '#2f4f4f'
  },

  // === BELTS (5 items) ===
  cosmic_heart: {
    id: 'cosmic_heart',
    name: 'Cosmic Heart',
    description: 'Power drawn from the stars themselves.',
    rarity: 'cosmic',
    slot: 'belt',
    stackable: false,
    maxStacks: 1,
    currentStacks: 0,
    stats: {
      hpPercent: 0.15,
      hpRegen: 10,
      allStatsPercent: 0.05
    },
    passives: [
      {
        id: 'cosmic_resilience',
        name: 'Cosmic Resilience',
        description: 'All healing increased by 25%.',
        trigger: 'passive',
        healingBonus: 0.25
      },
      {
        id: 'stellar_growth',
        name: 'Stellar Growth',
        description: 'Gain +0.5% max HP per enemy killed (resets on death).',
        trigger: 'on_kill',
        hpPerKill: 0.005
      }
    ],
    synergies: ['harmony_loop'],
    counters: [],
    infiniteScaling: true,
    iconType: 'belt',
    iconColor: '#ff69b4'
  },

  goliath_girdle: {
    id: 'goliath_girdle',
    name: "Goliath's Girdle",
    description: 'The belt of a giant.',
    rarity: 'legendary',
    slot: 'belt',
    stackable: false,
    maxStacks: 1,
    currentStacks: 0,
    stats: {
      hpPercent: 0.25,
      hpRegen: 5
    },
    passives: [
      {
        id: 'unstoppable',
        name: 'Unstoppable',
        description: 'Below 50% HP, gain +50% HP regeneration.',
        trigger: 'passive',
        threshold: 0.5,
        regenBonus: 0.5
      }
    ],
    synergies: ['titans_heart', 'bastion_of_eternity'],
    counters: [],
    iconType: 'belt',
    iconColor: '#8b4513'
  },

  transfusion_belt: {
    id: 'transfusion_belt',
    name: 'Transfusion Belt',
    description: 'Converts life force into protection.',
    rarity: 'unique',
    slot: 'belt',
    stackable: true,
    maxStacks: 2,
    currentStacks: 0,
    stats: {
      hpPercent: 0.10,
      lifesteal: 0.05
    },
    passives: [
      {
        id: 'blood_bank',
        name: 'Blood Bank',
        description: 'Store up to 20% max HP in a shield, charges from lifesteal.',
        trigger: 'passive',
        shieldPercent: 0.20
      }
    ],
    synergies: ['crimson_edge', 'bloodstone_band'],
    counters: [],
    iconType: 'belt',
    iconColor: '#800000'
  },

  catalyst_core: {
    id: 'catalyst_core',
    name: 'Catalyst Core',
    description: 'Pulses with magical potential.',
    rarity: 'epic',
    slot: 'belt',
    stackable: false,
    maxStacks: 1,
    currentStacks: 0,
    stats: {
      ap: 10,
      cdReduction: 0.08
    },
    passives: [
      {
        id: 'overcharge',
        name: 'Overcharge',
        description: 'After using 3 abilities, next ability deals 30% bonus damage.',
        trigger: 'on_ability_use',
        abilityCount: 3,
        bonusDamage: 0.3
      }
    ],
    synergies: [],
    counters: [],
    iconType: 'belt',
    iconColor: '#9370db'
  },

  molten_core: {
    id: 'molten_core',
    name: 'Molten Core',
    description: 'Radiates intense heat.',
    rarity: 'rare',
    slot: 'belt',
    stackable: true,
    maxStacks: 3,
    currentStacks: 0,
    stats: {
      armor: 8,
      hpRegen: 5
    },
    passives: [
      {
        id: 'burning_soul',
        name: 'Burning Soul',
        description: 'Deal 5 fire damage per second to nearby enemies.',
        trigger: 'passive',
        dps: 5,
        radius: 100
      }
    ],
    synergies: [],
    counters: [],
    iconType: 'belt',
    iconColor: '#ff4500'
  },

  // === BOOTS (5 items) ===
  phantom_striders: {
    id: 'phantom_striders',
    name: 'Phantom Striders',
    description: 'Phase through danger with each step.',
    rarity: 'legendary',
    slot: 'boots',
    stackable: false,
    maxStacks: 1,
    currentStacks: 0,
    stats: {
      speed: 0.15,
      evasion: 15
    },
    passives: [
      {
        id: 'phase_walk',
        name: 'Phase Walk',
        description: 'Evasion chance increased by 5% after each dodge, resets on hit.',
        trigger: 'on_dodge',
        evasionStack: 5
      },
      {
        id: 'ghost_step',
        name: 'Ghost Step',
        description: 'After dodging, next attack deals 20% bonus damage.',
        trigger: 'on_dodge',
        bonusDamage: 0.2
      }
    ],
    synergies: ['spectral_plate'],
    counters: [],
    iconType: 'boots',
    iconColor: '#778899'
  },

  temporal_treads: {
    id: 'temporal_treads',
    name: 'Temporal Treads',
    description: 'Each step bends time.',
    rarity: 'cosmic',
    slot: 'boots',
    stackable: false,
    maxStacks: 1,
    currentStacks: 0,
    stats: {
      speed: 0.10,
      cdReduction: 0.15
    },
    passives: [
      {
        id: 'time_trail',
        name: 'Time Trail',
        description: 'Movement leaves a trail that slows enemies by 30%.',
        trigger: 'passive',
        slowPercent: 0.3
      },
      {
        id: 'temporal_shift',
        name: 'Temporal Shift',
        description: 'After moving 100 units, reduce active cooldowns by 0.3s.',
        trigger: 'on_move',
        distanceThreshold: 100,
        cdReduction: 0.3
      }
    ],
    synergies: ['chrono_heart', 'chrono_band'],
    counters: [],
    infiniteScaling: true,
    iconType: 'boots',
    iconColor: '#00ced1'
  },

  warpath_greaves: {
    id: 'warpath_greaves',
    name: 'Warpath Greaves',
    description: 'Momentum builds power.',
    rarity: 'unique',
    slot: 'boots',
    stackable: true,
    maxStacks: 2,
    currentStacks: 0,
    stats: {
      speed: 0.12,
      atkDmg: 8
    },
    passives: [
      {
        id: 'momentum',
        name: 'Momentum',
        description: 'Build speed while moving, max +30% ATK after 3s.',
        trigger: 'passive',
        maxBonus: 0.3,
        buildTime: 3
      }
    ],
    synergies: [],
    counters: [],
    iconType: 'boots',
    iconColor: '#8b4513'
  },

  stormrunner_boots: {
    id: 'stormrunner_boots',
    name: 'Stormrunner Boots',
    description: 'Leave lightning in your wake.',
    rarity: 'epic',
    slot: 'boots',
    stackable: false,
    maxStacks: 1,
    currentStacks: 0,
    stats: {
      speed: 0.10,
      ap: 5
    },
    passives: [
      {
        id: 'lightning_dash',
        name: 'Lightning Dash',
        description: 'Moving fast leaves lightning trail dealing 10 damage.',
        trigger: 'passive',
        trailDamage: 10
      }
    ],
    synergies: ['stormcaller'],
    counters: [],
    iconType: 'boots',
    iconColor: '#00bfff'
  },

  steeltoe_stompers: {
    id: 'steeltoe_stompers',
    name: 'Steeltoe Stompers',
    description: 'Kick down doors and enemies.',
    rarity: 'rare',
    slot: 'boots',
    stackable: true,
    maxStacks: 3,
    currentStacks: 0,
    stats: {
      speed: 0.08,
      armor: 5
    },
    passives: [
      {
        id: 'impact',
        name: 'Impact',
        description: 'Dashing into enemies deals 15 damage and knocks back.',
        trigger: 'on_dash',
        damage: 15
      }
    ],
    synergies: [],
    counters: [],
    iconType: 'boots',
    iconColor: '#696969'
  }
};

// Generate SVG icons for all items
Object.keys(ITEMS).forEach(id => {
  const item = ITEMS[id];
  item.svgIcon = createSVGIcon(item.iconType, item.iconColor);
});

export {
  ITEMS,
  RARITY_CHANCES,
  RARITY_MULTIPLIERS,
  ITEM_SLOTS,
  RARITY_COLORS,
  RARITY_STARS,
  createSVGIcon
};
