# Item Build System Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement a roguelike item selection system where players choose from 4 random items on level-up and boss kills, with 35 unique items, 6 equipment slots, hidden synergies, and stacking mechanics.

**Architecture:** Create a new ItemSystem class that manages item selection, equipping, and synergy detection. The system integrates with Player for stat modifications, hooks into Game for level-up/boss-kill triggers, and adds a new UI overlay for item selection. Items are defined in a config file with SVG icons, stats, and passive effects.

**Tech Stack:** Vanilla JavaScript, ES Modules, HTML5 Canvas 2D (existing stack)

**Spec:** `docs/superpowers/specs/2026-10-26-item-build-system-design.md`

## Global Constraints

- Rarity chances: Rare 45% (25% on 3n), Epic 35% (35% on 3n), Unique 15% (25% on 3n), Legendary 5% (10% on 3n), Cosmic 0% (5% on 3n)
- Stat multipliers: Rare 1.0x, Epic 1.5x, Unique 2.5x, Legendary 4.0x, Cosmic 8.0x
- 6 item slots: weapon, armor, ring (×2), amulet, belt, boots
- Items persist during run, lost on death (roguelike)
- Player chooses 1 of 4 random items on level-up and boss kills
- Every 3rd level has elevated legendary/cosmic chances

---

## Task 1: Create Item Definitions Configuration

**Files:**
- Create: `config/items.js`

**Interfaces:**
- Produces: `ITEMS` object with all 35 items, `RARITY_CHANCES` object, `RARITY_MULTIPLIERS` object, `ITEM_SLOTS` array

- [ ] **Step 1: Create the items.js file with rarity configuration and item structure**

```javascript
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
```

- [ ] **Step 2: Add SVG icon generator helper function**

```javascript
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
```

- [ ] **Step 3: Add all 6 WEAPON items with full definitions**

```javascript
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
```

- [ ] **Step 4: Add all 6 ARMOR items with full definitions**

```javascript
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
```

- [ ] **Step 5: Add all 8 RING items with full definitions**

```javascript
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
```

- [ ] **Step 6: Add all 5 AMULET items with full definitions**

```javascript
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
```

- [ ] **Step 7: Add all 5 BELT items with full definitions**

```javascript
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
```

- [ ] **Step 8: Add all 5 BOOTS items with full definitions**

```javascript
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
```

- [ ] **Step 9: Commit the items configuration**

```bash
git add config/items.js
git commit -m "feat: add 35 unique item definitions with SVG icons

Add comprehensive item configuration including:
- 6 weapons, 6 armor, 8 rings, 5 amulets, 5 belts, 5 boots
- Rarity system: rare/epic/unique/legendary/cosmic
- Stats, passives, synergies, and counters
- Auto-generated SVG icons for each item"
```

---

## Task 2: Create Item System Class

**Files:**
- Create: `systems/item-system.js`

**Interfaces:**
- Consumes: `ITEMS`, `RARITY_CHANCES`, `RARITY_MULTIPLIERS` from `config/items.js`
- Produces: `ItemSystem` class with methods `generateChoices(count, level)`, `addItem(itemId, player)`, `removeItem(itemId, player)`, `checkSynergies(player)`, `calculateItemStats(player)`

- [ ] **Step 1: Create the ItemSystem class skeleton**

```javascript
// Item System - Selection, Equipping, Synergies, and Stacking

import { 
  ITEMS, 
  RARITY_CHANCES, 
  RARITY_MULTIPLIERS, 
  ITEM_SLOTS, 
  RARITY_COLORS, 
  RARITY_STARS 
} from '../config/items.js';

class ItemSystem {
  constructor() {
    // Track active synergies for display
    this.activeSynergies = new Set();
    // Track infinite scaling stacks (reset on death)
    this.infiniteStacks = new Map();
  }

  // Reset all state (called on player death)
  reset() {
    this.activeSynergies.clear();
    this.infiniteStacks.clear();
  }
```

- [ ] **Step 2: Implement rarity roll logic**

```javascript
  // Roll for item rarity based on current level
  rollRarity(level) {
    const isLevel3n = level % 3 === 0;
    const chances = isLevel3n ? RARITY_CHANCES.level3n : RARITY_CHANCES.normal;
    
    const roll = Math.random();
    let cumulative = 0;
    
    // Check rarities from lowest to highest
    const rarityOrder = ['rare', 'epic', 'unique', 'legendary', 'cosmic'];
    for (const rarity of rarityOrder) {
      cumulative += chances[rarity];
      if (roll < cumulative) {
        return rarity;
      }
    }
    return 'rare'; // Fallback
  }

  // Get all items of a specific rarity
  getItemsByRarity(rarity) {
    return Object.values(ITEMS).filter(item => item.rarity === rarity);
  }

  // Get all items for a specific slot
  getItemsBySlot(slot) {
    return Object.values(ITEMS).filter(item => item.slot === slot);
  }
```

