// Game Mode Configurations
//
// A mode decides how many players are in the run, whether they share a
// screen, and where the world is simulated. The menu reads this list to
// build its mode selection, so adding a mode is a config change as much as
// a code change.

const GAME_MODES = {
  single: {
    id: 'single',
    name: 'Single Player',
    description: 'One pilot against the swarm.',
    maxPlayers: 1,
    online: false
  },
  dualist: {
    id: 'dualist',
    name: 'Dualist',
    description: 'You and an AI wingman. Shared kills, shared XP.',
    maxPlayers: 2,
    online: false
  }
};

// The mode a fresh run starts in.
const DEFAULT_MODE = 'single';

export { GAME_MODES, DEFAULT_MODE };
