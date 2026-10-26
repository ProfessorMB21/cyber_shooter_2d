# Item Build System Design

## Overview

A roguelike item system where players choose from 4 random items on level-up and boss kills. Items provide stat bonuses, passive effects, and synergize with other items. Players have 6 slots and can build powerful combinations across 35 unique items.

---

## Core Mechanics

### Triggers
- **Level up:** Player gains XP, hits threshold, item selection appears
- **Boss kills:** Triggers item selection as reward
- **Every 3rd level (3, 6, 9...):** Elevated legendary/cosmic chances

### Rarity System

| Rarity | Chance (normal) | Chance (level 3n) | Stat Multiplier |
|--------|-----------------|-------------------|-----------------|
| Rare | 45% | 25% | 1.0× |
| Epic | 35% | 35% | 1.5× |
| Unique | 15% | 25% | 2.5× |
| Legendary | 5% | 10% | 4.0× |
| Cosmic | 0% | 5% | 8.0× |

### Slots
- **Weapon** — Primary damage amplification
- **Armor** — Defensive stats, HP scaling, damage mitigation
- **Ring (×2)** — Hybrid stats, utility effects
- **Amulet** — Powerful unique passives
- **Belt** — Sustain, regeneration, special mechanics
- **Boots** — Movement, evasion, speed synergies

### Stacking
- **Non-stackable:** Most items, one copy max
- **Stackable (max 3):** Some items reach "Unique+" power tier
- **Infinite stacking:** Rare items with unbounded scaling (e.g., +HP per kill)

---

## Item Data Structure

```javascript
{
  id: 'void_blade',
  name: 'Void Blade',
  description: 'Cuts through dimensions, ignoring armor.',
  rarity: 'legendary',
  slot: 'weapon',
  stackable: false,
  maxStacks: 1,
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
  synergies: ['null_shield'],  // Procs when null_shield is equipped
  counters: [],  // No hard counters
  svgIcon: '<svg>...</svg>'
}
```

---

## 35 Unique Items

### WEAPONS (6 items)

#### 1. Void Blade (Legendary)
- **Stats:** +25 ATK, +15 Armor Penetration
- **Passive:** Void Strike — 20% chance to ignore all armor on hit
- **Synergy:** With Null Shield, both gain +10% proc chance

#### 2. Crimson Edge (Unique)
- **Stats:** +18 ATK
- **Passive:** Blood Price — Deal 5% of damage dealt as self-healing
- **Stackable:** Max 3 stacks (healing increases to 8%/12%)

#### 3. Stormcaller (Epic)
- **Stats:** +12 ATK, +10 AP
- **Passive:** Chain Lightning — Every 3rd attack chains to nearby enemy for 50% damage
- **Synergy:** With Volt Ring, chain damage becomes 100%

#### 4. Pestilence (Legendary)
- **Stats:** +20 ATK
- **Passive:** Infect — On hit, apply poison dealing 2% max HP over 3s, stacks infinitely
- **Synergy:** With Plague Bearer, poison spreads to nearby enemies

#### 5. Annihilator (Cosmic)
- **Stats:** +40 ATK, +20 AP
- **Passives:**
  - Execute — Enemies below 20% HP take double damage
  - Devastation — Kills grant +2% ATK permanently (resets on death)
- **Counter:** Hard countered by Rebirth Amulet (halves all damage below 30% HP)

#### 6. Whisper of the End (Unique)
- **Stats:** +15 ATK, +5% Crit Chance
- **Passive:** Silent Killer — Crits deal 50% additional damage as true damage
- **Synergy:** With any crit item, gain +10% crit damage

---

### ARMOR (6 items)

#### 7. Bastion of Eternity (Cosmic)
- **Stats:** +30% HP, +25 Armor, +20 Magic Resist
- **Passives:**
  - Eternal Guard — When HP drops below 30%, become invulnerable for 2s (60s cooldown)
  - Aegis — Allies within range gain +10% of your armor
- **Synergy:** With Crown of Thorns, invulnerability reflects 100% damage taken

#### 8. Void Shell (Legendary)
- **Stats:** +20% HP, +15 Magic Resist
- **Passive:** Phase Shift — 15% chance to completely avoid damage
- **Synergy:** With Void Blade, both gain enhanced effects

#### 9. Titan's Heart (Epic)
- **Stats:** +25% HP, +2 HP Regen
- **Passive:** Growth — Gain +1% max HP per level permanently
- **Stackable:** Max 3 stacks

#### 10. Spectral Plate (Unique)
- **Stats:** +15% HP, +10 Evasion
- **Passive:** Ghost Form — Evasion grants 5% chance to reflect attacks
- **Synergy:** With Phantom Boots, evasion chance doubled

#### 11. Infernal Carapace (Rare)
- **Stats:** +10 Armor, +5 Magic Resist
- **Passive:** Burn Back — 10% of damage taken is dealt to attacker as fire damage
- **Stackable:** Max 3 stacks