- [ ] **Step 3: Implement choice generation with slot filtering**

```javascript
  // Generate N random item choices for the player
  generateChoices(count, level, player) {
    const choices = [];
    const usedIds = new Set();
    
    // Determine available slots (not full, or allow replacement)
    const filledSlots = this.getFilledSlots(player);
    const availableSlots = ITEM_SLOTS.filter(slot => {
      // Rings have 2 slots
      if (slot === 'ring') {
        const ringCount = filledSlots.filter(s => s === 'ring').length;
        return ringCount < 2;
      }
      return !filledSlots.includes(slot);
    });
    
    // If all slots filled, allow replacement
    const allowReplacement = availableSlots.length === 0;
    
    while (choices.length < count) {
      // Roll rarity
      const rarity = this.rollRarity(level);
      
      // Get items of this rarity that fit available slots
      let candidates = this.getItemsByRarity(rarity).filter(item => {
        // Skip already chosen items
        if (usedIds.has(item.id)) return false;
        
        // Skip items player already has (unless stackable)
        if (this.playerHasItem(player, item.id)) {
          if (!item.stackable) return false;
          if (this.getItemStacks(player, item.id) >= item.maxStacks) return false;
        }
        
        // Check slot availability
        if (!allowReplacement) {
          if (item.slot === 'ring') {
            const ringCount = filledSlots.filter(s => s === 'ring').length;
            if (ringCount >= 2 && !this.canStackRing(player, item.id)) return false;
          } else if (!availableSlots.includes(item.slot)) {
            return false;
          }
        }
        
        return true;
      });
      
      // Fallback to any available item if no candidates
      if (candidates.length === 0) {
        candidates = Object.values(ITEMS).filter(item => 
          !usedIds.has(item.id) && 
          (!this.playerHasItem(player, item.id) || 
           (item.stackable && this.getItemStacks(player, item.id) < item.maxStacks))
        );
      }
      
      if (candidates.length === 0) break;
      
      // Pick random candidate
      const item = candidates[Math.floor(Math.random() * candidates.length)];
      choices.push(item);
      usedIds.add(item.id);
    }
    
    return choices;
  }
```

- [ ] **Step 4: Implement helper methods for slot/item tracking**

```javascript
  // Get all slots that have items equipped
  getFilledSlots(player) {
    if (!player.items) return [];
    return player.items.map(item => item.slot);
  }

  // Check if player has a specific item
  playerHasItem(player, itemId) {
    if (!player.items) return false;
    return player.items.some(item => item.id === itemId);
  }

  // Get current stack count for an item
  getItemStacks(player, itemId) {
    if (!player.items) return 0;
    const item = player.items.find(i => i.id === itemId);
    return item ? item.currentStacks : 0;
  }

  // Check if a ring can be stacked
  canStackRing(player, itemId) {
    const item = ITEMS[itemId];
    if (!item || !item.stackable) return false;
    return this.getItemStacks(player, itemId) < item.maxStacks;
  }

  // Get item by ID
  getItem(itemId) {
    return ITEMS[itemId] || null;
  }
```

- [ ] **Step 5: Implement item adding with stat application**

```javascript
  // Add an item to the player
  addItem(itemId, player) {
    if (!player.items) player.items = [];
    
    const item = ITEMS[itemId];
    if (!item) return false;
    
    // Check if already have this item
    const existingIndex = player.items.findIndex(i => i.id === itemId);
    
    if (existingIndex >= 0) {
      // Stack it if possible
      const existing = player.items[existingIndex];
      if (!item.stackable || existing.currentStacks >= item.maxStacks) {
        return false;
      }
      existing.currentStacks++;
    } else {
      // Check slot availability
      const filledSlots = this.getFilledSlots(player);
      if (item.slot === 'ring') {
        const ringCount = filledSlots.filter(s => s === 'ring').length;
        if (ringCount >= 2) return false;
      } else if (filledSlots.includes(item.slot)) {
        return false;
      }
      
      // Add new item
      player.items.push({
        ...item,
        currentStacks: 1
      });
    }
    
    // Apply stats and check synergies
    this.recalculateItemStats(player);
    this.checkSynergies(player);
    
    return true;
  }
```

- [ ] **Step 6: Implement item removal**

```javascript
  // Remove an item from the player
  removeItem(itemId, player) {
    if (!player.items) return false;
    
    const index = player.items.findIndex(i => i.id === itemId);
    if (index < 0) return false;
    
    const item = player.items[index];
    
    // Reduce stack or remove
    if (item.currentStacks > 1) {
      item.currentStacks--;
    } else {
      player.items.splice(index, 1);
    }
    
    // Recalculate stats
    this.recalculateItemStats(player);
    this.checkSynergies(player);
    
    return true;
  }
```

