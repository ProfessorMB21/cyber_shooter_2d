# Cyber Shooter 2D - Graphics & Gameplay Enhancement Plan

## Status (updated 2026-10-22)

**Phase 1 is shipped. Phases 2-4 are mostly still open.**

| Item | Status |
|---|---|
| 1.1 UI visual hierarchy | Done |
| 1.2 Particle variety | Done - 9 types (was 4) |
| 1.3 Build-specific visuals | Done - extracted to `entities/build-visuals.js` |
| 2.1 Advanced camera & screen effects | Partly - screen shake only |
| 2.2 Skill visual feedback | Partly - cooldowns and effects exist, no per-skill identity |
| 2.3 Enemy variety | Partly - colours and shapes differ, no telegraphs or spawn animations |
| 2.4 Gameplay juice | Partly - particles on level up, no death animations or XP floaters |
| 3.x Major features | Not started |
| 4.1 Performance optimization | Done in the 2026-10-22 fix pass (see CHANGELOG) |
| 4.2 Audio | Not started |
| 4.3 UI/UX refinement | Partly |

Two of the plan's assumptions have since changed:

- **The "canvas 2D, no 3D" constraint is under review.** A renderer swap
  (three.js or PixiJS) is being considered for performance headroom. The
  current measurement says 253 of the 254 remaining draws per frame use
  `shadowBlur`, so pre-rendered glow sprites are the cheaper first step.
- **The 300-line file limit is still in force** and still worth keeping.

---

## Executive Summary

Your cyber_shooter_2d game has a solid foundation with well-organized modular code, comprehensive game systems, and good visual feedback. This plan identifies strategic improvements across graphics fidelity and gameplay depth while respecting the architectural constraints (vanilla JS, 300-line file limit, canvas-based rendering).

---

## PHASE 1: Quick Wins (1-2 days) — High Impact, Low Effort

### 1.1 Enhanced Visual Hierarchy & UI Polish ✅
**Priority**: ⭐⭐⭐⭐⭐ Quick Win

**Shipped**:
- Framed stat panels in `core/renderer.js` (green border, semi-transparent
  background)
- Emoji stat indicators (❤️, ⚔️, 💨, ⭐)
- Color-coded difficulty menu
- Build-specific colour tinting and border weight on the selection screen

**Still open**:
- Build icons or visual previews on the selection screen
- Combo display with visual scaling/animation
- Level-up feedback is a fading notice and a particle burst - deliberately
  non-blocking, so it stays out of the way

---

### 1.2 Expanded Particle Variety ✅
**Priority**: ⭐⭐⭐⭐ High Impact

**Shipped**: 9 particle types - explosion, trail, spark, text, critical,
healing, buff, electric, and the pooled spawn helpers
(`spawnCritical`, `spawnHealing`, `spawnBuff`, `spawnElectric`).

**Still open**:
- Slash effects for skill hits
- XP orb floaters
- Shield impact particles

---

### 1.3 Build-Specific Visual Polish ✅
**Priority**: ⭐⭐⭐⭐ Quality Enhancement

**Shipped**: all 7 builds draw a distinct decoration, extracted into
`entities/build-visuals.js` so `entities/player.js` stays small. Skipped
automatically in Performance mode and when the frame rate drops below
45 fps.

---

---

## PHASE 2: Medium Effort, High Impact (3-5 days) — Significant Polish

### 2.1 Advanced Camera & Screen Effects
**Priority**: ⭐⭐⭐⭐⭐ Strategic Enhancement

**Current State**: Basic screen shake on damage/kills

**Enhancements**:
- **Dynamic zoom**: Subtle zoom-in on critical hits or boss encounters
- **Directional screen shake**: Shake direction indicates enemy location
- **Chromatic aberration**: Color separation effect on big hits (advanced but doable)
- **Motion blur**: Subtle blur trails for fast projectiles/movement
- **Vignette effect**: Darkened edges during high-intensity moments
- **Slow-mo on boss kill**: Brief frame slow-down for dramatic effect

