/*
  Executes synchronous functions at a recurring frequency. The first
  or "base" loop determines the shared alpha value for all sibling functions.

  Tip: Add your physics loop first (ex: 1000ms / 30fps = ~33ms), then add the
  rendering loop without any delay. Use the alpha value to interpolate
  rendered objects during your physics engine delay.
*/

class Interval {
  constructor() {
    this.loops = [];
    this.speed = 1;
    this.thread = timestamp => this.update(timestamp);
    this.threadTimestamp = 0;
    this.threadFrame = 0;
  }

  add(callback, delay = -1) {
    // Create a loop with a callback and delay (milliseconds)
    return this.loops.push({ callback, delay, delta: 0, alpha: 0, frame: 0, sum: 0, timestamp: 0 });
  }

  get(i) {
    return this.loops[i];
  }

  remove(i) {
    return this.loops.splice(i, 1);
  }

  start() {
    // Set initial timestamps before starting thread
    this.threadFrame = requestAnimationFrame(timestamp => {
      this.threadTimestamp = timestamp;
      this.loops.forEach(loop => loop.timestamp = timestamp);
      this.thread(timestamp);
    });
  }

  stop() {
    cancelAnimationFrame(this.threadFrame);
  }

  update(timestamp) {
    // Rerun thread on next repaint
    this.threadFrame = requestAnimationFrame(this.thread);

    // Set thread delta from thread timestamp
    const threadDelta = timestamp - this.threadTimestamp;
    this.threadTimestamp = timestamp;

    // Loop through array of loops (descending order)
    for (let i = this.loops.length - 1; i >= 0; i--) {
      // Add thread delta to loop sum
      this.loops[i].sum += threadDelta * this.speed;

      // Trigger loop callback
      if (this.loops[i].sum >= this.loops[i].delay) {
        this.loops[i].sum %= this.loops[i].delay;
        this.loops[i].delta = (timestamp - this.loops[i].timestamp) * this.speed;
        this.loops[i].alpha = this.loops[0].sum / this.loops[0].delay;
        this.loops[i].frame++;
        this.loops[i].timestamp = timestamp;
        this.loops[i].callback(this.loops[i]);
      }
    }
  }
}

export { Interval };