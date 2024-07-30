import { World } from '@dimforge/rapier3d';
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

    // Initialize entity manager
    this.entities = new Map();

    // Add game debugger
    this.debugger = new Debugger(this.world);
    //this.debugger.disable();
  }

  setFrequency(frequency = 60) {
    this.world.timestep = 1 / frequency;
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

    // Simulate world
    this.world.step();

    // Update debugger buffer
    this.debugger.update();
  }

  render(delta, alpha) {
    // Update each 3D object
    this.entities.forEach(function(child) {
      child.render(delta, alpha);
    });
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
  }

  addToScene(scene) {
    // Loop through all entities
    this.entities.forEach(function(child) {
      scene.add(child.object);
    });

    // Add debugger to scene
    if (this.debugger.parent != scene) scene.add(this.debugger);
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