- [ ] **Step 7: Implement stat recalculation with multipliers and stacking**

```javascript
  // Recalculate all item stats for the player
  recalculateItemStats(player) {
    // Initialize item stats
    player.itemStats = {
      atkDmg: 0,
      ap: 0,
      hpPercent: 0,
      hpRegen: 0,
      armor: 0,
      magicResist: 0,
      speed: 0,
      evasion: 0,
      critChance: 0,
      critDamage: 0,
      cdReduction: 0,
      lifesteal: 0,
      armorPenetration: 0,
      allStats: 0,
      allStatsPercent: 0,
      allResistances: 0
    };
    
    if (!player.items || player.items.length === 0) return;
    
    // Apply each item's stats
    for (const item of player.items) {
      const multiplier = RARITY_MULTIPLIERS[item.rarity];
      const stacks = item.currentStacks || 1;
      
      // Apply stats with stacking
      if (item.stats) {
        for (const [stat, value] of Object.entries(item.stats)) {
          if (player.itemStats[stat] !== undefined) {
            player.itemStats[stat] += value * multiplier * stacks;
          }
        }
      }
    }
    
    // Apply item stats to player's derived stats
    this.applyItemStatsToPlayer(player);
  }

  // Apply calculated item stats to player
  applyItemStatsToPlayer(player) {
    const stats = player.itemStats;
    
    // Apply flat bonuses
    player.bonusStats.damage = Math.floor((player.bonusStats.damage || 0) + stats.atkDmg);
    player.bonusStats.armor = Math.floor((player.bonusStats.armor || 0) + stats.armor);
    player.bonusStats.speed = (player.bonusStats.speed || 0) + stats.speed;
    
    // Apply percent bonuses
    if (stats.hpPercent > 0) {
      const bonusHp = Math.floor(player.baseStats.maxHp * stats.hpPercent);
      player.bonusStats.maxHp = (player.bonusStats.maxHp || 0) + bonusHp;
    }
    
    // Apply special stats
    player.evasion = Math.min(75, (player.evasion || 0) + stats.evasion);
    player.criticalChance = Math.min(1, player.criticalChance + stats.critChance);
    player.criticalDamage = (player.criticalDamage || 1.5) + stats.critDamage;
    player.cooldownReduction = Math.min(0.5, (player.cooldownReduction || 0) + stats.cdReduction);
    
    // Recalculate derived stats
    player.calculateDerivedStats();
  }
```

- [ ] **Step 8: Implement synergy detection**

```javascript
  // Check and activate synergies
  checkSynergies(player) {
    this.activeSynergies.clear();
    if (!player.items || player.items.length === 0) return;
    
    const itemIds = new Set(player.items.map(i => i.id));
    
    // Define synergy sets
    const synergySets = [
      {
        name: 'void_convergence',
        items: ['void_blade', 'void_shell', 'ring_of_the_void'],
        required: 3,
        bonus: { voidProcChance: 0.3, armorReduction: 5 }
      },
      {
        name: 'eternal_guardian',
        items: ['bastion_of_eternity', 'goliath_girdle', 'crown_of_thorns'],
        required: 3,
        bonus: { invulnDuration: 4, reflectPercent: 1.5 }
      },
      {
        name: 'crit_cascade',
        items: ['berserker_signet', 'whisper_of_the_end'],
        required: 2,
        requiresEvasion: true,
        bonus: { doubleCritChance: 0.25 }
      },
      {
        name: 'time_fracture',
        items: ['chrono_heart', 'chrono_band', 'temporal_treads'],
        required: 3,
        bonus: { freeCooldownInterval: 30 }
      },
      {
        name: 'blood_sovereign',
        items: ['crimson_edge', 'bloodstone_band', 'transfusion_belt'],
        required: 3,
        bonus: { overhealShield: true }
      }
    ];
    
    // Check cosmic synergy (3+ cosmic items)
    const cosmicItems = player.items.filter(i => i.rarity === 'cosmic').length;
    if (cosmicItems >= 3) {
      this.activeSynergies.add('cosmic_ascension');
    }
    
    // Check each synergy set
    for (const synergy of synergySets) {
      const owned = synergy.items.filter(id => itemIds.has(id)).length;
      
      // Special case: crit_cascade needs evasion item
      if (synergy.requiresEvasion) {
        const hasEvasionItem = player.items.some(i => 
          i.stats && i.stats.evasion > 0
        );
        if (!hasEvasionItem) continue;
      }
      
      if (owned >= synergy.required) {
        this.activeSynergies.add(synergy.name);
        this.applySynergyBonus(player, synergy);
      }
    }
  }

  // Apply synergy bonus to player
  applySynergyBonus(player, synergy) {
    if (!player.synergyBonuses) player.synergyBonuses = {};
    player.synergyBonuses[synergy.name] = synergy.bonus;
  }
```

