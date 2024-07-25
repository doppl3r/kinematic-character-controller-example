import { BoxGeometry, Mesh, MeshStandardMaterial } from 'three';
import { Cuboid } from '@dimforge/rapier3d';
import { Entity } from './Entity.js';

/*
  A cuboid is a 6-sided shape that provides a 3D object (Three.js) and
  a 3D rigid body shape (Rapier.js)
*/

class Cube extends Entity {
  constructor(options) {
    // Resolve null option values
    if (options == null) options = {};
    if (options.color == null) options.color = '#ffffff';
    if (options.scale == null) options.scale = { x: 1, y: 1, z: 1 };

    // Create physical shape
    options.shape = new Cuboid(options.scale.x / 2, options.scale.y / 2, options.scale.z / 2)

    // Inherit Entity class
    super(options);

    // Initialize default cube mesh
    if (options.model == null) {
      var geometry = new BoxGeometry(1, 1, 1);
      var material = new MeshStandardMaterial({ color: options.color });
      var mesh = new Mesh(geometry, material);
      mesh.receiveShadow = true;
      mesh.castShadow = true;
      this.object.add(mesh);
    }
  }
}

export { Cube };