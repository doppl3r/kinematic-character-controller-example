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
    this.jointQueue = [];
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

      // Add entity to entities map before creating components
      this.entities.set(entity.id, entity);
  
      // Create entity physics components
      this.createRigidBody(entity);
      this.createColliders(entity);
      this.createParentJoint(entity);

      // Dispatch 'added' event to observers
      entity.dispatchEvent({ type: 'added' });
    }
    return entity;
  }

  remove(entity) {
    // Remove entity physics components before deletion
    this.removeJoints(entity);
    this.removeColliders(entity);
    this.removeRigidBody(entity);
    entity.object.removeFromParent();

    // Delete entity entry
    this.entities.delete(entity.id);

    // Dispatch 'removed' event to observers
    entity.dispatchEvent({ type: 'removed' });
    return entity;
  }

  get(id) {
    // Get entity from entities map by id
    return this.entities.get(id);
  }

  duplicate(entity) {
    var options = entity.toJSON();
    return this.create(options);
  }

  getEntityFromColliderHandle(handle) {
    const collider = this.world.getCollider(handle);
    const rigidBody = collider._parent;
    return this.get(rigidBody.userData.id);
  }

  createRigidBody(entity) {
    const rigidBody = this.world.createRigidBody(entity.rigidBodyDesc);
    entity.setRigidBody(rigidBody);
  }

  removeRigidBody(entity) {
    // Remove entity
    this.world.removeRigidBody(entity.rigidBody);
    entity.rigidBody = null;
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

  removeColliders(entity) {
    for (let i = entity.rigidBody.numColliders() - 1; i >= 0; i--) {
      const collider = entity.rigidBody.collider(i);
      this.world.removeCollider(collider);
    }
  }

  createJoint(parent, child) {
    const anchor1 = new Vector3();
    const anchor2 = new Vector3().copy(parent.rigidBodyDesc.translation).sub(child.rigidBodyDesc.translation);
    const frame1 = new Quaternion().copy(parent.rigidBodyDesc.rotation);
    const frame2 = new Quaternion().copy(child.rigidBodyDesc.rotation);

    // Rotate position by the frame conjugate
    anchor1.applyQuaternion(frame1.conjugate());
    anchor2.applyQuaternion(frame2.conjugate());

    // Create fixed joint from parameters
    const params = JointData.fixed(anchor1, frame1, anchor2, frame2);
    const joint = this.world.createImpulseJoint(params, parent.rigidBody, child.rigidBody, true);
    return joint;
  }

  removeJoint(joint) {
    this.world.removeImpulseJoint(joint, true);
  }

  createParentJoint(entity) {
    // Get entity parent ID
    let parentId = entity.getParentId();
    let parent = this.get(parentId);
    
    // Check if entity has parent ID
    if (parentId) {
      // Add entity to queue if no entity exists yet
      if (parent) {
        this.createJoint(parent, entity);
      }
      else {
        this.jointQueue.push(entity);
      }
    }

    // Loop through queue
    for (let i = this.jointQueue.length - 1; i >= 0; i--) {
      let child = this.jointQueue[i];
      
      // Restore parent ID if previously removed
      child.restoreParentId();

      // Create joint if parent entity exists in the world
      parent = this.get(child.getParentId());
      if (parent) {
        this.createJoint(parent, child);
        this.jointQueue.splice(i, 1);
      }
      else {
        // Reset child parent Id to null if parent entity does not exist yet
        child.setParentId(null);
      }
    }
  }

  removeJoints(entity) {
    // Populate array of joint handles from entity
    const jointHandles = [];
    this.world.impulseJoints.forEachJointHandleAttachedToRigidBody(entity.rigidBody.handle, function(handle) {
      jointHandles.push(handle);
    });

    // Reverse-loop through joint handles
    for (let i = jointHandles.length - 1; i >= 0; i--) {
      const handle = jointHandles[i];
      const joint = this.world.impulseJoints.get(handle);
      const parent = this.get(joint.body1().userData.id);
      const child = this.get(joint.body2().userData.id);
      
      // Enqueue orphan entity before removing joint
      if (entity.id == parent.id) {
        if (child.rigidBodyDesc.userData.parentId != null) {
          this.jointQueue.push(child);
          child.setParentId(null);
        }
      }

      // Remove joints
      this.removeJoint(joint);
    };
  }

  removeParentJoint(entity) {
    const jointHandles = [];
    const parent = this.get(entity.getParentId());
    
    if (parent) {
      // Populate array of joint handles from parent entity
      this.world.impulseJoints.forEachJointHandleAttachedToRigidBody(parent.rigidBody.handle, function(handle) {
        jointHandles.push(handle);
      });
  
      // Reverse-loop through joint handles
      for (let i = jointHandles.length - 1; i >= 0; i--) {
        const handle = jointHandles[i];
        const joint = this.world.impulseJoints.get(handle); 
        const child = this.get(joint.body2().userData.id);
        
        // Check if entity ID is the same as the child ID
        if (entity.id == child.id) {
          this.removeJoint(joint);
        }
      }
    }
  }

  createController(entity) {
    // Create character controller from world
    const controller = this.world.createCharacterController(0.01); // Spacing
    entity.setController(controller);

    // Update controller settings
    controller.setSlideEnabled(true); // Allow sliding down hill
    controller.setMaxSlopeClimbAngle(45 * Math.PI / 180); // Don’t allow climbing slopes larger than 45 degrees.
    controller.setMinSlopeSlideAngle(30 * Math.PI / 180); // Automatically slide down on slopes smaller than 30 degrees.
    controller.enableAutostep(0.5, 0.2, true); // (maxHeight, minWidth, includeDynamicBodies) Stair behavior
    controller.enableSnapToGround(0.5); // (distance) Set ground snap behavior
    controller.setApplyImpulsesToDynamicBodies(true); // Add push behavior
    controller.setCharacterMass(1); // (mass) Set character mass
    return controller;
  }

  removeController(entity) {
    this.world.removeCharacterController(entity.controller);
    entity.controller = null;
  }

  clear() {
    this.entities.forEach(function(entity){
      this.remove(entity);
    }.bind(this));
    this.jointQueue = []; // Empty queue
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