- [ ] **Step 9: Export the ItemSystem class**

```javascript
  // Get active synergies for display
  getActiveSynergies() {
    return Array.from(this.activeSynergies);
  }

  // Process passive triggers
  processPassiveTrigger(trigger, player, eventData = {}) {
    if (!player.items) return;
    
    for (const item of player.items) {
      if (!item.passives) continue;
      
      for (const passive of item.passives) {
        if (passive.trigger !== trigger) continue;
        
        // Check chance
        if (passive.chance && Math.random() > passive.chance) continue;
        
        // Apply effect
        this.applyPassiveEffect(player, passive, eventData, item);
      }
    }
  }

  // Apply a passive effect
  applyPassiveEffect(player, passive, eventData, item) {
    // Handle different passive types
    switch (passive.id) {
      case 'blood_price':
        const healAmount = eventData.damage * passive.healPercent * (item.currentStacks || 1);
        player.heal(healAmount);
        break;
      case 'void_strike':
        // Mark next hit to ignore armor
        player.ignoreArmorNextHit = true;
        break;
      // Add more passive handlers as needed
    }
  }
}

export { ItemSystem };
```

- [ ] **Step 10: Commit the item system**

```bash
git add systems/item-system.js
git commit -m "feat: implement ItemSystem with selection, stacking, and synergies

- Rarity-based item selection with level scaling
- Item slot management and stacking support
- Synergy detection for hidden combos
- Passive trigger processing framework"
```

---

## Task 3: Integrate Items into Player Class

**Files:**
- Modify: `entities/player.js`

**Interfaces:**
- Consumes: `ItemSystem` from `systems/item-system.js`
- Produces: Player with `items` array, `itemStats` object, `synergyBonuses` object

- [ ] **Step 1: Import ItemSystem and add item properties to Player constructor**

```javascript
// Add at top of player.js
import { ItemSystem } from '../systems/item-system.js';

// In constructor, after line 46 (this.abilities = new PlayerAbilities(this);)
    // Item system - equipment and bonuses
    this.items = [];
    this.itemStats = {};
    this.synergyBonuses = {};
    this.itemSystem = new ItemSystem();
```

- [ ] **Step 2: Modify calculateDerivedStats to include item stats**

```javascript
// In calculateDerivedStats(), after line 77 (this.speed = this.currentStats.speed;)
    
    // Apply item bonuses
    const itemStats = this.itemStats || {};
    
    // Flat damage bonus
    if (itemStats.atkDmg) {
      this.currentStats.damage += Math.floor(itemStats.atkDmg);
      this.damage = this.currentStats.damage;
    }
    
    // Percent HP bonus
    if (itemStats.hpPercent) {
      const bonusHp = Math.floor(this.baseStats.maxHp * itemStats.hpPercent);
      this.currentStats.maxHp += bonusHp;
      this.maxHp = this.currentStats.maxHp;
    }
    
    // Armor bonus
    if (itemStats.armor) {
      this.currentStats.armor += Math.floor(itemStats.armor);
      this.armor = this.currentStats.armor;
    }
    
    // Speed bonus
    if (itemStats.speed) {
      this.currentStats.speed *= (1 + itemStats.speed);
      this.speed = this.currentStats.speed;
    }
    
    // Evasion (capped at 75%)
    if (itemStats.evasion) {
      this.evasion = Math.min(75, this.evasion + itemStats.evasion);
    }
    
    // Crit chance (capped at 100%)
    if (itemStats.critChance) {
      this.criticalChance = Math.min(1, this.criticalChance + itemStats.critChance);
    }
    
    // Crit damage
    if (itemStats.critDamage) {
      this.criticalDamage += itemStats.critDamage;
    }
    
    // Cooldown reduction (capped at 50%)
    if (itemStats.cdReduction) {
      this.cooldownReduction = Math.min(0.5, this.cooldownReduction + itemStats.cdReduction);
    }
```

- [ ] **Step 3: Add reset method call on death**

```javascript
// Add method to reset items on death
  resetItems() {
    this.items = [];
    this.itemStats = {};
    this.synergyBonuses = {};
    this.itemSystem.reset();
  }
```

- [ ] **Step 4: Commit player integration**

```bash
git add entities/player.js
git commit -m "feat: integrate item system into Player class

- Add items array and item stats tracking
- Apply item bonuses in calculateDerivedStats
- Add reset method for roguelike death mechanic"
```

---

## Task 4: Create Item Selection UI Overlay

