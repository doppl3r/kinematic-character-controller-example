import { LightFactory } from '../factories/LightFactory.js';
import { Cube } from './Cube.js';

/*
  A Light is a subclass that extends the Cube class
*/

class Light extends Cube {
  constructor(options) {
    // Set options with default values
    options = Object.assign({
      collisionEventStart: function(e) {},
      collisionEventEnd: function(e) {},
      isSensor: true,
      status: 1
    }, options);

    // Inherit Character class
    super(options);

    // Assign new light to 3D model
    this.lightType = options.lightType;
    this.model = LightFactory.create(options.lightType, options);
    this.object.add(this.model);

    // Set default properties
    this.type = 'light';
  }

  update(delta) {
    // Call Entity update function
    super.update(delta);
  }

  animate(delta, alpha) {
    // Call Entity animate function
    super.animate(delta, alpha);
  }

  toJSON() {
    // Extend entity toJSON with model name
    const json = super.toJSON();
    json.lightType = this.model.type;
    return json;
  }
}

export { Light };