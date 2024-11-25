import { EventQueue, JointData, World } from '@dimforge/rapier3d';
import { Quaternion, Vector3 } from 'three';
import { Debugger } from './Debugger.js';

/*
  Manage physics related components
*/

class Physics {
  constructor() {
    // Initialize Rapier world
    this.world = new World({ x: 0.0, y: -9.81 * 8, z: 0.0 });
    this.world.numSolverIterations = 4; // Default = 4
    this.eventQueue = new EventQueue(true);
    this.debugger = new Debugger(this.world);
    this.entities = new Map();
  }

  update(delta) {
    // 1: Advance the simulation by one time step
    this.world.step(this.eventQueue);

    // 2: Update debugger from world buffer
    this.debugger.update();

    // 3: Update all entities
    this.entities.forEach(function(entity) {
      entity.update(delta);
    });

    // 4: Dispatch collision events to each entity pair
    this.eventQueue.drainCollisionEvents(function(handle1, handle2, started) {
      const entity1 = this.getEntityFromColliderHandle(handle1);
      const entity2 = this.getEntityFromColliderHandle(handle2);
      const event1 = { handle: handle1, pair: entity2, started: started, type: 'collision' };
      const event2 = { handle: handle2, pair: entity1, started: started, type: 'collision' };
      entity1.dispatchEvent(event1);
      entity2.dispatchEvent(event2);
    }.bind(this));
  }

  animate(delta, alpha) {
    // Update all 3D object rendering properties
    this.entities.forEach(function(entity) {
      entity.animate(delta, alpha);
    });
  }

  setFrequency(frequency = 60) {
    this.world.timestep = 1 / frequency;
  }

  add(entity) {
    if (entity != null) {
      // Recursively add multiple entities if provided
      if (arguments.length > 1) {
        for (var i = 0; i < arguments.length; i++) {
          this.add(arguments[i]);
        }
      }
  
      // Create body and collider for entity
      this.createRigidBody(entity);
      this.createColliders(entity);
      this.createController(entity);
      this.createJointFromParent(entity);
      entity.dispatchEvent({ type: 'added' });
  
      // Add entity to entities map using the rigidBody handle as the key (ex: "5e-324")
      this.entities.set(entity.rigidBody.handle, entity);
    }
    return entity;
  }

  createRigidBody(entity) {
    const rigidBody = this.world.createRigidBody(entity.rigidBodyDesc);
    entity.setRigidBody(rigidBody);
  }

  createColliders(entity) {
    if (entity.rigidBody) {
      // Loop through all collider descriptions
      entity.collidersDesc.forEach(function(colliderDesc) {
        // Parent the collider to the rigid body
        const collider = this.world.createCollider(colliderDesc, entity.rigidBody);
        collider.events = colliderDesc.events; // Assign optional events
      }.bind(this));
    }
  }

  createController(entity) {
    // Create character controller for KinematicPositionBased rigid body types
    if (entity.isCharacter) {
      // Create character controller from world
      entity.controller = this.world.createCharacterController(0.01); // Spacing
      entity.controller.setSlideEnabled(true); // Allow sliding down hill
      entity.controller.setMaxSlopeClimbAngle(45 * Math.PI / 180); // Don’t allow climbing slopes larger than 45 degrees.
      entity.controller.setMinSlopeSlideAngle(30 * Math.PI / 180); // Automatically slide down on slopes smaller than 30 degrees.
      entity.controller.enableAutostep(0.5, 0.2, true); // (maxHeight, minWidth, includeDynamicBodies) Stair behavior
      entity.controller.enableSnapToGround(0.5); // (distance) Set ground snap behavior
      entity.controller.setApplyImpulsesToDynamicBodies(true); // Add push behavior
      entity.controller.setCharacterMass(1); // (mass) Set character mass
    }
  }

  createJointFromParent(entity) {
    if (entity.parent) {
      const anchor1 = new Vector3();
      const anchor2 = new Vector3().copy(entity.parent.rigidBodyDesc.translation).sub(entity.rigidBodyDesc.translation);
      const frame1 = new Quaternion().copy(entity.parent.rigidBodyDesc.rotation);
      const frame2 = new Quaternion().copy(entity.rigidBodyDesc.rotation);

      // Rotate position by the frame conjugate
      anchor1.applyQuaternion(frame1.conjugate());
      anchor2.applyQuaternion(frame2.conjugate());

      // Create fixed joint from parameters
      const params = JointData.fixed(anchor1, frame1, anchor2, frame2);
      const joint = this.world.createImpulseJoint(params, entity.parent.rigidBody, entity.rigidBody, true);
    }
  }

  duplicate(entity) {
    var options = entity.toJSON();
    return this.create(options);
  }

  remove(entity) {
    // Delete and remove entity reference using the body handle as the key
    this.entities.delete(entity.rigidBody.handle);
    this.world.removeRigidBody(entity.rigidBody);
    entity.object.removeFromParent();
    entity.dispatchEvent({ type: 'removed' });
    return entity;
  }

  removeFirst() {
    var entry = this.entities.entries().next().value;
    if (entry == null) return;
    return this.remove(entry[1]);
  }

  get(handle) {
    // Get entity from entities map using the body handle as the key
    return this.entities.get(handle);
  }

  getEntityFromColliderHandle(handle) {
    const collider = this.world.getCollider(handle);
    return this.get(collider._parent.handle);
  }

  clear() {
    this.entities.forEach(function(entity){
      this.remove(entity);
    }.bind(this));
  }

  toJSON() {
    const json = [];
    this.entities.forEach(function(entity){
      json.push(entity.toJSON());
    });
    return json;
  }
}

export { Physics };