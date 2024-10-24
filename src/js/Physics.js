import { EventQueue, World } from '@dimforge/rapier3d';
import { Debugger } from './Debugger.js';
import { EntityFactory } from './factories/EntityFactory.js';

/*
  Manage physics related components
*/

class Physics {
  constructor() {
    // Initialize Rapier world
    this.world = new World({ x: 0.0, y: -9.81 * 8, z: 0.0 });
    this.world.numSolverIterations = 4; // Default = 4
    this.events = new EventQueue(true);
    this.debugger = new Debugger(this.world);
    this.entities = new Map();
  }

  update(delta) {
    // 1: Advance the simulation by one time step
    this.world.step(this.events);

    // 2: Update debugger from world buffer
    this.debugger.update();

    // 3: Update all entities
    this.entities.forEach(function(entity) {
      entity.update(delta);
    });

    // 4: Dispatch collision events to each entity pair
    this.events.drainCollisionEvents(function(handle1, handle2, started) {
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

  create(options) {
    return EntityFactory.create(options);
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
      entity.createRigidBody(this.world);
      entity.createColliders(this.world);
      entity.createJointFromParent(this.world);
      entity.dispatchEvent({ type: 'added' });
  
      // Add entity to entities map using the rigidBody handle as the key (ex: "5e-324")
      this.entities.set(entity.rigidBody.handle, entity);
    }
    return entity;
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