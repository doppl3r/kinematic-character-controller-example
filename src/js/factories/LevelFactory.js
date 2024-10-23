import { Quaternion, Vector3 } from 'three';
import { LightFactory } from './LightFactory.js';
import { EntityFactory } from './EntityFactory.js';

class LevelFactory {
  constructor() {
    // Define variables
  }

  static async loadFile(path) {
    // Fetch public folder for level
    return fetch(path).then(function (response) {
      if (response.ok) { return response.json(); }
      throw new Error('Something went wrong');
    })
    .then(function(json) { return this.loadFromJSON(json); }.bind(this))
    .catch(function(error) { console.error(error); });
  }

  static loadFromJSON(json) {
    // Initialize properties
    var entities = [];

    // Loop through children
    entities = this.createEntities(json);

    // Add ambient light
    var light = EntityFactory.createLight({
      model: LightFactory.create('ambient'),
      position: { x: 0, y: 4, z: 0 },
      sleeping: true
    });
    entities.push(light);

    // Return array of entities
    return entities;
  }

  static createEntities(json, entities = [], parent) {
    // Loop through children
    json.children.forEach(function(child) {
      // Add entity to array
      var entity = this.createEntity(child);
      if (entity != null) {
        // Assign parent before adding entity
        entity.parent = parent;
        entities.push(entity);
        
        // Recursively load child entities
        if (child.children) {
          this.createEntities(child, entities, entity);
        }
      }
    }.bind(this));

    // Return array of entities
    return entities;
  }

  static createEntity(json) {
    var position = new Vector3();
    var rotation = new Quaternion();
    var scale = new Vector3(1, 1, 1);

    // Update properties
    if (json.position) position.set(json.position.x, json.position.y, json.position.z);
    if (json.rotation) rotation.set(json.rotation.x, json.rotation.y, json.rotation.z, json.rotation.w);
    if (json.scale) scale.set(json.scale.x, json.scale.y, json.scale.z);

    // Assign defaults from json values
    var options = Object.assign({
      ccd: true,
      friction: json.friction || 0,
      softCcdPrediction: 0.5
    }, json);

    // Create model from json model name
    if (json.model) options.model = game.assets.duplicate(json.model);

    // Create new entity from options
    var entity = EntityFactory.create(options);
    return entity;
  }
}

export { LevelFactory };