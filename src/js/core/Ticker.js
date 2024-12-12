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
    this.index = 0;
  }

  add(callback, delay = 1000 / 60) {
    // Create a loop with a callback and delay (milliseconds)
    const loop = new Loop(callback, delay);
    this.loops.push(loop);
  }

  get(index) {
    return this.loops[index];
  }

  tick(animationFrameCallback) {
    if (this.running == true) {
      // Request visual update function before next repaint
      this.index = requestAnimationFrame(animationFrameCallback);

      // Check if functions exist
      if (this.loops.length > 0) {
        var delta = this.getDelta();
        var alpha = this.loops[0].sum / this.loops[0].rate; // Set alpha relative to base interval

        // Loop through array of functions (descending order)
        for (var index = this.loops.length - 1; index >= 0; index--) {
          this.loops[index].sum += delta;

          // Trigger this.loops[index] callback
          if (this.loops[index].sum >= this.loops[index].rate || this.loops[index].rate == -1) {
            this.loops[index].sum %= this.loops[index].rate;
            this.loops[index].callback({
              delta: (this.loops[index].rate == -1) ? delta : this.loops[index].rate,
              alpha: (index == 0) ? 0 : alpha, // Return zero for base loop or alpha for sibling loops
              index: this.index
            });
          }
        }
      }
    }
  }

  start() {
    // Reset loops before starting
    this.reset();

    // Create new recursive callback function
    var animationFrameCallback = function() {
      // Run tick function with callback
      this.tick(animationFrameCallback);
    }.bind(this);

    // Start recursive callback loop
    animationFrameCallback();
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
    for (var index = this.loops.length - 1; index >= 0; index--) {
      this.loops[index].reset();
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
  constructor(callback = () => {}, delay) {
    this.rate = delay / 1000;
    this.sum = 0;
    this.alpha = 0;
    this.callback = callback;

    // Render immediately if delay is negative
    if (delay < 0) this.rate = -1;
  }

  reset() {
    this.sum = 0;
    this.alpha = 0;
  }
}

export { Ticker };