#### 12. Adaptive Matrix (Legendary)
- **Stats:** +12 Armor, +12 Magic Resist
- **Passive:** Evolve — After taking damage of one type 5 times, gain +5 resistance to that type
- **Infinite Stacking:** No cap on resistance gains

---

### RINGS (8 items) — 2 slots available

#### 13. Ring of the Void (Epic)
- **Stats:** +8 ATK, +8 AP, +5% CD Reduction
- **Passive:** Void Tap — Abilities have 10% chance to reset cooldown
- **Synergy:** With Void items, chance increases to 20%

#### 14. Chrono Band (Unique)
- **Stats:** +15% CD Reduction
- **Passive:** Time Dilation — Abilities slow nearby enemies by 20% for 1s
- **Stackable:** Max 2 stacks

#### 15. Catalyst Ring (Rare)
- **Stats:** +10 AP
- **Passive:** Amplify — Ability damage increased by 8%
- **Stackable:** Max 3 stacks

#### 16. Storm Signet (Legendary)
- **Stats:** +10 ATK, +15 AP
- **Passive:** Overload — Every 5th ability cast deals 50% bonus damage
- **Synergy:** With Stormcaller, every 3rd ability instead

#### 17. Bloodstone Band (Epic)
- **Stats:** +5% HP, +3% Lifesteal
- **Passive:** Bloodwell — Store 10% of damage taken, release as healing on next ability use

#### 18. Null Ring (Unique)
- **Stats:** +10 Magic Resist, +10% CD Reduction
- **Passive:** Spell Shield — 25% chance to nullify magic damage completely
- **Synergy:** With Null Shield, both gain +15% nullify chance

#### 19. Berserker's Signet (Legendary)
- **Stats:** +15 ATK, +10% Crit Chance
- **Passives:**
  - Fury — Each crit grants +3% ATK for 5s, stacks infinitely
  - Bloodlust — Below 50% HP, +20% ATK speed
- **Synergy:** Any crit item extends Fury duration by 2s

#### 20. Harmony Loop (Cosmic)
- **Stats:** +8 All Stats
- **Passive:** Balance — For every 10 stat points difference between highest and lowest stat, gain +2% to all stats
- **Synergy:** With Cosmic Heart, balance bonus doubled

---

### AMULETS (5 items)

#### 21. Rebirth Amulet (Cosmic)
- **Stats:** +20% HP, +10 All Resistances
- **Passives:**
  - Second Chance — On death, revive with 30% HP (180s cooldown)
  - Resilience — Damage below 30% HP is halved
- **Counter:** Hard counters Annihilator's execute damage

#### 22. Crown of Thorns (Legendary)
- **Stats:** +15% HP
- **Passives:**
  - Retaliate — 25% of damage taken is reflected
  - Thorns — Attackers take 5% of their max HP as damage
- **Synergy:** With Bastion of Eternity, reflects 100% during invulnerability

#### 23. Chrono Heart (Unique)
- **Stats:** +20% CD Reduction, +10 AP
- **Passive:** Time Warp — Using abilities reduces all other cooldowns by 0.5s
- **Stackable:** Max 2 stacks (1s reduction each)

#### 24. Plague Bearer (Epic)
- **Stats:** +10 AP, +10 Magic Resist
- **Passive:** Contagion — Status effects spread to 1 nearby enemy within 2s
- **Synergy:** With Pestilence, poison spreads instantly

#### 25. Executioner's Pendant (Rare)
- **Stats:** +12 ATK
- **Passive:** Execution — Deal 15% bonus damage to enemies below 40% HP
- **Stackable:** Max 3 stacks

---

### BELTS (5 items)

#### 26. Cosmic Heart (Cosmic)
- **Stats:** +15% HP, +10 HP Regen, +5% All Stats
- **Passives:**
  - Cosmic Resilience — All healing increased by 25%
  - Stellar Growth — Gain +0.5% max HP per enemy killed (resets on death)
- **Infinite Stacking:** HP growth unbounded per run

#### 27. Goliath's Girdle (Legendary)
- **Stats:** +25% HP, +5 HP Regen
- **Passive:** Unstoppable — Below 50% HP, gain +50% HP regeneration
- **Synergy:** With Titan's Heart, HP scaling doubled

#### 28. Transfusion Belt (Unique)
- **Stats:** +10% HP, +5% Lifesteal
- **Passive:** Blood Bank — Store up to 20% max HP in a shield, charges from lifesteal
- **Stackable:** Max 2 stacks (30% shield)

#### 29. Catalyst Core (Epic)
- **Stats:** +10 AP, +8% CD Reduction
- **Passive:** Overcharge — After using 3 abilities, next ability deals 30% bonus damage
- **Synergy:** With any CD reduction item, charges faster

#### 30. Molten Core (Rare)
- **Stats:** +8 Armor, +5 HP Regen
- **Passive:** Burning Soul — Deal 5 fire damage per second to nearby enemies
- **Stackable:** Max 3 stacks

---

### BOOTS (5 items)

#### 31. Phantom Striders (Legendary)
- **Stats:** +15% Speed, +15 Evasion
- **Passives:**
  - Phase Walk — Evasion chance increased by 5% after each dodge, resets on hit
  - Ghost Step — After dodging, next attack deals 20% bonus damage
