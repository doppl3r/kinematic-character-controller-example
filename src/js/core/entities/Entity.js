import { EventDispatcher, MathUtils, Object3D, Quaternion, Vector3 } from 'three';
import { ActiveCollisionTypes, ActiveEvents, ColliderDesc, RigidBodyDesc, RigidBodyType } from '@dimforge/rapier3d';
import { Easing, Group, Tween } from '@tweenjs/tween.js'

/*
  An entity is an abstract class that contains a single 3D object and a
  single rigid body object. The rigid body can have multiple colliders.
  
  An entity assumes that the rigid body is being updated at a lower
  interval, and leverages the lerp() function to interpolate the
  3D object at a higher interval (smoother results)
*/

class Entity extends EventDispatcher {
  constructor(options) {
    // Inherit Three.js EventDispatcher system
    super();

    // Set base components
    this.name = options.name || '';
    this.type = options.type || 'entity';
    this.id = options.id || MathUtils.generateUUID();
    this.isEntity = true;
    this.object;
    this.objectDesc;
    this.rigidBody;
    this.rigidBodyDesc;
    this.collidersDesc = [];
    this.snapshot = {
      position_1: new Vector3(),
      position_2: new Vector3(),
      rotation_1: new Quaternion(),
      rotation_2: new Quaternion()
    };
    this.tweens = new Group();
    this.forceDirection = new Vector3();
    this.forceAcceleration = 1;
    this.forceSpeedMax = Infinity;

    // Define initial rigidBodyDesc and colliderDesc
    this.setObjectDesc(options);
    this.setRigidBodyDesc(options);
    this.addColliderDesc(options);
    
    // Add entity event listeners with "this" context
    this.onAdded = this.onAdded.bind(this);
    this.addEventListener('added', this.onAdded);
  }

  update(delta) {
    // Take a snapshot every time the entity is updated
    this.updateSnapshot();

    // Check local force
    this.updateForce();

    // Dispatch update event to listeners
    this.dispatchEvent({ type: 'updated' });
  }

  animate(delta, alpha) {
    // Skip (s)lerp if body type is null or "Fixed"
    if (this.rigidBody && this.rigidBody.isFixed()) return false;

    // Update optional tweens
    this.tweens.update();

    // Interpolate 3D object position
    this.lerp(alpha);
  }

  setObjectDesc(options) {
    // Set default object options
    const defaultOptions = {
      scale: { x: 1, y: 1, z: 1 }
    }

    // Set options with default values
    options = Object.assign({ ...defaultOptions }, options);

    // Create object description
    this.objectDesc = new Object3D();
    this.objectDesc.scale.copy(options.scale);
  }

  setObject(object) {
    this.object = object;
  }

  createObject3D(objectDesc) {
    const object = new Object3D();
    object.scale.copy(objectDesc.scale);
    return object;
  }

  setRigidBodyDesc(options) {
    // Set default rigid body options
    const defaultOptions = {
      angularDamping: 0,
      ccd: false,
      enabledRotations: { x: true, y: true, z: true },
      enabledTranslations: { x: true, y: true, z: true },
      isEnabled: true,
      linearDamping: 0,
      position: { x: 0, y: 0, z: 0 },
      rotation: { x: 0, y: 0, z: 0, w: 1 },
      sleeping: false,
      softCcdPrediction: 0,
      status: 0 // 0: Dynamic, 1: Fixed, 2: KinematicPositionBased, 3: KinematicVelocityBased
    };

    // Set options with default values
    options = Object.assign({ ...defaultOptions }, options);

    // Create rigid body description
    this.rigidBodyDesc = new RigidBodyDesc(isNaN(options.status) ? RigidBodyType[options.status] : options.status);
    this.rigidBodyDesc.enabledRotations(options.enabledRotations.x, options.enabledRotations.y, options.enabledRotations.z);
    this.rigidBodyDesc.enabledTranslations(options.enabledTranslations.x, options.enabledTranslations.y, options.enabledTranslations.z);
    this.rigidBodyDesc.setAngularDamping(options.angularDamping);
    this.rigidBodyDesc.setCcdEnabled(options.ccd);
    this.rigidBodyDesc.setEnabled(options.isEnabled);
    this.rigidBodyDesc.setLinearDamping(options.linearDamping);
    this.rigidBodyDesc.setRotation(options.rotation);
    this.rigidBodyDesc.setSleeping(options.sleeping);
    this.rigidBodyDesc.setSoftCcdPrediction(options.softCcdPrediction);
    this.rigidBodyDesc.setTranslation(options.position.x, options.position.y, options.position.z);
    this.rigidBodyDesc.setUserData({ id: this.id, parentId: options.parentId }); // Store entity IDs for Physics.js
  }

