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
      if (!player.synergyBonuses) player.synergyBonuses = {};
      player.synergyBonuses['cosmic_ascension'] = { allStats: 0.2, cooldownReduction: 0.2 };
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
