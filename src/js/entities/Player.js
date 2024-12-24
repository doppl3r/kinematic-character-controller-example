import { Vector3 } from 'three';
import { CameraFactory } from '../core/factories/CameraFactory.js';
import { Capsule } from '@dimforge/rapier3d';
import { Character } from '../core/entities/Character.js';
import { Cuboid } from '@dimforge/rapier3d';

/*
  A Player is a subclass that extends the Character class which includes
  a single Kinematic Character Controller.
*/

class Player extends Character {
  // Define static properties
  static model = {
    name: 'player'
  };

  constructor(options = {}) {
    // Set options with default values
    options = Object.assign({
      activeCollisionTypes: 'KINEMATIC_FIXED',
      activeEvents: 'COLLISION_EVENTS',
      ccd: true,
      events: [{ name: 'checkCollision' }],
      gravity: 9.81,
      height: 0.25,
      jumpForce: 5,
      moveForce: 5,
      radius: 0.25,
      scale: { x: 1, y: 1, z: 1 },
      status: 'KinematicPositionBased'
    }, options);

    // Create physical shape
    options.shape = new Capsule(options.height, options.radius);

    // Inherit Character class
    super(options);

    // Set default properties
    this.isPlayer = true;
    this.type = 'player';
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
    this.camera = CameraFactory.create('PerspectiveCamera');
    this.cameraOffset = new Vector3(0, 2, 2);

    // Add optional model to 3D object
    this.model = options.model;

    // Bind "this" context to class function (required for event removal)
    this.onPlayerAdded = this.onPlayerAdded.bind(this);
    this.onPlayerRemoved = this.onPlayerRemoved.bind(this);
    
    // Add event listeners
    this.addEventListener('added', this.onPlayerAdded);
    this.addEventListener('removed', this.onPlayerRemoved);

    // Add a sensor collider to the same rigidBody
    this.addColliderDesc({
      activeCollisionTypes: 'ALL',
      activeEvents: 'COLLISION_EVENTS',
      events: [(e) => { console.log(`Interacted with ${e.pair.type}`); }],
      isSensor: true,
      mass: 0,
      shape: new Cuboid(options.scale.x * 0.125, options.scale.y * 0.125, options.scale.z * 0.125),
      translation: { x: 0, y: 0, z: 0.25 * options.scale.y }
    });
  }

  update(delta) {
    // Call Entity update function
    super.update(delta);

    // Update the player velocity from input keys
    this.updateVelocityFromInput(delta);

    // Calculate next translation from computed movement
    this.move(this.velocity);

    // Update 3D object rotation using next direction
    this.updateObjectRotation();
  }

  animate(delta, alpha) {
    // Call Entity animate function
    super.animate(delta, alpha);

    // Update camera position
    this.camera.position.copy(this.object.position).add(this.cameraOffset);
    this.camera.lookAt(this.object.position);

    // Update model (optional)
    if (this.model && this.model.mixer) {
      this.model.mixer.update(delta);
    }
  }

  checkCollision({ pair, target, value }) {
    if (pair.type == 'bounce') {
      target.move({ x: 0, y: 1, z: 0 });
      target.velocity.y = 0.5;
    }
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
    if (this.nextTranslation.distanceTo(this.rigidBody.translation()) > 0.01) {
      this.object.lookAt(this.nextTranslation.x, this.object.position.y, this.nextTranslation.z);
      this.rigidBody.setNextKinematicRotation(this.object.quaternion);
    }
  }

  addModel() {
    this.object.add(this.model);

    // Offset model position from shape dimensions
    var height = this.collidersDesc[0].shape.halfHeight / this.object.scale.y;
    var radius = this.collidersDesc[0].shape.radius / this.object.scale.x
    this.model.position.y = -(height + radius);
  }

  isMoving() {
    return (this.keys['KeyW'] == true || this.keys['KeyS'] == true || this.keys['KeyA'] == true || this.keys['KeyD'] == true);
  }

  isJumping() {
    return this.jumping;
  }

  onPlayerAdded(e) {
    // Bind target "this" context to class function (required for event removal)
    e.target.keyDown = e.target.keyDown.bind(e.target);
    e.target.keyUp = e.target.keyUp.bind(e.target);

    // Add player model
    this.addModel(this.model);

    // Add event listeners
    document.addEventListener('keydown', e.target.keyDown);
    document.addEventListener('keyup', e.target.keyUp);
  }

  onPlayerRemoved(e) {
    // Remove entity event listeners
    e.target.removeEventListener('added', e.target.onPlayerAdded);
    e.target.removeEventListener('removed', e.target.onPlayerRemoved);

    // Add event listeners
    document.removeEventListener('keydown', e.target.keyDown);
    document.removeEventListener('keyup', e.target.keyUp);
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