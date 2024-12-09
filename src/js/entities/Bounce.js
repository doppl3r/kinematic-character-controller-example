import { Cube } from './Cube.js';

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
      color: '#0000ff',
      events: [
        {
          name: "bouncePlayer",
          data: { x: 0, y: 1, z: 0 }
        }
      ]
    }, options);

    // Inherit Entity class
    super(options);

    // Set default properties
    this.createModel({ color: options.color });
    this.isBounce = true;
    this.type = 'bounce';
  }

  bouncePlayer(e) {
    // Bounce player
    e.pair.move(e.data);
    e.pair.velocity.y = 0.5;
  }

  update(delta) {
    super.update(delta);
  }

  animate(delta, alpha) {
    super.animate(delta, alpha);
  }
}

export { Bounce };