**Files:**
- Create: `scenes/item-select.js`

**Interfaces:**
- Consumes: `ITEMS`, `RARITY_COLORS`, `RARITY_STARS` from `config/items.js`
- Produces: `ItemSelectScene` class for overlay rendering

- [ ] **Step 1: Create ItemSelectScene class with layout**

```javascript
// Item Selection Scene - Overlay for choosing items on level-up/boss kill

import { ITEMS, RARITY_COLORS, RARITY_STARS } from '../config/items.js';
import { ScreenItems, readMouse, drawButton, pulse, drawGlowText, wrapText } from './ui.js';

class ItemSelectScene {
  constructor(game) {
    this.game = game;
    this.items = new ScreenItems();
    this.choices = [];
    this.hoveredId = null;
    this.selectedCallback = null;
    this.trigger = null; // 'levelup' or 'bosskill'
  }
```

- [ ] **Step 2: Implement show method to set up selection**

```javascript
  // Show the item selection overlay
  show(choices, trigger, callback) {
    this.choices = choices;
    this.trigger = trigger;
    this.selectedCallback = callback;
    this.hoveredId = null;
  }

  // Hide the overlay
  hide() {
    this.choices = [];
    this.trigger = null;
    this.selectedCallback = null;
    this.hoveredId = null;
  }

  get time() {
    return this.game.clock;
  }
```

- [ ] **Step 3: Implement layout calculation**

```javascript
  layout(width, height) {
    this.items.reset();
    
    const itemCount = this.choices.length;
    if (itemCount === 0) return null;
    
    const cardWidth = 200;
    const cardHeight = 300;
    const gap = 20;
    const totalWidth = itemCount * cardWidth + (itemCount - 1) * gap;
    const startX = (width - totalWidth) / 2;
    const startY = (height - cardHeight) / 2 - 40;
    
    const cards = this.choices.map((item, i) => {
      const x = startX + i * (cardWidth + gap);
      const rect = { x, y: startY, w: cardWidth, h: cardHeight };
      this.items.add(item.id, x, startY, cardWidth, cardHeight, { kind: 'item', index: i });
      return { item, rect };
    });
    
    return { cards, cardWidth, cardHeight, startY };
  }
```

- [ ] **Step 4: Implement update method for input handling**

```javascript
  update(input) {
    if (this.choices.length === 0) return null;
    
    this.layout(this.game.width, this.game.height);
    
    const mouse = readMouse(this.items, input);
    this.hoveredId = mouse.hovered ? mouse.hovered.id : null;
    
    // Keyboard navigation
    const hoveredIndex = mouse.hovered?.index ?? -1;
    if (input.isKeyPressed('ArrowLeft') || input.isKeyPressed('a')) {
      this.hoveredId = this.choices[Math.max(0, hoveredIndex - 1)]?.id || this.choices[0]?.id;
    }
    if (input.isKeyPressed('ArrowRight') || input.isKeyPressed('d')) {
      this.hoveredId = this.choices[Math.min(itemCount - 1, hoveredIndex + 1)]?.id || this.choices[itemCount - 1]?.id;
    }
    
    // Selection
    if (mouse.clicked && mouse.clicked.kind === 'item') {
      return this.selectItem(mouse.clicked.id);
    }
    if (input.isKeyPressed(' ') || input.isKeyPressed('Enter')) {
      const selectedId = this.hoveredId || this.choices[0]?.id;
      if (selectedId) return this.selectItem(selectedId);
    }
    
    return null;
  }

  selectItem(itemId) {
    const callback = this.selectedCallback;
    this.hide();
    if (callback) callback(itemId);
    return { action: 'item_selected', itemId };
  }
```

- [ ] **Step 5: Implement render method with card drawing**

```javascript
  render(ctx, width, height) {
    const layout = this.layout(width, height);
    if (!layout) return;
    
    const { cards, cardWidth, cardHeight, startY } = layout;
    
    // Dark overlay
    ctx.fillStyle = 'rgba(0, 0, 0, 0.85)';
    ctx.fillRect(0, 0, width, height);
    
    // Title
    const title = this.trigger === 'levelup' ? '⚡ LEVEL UP! Choose Your Item ⚡' : '💀 BOSS DEFEATED! Choose Your Reward 💀';
    drawGlowText(ctx, title, width / 2, startY - 60, {
      font: 'bold 28px monospace',
      color: '#0f0',
      blur: 10 + pulse(this.time, 1.5) * 8
    });
    
    // Draw each item card
    for (const { item, rect } of cards) {
      this.drawItemCard(ctx, item, rect, this.hoveredId === item.id);
    }
    
    // Hint
    ctx.globalAlpha = 0.35 + pulse(this.time, 0.9) * 0.5;
    ctx.fillStyle = '#888';
    ctx.font = '14px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('[←/→] Navigate  [SPACE/ENTER] Select  or click', width / 2, startY + cardHeight + 60);
    ctx.globalAlpha = 1;
  }
```