**Implementation**: Extend `core/visual-effects.js`, add to `core/renderer.js` post-processing

**Effort**: 4-5 hours | **Code Complexity**: Medium | **Performance**: Moderate (GPU-friendly canvas ops)

---

### 2.2 Skill System Visual Feedback
**Priority**: ⭐⭐⭐⭐ Gameplay Clarity

**Current State**: Skills work but lack distinct visual identity

**Enhancements**:
- **Unique projectile appearances** per skill (not all bullets identical)
- **Skill activation visual**: Flash, energy burst, or specific effect per skill
- **Skill cooldown ring**: Circular progress indicator in UI or on player
- **Buff aura system**: Visible auras showing active buffs/skills
- **Skill-specific particle trails**: Overload has yellow/orange, Teleport has purple, etc.
- **Skill preview on menu**: Show what each skill does visually

**Implementation**: 
- Enhance `Projectile` class to store source skill
- Update `entities/player.js` skill activation
- Extend particle system with skill-specific effects
- Modify `core/renderer.js` for cooldown visualization

**Effort**: 5-6 hours | **Code Complexity**: Medium | **Performance**: Good

---

### 2.3 Enemy Variety & Visual Distinction
**Priority**: ⭐⭐⭐⭐ Gameplay Enhancement

**Current State**: 5 enemy types with color differentiation

**Enhancements**:
- **Elite variant visual upgrade**: Crown/aura indicating elite status
- **Boss visual hierarchy**: Significantly larger, more detailed, unique color scheme
- **Movement pattern visualization**: Trails showing enemy intent (Dasher gets speed lines)
- **Health indication**: Enemy size or intensity reflects remaining HP
- **Attack telegraphing**: Visual wind-up before shooter fires, obvious tells
- **Spawn animations**: Enemies fade in or scale up for clarity

**Implementation**: Enhance `entities/enemy.js` and `entities/boss.js` draw methods

**Effort**: 4-5 hours | **Code Complexity**: Low-Medium | **Performance**: Good

---

### 2.4 Gameplay Feedback & Juiciness
**Priority**: ⭐⭐⭐⭐⭐ Player Satisfaction

**Current State**: Functional but minimal feedback

**Enhancements**:
- **Hit stun**: Brief enemy knockback or freeze on hit
- **Screen impact**: Slight zoom/shake on boss damage
- **Enemy death animations**: Spiral out, explode with particles, rather than instant disappear
- **Projectile impact effects**: Different particles/sounds concept based on what hit
- **Pickup attraction**: Pickups move toward player when nearby
- **XP gain floaters**: "+50 XP" text floats up on kill
- **Level up presentation**: Special animation, particle burst, "LEVEL UP" text

**Implementation**: 
- Add death animation state to enemies
- Enhance pickup behavior in `entities/pickup.js`
- Extend damage system to trigger impact effects
- Add floating text particles to particle system

**Effort**: 5-6 hours | **Code Complexity**: Medium | **Performance**: Good

---

## PHASE 3: Major Features (5-7 days) — New Gameplay Depth

### 3.1 Expanded Skill System
**Priority**: ⭐⭐⭐⭐ Gameplay Depth

**Current State**: 2 skills per build with fixed mechanics

**Enhancements**:
- **Skill upgrade system**: Unlock enhanced versions of skills at high levels
- **Passive skill trees**: Mini progression within each build
- **Ultimate abilities**: High cooldown, high impact ability per build
- **Combo mechanics**: Chaining skills creates bonus effects
- **Skill customization**: Choose 2 from 4 skills per build
- **Skill synergies**: Certain skills work better together

**Implementation**:
- Extend `entities/abilities.js` with upgrade system
- Add skill selection to menu (`scenes/` update)
- Modify player level-up system to unlock skills
- Update UI to show available skills

**Effort**: 6-8 hours | **Code Complexity**: High | **Performance**: Good

---

### 3.2 Enemy Behavior & AI Enhancement
**Priority**: ⭐⭐⭐⭐ Gameplay Challenge