  setRigidBody(rigidBody) {
    this.rigidBody = rigidBody;
  }

  addColliderDesc(options) {
    if (options.shape) {
      // Set default collider options
      const defaultOptions = {
        activeCollisionTypes: 'DEFAULT', // 1: DYNAMIC_DYNAMIC, 2: DYNAMIC_FIXED, 12: DYNAMIC_KINEMATIC, 15: DEFAULT, 32: FIXED_FIXED, 8704: KINEMATIC_FIXED, 52224: KINEMATIC_KINEMATIC, 60943: ALL
        activeEvents: 'NONE', // 0: NONE, 1: COLLISION_EVENTS, 2: CONTACT_FORCE_EVENTS
        collisionGroups: 0xFFFFFFFF,
        contactForceEventThreshold: 0,
        density: 1,
        events: [],
        friction: 0.5,
        isSensor: false,
        mass: 0,
        restitution: 0,
        shape: null,
        solverGroups: 0xFFFFFFFF,
        translation: { x: 0, y: 0, z: 0 }
      };

      // Set options with default values
      options = Object.assign({ ...defaultOptions }, options);

      // Create collider description
      const colliderDesc = new ColliderDesc(options.shape);
      colliderDesc.setActiveCollisionTypes(isNaN(options.activeCollisionTypes) ? ActiveCollisionTypes[options.activeCollisionTypes] : options.activeCollisionTypes);
      colliderDesc.setActiveEvents(isNaN(options.activeEvents) ? ActiveEvents[options.activeEvents] : options.activeEvents);
      colliderDesc.setCollisionGroups(options.collisionGroups);
      colliderDesc.setContactForceEventThreshold(options.contactForceEventThreshold);
      colliderDesc.setMass(options.mass); // Must set before density
      colliderDesc.setDensity(options.density);
      colliderDesc.setFriction(options.friction);
      colliderDesc.setRestitution(options.restitution);
      colliderDesc.setSensor(options.isSensor);
      colliderDesc.setSolverGroups(options.solverGroups);
      colliderDesc.setTranslation(options.translation.x, options.translation.y, options.translation.z);

      // Store callback events to colliderDesc
      colliderDesc.events = options.events;

      // Add colliderDesc to array
      this.collidersDesc.push(colliderDesc);
    }
  }

  setController(controller) {
    this.controller = controller;
  }

  getParentId() {
    return this.rigidBodyDesc.userData.parentId;
  }

  setParentId(parentId) {
    this.rigidBodyDesc.userData.parentId = parentId;
  }

  getPosition() {
    if (this.rigidBody == null) return this.rigidBodyDesc.translation;
    else if (this.rigidBody.isKinematic()) return this.rigidBody.nextTranslation()
    else return this.rigidBody.translation();
  }

  setPosition(position) {
    if (this.rigidBody) this.rigidBody.setTranslation(position);
  }

  resetPosition() {
    this.setPosition(this.rigidBodyDesc.translation);
  }

  getRotation() {
    if (this.rigidBody == null) return this.rigidBodyDesc.rotation;
    else if (this.rigidBody.isKinematic()) return this.rigidBody.nextRotation()
    else return this.rigidBody.rotation();
  }

  setRotation(rotation) {
    if (this.rigidBody) this.rigidBody.setRotation(rotation);
  }

  resetRotation() {
    this.setRotation(this.rigidBodyDesc.rotation);
  }

  getScale() {
    return this.object.scale;
  }

  setScale(scale) {
    if (this.object) this.object.scale.copy(scale);
  }

  resetScale() {
    this.setScale(this.objectDesc.scale);
  }

  getLinearVelocity() {
    if (this.rigidBody) return this.rigidBody.linvel();
    else return this.rigidBodyDesc.linvel;
  }

  setLinearVelocity(velocity) {
    if (this.rigidBody) this.rigidBody.setLinvel(velocity);
  }

  applyVelocityAtAxisAngle(velocity = { x: 1, y: 1, z: 1 }, axis = { x: 0, y: 0, z: 0 }, angle = 0) {
    // Get current linear velocity
    _vector.copy(this.getLinearVelocity());

    // Rotate velocity along axis, apply scale, then revert rotation
    _vector.applyAxisAngle(axis, -angle);
    _vector.multiply(velocity);
    _vector.applyAxisAngle(axis, angle);

    // Set new linear velocity
    this.setLinearVelocity(_vector, true);
  }

  applyImpulse(force = { x: 0, y: 0, z: 0 }) {
    this.rigidBody.applyImpulse(force, true);
  }

