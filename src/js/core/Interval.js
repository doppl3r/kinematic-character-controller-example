/*
  Executes single or multiple functions at a recurring frequency. The first
  or "base" loop determines the shared alpha value for all sibling functions.

  Tip: Add your physics loop first (ex: 1000ms / 30fps), then add the
  rendering loop without any delay. Use the alpha value to interpolate
  rendered objects during your physics engine delay.
*/

class Interval {
  constructor() {
    this.loops = [];
    this.speed = 1;
    this.running = false;
  }

  add(callback, delay = -1) {
    // Create a loop with a callback and delay (milliseconds)
    return this.loops.push({ callback, delay, delta: 0, alpha: 0, sum: 0, timestamp: 0 });
  }

  get(i) {
    return this.loops[i];
  }

  remove(i) {
    return this.loops.splice(i, 1);
  }

  start() {
    this.running = true;
    this.loops.forEach(loop => loop.delta = loop.alpha = loop.frame = 0);
    
    // Start thread after the first animation frame
    const thread = timestamp => this.update(thread, timestamp);
    requestAnimationFrame(timestamp => thread(timestamp));
  }

  update(thread, timestamp) {
    if (this.running == true) {
      // Rerun thread on next repaint
      requestAnimationFrame(thread);

      // Declare delta/alpha from base loop [0]
      const diff = (timestamp - this.timestamp || 0) * this.speed;
      const alpha = this.loops[0].sum / this.loops[0].delay;
      this.timestamp = timestamp;

      // Loop through array of loops (descending order)
      for (let i = this.loops.length - 1; i >= 0; i--) {
        // Add delta time to sum
        this.loops[i].timestamp = this.loops[i].timestamp || timestamp;
        this.loops[i].sum += diff;

        // Trigger loop callback
        if (this.loops[i].sum >= this.loops[i].delay) {
          this.loops[i].sum %= this.loops[i].delay;
          this.loops[i].alpha = alpha;
          this.loops[i].delta = timestamp - this.loops[i].timestamp;
          this.loops[i].timestamp = timestamp;
          this.loops[i].callback(this.loops[i]);
        }
      }
    }
  }

  stop() {
    this.running = false;
  }
}

export { Interval };