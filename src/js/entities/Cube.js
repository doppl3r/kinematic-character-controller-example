import { BoxGeometry, Mesh, MeshStandardMaterial } from 'three';
import { Cuboid } from '@dimforge/rapier3d';
import { Entity } from './Entity.js';

/*
  A cuboid is a 6-sided shape that provides a 3D object (Three.js) and
  a 3D rigid body shape (Rapier.js)
*/

class Cube extends Entity {
  constructor(options) {
    // Set options with default values
    options = Object.assign({
      color: '#ffffff',
      scale: { x: 1, y: 1, z: 1 }
    }, options);

    // Create physical shape
    options.shape = new Cuboid(options.scale.x / 2, options.scale.y / 2, options.scale.z / 2);

    // Initialize default cube model mesh
    if (options.model == null) {
      var geometry = new BoxGeometry(1, 1, 1);
      var material = new MeshStandardMaterial({ color: options.color });
      options.model = new Mesh(geometry, material);
      options.model.receiveShadow = true;
      options.model.castShadow = true;
    }

    // Inherit Entity class
    super(options);
  }
}

export { Cube };