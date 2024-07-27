import { Euler, Vector3 } from 'three';
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
    // Resolve null option values
    if (options == null) options = {};
    if (options.color == null) options.color = '#ffffff';
    if (options.height == null) options.height = 0.5;
    if (options.radius == null) options.radius = 0.25;
    if (options.type == null) options.type = 'KinematicPositionBased';

    // Create physical shape
    options.shape = new Capsule(options.height / 2, options.radius);

    // Inherit Entity class
    super(options);

    // Set default properties
    this.keys = {};
    this.isJumping = true;
    this.isGrounded = false;
    this.speed = 5;
    this.direction = new Vector3();
    this.velocity = new Vector3();
    this.movement = new Vector3();
    this.nextTranslation = new Vector3();

    // Set character camera properties
    this.cameraOffset = new Vector3(0, 2, 2);
    this.camera = CameraFactory.create('perspective');
    this.camera.position.add(this.cameraOffset);
    this.camera.lookAt(0, 0, 0);
  }

  update(delta) {
    // Check if the controller is grounded
    this.isGrounded = this.controller.computedGrounded();

    // Set vertical velocity to zero if grounded
    if (this.isGrounded == true) {
      this.velocity.y = 0;
      this.isJumping = false;
    }

    // Update velocity from keys
    if (this.keys['KeyW'] == true) this.velocity.z -= delta * this.speed;
    if (this.keys['KeyS'] == true) this.velocity.z += delta * this.speed;
    if (this.keys['KeyA'] == true) this.velocity.x -= delta * this.speed;
    if (this.keys['KeyD'] == true) this.velocity.x += delta * this.speed;
    if (this.keys['Space'] == true && this.isJumping == false) {
      this.isJumping = true;
      this.velocity.y += 0.25;
    }

    // TODO: Multiply velocity by direction

    // Simulate gravity
    this.velocity.y -= delta;

    // Simulate movement damping
    this.velocity.z *= 0.5;
    this.velocity.x *= 0.5;
    
    // Clamp directional velocity
    this.velocity._y = this.velocity.y;
    this.velocity.y = 0; // Ignore gravity velocity
    this.velocity.clampLength(-this.speed * delta, this.speed * delta);
    this.velocity.y = this.velocity._y;

    // Calculate collider movement
    this.controller.computeColliderMovement(this.collider, this.velocity);

    // Calculate next translation from computed movement
    this.movement.copy(this.controller.computedMovement());
    this.nextTranslation.copy(this.body.translation());
    this.nextTranslation.add(this.movement);
    this.setNextPosition(this.nextTranslation);

    // Calculate next rotation from character direction
    if (this.nextTranslation.distanceTo(this.body.translation()) > 0.01) {
      this.object.lookAt(this.nextTranslation.x, this.object.position.y, this.nextTranslation.z);
      this.setNextRotation(this.object.quaternion);
    }

    // Call Entity update function
    super.update(delta);
  }

  render(delta, alpha) {
    // Call Entity render function
    super.render(delta, alpha);

    // Update camera position
    this.camera.position.copy(this.object.position).add(this.cameraOffset);
  }

  createBody(world) {
    // Add character shape to the world using Entity createBody function
    super.createBody(world);

    // Add character controller to the world
    this.controller = world.createCharacterController(0.01); // Spacing

    // Set controller behavior
    this.controller.setSlideEnabled(true); // Allow sliding down hill
    this.controller.setMaxSlopeClimbAngle(60 * Math.PI / 180); // (angle) Limit uphill climbing
    this.controller.setMinSlopeSlideAngle(60 * Math.PI / 180); // (angle) 30 feels slower up 45deg incline
    this.controller.enableAutostep(0.45, 0.2, true); // (maxHeight, minWidth, includeDynamicBodies) Stair behavior
    this.controller.enableSnapToGround(0.5); // (distance) Set ground snap behavior
    this.controller.setApplyImpulsesToDynamicBodies(true); // Add push behavior
    this.controller.setCharacterMass(1); // (mass) Set character mass
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

  getForwardVector() {
    // Update controller direction from camera world direction
    this.camera.getWorldDirection(this.direction);

    // Ignore y direction (up/down)
    this.direction.y = 0;
    this.direction.normalize();
    return this.direction;
  }

  getSideVector() {
    return this.getForwardVector().cross(this.camera.up);
  }

  isMoving() {
    return (this.keys['KeyW'] == true || this.keys['KeyS'] == true || this.keys['KeyA'] == true || this.keys['KeyD'] == true);
  }
}

export { Character };