- **Synergy:** With Spectral Plate, evasion doubled

#### 32. Temporal Treads (Cosmic)
- **Stats:** +10% Speed, +15% CD Reduction
- **Passives:**
  - Time Trail — Movement leaves a trail that slows enemies by 30%
  - Temporal Shift — After moving 100 units, reduce active cooldowns by 0.3s
- **Infinite Stacking:** No cap on cooldown reduction from movement

#### 33. Warpath Greaves (Unique)
- **Stats:** +12% Speed, +8 ATK
- **Passive:** Momentum — Build speed while moving, max +30% ATK after 3s
- **Stackable:** Max 2 stacks

#### 34. Stormrunner Boots (Epic)
- **Stats:** +10% Speed, +5 AP
- **Passive:** Lightning Dash — Moving fast leaves lightning trail dealing 10 damage
- **Synergy:** With Stormcaller, lightning damage +50%

#### 35. Steeltoe Stompers (Rare)
- **Stats:** +8% Speed, +5 Armor
- **Passive:** Impact — Dashing into enemies deals 15 damage and knocks back
- **Stackable:** Max 3 stacks

---

## Synergy Paths (Hidden)

Players discover these through experimentation:

### Void Convergence
- Void Blade + Void Shell + Ring of the Void
- **Hidden Bonus:** +30% chance for all void effects to proc
- All void effects also reduce enemy armor by 5 per proc

### Eternal Guardian
- Bastion of Eternity + Goliath's Girdle + Crown of Thorns
- **Hidden Bonus:** Invulnerability extended to 4s, reflects 150% damage

### Crit Cascade
- Berserker's Signet + Whisper of the End + Any evasion item
- **Hidden Bonus:** Crits have 25% chance to trigger a second crit at 50% damage

### Time Fracture
- Chrono Heart + Chrono Band + Temporal Treads
- **Hidden Bonus:** Abilities cost no cooldown once every 30s

### Cosmic Ascension
- Any 3 Cosmic items
- **Hidden Bonus:** All stats +20%, all cooldowns -20%

### Blood Sovereign
- Crimson Edge + Bloodstone Band + Transfusion Belt
- **Hidden Bonus:** Lifesteal over-healing becomes permanent HP shields

---

## Counter System

Some items hard-counter specific builds:

| Item | Counters | Effect |
|------|----------|--------|
| Rebirth Amulet | Annihilator | Halves execute damage |
| Adaptive Matrix | Pestilence | Builds resistance to poison |
| Null Ring | All AP builds | 25% magic nullification |
| Spectral Plate | High ATK builds | Evasion bypasses damage |

---

## Technical Implementation

### New Files
- `config/items.js` — Item definitions, SVG icons, stats, passives
- `systems/item-system.js` — Selection logic, synergy processing, stacking

### Modified Files
- `entities/player.js` — Integrate item stats into `calculateDerivedStats()`, handle passive triggers
- `scenes/ui.js` — Add item selection overlay
- `scenes/game.js` — Hook level-up and boss-kill triggers

### Data Flow
1. Level-up/boss-kill triggers `ItemSystem.showSelection()`
2. `ItemSystem` filters items by slot availability, rarity roll, creates 4 choices
3. Player selects item → `ItemSystem.addItem(item)`
4. `ItemSystem` checks synergies, updates player stats via `player.applyItemStats()`
5. `Player.recalculateStats()` includes item bonuses

---

## UI Mockup

```
┌─────────────────────────────────────────────────────┐
│            ⚡ LEVEL UP! Choose Your Item            │
├───────────────┬───────────────┬───────────────┬─────┤
│   [SVG ICON]  │   [SVG ICON]  │   [SVG ICON]  │ ... │
│               │               │               │     │
│  Void Blade   │  Crimson Edge │ Stormcaller   │     │
│  ★★★★★       │  ★★★★        │  ★★★         │     │
│  LEGENDARY    │  UNIQUE       │  EPIC         │     │
│               │               │               │     │
│  +25 ATK      │  +18 ATK      │  +12 ATK      │     │
│  +15 ArmorPen │               │  +10 AP       │     │
│               │               │               │     │
│  Void Strike: │  Blood Price: │ Chain Lightn: │     │
│  20% ignore   │  5% lifesteal │ 3rd hit chain │     │
│  armor        │               │               │     │
│               │               │               │     │
│  [  EQUIP  ]  │  [  EQUIP  ]  │  [  EQUIP  ]  │     │
└───────────────┴───────────────┴───────────────┴─────┘

         Current Build: [Slot Icons] [Slot Icons] ...
```

---

## Next Steps

1. Create `config/items.js` with all 35 items and SVG icons
2. Implement `systems/item-system.js` with selection/synergy logic
3. Integrate into `player.js` for stat calculations
4. Build UI in `scenes/ui.js` for selection overlay
5. Hook triggers in `scenes/game.js`
6. Playtest and balance rarity/drop rates
