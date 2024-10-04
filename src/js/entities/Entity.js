import { EventDispatcher, Object3D, Quaternion, Vector3 } from 'three';
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
    this.rigidBody;
    this.rigidBodyDesc;
    this.colliders = new Map();
    this.collidersDesc = [];
    this.object = new Object3D();
    this.snapshot = {
      position_1: new Vector3(),
      position_2: new Vector3(),
      quaternion_1: new Quaternion(),
      quaternion_2: new Quaternion()
    };
    this.tweens = new Group();
    this.forceDirection = new Vector3();
    this.forceAcceleration = 1;
    this.forceSpeedMax = Infinity;
    this.parent;

    // Define initial rigidBodyDesc and colliderDesc
    this.setRigidBodyDesc(options);
    this.addColliderDesc(options);

    // Update 3D object position/rotation
    this.takeSnapshot();
    this.lerp(1);
    
    // Add entity event listeners
    this.onCollision = this.onCollision.bind(this);
    this.onRemoved = this.onRemoved.bind(this);
    this.addEventListener('collision', this.onCollision);
    this.addEventListener('removed', this.onRemoved);
  }

  update(delta) {
    // Take a snapshot every time the entity is updated
    this.takeSnapshot();

    // Check local force
    this.updateForce();

    // Dispatch update event to listeners
    this.dispatchEvent({ type: 'updated' });
  }

  render(delta, alpha) {
    // Skip (s)lerp if body type is null or "Fixed"
    if (this.rigidBody && this.rigidBody.isFixed()) return false;

    // Interpolate 3D object position
    this.lerp(alpha);

    // Update optional tweens
    this.tweens.update();
  }

  setRigidBodyDesc(options) {
    // Set options with default values
    options = Object.assign({
      angularDamping: 0,
      ccd: false,
      enabledRotations: { x: true, y: true, z: true },
      enabledTranslations: { x: true, y: true, z: true },
      isEnabled: true,
      linearDamping: 0,
      position: { x: 0, y: 0, z: 0 },
      quaternion: { x: 0, y: 0, z: 0, w: 1 },
      softCcdPrediction: 0,
      status: 0, // 0: Dynamic, 1: Fixed, 2: KinematicPositionBased, 3: KinematicVelocityBased
    }, options);

    // Initialize rigid body description
    this.rigidBodyDesc = new RigidBodyDesc(isNaN(options.status) ? RigidBodyType[options.status] : options.status);
    this.rigidBodyDesc.enabledRotations(options.enabledRotations.x, options.enabledRotations.y, options.enabledRotations.z);
    this.rigidBodyDesc.enabledTranslations(options.enabledTranslations.x, options.enabledTranslations.y, options.enabledTranslations.z);
    this.rigidBodyDesc.setAngularDamping(options.angularDamping);
    this.rigidBodyDesc.setCcdEnabled(options.ccd);
    this.rigidBodyDesc.setEnabled(options.isEnabled);
    this.rigidBodyDesc.setLinearDamping(options.linearDamping);
    this.rigidBodyDesc.setRotation(options.quaternion);
    this.rigidBodyDesc.setSoftCcdPrediction(options.softCcdPrediction);
    this.rigidBodyDesc.setTranslation(options.position.x, options.position.y, options.position.z);
  }

  addColliderDesc(options) {
    // Set options with default values
    options = Object.assign({
      activeCollisionTypes: 'DEFAULT', // 1: DYNAMIC_DYNAMIC, 2: DYNAMIC_FIXED, 12: DYNAMIC_KINEMATIC, 15: DEFAULT, 32: FIXED_FIXED, 8704: KINEMATIC_FIXED, 52224: KINEMATIC_KINEMATIC, 60943: ALL
      activeEvents: 'NONE', // 0: NONE, 1: COLLISION_EVENTS, 2: CONTACT_FORCE_EVENTS
      collisionGroups: 0xFFFFFFFF,
      collisionEventStart: function(e) {},
      collisionEventEnd: function(e) {},
      contactForceEventThreshold: 0,
      density: 1,
      friction: 0.5,
      isSensor: false,
      mass: null,
      restitution: 0,
      shape: null,
      solverGroups: 0xFFFFFFFF,
      translation: { x: 0, y: 0, z: 0 }
    }, options);

    var colliderDesc = new ColliderDesc(options.shape);
    colliderDesc.setActiveCollisionTypes(ActiveCollisionTypes[options.activeCollisionTypes]);
    colliderDesc.setActiveEvents(ActiveEvents[options.activeEvents]);
    colliderDesc.setCollisionGroups(options.collisionGroups);
    colliderDesc.setContactForceEventThreshold(options.contactForceEventThreshold);
    colliderDesc.setDensity(options.density);
    colliderDesc.setFriction(options.friction);
    colliderDesc.setSensor(options.isSensor);
    colliderDesc.setRestitution(options.restitution);
    colliderDesc.setSolverGroups(options.solverGroups);
    colliderDesc.setTranslation(options.translation.x, options.translation.y, options.translation.z);
    
    // Conditionally set values to allow default effects
    if (options.mass) colliderDesc.setMass(options.mass);

    // Store callback events to colliderDesc
    colliderDesc.collisionEventStart = options.collisionEventStart;
    colliderDesc.collisionEventEnd = options.collisionEventEnd;

    // Add colliderDesc to array
    this.collidersDesc.push(colliderDesc);
  }

  createBody(world) {
    this.rigidBody = world.createRigidBody(this.rigidBodyDesc);
  }

  createColliders(world) {
    if (this.rigidBody) {
      // Loop through all collider descriptions
      this.collidersDesc.forEach(function(colliderDesc) {
        // Parent the collider to the rigid body
        var collider = world.createCollider(colliderDesc, this.rigidBody);

        // Add collider to colliders map using the collider handle as the key (ex: "5e-324")
        this.colliders.set(collider.handle, collider);

        // Assign optional callback events to collider
        collider.collisionEventStart = colliderDesc.collisionEventStart;
        collider.collisionEventEnd = colliderDesc.collisionEventEnd;
      }.bind(this));
    }
  }

  getPosition() {
    if (this.rigidBody == null) return this.object.position;
    else if (this.rigidBody.isKinematic()) return this.rigidBody.nextTranslation()
    else return this.rigidBody.translation();
  }

  setPosition(position) {
    if (this.rigidBody) this.rigidBody.setTranslation(position);
  }

  getRotation() {
    if (this.rigidBody == null) return this.object.quaternion;
    else if (this.rigidBody.isKinematic()) return this.rigidBody.nextRotation()
    else return this.rigidBody.rotation();
  }

  setRotation(quaternion) {
    if (this.rigidBody) this.rigidBody.setRotation(quaternion);
  }

  getScale() {
    return this.object.scale;
  }

  setScale(scale) {
    // Colliders cannot be resized directly 
    this.object.scale.copy(scale);
  }

  tween(options) {
    // Assign easing from string (ex: "Quadratic.InOut") - https://stackoverflow.com/a/43849204/2510368
    if (typeof options.easing == 'string') {
      options.easing = options.easing.split('.').reduce((p,c)=>p&&p[c]||null, Easing);
    }

    // Create and assign tween to tween group
    var tween = new Tween(options.object, this.tweens).to(options.to, options.duration).dynamic(options.dynamic).easing(options.easing).interpolation(options.interpolation).onStart(options.onStart).onUpdate(options.onUpdate).onComplete(options.onComplete);
    return tween;
  }

  takeSnapshot() {
    // A snapshot requires a physical rigid body
    if (this.rigidBody) {
      // Store previous snapshot position for lerp
      this.snapshot.position_1.copy(this.snapshot.position_2);
      this.snapshot.quaternion_1.copy(this.snapshot.quaternion_2);

      // Store next position for lerp if the rigid body is a kinematic type
      if (this.rigidBody.isKinematic()) {
        this.snapshot.position_2.copy(this.rigidBody.nextTranslation());
        this.snapshot.quaternion_2.copy(this.rigidBody.nextRotation());
      }
      else {
        // Store next position for lerp for all other rigid body types
        this.snapshot.position_2.copy(this.rigidBody.translation());
        this.snapshot.quaternion_2.copy(this.rigidBody.rotation());
      }
    }
    else {
      // Set position/rotation from rigidBodyDesc
      this.snapshot.position_1.copy(this.rigidBodyDesc.translation);
      this.snapshot.position_2.copy(this.rigidBodyDesc.translation);
      this.snapshot.quaternion_1.copy(this.rigidBodyDesc.rotation);
      this.snapshot.quaternion_2.copy(this.rigidBodyDesc.rotation);
    }
  }

  lerp(alpha = 0) {
    // Linear interpolation using alpha value
    this.object.position.lerpVectors(this.snapshot.position_1, this.snapshot.position_2, alpha);
    this.object.quaternion.slerpQuaternions(this.snapshot.quaternion_1, this.snapshot.quaternion_2, alpha);
  }

  onCollision(e) {
    // Get the collider from the event handle
    var collider = e.target.colliders.get(e.handle);

    // Determine which event to call by the "started" boolean
    if (e.started == true) collider.collisionEventStart(e);
    else collider.collisionEventEnd(e);
  }

  onRemoved(e) {
    // Remove all event listeners when removed by Physics.js
    e.target.removeEventListener('collision', e.target.onCollision);
    e.target.removeEventListener('removed', e.target.onRemoved);
  }

  applyVelocityAtAngle(force = { x: 1, y: 1, z: 1 }, angle) {
    // Rotate and apply velocity at an angle
    var velocity = new Vector3().copy(this.rigidBody.linvel());
    velocity.applyAxisAngle({ x: 0, y: 0, z: 1 }, -angle);
    velocity.multiply(force);
    velocity.applyAxisAngle({ x: 0, y: 0, z: 1 }, angle);
    this.rigidBody.setLinvel(velocity, true);
  }

  setAngularVelocityAtAngle(force = { x: 1, y: 1, z: 1 }, angle) {
    var velocity = new Vector3().copy(this.rigidBody.linvel());
    var direction = 1;

    // Rotate velocity before computing direction
    velocity.applyAxisAngle({ x: 0, y: 0, z: 1 }, -angle);
    direction *= -Math.sign(Math.round(velocity.x)); // -1, 0, or 1
    force = new Vector3().copy(force);
    force.multiplyScalar(direction);
    this.rigidBody.setAngvel(force, true);
  }

  applyImpulseAtAngle(force = { x: 0, y: 0, z: 0 }, angle) {
    // Rotate and apply force at an angle
    force = new Vector3().copy(force);
    force.applyAxisAngle({ x: 0, y: 0, z: 1 }, angle);
    this.rigidBody.applyImpulse(force, true);
  }

  setForce(direction = { x: 0, y: 0, z: 0 }, acceleration = 1, max = Infinity) {
    this.forceDirection.copy(direction).normalize(); // Ex: -1.0 to 1.0
    this.forceAcceleration = acceleration;
    this.forceSpeedMax = max;
  }

  updateForce() {
    // Check if force exists
    if (this.forceDirection.length() > 0) {
      _vector.copy(this.rigidBody.linvel());
      const speed = _vector.dot(this.forceDirection);
      const speedNext = speed + this.forceAcceleration; // Ex: 0.5 to 4.5
      const speedClamped = Math.max(speed, Math.min(speedNext, this.forceSpeedMax));
      const acceleration = speedClamped - speed; // Ex: 0.5 (or 0 at max speed)
      
      // Update velocity using new force
      _vector.x += this.forceDirection.x * acceleration;
      _vector.y += this.forceDirection.y * acceleration;
      _vector.z += this.forceDirection.z * acceleration;
      this.rigidBody.setLinvel(_vector);
    }
  }

  getSpeed() {
    if (this.rigidBody == null) return 0;
    return _vector.copy(this.rigidBody.linvel()).length();
  }

  toJSON() {
    var json = {
      class: this.constructor.name,
      position: {
        x: this.snapshot.position_2.x,
        y: this.snapshot.position_2.y,
        z: this.snapshot.position_2.z
      },
      quaternion: {
        x: this.snapshot.quaternion_2.x,
        y: this.snapshot.quaternion_2.y,
        z: this.snapshot.quaternion_2.z,
        w: this.snapshot.quaternion_2.w,
      }
    };

    // Add body info
    if (this.rigidBody) {
      json.rigidBody = {
        status: this.rigidBody.bodyType()
      }
    }

    return json;
  }

  updateFromJSON(json) {
    // Set position
    if (json.position) {
      if (this.rigidBody) this.setPosition(json.position);
      this.snapshot.position_2.copy(json.position);
    }

    // Set rotation
    if (json.quaternion) {
      if (this.rigidBody) this.setRotation(json.quaternion);
      this.snapshot.quaternion_2.copy(json.quaternion);
    }
  }
}

// Assign local helper components
let _vector = new Vector3();

export { Entity };