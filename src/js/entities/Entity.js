import { EventDispatcher, Object3D, Quaternion, Vector3 } from 'three';
import { ActiveCollisionTypes, ActiveEvents, ColliderDesc, RigidBodyDesc, RigidBodyType } from '@dimforge/rapier3d';

/*
  An entity is an abstract class that contains a single 3D object and a
  single rigid body object. An entity assumes that the rigid body is being
  updated at a lower interval, and leverages the lerp() function to
  interpolate the 3D object at a higher interval (smoother results)
*/

class Entity extends EventDispatcher {
  constructor(options) {
    // Inherit Three.js EventDispatcher system
    super();

    // These components are created when this entity is added to scene/world
    this.body;
    this.collider;
    this.object = new Object3D();
    this.snapshot = {
      position_1: new Vector3(0, 0, 0),
      position_2: new Vector3(0, 0, 0),
      quaternion_1: new Quaternion(0, 0, 0, 1),
      quaternion_2: new Quaternion(0, 0, 0, 1)
    };

    // Define initial rigidBodyDesc and colliderDesc
    this.setRigidBodyDesc(options);
    this.addColliderDesc(options);

    // Update object properties
    this.takeSnapshot();
    this.lerp(1);
  }

  update(delta) {
    // Take a snapshot every time the entity is updated
    if (this.body) this.takeSnapshot();
  }

  render(delta, alpha) {
    // Interpolate 3D object position
    this.lerp(alpha);
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
      type: 'Dynamic', // 0: Dynamic, 1: Fixed, 2: KinematicPositionBased, 3: KinematicVelocityBased
    }, options);

    // Initialize rigid body description
    this.rigidBodyDesc = new RigidBodyDesc(RigidBodyType[options.type]);
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
      mass: 1,
      restitution: 0,
      shape: null,
      solverGroups: 0xFFFFFFFF
    }, options);

    this.colliderDesc = new ColliderDesc(options.shape);
    this.colliderDesc.setActiveCollisionTypes(ActiveCollisionTypes[options.activeCollisionTypes]);
    this.colliderDesc.setActiveEvents(ActiveEvents[options.activeEvents]);
    this.colliderDesc.setCollisionGroups(options.collisionGroups);
    this.colliderDesc.setContactForceEventThreshold(options.contactForceEventThreshold);
    this.colliderDesc.setDensity(options.density);
    this.colliderDesc.setFriction(options.friction);
    this.colliderDesc.setSensor(options.isSensor);
    this.colliderDesc.setMass(options.mass);
    this.colliderDesc.setRestitution(options.restitution);
    this.colliderDesc.setSolverGroups(options.solverGroups);

    // Set collision events
    this.addEventListener('collision', function(e) {
      if (e.started == true) options.collisionEventStart(e);
      else options.collisionEventEnd(e);
    })
  }

  createBody(world) {
    this.body = world.createRigidBody(this.rigidBodyDesc);
  }

  createCollider(world) {
    if (this.body) {
      this.collider = world.createCollider(this.colliderDesc, this.body); // Parent collision to rigid body
    }
  }

  setPosition(position) {
    if (this.body) this.body.setTranslation(position);
  }

  setRotation(quaternion) {
    if (this.body) this.body.setRotation(quaternion);
  }

  takeSnapshot() {
    // A snapshot requires a physical rigid body
    if (this.body) {
      // Store previous snapshot position for lerp
      this.snapshot.position_1.copy(this.snapshot.position_2);
      this.snapshot.quaternion_1.copy(this.snapshot.quaternion_2);

      // Store next position for lerp if the rigid body is a kinematic type
      if (this.body.isKinematic()) {
        this.snapshot.position_2.copy(this.body.nextTranslation());
        this.snapshot.quaternion_2.copy(this.body.nextRotation());
      }
      else {
        // Store next position for lerp for all other rigid body types
        this.snapshot.position_2.copy(this.body.translation());
        this.snapshot.quaternion_2.copy(this.body.rotation());
      }
    }
    else {
      this.snapshot.position_1.copy(this.rigidBodyDesc.translation);
      this.snapshot.position_2.copy(this.rigidBodyDesc.translation);
      this.snapshot.quaternion_1.copy(this.rigidBodyDesc.rotation);
      this.snapshot.quaternion_2.copy(this.rigidBodyDesc.rotation);
    }
  }

  lerp(alpha = 0) {
    // Skip (s)lerp if body type is null or "Fixed"
    if (this.body && this.body.isFixed()) return false;

    // Linear interpolation using alpha value
    this.object.position.lerpVectors(this.snapshot.position_1, this.snapshot.position_2, alpha);
    this.object.quaternion.slerpQuaternions(this.snapshot.quaternion_1, this.snapshot.quaternion_2, alpha);
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
    if (this.body) {
      json.body = {
        type: this.body.bodyType()
      }
    }

    return json;
  }

  updateFromJSON(json) {
    // Set position
    if (json.position) {
      if (this.body) this.setPosition(json.position);
      this.snapshot.position_2.copy(json.position);
    }

    // Set rotation
    if (json.quaternion) {
      if (this.body) this.setRotation(json.quaternion);
      this.snapshot.quaternion_2.copy(json.quaternion);
    }
  }
}

export { Entity };