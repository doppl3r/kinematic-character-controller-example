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

  update(delta) {
    // 1: Update all entities
    this.entities.forEach(function(entity) {
      entity.update(delta);
    });

    // 2: Dispatch collision events from previous world step to each entity pair
    this.events.drainCollisionEvents(function(handle1, handle2, started) {
      // Dispatch an event for each pair
      var entity1 = this.getColliderEntity(handle1);
      var entity2 = this.getColliderEntity(handle2);
      var event1 = { handle: handle1, pair: entity2, started: started, type: 'collision' };
      var event2 = { handle: handle2, pair: entity1, started: started, type: 'collision' };
      entity1.dispatchEvent(event1);
      entity2.dispatchEvent(event2);
    }.bind(this));

    // 3: Update debugger from previous simulation
    this.debugger.update();

    // 4: Advance the simulation by one time step
    this.world.step(this.events);
  }

  render(delta, alpha) {
    // Update all 3D object rendering properties
    this.entities.forEach(function(entity) {
      entity.render(delta, alpha);
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

  getColliderEntity(handle) {
    var collider = this.world.getCollider(handle);
    var rigidBody = collider._parent;
    return this.get(rigidBody.handle);
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