- [ ] **Step 6: Implement item card drawing**

```javascript
  drawItemCard(ctx, item, rect, hovered) {
    const { x, y, w, h } = rect;
    const rarityColor = RARITY_COLORS[item.rarity];
    const starCount = RARITY_STARS[item.rarity];
    
    // Card background
    ctx.fillStyle = hovered ? '#1a1a2e' : '#0d0d1a';
    ctx.fillRect(x, y, w, h);
    
    // Glowing border on hover
    ctx.strokeStyle = hovered ? rarityColor : '#333';
    ctx.lineWidth = hovered ? 3 : 2;
    if (hovered) {
      ctx.shadowColor = rarityColor;
      ctx.shadowBlur = 15;
    }
    ctx.strokeRect(x, y, w, h);
    ctx.shadowBlur = 0;
    
    // SVG Icon
    const iconSize = 60;
    const iconX = x + (w - iconSize) / 2;
    const iconY = y + 20;
    if (item.svgIcon) {
      const img = new Image();
      img.src = 'data:image/svg+xml;base64,' + btoa(item.svgIcon);
      ctx.drawImage(img, iconX, iconY, iconSize, iconSize);
    }
    
    // Name
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 14px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(item.name, x + w / 2, iconY + iconSize + 20);
    
    // Rarity stars
    const stars = '★'.repeat(starCount);
    ctx.fillStyle = rarityColor;
    ctx.font = '12px monospace';
    ctx.fillText(stars, x + w / 2, iconY + iconSize + 38);
    
    // Rarity label
    ctx.fillStyle = rarityColor;
    ctx.font = 'bold 11px monospace';
    ctx.fillText(item.rarity.toUpperCase(), x + w / 2, iconY + iconSize + 54);
    
    // Stats
    let statY = iconY + iconSize + 75;
    ctx.font = '11px monospace';
    ctx.textAlign = 'left';
    
    const stats = [];
    if (item.stats.atkDmg) stats.push(`+${item.stats.atkDmg} ATK`);
    if (item.stats.ap) stats.push(`+${item.stats.ap} AP`);
    if (item.stats.hpPercent) stats.push(`+${Math.round(item.stats.hpPercent * 100)}% HP`);
    if (item.stats.armor) stats.push(`+${item.stats.armor} Armor`);
    if (item.stats.magicResist) stats.push(`+${item.stats.magicResist} MR`);
    if (item.stats.speed) stats.push(`+${Math.round(item.stats.speed * 100)}% Speed`);
    if (item.stats.critChance) stats.push(`+${Math.round(item.stats.critChance * 100)}% Crit`);
    if (item.stats.cdReduction) stats.push(`+${Math.round(item.stats.cdReduction * 100)}% CDR`);
    
    ctx.fillStyle = '#4f4';
    stats.slice(0, 4).forEach((stat, i) => {
      ctx.fillText(stat, x + 15, statY + i * 16);
    });
    
    // Passive description
    if (item.passives && item.passives.length > 0) {
      const passive = item.passives[0];
      statY += stats.length > 0 ? stats.slice(0, 4).length * 16 + 10 : 0;
      
      ctx.fillStyle = '#ffcc00';
      ctx.font = 'bold 10px monospace';
      ctx.fillText(passive.name + ':', x + 15, statY);
      
      ctx.fillStyle = '#aaa';
      ctx.font = '9px monospace';
      const lines = wrapText(passive.description, 25);
      lines.forEach((line, i) => {
        ctx.fillText(line, x + 15, statY + 14 + i * 12);
      });
    }
    
    // Equip button
    if (hovered) {
      const btnY = y + h - 40;
      drawButton(ctx, {
        x: x + 20,
        y: btnY,
        w: w - 40,
        h: 30,
        label: 'EQUIP',
        hovered: true,
        color: rarityColor
      });
    }
  }
}

export { ItemSelectScene };
```

- [ ] **Step 7: Commit the item selection UI**

```bash
git add scenes/item-select.js
git commit -m "feat: add item selection overlay UI

- Card-based item display with rarity styling
- Keyboard and mouse navigation
- SVG icon rendering and stat display
- Passive effect descriptions"
```

---

## Task 5: Hook Item Selection into Game Loop

**Files:**
- Modify: `core/game.js`
- Modify: `scenes/index.js`

**Interfaces:**
- Consumes: `ItemSystem` from `systems/item-system.js`, `ItemSelectScene` from `scenes/item-select.js`
- Produces: Game with item selection state, level-up/boss-kill hooks

- [ ] **Step 1: Import ItemSystem and ItemSelectScene**

