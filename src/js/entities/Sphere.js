import { SphereGeometry, Mesh, MeshStandardMaterial } from 'three';
import { Ball } from '@dimforge/rapier3d';
import { Entity } from '../core/Entity.js';

/*
  A sphere is a ball shape that provides a 3D object (Three.js) and
  a 3D rigid body shape (Rapier.js)
*/

class Sphere extends Entity {
  // Define static properties
  static model = {
    name: ''
  };

  constructor(options = {}) {
    // Set options with default values
    options = Object.assign({
      color: '#ffffff',
      heightSegments: 32,
      radius: 0.5,
      widthSegments: 32,
    }, options);

    // Create physical shape
    options.shape = new Ball(options.radius);

    // Inherit Entity class
    super(options);

    // Set default properties
    this.isSphere = true;
    this.type = 'sphere';
    this.model = options.model;

    // Initialize default sphere model mesh
    if (this.model.isObject3D == null) {
      const model = this.createModel(options);
      this.setModel(model);
    }

    // Bind "this" context to class function (required for event removal)
    this.onSphereAdded = this.onSphereAdded.bind(this);
    this.addEventListener('added', this.onSphereAdded);
  }

  onSphereAdded(e) {
    // Bind target "this" context to class function (required for event removal)
    this.onSphereRemoved = this.onSphereRemoved.bind(this);

    // Add optional model to 3D object
    if (this.model.isObject3D) this.object.add(this.model);
    
    // Add Cube event listeners
    this.addEventListener('removed', this.onSphereRemoved);
  }

  onSphereRemoved(e) {
    // Remove model from 3D object
    if (this.model.isObject3D) this.object.remove(this.model);

    // Remove entity event listeners
    this.removeEventListener('removed', this.onSphereRemoved);
  }

  createModel(options) {
    const geometry = new SphereGeometry(options.radius, options.widthSegments, options.heightSegments);
    const material = new MeshStandardMaterial({ color: options.color });
    const model = new Mesh(geometry, material);
    model.receiveShadow = true;
    model.castShadow = true;
    return model;
  }

  setModel(model) {
    this.model = model;
  }

  setRadius(radius) {
    const collider = this.rigidBody.collider(0); // First collider

    // Update collider and 3D object scale
    collider.setRadius(radius);
    this.object.scale.set(radius * 2, radius * 2, radius * 2);
  }
  
  setScale(scale) {
    this.setRadius(scale.x / 2);
  }
}

export { Sphere };