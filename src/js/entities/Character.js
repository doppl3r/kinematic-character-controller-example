import { Cuboid, QueryFilterFlags } from '@dimforge/rapier3d';
import { Vector3 } from 'three';
import { Entity } from './Entity.js';

/*
  Characters are a subclass that has a single Kinematic Body and
  a single Character Controller. A Player or an enemy should inherit
  this class for common control behaviors that interact with the world.
*/

class Character extends Entity {
  // Define static properties
  static model = {
    name: ''
  };
  
  constructor(options = {}) {
    // Set options with default values
    options = Object.assign({
      color: '#ffffff',
      shape: new Cuboid(0.5, 0.5, 0.5),
      status: 'KinematicPositionBased'
    }, options);

    // Inherit Entity class
    super(options);

    // Set default properties
    this.isCharacter = true;
    this.type = 'character';

    // Initialize helpers
    this.nextTranslation = new Vector3();
  }

  move(desiredTranslation) {
    // Compute collider movement using first rigid body collider
    this.controller.computeColliderMovement(this.rigidBody.collider(0), desiredTranslation, QueryFilterFlags['EXCLUDE_SENSORS']);
    this.nextTranslation.copy(this.rigidBody.translation());
    this.nextTranslation.add(this.controller.computedMovement());
    this.rigidBody.setNextKinematicTranslation(this.nextTranslation);
  }
}

export { Character };