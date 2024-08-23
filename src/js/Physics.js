import { EventQueue, World } from '@dimforge/rapier3d';
import { EventDispatcher } from 'three';
import { Debugger } from './Debugger.js';
import { EntityFactory } from './factories/EntityFactory.js';

/*
  Manage physics related components
*/

class Physics extends EventDispatcher {
  constructor() {
    // Inherit Three.js EventDispatcher system
    super();
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
      var entityOne = this.get(handleOne);
      var entityTwo = this.get(handleTwo);

      // Check if collider is a sensor
      if (entityOne.collider.isSensor()) {
        if (started == true) {
          this.dispatchEvent({ type: 'startCollision', pair: [entityOne, entityTwo] });
        }
        else {
          this.dispatchEvent({ type: 'stopCollision', pair: [entityOne, entityTwo] });
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

    // Create body and collider for entity
    entity.createBody(this.world);
    entity.createCollider(this.world);
    entity.takeSnapshot(); // Take snapshot from rigid body for 3D object

    // Add entity to entities map using body handle (ex: "5e-324")
    this.entities.set(entity.body.handle, entity);

    // Add entity 3D object to scene reference
    if (this.scene) {
      this.scene.add(entity.object);
    }
  }

  remove(entity) {
    this.entities.delete(entity.body.handle); // Dereference entity by UUID
    this.world.removeRigidBody(entity.body); // Remove body from world (includes colliders)
    entity.object.removeFromParent(); // Remove reference to 3D object parent
  }

  get(handle) {
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