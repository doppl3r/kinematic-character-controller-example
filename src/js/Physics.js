import { EventQueue, World } from '@dimforge/rapier3d';
import { Debugger } from './Debugger.js';
import { EntityFactory } from './factories/EntityFactory.js';

/*
  Manage physics related components
*/

class Physics {
  constructor() {
    
  }

  init() {
    // Initialize Rapier world
    this.world = new World({ x: 0.0, y: -9.81 * 8, z: 0.0 });
    this.events = new EventQueue(true);

    // Initialize entity manager
    this.entities = new Map();

    // Add game debugger
    this.debugger = new Debugger(this.world);
  }

  update(delta, alpha) {
    // Safely drain all entities before next engine step
    if (this.isDraining == true) {
      this.isDraining = false;
      this.clear();
    }

    // Loop through all entities
    this.entities.forEach(function(child) {
      if (child.rigidBody) child.update(delta);
    });

    // Update debugger buffer
    this.debugger.update();

    // Simulate world
    this.world.step(this.events);

    // Check collision events
    this.events.drainCollisionEvents(function(handle1, handle2, started) {
      // Dispatch event to entities
      var entity1 = this.getEntityFromColliderHandle(handle1);
      var entity2 = this.getEntityFromColliderHandle(handle2);
      var event1 = { type: 'collision', pair: entity2, handle: handle1, started: started };
      var event2 = { type: 'collision', pair: entity1, handle: handle2, started: started };
      entity1.dispatchEvent(event1);
      entity2.dispatchEvent(event2);
    }.bind(this));
  }

  render(delta, alpha) {
    // Update each 3D object
    this.entities.forEach(function(child) {
      child.render(delta, alpha);
    });
  }

  setFrequency(frequency = 60) {
    this.world.timestep = 1 / frequency;
  }

  create(options) {
    return EntityFactory.create(options);
  }

  add(entity) {
    // Recursively add multiple entities if provided
    if (arguments.length > 1) {
      for (var i = 0; i < arguments.length; i++) {
        this.add(arguments[i]);
      }
    }

    // Create body and collider for entity
    entity.createBody(this.world);
    entity.createColliders(this.world);
    entity.takeSnapshot(); // Take snapshot from rigid body for 3D object
    entity.dispatchEvent({ type: 'added' })

    // Add entity to entities map using the rigidBody handle as the key (ex: "5e-324")
    this.entities.set(entity.rigidBody.handle, entity);
  }

  remove(entity) {
    // Delete and remove entity reference using the body handle as the key
    this.entities.delete(entity.rigidBody.handle);
    this.world.removeRigidBody(entity.rigidBody);
    entity.object.removeFromParent();
    entity.dispatchEvent({ type: 'removed' });
  }

  get(handle) {
    // Get entity from entities map using the body handle as the key
    return this.entities.get(handle);
  }

  getEntityFromColliderHandle(handle) {
    var collider = this.world.getCollider(handle);
    var rigidBody = collider._parent;
    return this.get(rigidBody.handle);
  }

  drain() {
    this.isDraining = true;
  }

  clear() {
    this.entities.forEach(function(entity){
      this.remove(entity);
    }.bind(this));
  }

  toJSON() {
    var json = [];
    this.entities.forEach(function(entity){
      json.push(entity.toJSON());
    });
    return json;
  }
}

export { Physics };