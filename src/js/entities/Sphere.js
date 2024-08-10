import { SphereGeometry, Mesh, MeshStandardMaterial } from 'three';
import { Ball } from '@dimforge/rapier3d';
import { Entity } from './Entity.js';

/*
  A sphere is a ball shape that provides a 3D object (Three.js) and
  a 3D rigid body shape (Rapier.js)
*/

class Sphere extends Entity {
  constructor(options = {}) {
    // Set options with default values
    options = Object.assign({
      color: '#ffffff',
      heightSegments: 32,
      radius: 1,
      widthSegments: 32,
    }, options);

    // Create physical shape
    options.shape = new Ball(options.radius);

    // Inherit Entity class
    super(options);

    // Initialize default sphere mesh
    if (options.model == null) {
      var geometry = new SphereGeometry(options.radius, options.widthSegments, options.heightSegments);
      var material = new MeshStandardMaterial({ color: options.color });
      var mesh = new Mesh(geometry, material);
      mesh.receiveShadow = true;
      mesh.castShadow = true;
      this.object.add(mesh);
    }
  }
}

export { Sphere };