import { BoxGeometry, Mesh, MeshStandardMaterial, Vector3 } from 'three';
import { Cuboid } from '@dimforge/rapier3d';
import { Entity } from './Entity.js';

/*
  A cuboid is a 6-sided shape that provides a 3D object (Three.js) and
  a 3D rigid body shape (Rapier.js)
*/

class Cube extends Entity {
  // Define static properties
  static model = {
    name: ''
  };

  constructor(options) {
    // Set options with default values
    options = Object.assign({
      color: '#ffffff',
      scale: { x: 1, y: 1, z: 1 }
    }, options);

    // Create physical shape
    options.shape = new Cuboid(options.scale.x / 2, options.scale.y / 2, options.scale.z / 2);

    // Inherit Entity class
    super(options);
    
    // Set default properties
    this.isCube = true;
    this.type = 'cube';
    this.model = options.model;

    // Create model if not defined
    if (this.model.isObject3D == null) {
      const model = this.createModel(options);
      this.setModel(model);
    }

    // Bind "this" context to class function (required for event removal)
    this.onCubeAdded = this.onCubeAdded.bind(this);
    this.addEventListener('added', this.onCubeAdded);
  }

  update(delta) {
    super.update(delta);
  }

  animate(delta, alpha) {
    super.animate(delta, alpha);

    // Update model (optional)
    if (this.model && this.model.mixer) {
      this.model.mixer.update(delta);
    }
  }

  onCubeAdded(e) {
    // Bind target "this" context to class function (required for event removal)
    this.onCubeRemoved = this.onCubeRemoved.bind(this);

    // Add optional model to 3D object
    if (this.model.isObject3D) this.object.add(this.model);
    
    // Add Cube event listeners
    this.addEventListener('removed', this.onCubeRemoved);
  }

  onCubeRemoved(e) {
    // Remove model from 3D object
    if (this.model.isObject3D) this.object.remove(this.model);

    // Remove entity event listeners
    this.removeEventListener('removed', this.onCubeRemoved);
  }

  createModel(options) {
    var geometry = new BoxGeometry(1, 1, 1);
    var material = new MeshStandardMaterial({ color: options.color });
    const model = new Mesh(geometry, material);
    model.receiveShadow = true;
    model.castShadow = true;
    return model;
  }

  setModel(model) {
    this.model = model;
  }
  
  setScale(scale) {
    var scaleNew = new Vector3().copy(scale);
    var factor = scaleNew.clone();

    // Update all collider halfExtents and positions
    for (var i = 0; i < this.rigidBody.numColliders(); i++) {
      var collider = this.rigidBody.collider(i);
      var colliderDesc = this.collidersDesc[i];
      var halfExtents = new Vector3().copy(colliderDesc.shape.halfExtents);
      var scaleOrigin = halfExtents.clone().multiplyScalar(2);
      var translation = new Vector3().copy(colliderDesc.translation);

      // Divide factor by first collider scale
      if (i == 0) factor.divide(scaleOrigin);
  
      // Update collider and 3D object scale
      collider.setHalfExtents(halfExtents.multiply(factor));
      collider.setTranslationWrtParent(translation.multiply(factor));
    }

    // Update 3D object scale
    super.setScale(scaleNew);
  }

  toJSON() {
    // Extend entity toJSON with model name
    const json = super.toJSON();

    // Assign cube properties to entity JSON
    Object.assign(json, {
      type: this.type
    });

    // Conditionally store model name
    if (this.model.name) json.model = { name: this.model.name };

    // Return json object
    return json;
  }
}

export { Cube };