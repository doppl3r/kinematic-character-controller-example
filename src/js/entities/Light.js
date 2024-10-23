import { LightFactory } from '../factories/LightFactory.js';
import { Cube } from './Cube.js';

/*
  A Light is a subclass that extends the Cube class
*/

class Light extends Cube {
  constructor(options = {}) {
    // Set options with default values
    options = Object.assign({
      collisionEventStart: function(e) {},
      collisionEventEnd: function(e) {},
      intensity: Math.PI,
      isSensor: true,
      status: 1
    }, options);

    // Assign new light to 3D model
    if (options.model == null) {
      options.model = LightFactory.create('point');
    }

    // Inherit Character class
    super(options);

    // Set default properties
    this.type = 'light';

    // Update light properties
    this.updateIntensity();
  }

  update(delta) {
    // Call Entity update function
    super.update(delta);
  }

  animate(delta, alpha) {
    // Call Entity animate function
    super.animate(delta, alpha);
  }

  updateIntensity() {
    // Find the max scale value
    var max = Math.max(...Object.values(this.object.scale));
    this.model.intensity = Math.PI * max;
  }
}

export { Light };