  applyImpulseAtAngle(force = { x: 0, y: 0, z: 0 }, angle = 0) {
    // Rotate and apply force at an angle
    force = _vector.copy(force);
    force.applyAxisAngle({ x: 0, y: 0, z: 1 }, angle);
    this.applyImpulse(force);
  }

  setForce(direction = { x: 0, y: 0, z: 0 }, acceleration = 1, max = Infinity) {
    this.forceDirection.copy(direction).normalize(); // Ex: -1.0 to 1.0
    this.forceAcceleration = acceleration;
    this.forceSpeedMax = max;
  }

  updateForce() {
    // Check if force exists
    if (this.forceDirection.length() > 0) {
      _vector.copy(this.getLinearVelocity());
      const speed = _vector.dot(this.forceDirection);
      const speedNext = speed + this.forceAcceleration; // Ex: 0.5 to 4.5
      const speedClamped = Math.max(speed, Math.min(speedNext, this.forceSpeedMax));
      const acceleration = speedClamped - speed; // Ex: 0.5 (or 0 at max speed)
      
      // Update velocity using new force
      _vector.x += this.forceDirection.x * acceleration;
      _vector.y += this.forceDirection.y * acceleration;
      _vector.z += this.forceDirection.z * acceleration;
      this.setLinearVelocity(_vector);
    }
  }

  resetLinearVelocity() {
    this.setLinearVelocity(this.rigidBodyDesc.linvel);
  }

  getAngularVelocity() {
    if (this.rigidBody == null) return this.rigidBodyDesc.angvel;
    else return this.rigidBody.angvel();
  }

  setAngularVelocity(velocity) {
    if (this.rigidBody) this.rigidBody.setAngvel(velocity);
  }

  setAngularVelocityAtAngle(force = { x: 1, y: 1, z: 1 }, angle = 0) {
    const velocity = _vector.copy(this.getLinearVelocity());
    let direction = 1;

    // Rotate velocity before computing direction
    velocity.applyAxisAngle({ x: 0, y: 0, z: 1 }, -angle);
    direction *= -Math.sign(Math.round(velocity.x)); // -1, 0, or 1
    force = _vector.copy(force);
    force.multiplyScalar(direction);
    this.setAngularVelocity(force);
  }

  resetAngularVelocity() {
    this.setAngularVelocity(this.rigidBodyDesc.angvel);
  }

  getStatus() {
    if (this.rigidBody) return this.rigidBody.bodyType;
    else return this.rigidBodyDesc.status;
  }

  setStatus(status) {
    if (this.rigidBody) this.rigidBody.setBodyType(status);
  }

  resetStatus() {
    this.setStatus(this.rigidBodyDesc.status);
  }

  resetForces() {
    if (this.rigidBody) this.rigidBody.resetForces();
  }

  resetTorques() {
    if (this.rigidBody) this.rigidBody.resetTorques();
  }

  reset() {
    this.resetPosition();
    this.resetRotation();
    this.resetScale();
    this.resetLinearVelocity();
    this.resetAngularVelocity();
    this.resetForces();
    this.resetTorques();
    this.resetStatus();
    this.updateSnapshot();
    this.lerp(1);
  }

  tween(options) {
    // Assign easing from string (ex: "Quadratic.InOut") - https://stackoverflow.com/a/43849204/2510368
    if (typeof options.easing == 'string') {
      options.easing = options.easing.split('.').reduce((p,c)=>p&&p[c]||null, Easing);
    }

    // Create and assign tween to tween group
    const tween = new Tween(options.object, this.tweens).to(options.to, options.duration).dynamic(options.dynamic).easing(options.easing).interpolation(options.interpolation).onStart(options.onStart).onUpdate(options.onUpdate).onComplete(options.onComplete);
    return tween;
  }

  updateSnapshot(refresh = false) {
    if (refresh == true) {
      // Set position/rotation from rigidBodyDesc
      this.snapshot.position_1.copy(this.rigidBodyDesc.translation);
      this.snapshot.position_2.copy(this.rigidBodyDesc.translation);
      this.snapshot.rotation_1.copy(this.rigidBodyDesc.rotation);
      this.snapshot.rotation_2.copy(this.rigidBodyDesc.rotation);
    }
    else {
      // Store previous snapshot position for lerp
      this.snapshot.position_1.copy(this.snapshot.position_2);
      this.snapshot.rotation_1.copy(this.snapshot.rotation_2);

      // Store next position for lerp if the rigid body is a kinematic type
      if (this.rigidBody.isKinematic()) {
        this.snapshot.position_2.copy(this.rigidBody.nextTranslation());
        this.snapshot.rotation_2.copy(this.rigidBody.nextRotation());
      }
      else {
        // Store next position for lerp for all other rigid body types
        this.snapshot.position_2.copy(this.rigidBody.translation());
        this.snapshot.rotation_2.copy(this.rigidBody.rotation());
      }
    }
  }

