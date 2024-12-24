import { Cube } from '../core/entities/Cube.js';

/*
  A cuboid is a 6-sided shape that provides a 3D object (Three.js) and
  a 3D rigid body shape (Rapier.js)
*/

class Bounce extends Cube {
  // Define static properties
  static model = {
    name: ''
  };

  constructor(options) {
    // Set options with default values
    options = Object.assign({
      activeCollisionTypes: 'ALL',
      activeEvents: 'COLLISION_EVENTS',
      color: '#0000ff',
      events: [
        {
          name: 'bounce',
          value: 30
        }
      ],
      status: 1
    }, options);

    // Inherit Entity class
    super(options);

    // Set default properties
    this.createModel({ color: options.color });
    this.isBounce = true;
    this.type = 'bounce';
  }

  update(delta) {
    super.update(delta);
  }

  animate(delta, alpha) {
    super.animate(delta, alpha);
  }
}

export { Bounce };