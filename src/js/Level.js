import { Group } from 'three';
import { LightFactory } from './factories/LightFactory.js';
import { EntityFactory } from './factories/EntityFactory.js';

class Level extends Group {
  constructor() {
    super();

    // Define variables
    this.player;
  }

  load() {
    var entities = [];

    // Add lights
    var light_hemisphere = LightFactory.create('ambient');
    light_hemisphere.position.set(0, 1, 0);
    this.add(light_hemisphere);

    // Create map entity with model
    var mapEntity = EntityFactory.create({
      class: 'TriMesh',
      solverGroups: 0xFFFFFF00,
      model: game.assets.get('ramps')
    });

    // Create cube entity
    var cubeEntity = EntityFactory.create({
      ccd: true,
      class: 'Cube',
      collisionEventStart: function(e) {
        // Change cube color to green
        cubeEntity.model.material.color.set('#00ff00');

        // Bounce player
        this.player.move({ x: 0, y: 1, z: 0});
        this.player.velocity.y = 0.5;
      }.bind(this),
      collisionEventEnd: function(e) {
        // Change cube color to blue
        cubeEntity.model.material.color.set('#0000ff');
      },
      color: '#0000ff',
      isSensor: true,
      position: { x: -0.5, y: 0, z: -3.5 },
      scale: { x: 1, y: 0.25, z: 1 },
      type: 'Fixed'
    });

    // Create sphere entity
    var sphereEntity = EntityFactory.create({
      angularDamping: 1,
      ccd: true,
      class: 'Sphere',
      color: '#ff00ff',
      position: { x: 0.5, y: 0.5, z: -5.5 },
      radius: 0.5
    });

    // Create a player character entity
    this.player = EntityFactory.create({
      ccd: true,
      class: 'Player',
      height: 0.25,
      jumpSpeed: 4,
      model: game.assets.get('player'),
      moveSpeed: 5,
      position: { x: 0, y: 0.5, z: 0 },
      radius: 0.25,
      scale: { x: 1, y: 1, z: 1 }
    });
    this.player.model.play('Idle', 0); // Start idle animation
    this.player.addEventListeners();
    
    // Add entities to scene
    entities.push(mapEntity, cubeEntity, sphereEntity, this.player);
    entities.forEach(function(entity) { this.add(entity.object); }.bind(this));

    return entities;
  }
}

export { Level };