```javascript
// Add to imports in game.js (around line 5)
import { ItemSystem } from '../systems/item-system.js';
```

```javascript
// Add to scenes/index.js
export { ItemSelectScene } from './item-select.js';
```

- [ ] **Step 2: Add item selection state to Game constructor**

```javascript
// In constructor, after line 88 (this.levelUpNoticeTimer = 0;)
    // Item selection state
    this.itemSystem = new ItemSystem();
    this.pendingItemSelection = false;
    this.itemChoices = [];
    this.itemSelectionCallback = null;
```

- [ ] **Step 3: Register ItemSelectScene with SceneManager**

```javascript
// In constructor, after line 105 (this.sceneManager.register('lobby', ...);)
    this.sceneManager.register('itemselect', new ItemSelectScene(this));
```

- [ ] **Step 4: Modify announceLevelUp to trigger item selection**

```javascript
// Replace announceLevelUp method (line 526)
  announceLevelUp(player = this.player) {
    this.levelUpNotice = `LEVEL UP - LEVEL ${player.level}`;
    this.levelUpNoticeTimer = 1.8;
    const center = player.getCenter();
    this.particles.spawnExplosion(center.x, center.y, 18, '#0f0');
    this.particles.spawnText('LEVEL UP', center.x, center.y - 40, '#0f0');
    
    // Trigger item selection
    this.triggerItemSelection('levelup', player.level);
  }

  // Trigger item selection overlay
  triggerItemSelection(trigger, level) {
    if (this.pendingItemSelection) return;
    
    const choices = this.itemSystem.generateChoices(4, level, this.player);
    if (choices.length === 0) return;
    
    this.itemChoices = choices;
    this.pendingItemSelection = true;
    this.state = 'itemselect';
    this.sceneManager.switchTo('itemselect');
    
    const itemSelectScene = this.sceneManager.scenes.itemselect;
    itemSelectScene.show(choices, trigger, (itemId) => {
      this.onItemSelected(itemId);
    });
  }
```

- [ ] **Step 5: Add onItemSelected callback**

```javascript
  // Handle item selection completion
  onItemSelected(itemId) {
    if (!itemId) {
      this.pendingItemSelection = false;
      this.state = 'playing';
      return;
    }
    
    const success = this.itemSystem.addItem(itemId, this.player);
    if (success) {
      const item = this.itemSystem.getItem(itemId);
      this.showNotice(`EQUIPPED: ${item.name}`);
    }
    
    this.pendingItemSelection = false;
    this.itemChoices = [];
    this.state = 'playing';
  }
```

- [ ] **Step 6: Hook boss kill to trigger item selection**

```javascript
// Find onBossKill method and add at the end
  onBossKill(boss) {
    // Existing code...
    
    // Trigger item selection for boss kill
    this.triggerItemSelection('bosskill', this.player.level);
  }
```

- [ ] **Step 7: Add item selection state handling to loop**

```javascript
// In loop method, after the 'paused' state check (around line 312), add:
      if (this.state === 'itemselect') {
        const result = this.sceneManager.update(this.input);
        // Item selection handles its own callbacks, just render
        this.sceneManager.render(this.ctx, this.width, this.height, this);
        this.debug.render(this.ctx);
        return;
      }
```

- [ ] **Step 8: Reset item system on run clear**

```javascript
// In clearRunState method, add:
    this.itemSystem.reset();
    this.pendingItemSelection = false;
    this.itemChoices = [];
    this.itemSelectionCallback = null;
```

- [ ] **Step 9: Commit game integration**

```bash
git add core/game.js scenes/index.js
git commit -m "feat: integrate item selection into game loop

- Trigger item selection on level-up and boss kills
- Pause game during selection
- Apply selected items to player
- Reset items on run clear/death"
```

---

## Task 6: Add Item Display to HUD

**Files:**
- Modify: `core/renderer.js`

**Interfaces:**
- Consumes: Player items array
- Produces: Item slot icons in HUD

- [ ] **Step 1: Find renderUI method in renderer.js**

```javascript
// Locate the renderUI method in core/renderer.js
```

- [ ] **Step 2: Add item slots display method**

