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
    this.thread;
    this.threadTimestamp;
    this.threadRunning = false;
  }

  add(callback, delay = -1) {
    // Create a loop with a callback and delay (milliseconds)
    return this.loops.push({ callback, delay, delta: 0, alpha: 0, frame: 0, sum: 0, timestamp: 0 }) - 1;
  }

  get(i) {
    return this.loops[i];
  }

  remove(i) {
    return this.loops.splice(i, 1);
  }

  start() {
    this.threadRunning = true;
    this.loops.forEach(loop => loop.delta = loop.alpha = loop.frame = loop.sum = loop.timestamp = 0);
    this.thread = timestamp => this.update(timestamp);
    
    // Start thread after the first animation frame
    requestAnimationFrame(timestamp => this.thread(timestamp));
  }

  update(timestamp) {
    if (this.threadRunning == true) {
      // Rerun thread on next repaint
      requestAnimationFrame(this.thread);

      // Set thread delta from thread timestamp
      const threadDelta = timestamp - this.threadTimestamp || 0;
      this.threadTimestamp = timestamp;

      // Loop through array of loops (descending order)
      for (let i = this.loops.length - 1; i >= 0; i--) {
        // Resolve initial timestamp for each loop
        this.loops[i].timestamp = (this.loops[i].timestamp || timestamp);

        // Set loop delta/alpha from base loop (0)
        const loop = this.loops[i];
        const delta = (timestamp - loop.timestamp) * this.speed;
        const alpha = this.loops[0].sum / this.loops[0].delay;
        
        // Add delta time to loop sum
        loop.sum += threadDelta * this.speed;

        // Trigger loop callback
        if (loop.sum >= loop.delay) {
          loop.sum %= loop.delay;
          loop.delta = delta;
          loop.alpha = alpha;
          loop.frame++;
          loop.timestamp = timestamp;
          loop.callback(loop);
        }
      }
    }
  }

  stop() {
    this.threadRunning = false;
  }
}

export { Interval };