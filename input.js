// Input Handler

class InputHandler {
  constructor(canvas) {
    this.keys = {};
    this.keysPressed = {}; // For one-shot key detection
    this.mouseX = 0;
    this.mouseY = 0;
    this.mouseDown = false;
    this.mouseClicked = false;
    this.canvas = canvas;

    this.setupEventListeners();
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
      this.keysPressed[e.key.toLowerCase()] = false;
    });

    // Mouse events relative to canvas
    if (this.canvas) {
      this.canvas.addEventListener('mousemove', (e) => {
        const rect = this.canvas.getBoundingClientRect();
        this.mouseX = e.clientX - rect.left;
        this.mouseY = e.clientY - rect.top;
      });

      this.canvas.addEventListener('mousedown', (e) => {
        this.mouseDown = true;
        this.mouseClicked = true;
      });

      this.canvas.addEventListener('mouseup', (e) => {
        this.mouseDown = false;
      });
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

  // Get mouse position
  getMousePos() {
    return { x: this.mouseX, y: this.mouseY };
  }

  // Get mouse position as normalized vector from center
  getMouseDirection(centerX, centerY) {
    const dx = this.mouseX - centerX;
    const dy = this.mouseY - centerY;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance === 0) return { x: 0, y: -1 };

    return {
      x: dx / distance,
      y: dy / distance
    };
  }

  // Clear all input state
  clear() {
    this.keys = {};
    this.keysPressed = {};
    this.mouseClicked = false;
  }
}

export { InputHandler };