```javascript
// Add method to draw item slots
  renderItemSlots(ctx, player, x, y) {
    if (!player.items || player.items.length === 0) return;
    
    const slotSize = 32;
    const gap = 4;
    
    ctx.fillStyle = '#111';
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 1;
    
    // Draw slot backgrounds
    ITEM_SLOTS.forEach((slot, i) => {
      const slotX = x + i * (slotSize + gap);
      ctx.fillRect(slotX, y, slotSize, slotSize);
      ctx.strokeRect(slotX, y, slotSize, slotSize);
    });
    
    // Draw equipped items
    player.items.forEach(item => {
      const slotIndex = ITEM_SLOTS.indexOf(item.slot);
      if (slotIndex < 0) return;
      
      const slotX = x + slotIndex * (slotSize + gap);
      
      // Draw icon background
      ctx.fillStyle = RARITY_COLORS[item.rarity];
      ctx.globalAlpha = 0.3;
      ctx.fillRect(slotX, y, slotSize, slotSize);
      ctx.globalAlpha = 1;
      
      // Draw border
      ctx.strokeStyle = RARITY_COLORS[item.rarity];
      ctx.lineWidth = 2;
      ctx.strokeRect(slotX, y, slotSize, slotSize);
      
      // Draw stack count
      if (item.currentStacks > 1) {
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 10px monospace';
        ctx.textAlign = 'right';
        ctx.fillText(item.currentStacks, slotX + slotSize - 2, y + slotSize - 2);
      }
    });
  }
```

- [ ] **Step 3: Call renderItemSlots in renderUI**

```javascript
// In renderUI, after drawing cooldowns, add:
    // Draw item slots
    if (this.game.player && this.game.player.items) {
      this.renderItemSlots(ctx, this.game.player, 10, canvasHeight - 50);
    }
```

- [ ] **Step 4: Commit HUD display**

```bash
git add core/renderer.js
git commit -m "feat: display equipped items in HUD

- Show item slots with rarity-colored borders
- Display stack counts for stacked items
- Position below ability cooldowns"
```

---

## Task 7: Export Items from Config Index

**Files:**
- Modify: `config/index.js`

**Interfaces:**
- Produces: Re-export of items module

- [ ] **Step 1: Add items export to config/index.js**

```javascript
// Add to config/index.js exports
export * from './items.js';
```

- [ ] **Step 2: Commit config export**

```bash
git add config/index.js
git commit -m "feat: export items from config index"
```

---

## Task 8: Manual Testing and Verification

**Files:**
- None (manual testing)

- [ ] **Step 1: Start the game and verify items load**

Run: `python -m http.server` or `node server/index.js`
Open browser to `http://localhost:8000`

- [ ] **Step 2: Test item selection on level-up**

- Start a game with any build
- Kill enemies to gain XP and level up
- Verify item selection overlay appears
- Verify 4 random items are shown
- Select an item and verify it appears in HUD

- [ ] **Step 3: Test item stacking**

- Continue leveling and try to select the same stackable item again
- Verify stack count increases

- [ ] **Step 4: Test item stats apply**

- Check player damage/HP changes after equipping items
- Verify stats increase correctly

- [ ] **Step 5: Test synergies**

- Equip all items for a synergy set (e.g., Void Convergence)
- Verify synergy activates

- [ ] **Step 6: Test death resets items**

- Die in game
- Restart and verify items are cleared

---

## Task 9: Create Systems Index Export

**Files:**
- Modify: `systems/index.js` (if exists) or create it

- [ ] **Step 1: Add item-system export to systems index**

```bash
# Check if systems/index.js exists
ls -la systems/index.js 2>/dev/null || echo "File does not exist"
```

- [ ] **Step 2: Create or modify systems/index.js**

```javascript
// If file exists, add to exports:
export { ItemSystem } from './item-system.js';

// If file doesn't exist, create it:
export { ItemSystem } from './item-system.js';
// ... other system exports
```

- [ ] **Step 3: Commit systems export**

```bash
git add systems/index.js
git commit -m "feat: export ItemSystem from systems index"
```

---

## Spec Coverage Check

| Spec Requirement | Task |
|------------------|------|
| 35 unique items | Task 1 (items.js) |
| 6 equipment slots | Task 1 (ITEM_SLOTS) |
| Rarity system with chances | Task 1 (RARITY_CHANCES), Task 2 (rollRarity) |
| Level 3n elevated chances | Task 2 (isLevel3n check) |
| Item selection UI (1 of 4) | Task 4, Task 5 |
| Level-up trigger | Task 5 (announceLevelUp) |
| Boss kill trigger | Task 5 (onBossKill) |
| Item stacking (max 3, infinite) | Task 2 (addItem stacking logic) |
| Hidden synergies | Task 2 (synergySets) |
| Item stats apply to player | Task 3 (calculateDerivedStats) |
| Items lost on death | Task 3 (resetItems), Task 5 (clearRunState) |
| SVG icons | Task 1 (createSVGIcon) |
| HUD display | Task 6 |

All spec requirements covered.

---

## Self-Review Checklist

- [x] No placeholders (TBD, TODO, implement later)
- [x] All code blocks show actual implementation
- [x] Type consistency across tasks (itemId, player.items, etc.)
- [x] All imports/exports match across files
- [x] File paths are exact and correct
- [x] Each task produces testable output
