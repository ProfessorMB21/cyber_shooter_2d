// Pickup Configuration

const PICKUPS = {
  health: { value: 20, color: '#44ff44' },
  shield: { value: 10, color: '#4444ff' },
  speed: { value: 5, color: '#ffff44' },
  damage: { value: 2, color: '#ff4444' }
};

// Item definitions for UI/inventory
const ITEMS = {
  passive: [
    { name: 'HP Potion', effect: 'heal', value: 20, rarity: 'common' },
    { name: 'Strength Potion', effect: 'stat', value: 5, type: 'damage', rarity: 'uncommon' },
    { name: 'Health Potion', effect: 'stat', value: 10, type: 'armor', rarity: 'uncommon' },
    { name: 'Speed Potion', effect: 'stat', value: 5, type: 'speed', rarity: 'uncommon' },
    { name: 'Evasion Potion', effect: 'stat', value: 10, type: 'evasion', rarity: 'uncommon' },
    { name: 'Regeneration Potion', effect: 'stat', value: 2, type: 'regen', rarity: 'rare' },
    { name: 'Critical Potion', effect: 'stat', value: 10, type: 'crit_chance', rarity: 'rare' }
  ],
  active: [
    { name: 'Healing Shot', type: 'heal', cooldown: 6, duration: 0 },
    { name: 'Shield', type: 'shield', cooldown: 8, duration: 0 },
    { name: 'Sniper Shot', type: 'crit', cooldown: 10, duration: 0 },
    { name: 'Berserk Rage', type: 'rage', cooldown: 12, duration: 0 },
    { name: 'Dash', type: 'dash', cooldown: 4, duration: 0.2 },
    { name: 'Teleport', type: 'teleport', cooldown: 12, duration: 0 },
    { name: 'Ground Slam', type: 'aoe', cooldown: 8, duration: 0 },
    { name: 'Adrenaline Rush', type: 'speed', cooldown: 12, duration: 4 },
    { name: 'Smoke Screen', type: 'invisibility', cooldown: 15, duration: 3 },
    { name: 'Whirlwind', type: 'whirlwind', cooldown: 10, duration: 2 },
    { name: 'Divine Protection', type: 'immunity', cooldown: 20, duration: 2 },
    { name: 'Overload', type: 'damage_boost', cooldown: 15, duration: 5 }
  ]
};

export { PICKUPS, ITEMS };
