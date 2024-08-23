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
    this.events.drainCollisionEvents(function(handleOne, handleTwo, started) {
      var colliderOne = this.world.getCollider(handleOne);
      var colliderTwo = this.world.getCollider(handleTwo);
      var message = `handleOne: ${ handleOne }, handleTwo: ${ handleTwo }, started: ${ started }`;

      // Check if collider is a sensor
      if (colliderOne.isSensor()) {
        if (started == true) {
          // Dispatch an event to the UI to open a popup
          dispatchEvent(new CustomEvent('openPopup', { detail: { message: message }}));
        }
        else {
          // Dispatch an event to close a popup
          dispatchEvent(new CustomEvent('closePopup', { detail: { message: message }}));
        }
      }
    }.bind(this));
  }

  render(delta, alpha) {
    // Update each 3D object
    this.entities.forEach(function(child) {
      child.render(delta, alpha);
    });
  }

  setScene(scene) {
    // Assign scene for entity 3D objects
    this.scene = scene;

    // Add debugger to scene
    if (this.debugger.parent != scene) {
      this.scene.add(this.debugger);
    }
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

    // Add entity to entities map using entity UUID
    this.entities.set(entity.uuid, entity);

    // Create body and collider for entity
    entity.createBody(this.world);
    entity.createCollider(this.world);
    entity.takeSnapshot(); // Take snapshot from rigid body for 3D object

    // Add entity 3D object to scene reference
    if (this.scene) {
      this.scene.add(entity.object);
    }
  }

  remove(entity) {
    this.entities.delete(entity.uuid); // Dereference entity by UUID
    this.world.removeRigidBody(entity.body); // Remove body from world (includes colliders)
    entity.object.removeFromParent(); // Remove reference to 3D object parent
  }

  get(key) {
    return this.entities.get(key);
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