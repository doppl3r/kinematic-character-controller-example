/*
  Executes single or multiple functions at a recurring frequency. The first
  action determines the shared alpha value for all sibling functions.

  Tip: Add your physics function first (ex: 30hz), then add the rendering
  function at a higher frequency (ex: -1 = unlimited). Use the alpha value
  to interpolate rendered objects between engine steps.

  Clock credit: mrdoob
*/

class Ticker {
  constructor() {
    this.loops = [];
    this.startTime = 0;
    this.oldTime = 0;
    this.elapsedTime = 0;
    this.speed = 1;
    this.running = false;
  }

  add(callback, delay) {
    // Create a loop with a callback and delay (milliseconds)
    const loop = new Loop(callback, delay);
    this.loops.push(loop);
  }

  get(i) {
    return this.loops[i];
  }

  remove(i) {
    return this.loops.splice(i, 1);
  }

  tick(ticker) {
    if (this.running == true) {
      // Run ticker on next repaint
      requestAnimationFrame(ticker);

      // Declare delta/alpha from base loop [0]
      let delta = this.getDelta();
      let alpha = this.loops[0].sum / this.loops[0].rate;

      // Loop through array of loops (descending order)
      for (let i = this.loops.length - 1; i >= 0; i--) {
        // Add delta time to sum
        this.loops[i].sum += delta;

        // Trigger loop callback and keep sum remainder
        if (this.loops[i].sum >= this.loops[i].rate) {
          this.loops[i].sum %= this.loops[i].rate;
          this.loops[i].callback({
            delta: i == 0 ? this.loops[i].rate : delta,
            alpha: i == 0 ? 0 : alpha,
            frame: this.loops[i].frame++
          });
        }
      }
    }
  }

  start() {
    this.reset(); // Reset loops before starting
    const ticker = () => this.tick(ticker);
    ticker(); // Start recursive callback loop
  }

  stop() {
    this.getElapsedTime();
    this.running = false;
  }

  reset() {
    this.startTime = this.now();
    this.oldTime = this.startTime;
    this.elapsedTime = 0;
    this.running = true;

    // Reset each loop object
    for (let i = this.loops.length - 1; i >= 0; i--) {
      this.loops[i].reset();
    }
  }

  isRunning() {
    return this.running;
  }

  getElapsedTime() {
    this.getDelta();
    return this.elapsedTime;
  }

  getDelta() {
    let diff = 0;

    // Update the elapsed time if the clock is running
    if (this.running) {
      const newTime = this.now();
      diff = (newTime - this.oldTime) / 1000;
      this.oldTime = newTime;
      this.elapsedTime += diff;
    }
    return diff * this.speed;
  }

  now() {
    return (typeof performance === 'undefined' ? Date : performance).now();
  }
}

/*
  A loop triggers a callback after a specific time delay (milliseconds).
  The rate is measured by delay over 1 second.
  
  Ex:
    delay (60fps): 1000 / 60
    rate (16ms): delay / 1000
*/

class Loop {
  constructor(callback = () => {}, delay = -1) {
    this.rate = delay / 1000;
    this.sum = 0;
    this.alpha = 0;
    this.frame = 0;
    this.callback = callback;
  }

  reset() {
    this.sum = 0;
    this.alpha = 0;
    this.frame = 0;
  }
}

export { Ticker };