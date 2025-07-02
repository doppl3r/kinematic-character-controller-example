import { AnimationMixer, Euler, Object3D, Quaternion, Vector3 } from 'three';
import { ActiveCollisionTypes, ActiveEvents, ColliderDesc, RigidBodyDesc, RigidBodyType, TriMeshFlags } from '@dimforge/rapier3d';
import { CameraFactory } from './CameraFactory.js';
import { Entity } from './Entity.js';
import { EntityEvents } from './EntityEvents.js';
import { EntityTemplates } from './EntityTemplates.js';
import { LightFactory } from './LightFactory.js';
import { MeshFactory } from './MeshFactory.js';
import { ObjectAssign } from './ObjectAssign.js';
import { clone } from 'three/examples/jsm/utils/SkeletonUtils';

class EntityFactory {
  constructor() {

  }

  static create(options, world) {
    // Combine new options with existing template
    options = ObjectAssign({}, EntityTemplates[options.template], options);

    // Initialize entity
    const entity = new Entity(options);
    const object3D = this.createObject3D(options.object3D);
    const mixer = this.createMixer(object3D);
    const rigidBodyDesc = this.createRigidBodyDesc(options.body);
    const rigidBody = this.createRigidBody(rigidBodyDesc, world);

    // Create and assign colliders using entity components
    this.createColliders({ options: options.colliders, rigidBody, object3D, entity, world });

    // Assign components to entity
    entity.set3DObject(object3D);
    entity.setMixer(mixer);
    entity.setRigidBody(rigidBody);
    return entity;
  }

  static createRigidBodyDesc(options) {
    // Define default options
    options = ObjectAssign({
      angularDamping: 0,
      ccd: false,
      enabledRotations: { x: true, y: true, z: true },
      enabledTranslations: { x: true, y: true, z: true },
      isEnabled: true,
      linearDamping: 0,
      position: { x: 0, y: 0, z: 0 },
      rotation: { x: 0, y: 0, z: 0 },
      sleeping: false,
      softCcdPrediction: 0,
      status: 0, // 0: Dynamic, 1: Fixed, 2: KinematicPositionBased, 3: KinematicVelocityBased
      userData: {}
    }, options);

    const rigidBodyDesc = new RigidBodyDesc(isNaN(options.status) ? RigidBodyType[options.status] : options.status);
    const rotation = options.w ? _q.copy(options.rotation) : _q.setFromEuler(_e.setFromVector3(_v.copy(options.rotation)));
    rigidBodyDesc.enabledRotations(options.enabledRotations.x, options.enabledRotations.y, options.enabledRotations.z);
    rigidBodyDesc.enabledTranslations(options.enabledTranslations.x, options.enabledTranslations.y, options.enabledTranslations.z);
    rigidBodyDesc.setAngularDamping(options.angularDamping);
    rigidBodyDesc.setCcdEnabled(options.ccd);
    rigidBodyDesc.setEnabled(options.isEnabled);
    rigidBodyDesc.setLinearDamping(options.linearDamping);
    rigidBodyDesc.setRotation(rotation);
    rigidBodyDesc.setSleeping(options.sleeping);
    rigidBodyDesc.setSoftCcdPrediction(options.softCcdPrediction);
    rigidBodyDesc.setTranslation(options.position.x, options.position.y, options.position.z);
    rigidBodyDesc.setUserData(options.userData);
    return rigidBodyDesc;
  }

  static createRigidBody(rigidBodyDesc, world) {
    return world.createRigidBody(rigidBodyDesc);
  }

  static createColliders({ options, rigidBody, object3D, entity, world }) {
    const buildCollider = (colliderOptions, index, total) => {
      // Wait for child mesh to load before creating collider
      if (object3D.children.length === 0) {
        object3D.addEventListener('childLoaded', () => buildCollider(colliderOptions, index, total));
        return;
      }

      // Update object3D and shapeDesc
      this.updateShapeDescFromObject3D(colliderOptions.shapeDesc, object3D);
      this.updateObject3DFromShapeDesc(object3D, colliderOptions.shapeDesc);

      // Create the collider and attach to the rigidBody with entity events
      const colliderDesc = this.createColliderDesc(colliderOptions);
      const collider = this.createCollider(colliderDesc, rigidBody, world);
      this.createColliderEvents(colliderOptions.events, collider, entity);

      // Dispatch collider creation events
      entity.dispatchEvent({ type: 'colliderCreated', collider, index, total });
    }

    // Loop through each collider option
    options?.forEach((colliderOptions, index) => buildCollider(colliderOptions, index, options.length));
  }

