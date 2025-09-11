import { Vector3 } from 'three';
import { QueryFilterFlags } from '@dimforge/rapier3d';

/*
  The following controller receives user input that can control
  entity properties (such as position, force, etc.)
*/

class EntityControllerKinematic {
  constructor(controller) {
    // Declare components
    this.controller = controller;
    this.entity;

    // Initialize force properties
    this.forceDirection = new Vector3();
    this.forceAcceleration = 1 / 32;
    this.forceSpeedMax = 0.075;

    // Initialize input properties
    this.keys = {};
    this.pointer = {};
    this.jumpBuffer = 0; // ms
    this.inputBuffer = 100; // ms
    this.allowJump = true;

    // Set camera properties
    this.camera;
    this.cameraSpeed = 100; // ms
    this.cameraOffset = new Vector3(0, 3, 4);

    // Add input event listeners
    document.addEventListener('keydown', this.onKeyDown);
    document.addEventListener('keyup', this.onKeyUp);
    document.addEventListener('pointerdown', this.onPointerDown);
    document.addEventListener('pointerup', this.onPointerUp);
  }

  setCamera = camera => {
    this.camera = camera;
  }

  setEntity(entity) {
    this.entity = entity;
    this.entity.velocity = new Vector3();
    this.entity.addEventListener('updated', this.onUpdated);
    this.entity.addEventListener('rendered', this.onRendered);

    // Update camera position/rotation
    this.camera.position.copy(this.cameraOffset);
    this.camera.lookAt(this.entity.object3D.position);
  }

  onUpdated = ({ loop }) => {
    // Calculate input buffer
    if (this.jumpBuffer > 0) {
      this.jumpBuffer -= loop.delta; // ms

      // Automatically jump if buffer is set
      if (this.allowJump === true) {
        this.jumpBuffer = 0;
        this.jump();
      }
    }
    
    // Add fake friction and fake gravity
    this.entity.velocity.x *= 0.75;
    this.entity.velocity.z *= 0.75;
    this.entity.velocity.y -= 0.005;
    
    // Update force direction from user input
    let xDirection = 0;
    let zDirection = 0;
    if (this.keys['KeyW'] === true || this.keys['ArrowUp'] === true) zDirection = -1;
    if (this.keys['KeyS'] === true || this.keys['ArrowDown'] === true) zDirection = 1;
    if (this.keys['KeyD'] === true || this.keys['ArrowRight'] === true) xDirection = 1;
    if (this.keys['KeyA'] === true || this.keys['ArrowLeft'] === true) xDirection = -1;
    
    // Set the new force direction
    this.forceDirection.copy({ x: xDirection, y: 0, z: zDirection }); // Ex: -1.0 to 1.0

    // Decrease acceleration if the velocity speed equals the force speed
    _v.copy(this.entity.velocity);
    const speed = _v.dot(this.forceDirection);
    const speedNext = speed + this.forceAcceleration;
    const speedClamped = Math.max(speed, Math.min(speedNext, this.forceSpeedMax));
    const acceleration = speedClamped - speed; // Ex: 0.5 (or 0 at max speed)
    
    // Add force to velocity using new acceleration
    this.entity.velocity.x += this.forceDirection.x * acceleration;
    this.entity.velocity.y += this.forceDirection.y * acceleration;
    this.entity.velocity.z += this.forceDirection.z * acceleration;
    
    // Set the next kinematic translation
    if (this.entity.rigidBody.numColliders() > 0) {
      this.controller.computeColliderMovement(this.entity.rigidBody.collider(0), this.entity.velocity, QueryFilterFlags['EXCLUDE_SENSORS']);
      _v.copy(this.entity.rigidBody.translation());
      _v.add(this.controller.computedMovement());
      this.entity.rigidBody.setNextKinematicTranslation(_v);
    }

    // Calculate 3D object rotation from character translation
    _v.copy(this.entity.rigidBody.nextTranslation());
    if (_v.distanceTo(this.entity.rigidBody.translation()) > 0.01) {
      this.entity.object3D.lookAt(_v.x, this.entity.object3D.position.y, _v.z);
      this.entity.rigidBody.setNextKinematicRotation(this.entity.object3D.quaternion);
    }
    
    // Set vertical velocity to zero if grounded
    if (this.controller.computedGrounded()) {
      this.allowJump = true;
      this.entity.velocity.y = 0;
    }
  }

  onRendered = ({ loop }) => {
    // Smoothly move camera to entity position
    this.camera.position.x = this.camera.position.x * (1 - loop.delta / this.cameraSpeed) + (this.entity.snapshot.position.x + this.cameraOffset.x) * loop.delta / this.cameraSpeed;
    this.camera.position.y = this.camera.position.y * (1 - loop.delta / this.cameraSpeed) + (this.entity.snapshot.position.y + this.cameraOffset.y) * loop.delta / this.cameraSpeed;
    this.camera.position.z = this.camera.position.z * (1 - loop.delta / this.cameraSpeed) + (this.entity.snapshot.position.z + this.cameraOffset.z) * loop.delta / this.cameraSpeed;
    this.camera.lookAt(this.entity.object3D.position);
  }

  jump() {
    if (this.allowJump === true) {
      this.allowJump = false;
      this.entity.velocity.y = 0.1;
    }
    else {
      // Add jump buffer (ms)
      this.jumpBuffer = this.inputBuffer;
    }
  }

  isMoving() {
    // Check if user input keys exist in array of optional movement keys
    const movementKeys = ['KeyW', 'KeyA', 'KeyS', 'KeyD', 'ArrowUp', 'ArrowLeft', 'ArrowDown', 'ArrowRight'];
    return Object.keys(this.keys).some(key => movementKeys.includes(key));
  }

  onKeyDown = ({ code, repeat }) => {
    // Assign key inputs to true (once)
    if (repeat) return;
    this.keys[code] = true;

    // Add keybindings
    if (this.keys['Space'] === true) this.jump();

    // Update mixer animations
    if (this.isMoving() === true) {
      this.entity?.mixer.play('Run', 0.125);
    }
  }

  onKeyUp = ({ code }) => {
    // Set key values to false
    delete this.keys[code];

    // Update mixer animations
    if (this.isMoving() === false) {
      this.entity?.mixer.play('Idle', 0.125);
    }
  }

  onPointerDown = ({ target, which }) => {
    // Cancel input for non-canvas elements
    if (target.nodeName != 'CANVAS') return;
    
    // Add touch bindings
    this.pointer[which] = true;
    if (this.pointer[1] === true) this.jump();
  }

  onPointerUp = (e) => {
    
  }

  destroy() {
    this.entity.removeEventListener('updated', this.update);
    this.entity.removeEventListener('rendered', this.render);
    document.removeEventListener('keydown', this.onKeyDown);
    document.removeEventListener('keyup', this.onKeyUp);
    document.removeEventListener('pointerdown', this.onPointerDown);
    document.removeEventListener('pointerup', this.onPointerUp);
  }
}

const _v = new Vector3();

export { EntityControllerKinematic }