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
    return this.loops.push({ callback, delay, sum: 0, alpha: 0 });
  }

  get(i) {
    return this.loops[i];
  }

  remove(i) {
    return this.loops.splice(i, 1);
  }

  update(thread, timestamp) {
    if (this.running == true) {
      // Rerun thread on next repaint
      requestAnimationFrame(thread);

      // Declare delta/alpha from base loop [0]
      let delta = (timestamp - this.timestamp) * this.speed;
      let alpha = this.loops[0].sum / this.loops[0].delay;
      this.timestamp = timestamp;

      // Loop through array of loops (descending order)
      for (let i = this.loops.length - 1; i >= 0; i--) {
        // Add delta time to sum
        this.loops[i].sum += delta;

        // Trigger loop callback
        if (this.loops[i].sum >= this.loops[i].delay) {
          this.loops[i].alpha = alpha;
          this.loops[i].callback(this.loops[i]);
          this.loops[i].sum %= this.loops[i].delay;
        }
      }
    }
  }

  start() {
    this.running = true;
    this.loops.forEach(loop => loop.delta = loop.alpha = loop.frame = 0);
    
    // Start thread after the first animation frame
    const thread = timestamp => this.update(thread, timestamp);
    requestAnimationFrame(timestamp => { this.timestamp = timestamp; thread(timestamp) });
  }

  stop() {
    this.running = false;
  }
}

export { Interval };