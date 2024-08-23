import { Cuboid, QueryFilterFlags } from '@dimforge/rapier3d';
import { Vector3 } from 'three';
import { Entity } from './Entity.js';

/*
  Characters are a subclass that has a single Kinematic Body and
  a single Character Controller. A Player or an enemy should inherit
  this class for common control behaviors that interact with the world.
*/

class Character extends Entity {
  constructor(options = {}) {
    // Set options with default values
    options = Object.assign({
      color: '#ffffff',
      shape: new Cuboid(0.5, 0.5, 0.5),
      type: 'KinematicPositionBased'
    }, options);

    // Inherit Entity class
    super(options);

    // Initialize helpers
    this.nextTranslation = new Vector3();
  }

  move(desiredTranslation) {
    this.controller.computeColliderMovement(this.collider, desiredTranslation, QueryFilterFlags['EXCLUDE_SENSORS']);
    this.nextTranslation.copy(this.body.translation());
    this.nextTranslation.add(this.controller.computedMovement());
    this.body.setNextKinematicTranslation(this.nextTranslation);
  }

  createCollider(world) {
    // Invoke Entity superclass constructor
    super.createCollider(world);

    // Pass world through controller initialization
    this.createController(world);
  }

  createController(world) {
    // Create character controller from world
    this.controller = world.createCharacterController(0.01); // Spacing
    this.controller.setSlideEnabled(true); // Allow sliding down hill
    this.controller.setMaxSlopeClimbAngle(45 * Math.PI / 180); // Don’t allow climbing slopes larger than 45 degrees.
    this.controller.setMinSlopeSlideAngle(30 * Math.PI / 180); // Automatically slide down on slopes smaller than 30 degrees.
    this.controller.enableAutostep(0.5, 0.2, true); // (maxHeight, minWidth, includeDynamicBodies) Stair behavior
    this.controller.enableSnapToGround(0.5); // (distance) Set ground snap behavior
    this.controller.setApplyImpulsesToDynamicBodies(true); // Add push behavior
    this.controller.setCharacterMass(1); // (mass) Set character mass
  }
}

export { Character };