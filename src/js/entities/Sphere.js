import { SphereGeometry, Mesh, MeshStandardMaterial } from 'three';
import { Ball } from '@dimforge/rapier3d';
import { Entity } from './Entity.js';

/*
  A sphere is a ball shape that provides a 3D object (Three.js) and
  a 3D rigid body shape (Rapier.js)
*/

class Sphere extends Entity {
  constructor(options = {}) {
    // Resolve null option values
    if (options == null) options = {};
    if (options.color == null) options.color = '#ffffff';
    if (options.radius == null) options.radius = 1;
    if (options.widthSegments == null) options.widthSegments = 32;
    if (options.heightSegments == null) options.heightSegments = 32;

    // Create physical shape
    options.shape = new Ball(options.radius);

    // Inherit Entity class
    super(options);

    // Initialize default cube mesh
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