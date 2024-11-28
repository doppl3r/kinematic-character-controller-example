import { BoxGeometry, Mesh, MeshStandardMaterial, Vector3 } from 'three';
import { Cuboid } from '@dimforge/rapier3d';
import { Entity } from '../core/Entity.js';

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
      enabledRotations: { x: false, y: false, z: true },
      enabledTranslations: { x: true, y: true, z: false },
      scale: { x: 1, y: 1, z: 1 },
      model: { name: '' }
    }, options);

    // Create physical shape
    options.shape = new Cuboid(options.scale.x / 2, options.scale.y / 2, options.scale.z / 2);

    // Inherit Entity class
    super(options);
    
    // Set default properties
    this.isCube = true;
    this.type = 'cube';
    this.model = options.model;
    
    // Update 3D object
    if (this.model.isObject3D) this.object.add(this.model);
    this.object.scale.copy(options.scale);
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

  createModel(options) {
    Object.assign({ color: '#ffffff' }, options);

    var geometry = new BoxGeometry(1, 1, 1);
    var material = new MeshStandardMaterial({ color: options.color });
    this.model = new Mesh(geometry, material);
    this.model.receiveShadow = true;
    this.model.castShadow = true;
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
    if (this.model.name) json.model = { name: this.model.name };
    return json;
  }
}

export { Cube };