  static updateShapeDescFromObject3D(shapeDesc, object3D) {
    if (shapeDesc.type === 'trimesh') {
      // Add vertices & indices from the 3D object to shapeDesc
      const { geometry } = MeshFactory.mergeObjectMeshes(object3D);
      shapeDesc.arguments = [geometry.attributes.position.array, geometry.index.array, TriMeshFlags['FIX_INTERNAL_EDGES']];
    }
  }

  static updateObject3DFromShapeDesc(object3D, shapeDesc) {
    if (shapeDesc.type === 'voxels') {
      // Replace 3D object with instanced mesh (better performance)
      const child = MeshFactory.createInstancedMesh(object3D, shapeDesc.arguments[0]);
      object3D.clear();
      object3D.add(child);
    }
  }

  static createColliderDesc(options) {
    options = ObjectAssign({
      activeCollisionTypes: 'ALL', // 1: DYNAMIC_DYNAMIC, 2: DYNAMIC_FIXED, 12: DYNAMIC_KINEMATIC, 15: DEFAULT, 32: FIXED_FIXED, 8704: KINEMATIC_FIXED, 52224: KINEMATIC_KINEMATIC, 60943: ALL
      activeEvents: 'COLLISION_EVENTS', // 0: NONE, 1: COLLISION_EVENTS, 2: CONTACT_FORCE_EVENTS
      collisionGroups: 0xFFFFFFFF,
      contactForceEventThreshold: 0,
      density: 1,
      events: [],
      friction: 0.5,
      isSensor: false,
      mass: 0,
      restitution: 0,
      shapeDesc: {
        type: null,
        arguments: []
      },
      solverGroups: 0xFFFFFFFF,
      translation: { x: 0, y: 0, z: 0 }
    }, options);

    // Create collider description using shape "type" (ex: "cuboid") with parameters (ex: 0.5, 0.5, 0.5)
    const colliderDesc = ColliderDesc[options.shapeDesc.type](...options.shapeDesc.arguments);
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
    return colliderDesc;
  }

  static createCollider(colliderDesc, rigidBody, world) {
    return world.createCollider(colliderDesc, rigidBody);
  }

  static createColliderEvents(events, collider, entity) {
    // Loop through array of event descriptions
    events?.forEach(event => {
      // Add collision event listener to entity
      entity.addEventListener('collision', e => {
        // Trigger event on initial contact (or if event "started" matches collision "started")
        if (event.started === undefined && e.started === true || event.started === e.started) {
          // Trigger match collider handles
          if (e.handle === collider.handle) {
            EntityEvents[event.name]({ value: event.value, ...e });
          }
        }
      });
    });
  }

  static createObject3D(options) {
    options = ObjectAssign({
      position: { x: 0, y: 0, z: 0 },
      rotation: { x: 0, y: 0, z: 0 },
      scale: { x: 1, y: 1, z: 1 }
    }, options);

    // Create 3D object from options
    const object3D = new Object3D();

    // Copy 3D object properties
    ObjectAssign(object3D.userData, options.userData);
    options.rotation = options.rotation.w ? _e.setFromQuaternion(_q.copy(options.rotation)) : _e.setFromVector3(_v.copy(options.rotation));
    object3D.position.copy(options.position);
    object3D.rotation.copy(options.rotation);
    object3D.scale.copy(options.scale);

    // This function adds missing assets to a queue
    const queueAssets = (options, queue) => {
      if (options && typeof options === 'object') {
        Object.keys(options).forEach(key => {
          // Add to queue OR continue recursion
          if (typeof options[key] === 'string') {
            const url = options[key].split('asset:')[1];
            if (url) queue.push({ options, key, url });
          }
          else queueAssets(options[key], queue);
        });
      }
    }
    
    // This function builds & adds children to the 3D object
    const buildChildren = (options, queue) => {
      // Check queue before creation
      if (queue.length > 0) {
        for (let i = queue.length - 1; i >= 0; i--) {
          const item = queue[i];
          // Load asset
          game.assets.load(item.url, asset => {
            item.options[item.key] = asset; // Assign asset from queue
            queue.splice(queue.indexOf(item), 1); // Remove item from queue
            buildChildren(options, queue); // Continue recursion
          });
        }
        return; // End recursion until queue is empty
      }

      // Create 3D object children
      options.children.forEach((childOptions, index) => {
        let child;
        if (childOptions.isObject3D) {
          child = clone(childOptions);
        }
        else {
          const factories = [CameraFactory, MeshFactory, LightFactory];
          const factory = factories.find(f => f[childOptions.type]);
          if (factory) {
            child = factory.create(childOptions);
          }
        }

        if (child) {
          // Add loaded child and dispatch event
          object3D.add(child);
          object3D.dispatchEvent({ type: 'childLoaded', child, index, total: options.children.length });
        }
      });
    }
    
    // Queue and add children
    const queue = [];
    queueAssets(options, queue);
    buildChildren(options, queue);

    // Return newly created 3D object
    return object3D;
  }

