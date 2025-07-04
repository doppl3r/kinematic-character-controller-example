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
    this.forceAcceleration = 1;
    this.forceSpeedMax = Infinity;

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
  }

  onUpdated = ({ delta }) => {
    // Calculate input buffer
    if (this.jumpBuffer > 0) {
      this.jumpBuffer -= delta; // ms

      // Automatically jump if buffer is set
      if (this.allowJump === true) {
        this.jumpBuffer = 0;
        this.jump();
      }
    }

    // Apply constant gravity force (and horizontal damping)
    this.entity.velocity.y -= 0.005;

    // Add movement damping (air resistance)
    this.entity.velocity.x *= 0.75;
    this.entity.velocity.z *= 0.75;

    // Check user input and update force
    this.updateControls();
    this.updateForce();
    
    // Move entity
    this.move(this.entity.velocity);
    this.updateObjectRotation();
    
    // Set vertical velocity to zero if grounded
    if (this.controller.computedGrounded()) {
      this.allowJump = true;
      this.entity.velocity.y = 0;
    }
  }

  onRendered = e => {
    this.lerpCamera(e.loop.delta);
  }

  updateControls() {
    let xDirection = 0;
    let zDirection = 0;

    // Conditionally assign direction from keyboard input
    if (this.keys['KeyW'] === true || this.keys['ArrowUp'] === true) zDirection = -1;
    if (this.keys['KeyS'] === true || this.keys['ArrowDown'] === true) zDirection = 1;
    if (this.keys['KeyD'] === true || this.keys['ArrowRight'] === true) xDirection = 1;
    if (this.keys['KeyA'] === true || this.keys['ArrowLeft'] === true) xDirection = -1;
    
    // Rotate direction vector according to gravity angle
    _v.copy({ x: xDirection, y: 0, z: zDirection });
    this.setForce(_v, 1 / 32, 0.075);
  }

  updateForce() {
    // Check if force exists
    if (this.forceDirection.length() > 0) {
      _v.copy(this.entity.velocity);
      const speed = _v.dot(this.forceDirection);
      const speedNext = speed + this.forceAcceleration; // Ex: 0.5 to 4.5
      const speedClamped = Math.max(speed, Math.min(speedNext, this.forceSpeedMax));
      const acceleration = speedClamped - speed; // Ex: 0.5 (or 0 at max speed)
      
      // Update velocity using new force
      this.entity.velocity.x += this.forceDirection.x * acceleration;
      this.entity.velocity.y += this.forceDirection.y * acceleration;
      this.entity.velocity.z += this.forceDirection.z * acceleration;
    }
  }

  updateObjectRotation() {
    // Calculate 3D object rotation from character translation
    _v.copy(this.entity.rigidBody.nextTranslation());

    if (_v.distanceTo(this.entity.rigidBody.translation()) > 0.01) {
      this.entity.object3D.lookAt(_v.x, this.entity.object3D.position.y, _v.z);
      this.entity.rigidBody.setNextKinematicRotation(this.entity.object3D.quaternion);
    }
  }

  setForce(direction = { x: 0, y: 0, z: 0 }, acceleration = 1, max = Infinity) {
    this.forceDirection.copy(direction); // Ex: -1.0 to 1.0
    this.forceAcceleration = acceleration;
    this.forceSpeedMax = max;
  }

  lerpCamera(delta) {
    this.camera.position.x = this.camera.position.x * (1 - delta / this.cameraSpeed) + (this.entity.snapshot.position.x + this.cameraOffset.x) * delta / this.cameraSpeed;
    this.camera.position.y = this.camera.position.y * (1 - delta / this.cameraSpeed) + (this.entity.snapshot.position.y + this.cameraOffset.y) * delta / this.cameraSpeed;
    this.camera.position.z = this.camera.position.z * (1 - delta / this.cameraSpeed) + (this.entity.snapshot.position.z + this.cameraOffset.z) * delta / this.cameraSpeed;
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

  move(desiredTranslation) {
    // Set the next kinematic translation
    if (this.entity.rigidBody.numColliders() > 0) {
      this.controller.computeColliderMovement(this.entity.rigidBody.collider(0), desiredTranslation, QueryFilterFlags['EXCLUDE_SENSORS']);
      _v.copy(this.entity.rigidBody.translation());
      _v.add(this.controller.computedMovement());
      this.entity.rigidBody.setNextKinematicTranslation(_v);
    }
  }

  isMoving() {
    return (this.keys['KeyW'] === true || this.keys['KeyS'] === true || this.keys['KeyA'] === true || this.keys['KeyD'] === true);
  }

  onKeyDown = ({ code, repeat }) => {
    // Assign key inputs to true (once)
    if (repeat) return;
    this.keys[code] = true;

    // Add keybindings
    if (this.keys['Space'] === true || this.keys['ArrowUp'] === true) this.jump();

    // Update mixer animations
    if (this.isMoving() === true) {
      this.entity.mixer.play('Run', 0.125);
    }
  }

  onKeyUp = ({ code }) => {
    // Set key values to false
    this.keys[code] = false;

    // Update mixer animations
    if (this.isMoving() === false) {
      this.entity.mixer.play('Idle', 0.125);
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
    this.entity.addEventListener('updated', this.update);
    this.entity.addEventListener('rendered', this.render);
    document.removeEventListener('keydown', this.onKeyDown);
    document.removeEventListener('keyup', this.onKeyUp);
    document.removeEventListener('pointerdown', this.onPointerDown);
    document.removeEventListener('pointerup', this.onPointerUp);
  }
}

const _v = new Vector3();

export { EntityControllerKinematic }