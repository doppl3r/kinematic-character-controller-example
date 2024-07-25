/*
  Executes single or multiple functions at a recurring frequency. The first
  action determines the shared alpha value for all sibling functions.

  Tip: Add your physics function first (ex: 30hz), then add the rendering
  function at a higher frequency (ex: -1 = unlimited). Use the alpha value
  to interpolate rendered objects between engine steps.

  Clock credit: mrdoob
*/

class Loop {
  constructor() {
    this.actions = [];
    this.startTime = 0;
    this.oldTime = 0;
    this.elapsedTime = 0;
    this.speed = 1;
    this.running = false;
  }

  add(callback = () => {}, frequency = -1) {
    // Add callback function to array of functions
    this.actions.push({
      rate: 1 / frequency,
      sum: 1 / frequency,
      alpha: 0,
      callback: callback // Execute function after each interval
    });
  }

  update(animationFrameCallback) {
    if (this.running == true) {
      // Request visual update function before next repaint
      requestAnimationFrame(animationFrameCallback);

      // Check if functions exist
      if (this.actions.length > 0) {
        var delta = this.getDelta();
        var alpha = this.actions[0].sum / this.actions[0].rate; // Set alpha relative to base interval

        // Loop through array of functions (descending order)
        for (var index = this.actions.length - 1; index >= 0; index--) {
          this.actions[index].sum += delta;

          // Trigger this.actions[index] callback
          if (this.actions[index].sum >= this.actions[index].rate || this.actions[index].rate == -1) {
            this.actions[index].sum %= this.actions[index].rate;
            this.actions[index].callback({
              delta: (this.actions[index].rate == -1) ? delta : this.actions[index].rate,
              alpha: (index == 0) ? 0 : alpha // Return zero for base action or alpha for sibling actions
            });
          }
        }
      }
    }
  }

  start() {
    this.startTime = this.now();
    this.oldTime = this.startTime;
    this.elapsedTime = 0;
    this.running = true;

    // Create recursive callback function
    var animationFrameCallback = function() {
      // Run update function with callback
      this.update(animationFrameCallback);
    }.bind(this);

    // Start recursive callback loop
    animationFrameCallback();
  }

  stop() {
    this.getElapsedTime();
    this.running = false;
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

export { Loop };