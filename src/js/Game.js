import { Assets } from './Assets.js';
import { Interval } from './Interval.js';
import { EventQueue, World } from '@dimforge/rapier3d';
import { Graphics } from './Graphics.js';
import { Debugger } from './Debugger.js';
import { EntityFactory } from './EntityFactory.js';

class Game {
  constructor() {
    this.assets = new Assets();
    this.interval = new Interval();
    this.graphics = new Graphics();
    this.world = new World({ x: 0.0, y: -9.81, z: 0.0 });
    this.world.numSolverIterations = 4; // Default = 4
    this.world.timestep = 1 / 60; // Default 1 / 60
    this.debugger = new Debugger(this.world);
    this.graphics.scene.add(this.debugger);
    this.eventQueue = new EventQueue(true);
    this.entities = new Map();
  }

  start() {
    this.interval.add(loop => this.update(loop), 1000 / 60);
    this.interval.add(loop => this.render(loop));
    this.interval.start();
  }

  stop() {
    this.interval.stop();
  }

  update(loop) {
    // 1: Advance the simulation by one time step
    this.world.step(this.eventQueue);

    // 2: Update debugger from world buffer
    this.debugger.update();

    // 3: Update all entities
    this.entities.forEach(function(entity) {
      entity.update(loop);
    });

    // 4: Dispatch collision events to each entity pair
    this.eventQueue.drainCollisionEvents(function(handle1, handle2, started) {
      const collider1 = this.world.getCollider(handle1);
      const collider2 = this.world.getCollider(handle2);
      const entity1 = this.entities.get(collider1._parent.handle);
      const entity2 = this.entities.get(collider2._parent.handle);
      const event1 = { handle: handle1, pair: entity2, started: started, type: 'collision' };
      const event2 = { handle: handle2, pair: entity1, started: started, type: 'collision' };
      entity1.dispatchEvent(event1);
      entity2.dispatchEvent(event2);
    }.bind(this));
  }

  render(loop) {
    // Update all 3D object rendering properties
    this.entities.forEach(entity => {
      entity.render(loop);
    });

    // Render all graphics
    this.graphics.render();
  }

  async load(url) {
    let json = {
      children: []
    };

    // Load entity descriptions from JSON file
    try {
      json = await (await fetch(url)).json();
    }
    catch {
      console.error(`Error: ${ url } not found.`);
    }

    // Create entities from children
    json.children.forEach(child => {
      const entity = EntityFactory.create(child, this.world);
      this.add(entity);
    });
  }

  unload() {
    this.entities.forEach(entity => {
      this.remove(entity);
    });
  }

  add(entity) {
    // Set entity key with unique rigidBody handle
    this.entities.set(entity.rigidBody.handle, entity);
    this.graphics.scene.add(entity.object3D);
    
    // Dispatch 'added' event to observers
    entity.dispatchEvent({ type: 'added' });
    return entity;
  }

  remove(entity) {
    this.entities.delete(entity.rigidBody.handle);
    this.graphics.scene.remove(entity.object3D);

    // Deconstruct entity
    EntityFactory.destroy(entity, this.world);

    // Dispatch 'removed' event to observers
    entity.dispatchEvent({ type: 'removed' });
    return entity;
  }
}

export { Game }