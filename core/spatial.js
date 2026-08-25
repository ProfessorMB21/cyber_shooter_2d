// Spatial Hashing for Fast Collision Detection

class SpatialGrid {
  constructor(width, height, cellSize = 100) {
    this.width = width;
    this.height = height;
    this.cellSize = cellSize;
    this.cols = Math.ceil(width / cellSize);
    this.rows = Math.ceil(height / cellSize);
    this.grid = [];
    this.clear();
  }

  clear() {
    this.grid = Array(this.cols * this.rows).fill(null).map(() => []);
  }

  getKey(x, y) {
    const col = Math.floor(x / this.cellSize);
    const row = Math.floor(y / this.cellSize);
    if (col < 0 || row < 0 || col >= this.cols || row >= this.rows) return -1;
    return row * this.cols + col;
  }

  insert(entity, x, y) {
    const key = this.getKey(x, y);
    if (key >= 0) this.grid[key].push(entity);
  }

  getNearby(x, y, range = 50) {
    const entities = new Set();
    const col = Math.floor(x / this.cellSize);
    const row = Math.floor(y / this.cellSize);

    for (let dx = -1; dx <= 1; dx++) {
      for (let dy = -1; dy <= 1; dy++) {
        const c = col + dx;
        const r = row + dy;
        if (c >= 0 && c < this.cols && r >= 0 && r < this.rows) {
          const key = r * this.cols + c;
          this.grid[key].forEach(e => entities.add(e));
        }
      }
    }

    return Array.from(entities);
  }
}

export { SpatialGrid };
