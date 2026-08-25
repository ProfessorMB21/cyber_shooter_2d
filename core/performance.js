// Performance Monitoring System

class PerformanceMonitor {
  constructor() {
    this.frameCount = 0;
    this.lastTime = performance.now();
    this.fps = 60;
    this.avgFrameTime = 0;
    this.frameTimes = [];
    this.maxFrameSamples = 30;
  }

  update() {
    const now = performance.now();
    const frameTime = now - this.lastTime;
    this.lastTime = now;

    this.frameTimes.push(frameTime);
    if (this.frameTimes.length > this.maxFrameSamples) {
      this.frameTimes.shift();
    }

    this.frameCount++;
    if (this.frameCount % 30 === 0) {
      const avgTime = this.frameTimes.reduce((a, b) => a + b, 0) / this.frameTimes.length;
      this.avgFrameTime = avgTime;
      this.fps = Math.round(1000 / avgTime);
    }
  }

  shouldSkipEffects() {
    // Skip expensive effects if FPS drops below 45
    return this.fps < 45;
  }

  getQualityLevel() {
    if (this.fps >= 55) return 'high';
    if (this.fps >= 45) return 'medium';
    return 'low';
  }
}

export { PerformanceMonitor };