  static createMixer(object3D) {
    // Create animation mixer
    const mixer = new AnimationMixer(object3D);

    // Add mixer helper function
    mixer.play = (name, duration = 1) => {
      var startAction = mixer.actions['active'];
      var endAction = mixer.actions[name];
      
      // Check if action exists
      if (endAction && endAction != startAction) {
        // Fade in from no animation
        if (startAction == null) {
          endAction.setEffectiveWeight(1);
          endAction.reset().fadeIn(duration);
        }
        else {
          // Cross fade animation with duration
          startAction.setEffectiveWeight(1);
          endAction.setEffectiveWeight(1);
          endAction.reset().crossFadeFrom(startAction, duration);
        }

        // Store action data for cross fade
        endAction['duration'] = duration;
        mixer.actions['active'] = endAction;
      }
    }

    // This function builds a mixer from children
    const buildAnimations = ({ child }) => {
      // Add animations to mixer if animations exists
      if (child.animations.length > 0) {
        const loopType = child.userData.loop || 2201; // 2201 = LoopRepeat, 2200 = LoopOnce
        mixer.actions = {};
        
        // Add all animations (for nested objects)
        for (let i = 0; i < child.animations.length; i++) {
          const animation = child.animations[i];
          const action = mixer.clipAction(animation);
          if (loopType == 2200) {
            action.setLoop(loopType);
            action.clampWhenFinished = true;
          }
          action.play(); // Activate action by default
          action.setEffectiveWeight(0); // Clear action influence
          mixer.actions[animation.name] = action;

          // Set active action to first action
          if (i == 0) {
            mixer.actions['active'] = action;
            action.setEffectiveWeight(1);
          }
        }
      }
    }

    // Listen for newly added children
    object3D.addEventListener('childadded', buildAnimations);

    // Return animation mixer
    return mixer;
  }

  static createController(options, world) {
    // Set base options
    options = ObjectAssign({
      applyImpulsesMass: 1,
      applyImpulsesToDynamicBodies: true,
      autostepMaxHeight: 0.5,
      autostepMinWidth: 0.2,
      autostepIncludeDynamicBodies: true,
      maxSlopeClimbAngle: 45 * Math.PI / 180,
      minSlopeClimbAngle: 30 * Math.PI / 180,
      offset: 0.01,
      slideEnabled: true,
      snapToGroundDistance: 0
    }, options);

    // Create character controller from world
    const controller = world.createCharacterController(options.offset); // Spacing

    // Update controller settings
    controller.setSlideEnabled(options.slideEnabled); // Allow sliding down hill
    controller.setMaxSlopeClimbAngle(options.maxSlopeClimbAngle); // Don’t allow climbing slopes larger than 45 degrees.
    controller.setMinSlopeSlideAngle(options.minSlopeClimbAngle); // Automatically slide down on slopes smaller than 30 degrees.
    controller.enableAutostep(options.autostepMaxHeight, options.autostepMinWidth, options.autostepIncludeDynamicBodies); // (maxHeight, minWidth, includeDynamicBodies) Stair behavior
    controller.enableSnapToGround(options.snapToGroundDistance); // (distance) Set ground snap behavior
    controller.setApplyImpulsesToDynamicBodies(options.applyImpulsesToDynamicBodies); // Add push behavior
    controller.setCharacterMass(options.applyImpulsesMass); // (mass) Set character mass
    return controller;
  }

  static destroy(entity, world) {
    // Remove rigid body (and attached colliders/joints)
    world.removeRigidBody(entity.rigidBody);
  }
}

// Assign local helper components
const _v = new Vector3();
const _e = new Euler();
const _q = new Quaternion();

export { EntityFactory }