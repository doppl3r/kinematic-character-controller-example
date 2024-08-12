import { Vector3 } from 'three';
import { Capsule } from '@dimforge/rapier3d';
import { Entity } from './Entity.js';
import { CameraFactory } from '../factories/CameraFactory.js';

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
      height: 0.5,
      radius: 0.25,
      type: 'KinematicPositionBased'
    }, options);

    // Create physical shape
    options.shape = new Capsule(options.height / 2, options.radius);

    // Inherit Entity class
    super(options);

    // Set default properties
    this.keys = {};
    this.isJumping = true;
    this.speed = 5;
    this.angle = 0;
    this.gravity = 9.81;
    this.force = new Vector3();
    this.direction = new Vector3();
    this.velocity = new Vector3();
    this.movement = new Vector3();
    this.nextTranslation = new Vector3();

    // Set character camera properties
    this.camera = CameraFactory.create('perspective');
    this.cameraOffset = new Vector3(0, 2, 2);
  }

  update(delta) {
    // Update the player velocity from input keys
    this.updateVelocityFromInput(delta);
    
    // Calculate next translation from computed movement
    this.controller.computeColliderMovement(this.collider, this.velocity);
    this.movement.copy(this.controller.computedMovement());
    this.nextTranslation.copy(this.body.translation());
    this.nextTranslation.add(this.movement);
    this.setNextPosition(this.nextTranslation);

    // Update 3D object rotation using next direction
    this.updateObjectRotation();

    // Call Entity update function
    super.update(delta);
  }

  render(delta, alpha) {
    // Call Entity render function
    super.render(delta, alpha);

    // Update camera position
    this.camera.position.copy(this.object.position).add(this.cameraOffset);
    this.camera.lookAt(this.object.position);
  }

  updateVelocityFromInput(delta) {
    // Set vertical velocity to zero if grounded
    if (this.isGrounded()) {
      this.velocity.y = 0;
      this.isJumping = false;
    }

    // Reset force to zero
    this.force.set(0, 0, 0);

    // Add force relative to zero radians/degrees (visually 90° counterclockwise)
    if (this.keys['KeyW'] == true) this.force.x = -delta * this.speed;
    if (this.keys['KeyA'] == true) this.force.z = delta * this.speed;
    if (this.keys['KeyS'] == true) this.force.x = delta * this.speed;
    if (this.keys['KeyD'] == true) this.force.z = -delta * this.speed;
    if (this.keys['Space'] == true && this.isJumping == false) {
      this.isJumping = true;
      this.force.y += delta * this.speed * 1.5;
    }

    // Rotate force by camera world direction
    this.camera.getWorldDirection(this.direction);
    this.angle = Math.PI - Math.atan2(this.direction.z, this.direction.x);
    this.force.applyAxisAngle({ x: 0, y: 1, z: 0 }, this.angle);

    // Add new force to current velocity
    this.velocity.add(this.force);
    
    // Simulate gravity and damping
    this.velocity.y -= delta * this.gravity / 9.81;
    this.velocity.z *= 0.5;
    this.velocity.x *= 0.5;
    
    // Clamp directional velocity
    this.velocity._y = this.velocity.y;
    this.velocity.y = 0; // Ignore gravity velocity
    this.velocity.clampLength(-this.speed * delta, this.speed * delta);
    this.velocity.y = this.velocity._y;
  }

  updateObjectRotation() {
    // Calculate 3D object rotation from character translation
    if (this.nextTranslation.distanceTo(this.body.translation()) > 0.01) {
      this.object.lookAt(this.nextTranslation.x, this.object.position.y, this.nextTranslation.z);
      this.setNextRotation(this.object.quaternion);
    }
  }

  createBody(world) {
    // Invoke Entity superclass constructor
    super.createBody(world);

    // Create character controller from world
    this.controller = world.createCharacterController(0.01); // Spacing
    this.controller.setSlideEnabled(true); // Allow sliding down hill
    this.controller.setMaxSlopeClimbAngle(60 * Math.PI / 180); // (angle) Limit uphill climbing
    this.controller.setMinSlopeSlideAngle(60 * Math.PI / 180); // (angle) 30 feels slower up 45deg incline
    this.controller.enableAutostep(0.45, 0.2, true); // (maxHeight, minWidth, includeDynamicBodies) Stair behavior
    this.controller.enableSnapToGround(0.5); // (distance) Set ground snap behavior
    this.controller.setApplyImpulsesToDynamicBodies(true); // Add push behavior
    this.controller.setCharacterMass(1); // (mass) Set character mass
  }

  isGrounded() {
    return this.controller.computedGrounded();
  }

  isMoving() {
    return (this.keys['KeyW'] == true || this.keys['KeyS'] == true || this.keys['KeyA'] == true || this.keys['KeyD'] == true);
  }

  addEventListeners(domElement = window.document) {
    // Add event listeners
    domElement.addEventListener('keydown', function(e) { this.keyDown(e); }.bind(this), false);
    domElement.addEventListener('keyup', function(e) { this.keyUp(e); }.bind(this), false);
  }

  removeEventListeners(domElement = window.document) {
    // Add event listeners
    domElement.removeEventListener('keydown', function(e) { this.keyDown(e); }.bind(this), false);
    domElement.removeEventListener('keyup', function(e) { this.keyUp(e); }.bind(this), false);
  }

  keyDown(e) {
    // Assign key inputs to true (once)
    if (e.repeat) return;
    this.keys[e.code] = true;

    // Update model animations
    if (this.isMoving() == true) {
      this.model.play('Run', 0.125);
    }
  }

  keyUp(e) {
    // Set key values to false
    this.keys[e.code] = false;

    // Update model animations
    if (this.isMoving() == false) {
      this.model.play('Idle', 0.125);
    }
  }
}

export { Character };