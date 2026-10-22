// Mouse support for the screens.
//
// A screen lists what it draws as a set of items with a rectangle, and the
// mouse works out which one the pointer is over. The list is built by the
// same method that draws the screen, so a click always lands on exactly
// what the player can see.

class ScreenItems {
  constructor() {
    this.items = [];
  }

  // Start a fresh list - a screen rebuilds it every frame.
  reset() {
    this.items.length = 0;
  }

  // Add an item. `id` is what the screen wants back when it is clicked,
  // and `data` is whatever else it needs to know about the item.
  add(id, x, y, w, h, data = {}) {
    const item = { id, x, y, w, h, ...data };
    this.items.push(item);
    return item;
  }

  // The item under the point, or null. The last one added wins, so a
  // panel drawn over another panel takes the click.
  at(x, y) {
    for (let i = this.items.length - 1; i >= 0; i--) {
      const item = this.items[i];
      if (x >= item.x && x <= item.x + item.w &&
          y >= item.y && y <= item.y + item.h) {
        return item;
      }
    }
    return null;
  }

  // A row of buttons across an area. The rectangles are returned as well
  // as recorded, so the drawing and the click test use the same numbers.
  // `originX` is the left edge of the area, for a row that is not across
  // the whole screen.
  buttonRow(ids, y, width, height = 32, gap = 20, originX = 0) {
    const count = ids.length;
    const buttonWidth = Math.min(200, (width - gap * (count + 1)) / count);
    const total = buttonWidth * count + gap * (count - 1);
    const rects = {};
    ids.forEach((id, i) => {
      const x = originX + (width - total) / 2 + i * (buttonWidth + gap);
      const rect = { x, y, w: buttonWidth, h: height };
      rects[id] = rect;
      this.add(id, x, y, buttonWidth, height, { kind: 'button' });
    });
    return rects;
  }
}

// Read the mouse for a screen.
//
// `hovered` is the item under the pointer and `clicked` is the item that
// was clicked - either of them is null when there is nothing there. The
// pointer only moves the selection when the mouse actually moved, so the
// keyboard and the mouse do not fight over it.
function readMouse(items, input) {
  const pointer = input.getMousePos();
  const hovered = items.at(pointer.x, pointer.y);
  let clicked = null;
  if (input.wasMouseClicked()) {
    const click = input.getClickPos();
    clicked = items.at(click.x, click.y);
  }
  return { hovered, clicked, moved: input.consumeMouseMove() };
}

// A button. The rectangle it covers is recorded by the screen's layout,
// so the drawing here and the click test always agree.
function drawButton(ctx, options) {
  const { x, y, w, h, label, hovered = false, color = '#0f0' } = options;
  ctx.fillStyle = hovered ? color : 'rgba(0, 0, 0, 0.7)';
  ctx.fillRect(x, y, w, h);
  ctx.strokeStyle = color;
  ctx.lineWidth = 2;
  ctx.strokeRect(x, y, w, h);
  ctx.fillStyle = hovered ? '#000' : color;
  ctx.font = 'bold 15px monospace';
  ctx.textAlign = 'center';
  ctx.fillText(label, x + w / 2, y + h / 2 + 5);
}

export { ScreenItems, readMouse, drawButton };