**Current State**: Unpredictable movement, fixed attack patterns

**Enhancements**:
- **Enemy formations**: Enemies spawn in coordinated groups
- **Flanking AI**: Enemies attempt to surround player
- **Ranged + melee tactics**: Shooters stay back, grunts rush
- **Adaptive difficulty**: Enemies adjust strategy based on player performance
- **Unique boss patterns per level**: Not just stat scaling
- **Enemy communication**: Visual indicators when enemies "coordinate"

**Implementation**:
- Enhance `entities/enemy.js` with state machines
- Add formation spawning to `core/spawning.js`
- Update boss patterns in `entities/boss-patterns.js`
- Add difficulty adaptation logic to `core/spawning.js`

**Effort**: 6-7 hours | **Code Complexity**: High | **Performance**: Good

---

### 3.3 Progressive Cosmetics & Unlockables
**Priority**: ⭐⭐⭐ Long-term Engagement

**Current State**: No meta-progression beyond current run

**Enhancements**:
- **Kill milestone achievements**: "100 kills", "10 bosses defeated", etc.
- **Build mastery**: Unlock special skins/trails for builds with high kills
- **Difficulty achievements**: "Beat Nightmare mode"
- **Cosmetic effects**: Alternate bullet colors, trail styles, death animations
- **Prestige system**: Reset with rewards for visual customization
- **Local storage progression**: Track all-time stats

**Implementation**:
- Create cosmetics config file
- Add localStorage persistence
- Create achievement system
- Update menu to show cosmetics/stats
- Modify rendering to use cosmetics

**Effort**: 5-6 hours | **Code Complexity**: Medium | **Performance**: Good

---

### 3.4 Boss Encounter Evolution
**Priority**: ⭐⭐⭐⭐ Climactic Gameplay

**Current State**: Bosses spawn at fixed levels with basic patterns

**Enhancements**:
- **Multi-phase bosses**: Health thresholds trigger new attack patterns
- **Boss telegraphing**: Clear visual indicators before attacks
- **Environmental hazards during boss fights**: Add obstacles
- **Boss weakpoint system**: Hitting specific spots deals more damage
- **Boss-specific mechanics**: Each boss has unique gimmick
- **Build-vs-Boss matchups**: Some builds counter some bosses

**Implementation**:
- Extend `entities/boss.js` with phase system
- Create boss-specific visual indicators
- Add weakpoint detection to collision system
- Enhance `entities/boss-patterns.js` with multi-phase patterns

**Effort**: 6-7 hours | **Code Complexity**: High | **Performance**: Good

---

## PHASE 4: Polish & Optimization (2-3 days) — Refinement

### 4.1 Performance Optimization ✅
**Priority**: ⭐⭐⭐ Sustainability

**Shipped (2026-10-22)**: a headless measurement harness and the fix pass it
drove. The game was rendering the scene 333 times per frame and the reported
frame rate was a fiction. Both are fixed and measured - see CHANGELOG.md.

**Still open**:
- 253 of the 254 remaining draws per frame use `shadowBlur`, which is one
  gaussian blur pass per draw call. Pre-rendered glow sprites would remove
  nearly all of them.
- Collision detection is still a linear scan (`core/spatial.js` has a grid
  index that nothing uses).
- Batch canvas operations where possible
- Test on lower-end devices

**Effort**: 2-3 hours | **Code Complexity**: Medium

---

### 4.2 Audio Concept Layer
**Priority**: ⭐⭐⭐ Immersion (Optional - JS Web Audio API)

**Note**: No audio currently implemented, but recommended:
- Weapon fire sounds (different per build)
- Enemy death sounds
- Skill activation sounds
- Boss music/effects
- UI interaction sounds

**Implementation**: Use Web Audio API for procedural/simple sounds

**Effort**: 3-4 hours | **Code Complexity**: Low | **Performance**: Good

---

### 4.3 UI/UX Refinement
**Priority**: ⭐⭐⭐ User Experience

