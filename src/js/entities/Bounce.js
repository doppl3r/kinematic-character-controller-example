import { Cube } from './Cube.js';

/*
  A cuboid is a 6-sided shape that provides a 3D object (Three.js) and
  a 3D rigid body shape (Rapier.js)
*/

class Bounce extends Cube {
  constructor(options) {
    // Set options with default values
    options = Object.assign({
      
    }, options);

    // Inherit Entity class
    super(options);

    // Set default properties
    this.createModel({ color: '#0000ff' });
    this.object.add(this.model);
    this.type = 'bounce';
  }

  update(delta) {
    super.update(delta);
  }

  animate(delta, alpha) {
    super.animate(delta, alpha);
  }

  bouncePlayer(e) {
    // Change cube color to green
    e.target.model.material.color.set('#00ff00');

    // Bounce player
    e.pair.move({ x: 0, y: 1, z: 0});
    e.pair.velocity.y = 0.5;
  }

  resetBounce(e) {
    e.target.model.material.color.set('#0000ff');
  }
}

export { Bounce };