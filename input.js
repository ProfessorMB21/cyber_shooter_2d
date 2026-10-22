// Input Handler

class InputHandler {
  constructor(canvas) {
    this.keys = {};
    this.keysPressed = {}; // For one-shot key detection
    this.mouseX = 0;
    this.mouseY = 0;
    this.mouseDown = false;
    this.mouseClicked = false;
    // Where the pointer was when it was clicked. The pointer may well have
    // moved on by the time the click is handled, so the position of the
    // click itself is kept.
    this.clickX = 0;
    this.clickY = 0;
    // Set whenever the pointer moves, and consumed by the screens so that
    // a screen can follow the pointer without the keyboard fighting it.
    this.mouseMoved = false;
    this.canvas = canvas;

    // Setup event listeners after a small delay to ensure canvas is in DOM
    setTimeout(() => {
      this.setupEventListeners();
    }, 0);
  }

  setupEventListeners() {
    // Keyboard events
    window.addEventListener('keydown', (e) => {
      this.keys[e.key.toLowerCase()] = true;
      this.keys[e.code] = true;

      // Track pressed state for one-shot detection
      if (!this.keysPressed[e.key.toLowerCase()]) {
        this.keysPressed[e.key.toLowerCase()] = true;
      }

      // Prevent scrolling with arrow keys/space
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) {
        e.preventDefault();
      }
    });

    window.addEventListener('keyup', (e) => {
      this.keys[e.key.toLowerCase()] = false;
      this.keys[e.code] = false;
      // NOTE: keysPressed is deliberately NOT cleared here. A tap that begins
      // and ends between two frames would otherwise be lost. isKeyPressed()
      // consumes the one-shot flag instead.
    });

    // Mouse events relative to canvas
    if (this.canvas) {
      this.canvas.addEventListener('mousemove', (e) => {
        const rect = this.canvas.getBoundingClientRect();
        this.mouseX = e.clientX - rect.left;
        this.mouseY = e.clientY - rect.top;
        this.mouseMoved = true;
      });

      this.canvas.addEventListener('mousedown', (e) => {
        // The right button is not used - the left one is the gun.
        if (e.button !== undefined && e.button !== 0) return;
        // The position comes from the event, not from the last move. A
        // press that arrives without a move - the pointer coming back
        // into the window, say - would otherwise be recorded at
        // wherever the pointer was last seen.
        const rect = this.canvas.getBoundingClientRect();
        this.mouseX = e.clientX - rect.left;
        this.mouseY = e.clientY - rect.top;
        this.mouseDown = true;
        this.mouseClicked = true;
        this.clickX = this.mouseX;
        this.clickY = this.mouseY;
      });

      this.canvas.addEventListener('mouseup', (e) => {
        if (e.button !== undefined && e.button !== 0) return;
        this.mouseDown = false;
      });

      // The right button would otherwise open the browser's own menu over
      // the game.
      this.canvas.addEventListener('contextmenu', (e) => e.preventDefault());
    }
  }

  // Check if key is held down
  isKeyDown(key) {
    return !!this.keys[key.toLowerCase()];
  }

  // Check if key was just pressed (one-shot)
  isKeyPressed(key) {
    const lowerKey = key.toLowerCase();
    if (this.keysPressed[lowerKey]) {
      this.keysPressed[lowerKey] = false;
      return true;
    }
    return false;
  }

  // Check if any movement keys are pressed
  getMovement() {
    let dx = 0;
    let dy = 0;

    if (this.isKeyDown('w') || this.isKeyDown('ArrowUp')) dy -= 1;
    if (this.isKeyDown('s') || this.isKeyDown('ArrowDown')) dy += 1;
    if (this.isKeyDown('a') || this.isKeyDown('ArrowLeft')) dx -= 1;
    if (this.isKeyDown('d') || this.isKeyDown('ArrowRight')) dx += 1;

    // Normalize diagonal movement
    if (dx !== 0 && dy !== 0) {
      dx *= 0.707;
      dy *= 0.707;
    }

    return { dx, dy };
  }

  // Check if mouse was clicked (one-shot)
  wasMouseClicked() {
    if (this.mouseClicked) {
      this.mouseClicked = false;
      return true;
    }
    return false;
  }

  // True once after the pointer has moved. A screen uses it to follow the
  // pointer with its selection, so the two do not fight over it.
  consumeMouseMove() {
    if (!this.mouseMoved) return false;
    this.mouseMoved = false;
    return true;
  }

  // Get mouse position
  getMousePos() {
    return { x: this.mouseX, y: this.mouseY };
  }

  // Where the pointer was when it was clicked
  getClickPos() {
    return { x: this.clickX, y: this.clickY };
  }

  // Clear all input state
  clear() {
    this.keys = {};
    this.keysPressed = {};
    this.mouseClicked = false;
    this.mouseMoved = false;
  }
}

export { InputHandler };
