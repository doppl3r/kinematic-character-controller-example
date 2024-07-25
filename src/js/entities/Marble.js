import { IcosahedronGeometry, Mesh, MeshLambertMaterial } from 'three';
import { Ball } from '@dimforge/rapier3d';
import { CameraFactory } from '../factories/CameraFactory.js';
import { Entity } from './Entity.js';

/*
  A sphere is a ball shape that provides a 3D object (Three.js) and
  a 3D rigid body shape (Rapier.js)
*/

class Marble extends Entity {
  constructor(options = {}) {
    // Resolve null option values
    if (options == null) options = {};
    if (options.color == null) options.color = '#ffffff';
    if (options.radius == null) options.radius = 0.5;
    if (options.widthSegments == null) options.widthSegments = 32;
    if (options.heightSegments == null) options.heightSegments = 32;
    if (options.angularDamping == null) options.angularDamping = 10;
    if (options.restitution == null) options.restitution = 0;
    if (options.ccd == null) options.ccd = true;

    // Create physical shape
    options.shape = new Ball(options.radius);

    // Inherit Entity class
    super(options);

    // Create camera
    this.camera = CameraFactory.create('perspective', { helper: true });
    this.camera.offset = this.camera.position.clone().set(0, 2, 2);
    this.camera.position.add(this.camera.offset);
    this.camera.lookAt(0, 0, 0); // Look at world origin

    // Initialize default cube mesh
    if (options.model == null) {
      var geometry = new IcosahedronGeometry(options.radius, 5);
      var material = new MeshLambertMaterial({ color: options.color });
      var mesh = new Mesh(geometry, material);
      mesh.receiveShadow = true;
      mesh.castShadow = true;
      this.object.add(mesh);
    }
  }

  render(delta, alpha) {
    super.render(delta, alpha);

    // Update camera position
    this.camera.position.copy(this.object.position).add(this.camera.offset);
  }
}

export { Marble };