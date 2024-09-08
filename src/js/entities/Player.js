import { Vector3 } from 'three';
import { CameraFactory } from '../factories/CameraFactory.js';
import { Capsule } from '@dimforge/rapier3d';
import { Character } from './Character.js';

/*
  A Player is a subclass that extends the Character class which includes
  a single Kinematic Character Controller.
*/

class Player extends Character {
  constructor(options = {}) {
    // Set options with default values
    options = Object.assign({
      activeCollisionTypes: 'KINEMATIC_FIXED',
      activeEvents: 'COLLISION_EVENTS',
      gravity: 9.81,
      height: 0.25,
      jumpForce: 5,
      moveForce: 5,
      radius: 0.25,
      scale: { x: 1, y: 1, z: 1 }
    }, options);

    // Create physical shape
    options.shape = new Capsule(options.height, options.radius);

    // Inherit Character class
    super(options);

    // Set default properties
    this.keys = {};
    this.jumping = true;
    this.angle = 0;
    this.gravity = options.gravity;
    this.jumpForce = options.jumpForce;
    this.moveForce = options.moveForce;
    this.force = new Vector3();
    this.direction = new Vector3();
    this.velocity = new Vector3();

    // Set character camera properties
    this.camera = CameraFactory.create('perspective');
    this.cameraOffset = new Vector3(0, 2, 2);
  }

  update(delta) {
    // Update the player velocity from input keys
    this.updateVelocityFromInput(delta);

    // Calculate next translation from computed movement
    this.move(this.velocity);

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
      this.jumping = false;
    }

    // Reset force to zero
    this.force.set(0, 0, 0);

    // Add force relative to zero radians/degrees (visually 90° counterclockwise)
    if (this.keys['KeyW'] == true) this.force.x = -delta * this.moveForce;
    if (this.keys['KeyA'] == true) this.force.z = delta * this.moveForce;
    if (this.keys['KeyS'] == true) this.force.x = delta * this.moveForce;
    if (this.keys['KeyD'] == true) this.force.z = -delta * this.moveForce;
    if (this.keys['Space'] == true && this.isJumping() == false) {
      this.jumping = true;
      this.force.y += delta * this.jumpForce * 1.5;
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
    this.velocity.clampLength(-this.moveForce * delta, this.moveForce * delta);
    this.velocity.y = this.velocity._y;
  }

  updateObjectRotation() {
    // Calculate 3D object rotation from character translation
    if (this.nextTranslation.distanceTo(this.body.translation()) > 0.01) {
      this.object.lookAt(this.nextTranslation.x, this.object.position.y, this.nextTranslation.z);
      this.body.setNextKinematicRotation(this.object.quaternion);
    }
  }

  addModel(model) {
    // Invoke Character superclass constructor
    super.addModel(model);
      
    // Offset model position from shape dimensions
    var height = this.colliderDesc.shape.halfHeight / this.object.scale.y;
    var radius = this.colliderDesc.shape.radius / this.object.scale.x
    this.model.position.y = -(height + radius);
  }

  isGrounded() {
    return this.controller.computedGrounded();
  }

  isMoving() {
    return (this.keys['KeyW'] == true || this.keys['KeyS'] == true || this.keys['KeyA'] == true || this.keys['KeyD'] == true);
  }

  isJumping() {
    return this.jumping;
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

export { Player };