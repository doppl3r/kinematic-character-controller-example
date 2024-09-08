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
    this.world = new World({ x: 0.0, y: -9.81 * 2, z: 0.0 });
    this.events = new EventQueue(true);

    // Initialize entity manager
    this.entities = new Map();

    // Add game debugger
    this.debugger = new Debugger(this.world);
    //this.debugger.disable();
  }

  update(delta, alpha) {
    // Safely drain all entities before next engine step
    if (this.isDraining == true) {
      this.isDraining = false;
      this.clear();
    }

    // Loop through all entities
    this.entities.forEach(function(child) {
      if (child.body) child.update(delta);
    });

    // Update debugger buffer
    this.debugger.update();

    // Simulate world
    this.world.step(this.events);

    // Check collision events
    this.events.drainCollisionEvents(function(h1, h2, started) {
      // Dispatch event to entities
      var p1 = this.get(h1);
      var p2 = this.get(h2);
      p1.dispatchEvent({ type: 'collision', entity: p2, started: started })
      p2.dispatchEvent({ type: 'collision', entity: p1, started: started })
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
    entity.createCollider(this.world);
    entity.takeSnapshot(); // Take snapshot from rigid body for 3D object
    entity.dispatchEvent({ type: 'added' })

    // Add entity to entities map using the body handle as the key (ex: "5e-324")
    this.entities.set(entity.body.handle, entity);
  }

  remove(entity) {
    // Delete and remove entity reference using the body handle as the key
    this.entities.delete(entity.body.handle);
    this.world.removeRigidBody(entity.body);
    entity.object.removeFromParent();
    entity.dispatchEvent({ type: 'removed' });
  }

  get(handle) {
    // Get entity from entities map using the body handle as the key
    return this.entities.get(handle);
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