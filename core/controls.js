// The controls
//
// An input scheme says what the keyboard and the mouse do in a run: what
// moves the ship, what aims it, what shoots and which keys fire the
// abilities. This turns the raw input into the one input object the
// world understands.
//
// The screens take the mouse whatever the scheme is - this is about
// playing, not about the menus.

import { INPUT_SCHEMES } from './settings.js';

// The mouse in world coordinates. In the local modes the world is the
// canvas, so this is the pointer position as it is. An online run draws a
// fixed-size shared world scaled to fit the window, so the pointer has to
// be taken back out of that scale.
function mouseWorldPos(input, game) {
  const scale = game.worldScale || 1;
  return {
    x: (input.mouseX - (game.worldOffsetX || 0)) / scale,
    y: (input.mouseY - (game.worldOffsetY || 0)) / scale
  };
}

// The angle from the ship's gun to the pointer. Null when there is no
// ship to aim from yet.
function aimAngle(input, game) {
  const player = game.player;
  if (!player) return null;
  const centre = player.getCenter();
  const mouse = mouseWorldPos(input, game);
  // The gun sits a little above the middle of the ship.
  return Math.atan2(mouse.y - (centre.y - 20), mouse.x - centre.x);
}

// The input for the local player, for one frame.
function buildLocalInput(input, schemeName, game) {
  const scheme = INPUT_SCHEMES[schemeName] || INPUT_SCHEMES.keyboard;
  const aim = scheme.aim === 'mouse' ? aimAngle(input, game) : null;

  if (scheme.move === 'mouse') {
    // The ship follows the pointer. The push eases off as the ship gets
    // close, so it settles on the pointer instead of sailing past it and
    // coming back.
    const centre = game.player ? game.player.getCenter() : { x: 0, y: 0 };
    const point = mouseWorldPos(input, game);
    const dx = point.x - centre.x;
    const dy = point.y - centre.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    const strength = distance < 8 ? 0 : Math.min(1, distance / 90);
    return {
      dx: distance ? (dx / distance) * strength : 0,
      dy: distance ? (dy / distance) * strength : 0,
      shoot: input.mouseDown,
      ability1: input.isKeyPressed(scheme.abilityKeys[0]),
      ability2: input.isKeyPressed(scheme.abilityKeys[1]),
      aim
    };
  }

  const movement = input.getMovement();
  return {
    dx: movement.dx,
    dy: movement.dy,
    shoot: scheme.shoot === 'mouse' ? input.mouseDown : input.isKeyDown(' '),
    ability1: input.isKeyPressed(scheme.abilityKeys[0]),
    ability2: input.isKeyPressed(scheme.abilityKeys[1]),
    aim
  };
}

export { buildLocalInput, mouseWorldPos, aimAngle };
