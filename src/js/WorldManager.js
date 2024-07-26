import { Debugger } from './Debugger.js';
import { EntityFactory } from './factories/EntityFactory.js';
import { World } from '@dimforge/rapier3d';

/*
  Manage world entities
*/

class WorldManager {
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

  addEntitiesToScene(scene) {
    // Loop through all entities
    this.entities.forEach(function(child) {
      scene.add(child.object);
    });

    // Add debugger to scene
    scene.add(this.debugger);
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

    // Update debugger buffer
    this.debugger.update();

    // Loop through all entities
    this.entities.forEach(function(child) {
      if (child.body) child.update(delta);
    });

    // Simulate world
    this.world.step();
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
    // Add entity to entities map using entity UUID
    this.entities.set(entity.uuid, entity);

    // Create body and collider for entity
    entity.createBody(this.world);
    entity.createCollider(this.world);
    entity.takeSnapshot(); // Take snapshot from rigid body for 3D object
  }

  remove(entity) {
    this.entities.delete(entity.uuid);
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

export { WorldManager };