  lerp(alpha = 0) {
    // Linear interpolation using alpha value
    if (this.object) {
      this.object.position.lerpVectors(this.snapshot.position_1, this.snapshot.position_2, alpha);
      this.object.quaternion.slerpQuaternions(this.snapshot.rotation_1, this.snapshot.rotation_2, alpha);
    }
  }

  getCollider(handle) {
    // Loop through rigid body colliders
    for (let i = 0; i < this.rigidBody.numColliders(); i++) {
      const collider = this.rigidBody.collider(i);
      if (handle == collider.handle) return collider;
    }
  }

  onCollision(e) {
    // Get the collider from the event handle
    const collider = this.getCollider(e.handle);

    // Get a new list of events based on e.started state
    const events = collider.events.filter(
      function(event) {
        // Return events with matching started state
        return (event.started == undefined && e.started == true) || event.started == e.started;
      }.bind(this)
    );

    // Trigger each event with optional data
    events.forEach(
      function(event) {
        try {
          let fn = event;
          if (typeof event == 'object') fn = this[event.name];
          fn(Object.assign(e, event));
        }
        catch (error) { console.error(error); }
      }.bind(this)
    );
  }

  onAdded(e) {
    // Update 3D object properties
    this.updateSnapshot(true);
    this.lerp(1);

    // Add entity event listeners with "this" context
    this.onCollision = this.onCollision.bind(this);
    this.onRemoved = this.onRemoved.bind(this);
    this.addEventListener('collision', this.onCollision);
    this.addEventListener('removed', this.onRemoved);
  }

  onRemoved(e) {
    // Remove all event listeners when removed by Physics.js
    this.removeEventListener('collision', this.onCollision);
    this.removeEventListener('removed', this.onRemoved);
  }

  getSpeed() {
    if (this.rigidBody == null) return 0;
    return _vector.copy(this.getLinearVelocity()).length();
  }

  toJSON() {
    // Initialize entity values
    let json = {
      id: this.id,
      name: this.name,
      type: this.type
    };

    // Include rigidBody properties
    json = Object.assign({
      angularDamping: this.rigidBodyDesc.angularDamping,
      ccd: this.rigidBodyDesc.ccdEnabled,
      enabledRotations: {
        x: this.rigidBodyDesc.rotationsEnabledX,
        y: this.rigidBodyDesc.rotationsEnabledY,
        z: this.rigidBodyDesc.rotationsEnabledZ
      },
      enabledTranslations: {
        x: this.rigidBodyDesc.translationsEnabledX,
        y: this.rigidBodyDesc.translationsEnabledY,
        z: this.rigidBodyDesc.translationsEnabledZ
      },
      isEnabled: this.rigidBodyDesc.enabled,
      linearDamping: this.rigidBodyDesc.linearDamping,
      parentId: this.rigidBodyDesc.userData.parentId,
      position: {
        x: this.rigidBodyDesc.translation.x,
        y: this.rigidBodyDesc.translation.y,
        z: this.rigidBodyDesc.translation.z
      },
      rotation: {
        x: this.rigidBodyDesc.rotation.x,
        y: this.rigidBodyDesc.rotation.y,
        z: this.rigidBodyDesc.rotation.z,
        w: this.rigidBodyDesc.rotation.w
      },
      scale: {
        x: this.objectDesc.scale.x,
        y: this.objectDesc.scale.y,
        z: this.objectDesc.scale.z
      },
      sleeping: this.rigidBodyDesc.sleeping,
      softCcdPrediction: this.rigidBodyDesc.softCcdPrediction,
      status: this.rigidBodyDesc.status
    }, json);

    // Include first collider properties
    if (this.collidersDesc.length > 0) {
      json = Object.assign({
        activeCollisionTypes: this.collidersDesc[0].activeCollisionTypes,
        activeEvents: this.collidersDesc[0].activeEvents,
        collisionGroups: this.collidersDesc[0].collisionGroups,
        contactForceEventThreshold: this.collidersDesc[0].contactForceEventThreshold,
        density: this.collidersDesc[0].density,
        events: this.collidersDesc[0].events,
        friction: this.collidersDesc[0].friction,
        isSensor: this.collidersDesc[0].isSensor,
        mass: this.collidersDesc[0].mass,
        restitution: this.collidersDesc[0].restitution,
        solverGroups: this.collidersDesc[0].solverGroups,
        translation: this.collidersDesc[0].translation
      }, json);
    }

    // Return final json
    return json;
  }
}

// Assign local helper components
let _vector = new Vector3();

export { Entity };