**Improvements**:
- Better menu navigation feedback
- Clearer control display (show keybindings in-game)
- Stats tooltip explanations
- Difficulty tooltips with expected challenge
- Build descriptions on menu
- High score tracking
- Replay value incentives

**Implementation**: Enhance menu scenes, add overlay system

**Effort**: 3-4 hours | **Code Complexity**: Low | **Performance**: Good

---

## Implementation Priority Matrix

| Enhancement | Phase | Effort | Impact | Start When? | Status |
|---|---|---|---|---|---|
| Enhanced UI Visual Hierarchy | 1 | 2h | ⭐⭐⭐⭐ | Immediate | Done |
| Expanded Particle Variety | 1 | 3h | ⭐⭐⭐⭐ | Immediate | Done |
| Build-Specific Visuals | 1 | 2h | ⭐⭐⭐⭐ | Immediate | Done |
| Advanced Camera Effects | 2 | 4h | ⭐⭐⭐⭐⭐ | After Phase 1 | Open |
| Skill Visual Feedback | 2 | 5h | ⭐⭐⭐⭐ | After Phase 1 | Partly |
| Enemy Visual Upgrade | 2 | 4h | ⭐⭐⭐⭐ | Parallel | Partly |
| Gameplay Juiciness | 2 | 5h | ⭐⭐⭐⭐⭐ | After Phase 1 | Partly |
| Expanded Skills | 3 | 7h | ⭐⭐⭐⭐ | Mid-project | Open |
| Enemy AI Enhancement | 3 | 6h | ⭐⭐⭐⭐ | Mid-project | Open |
| Cosmetics/Unlockables | 3 | 5h | ⭐⭐⭐ | Late-project | Open |
| Boss Evolution | 3 | 6h | ⭐⭐⭐⭐ | Late-project | Open |

---

## Architecture Considerations

### Strengths to Preserve
✅ Clean modular structure (one system per file)  
✅ Centralized configuration (easy to tweak balance)  
✅ Particle system foundation (extensible)  
✅ Event-driven combat system  
✅ Scene management for different screens  

### Implementation Constraints
- **Canvas-based rendering**: No 3D, keep effects simple (no complex shaders needed).
  *Under review* - a renderer swap is being considered for performance
  headroom. If it happens, this constraint changes; see the status note at
  the top.
- **300-line file limit**: Each enhancement should split across multiple small files if needed
- **No external libraries**: Use only vanilla JS Canvas API, Web Audio API (browser native)
- **Performance ceiling**: Keep simultaneous particles < 300, entities < 100 total

### Code Organization for New Features
- Create `systems/effects.js` for advanced camera/visual effects
- Create `systems/cosmetics.js` for cosmetic system management
- Extend `config/achievements.js` for milestone tracking
- Add `ui/` directory for UI components if growing too large
- Keep `entities/` focused on game logic, move rendering details to `systems/`

---

## Recommended Roadmap

### Week 1: Visual Polish (Quick Wins + Phase 2 Start)
- Day 1-2: Phase 1 enhancements (UI, particles, build visuals) - **done**
- Day 3-4: Advanced camera effects, skill feedback
- Day 5: Enemy visuals, gameplay juiciness

### Week 2: Gameplay Depth (Phase 3)
- Day 1-2: Skill system expansion
- Day 3-4: Enemy AI enhancement
- Day 5-7: Boss encounters + cosmetics/achievements

### Week 3: Polish & Release (Phase 4)
- Day 1: Performance optimization - **done**, except the `shadowBlur` work
- Day 2: Audio implementation (optional)
- Day 3: Final UI polish & testing

---

## Success Metrics

After implementing these enhancements, you should see:
- More satisfying moment-to-moment gameplay (juice/feedback)
- Clearer visual distinction between game elements
- Deeper strategic choices (skill selection, build variety)
- Longer play sessions (achievements, cosmetics, boss variety)
- Professional visual polish comparable to indie retro shooters

