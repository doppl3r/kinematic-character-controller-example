import { Entity } from './Entity.js';

/*
  An empty can contains a single rigid body with no colliders and
  is useful for placing 3D models within the world.
*/

class Empty extends Entity {
  constructor(options) {
    // Set options with default values
    options = Object.assign({
      status: 1, // Fixed
    }, options);

    // Inherit Entity class
    super(options);
  }
}

export { Empty }