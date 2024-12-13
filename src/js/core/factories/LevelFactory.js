import { Quaternion, Vector3 } from 'three';
import { EntityFactory } from '../../factories/EntityFactory.js';
import CustomEvents from '../../mixins/CustomEvents.js';

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
    .then(function(json) { return json; })
    .catch(function(error) { console.error(error); });
  }

  static loadFromJSON(json) {
    // Initialize properties
    var entities = [];

    // Loop through children
    entities = this.createEntities(json);

    // Return array of entities
    return entities;
  }

  static createEntities(json, entities = []) {
    // Loop through children
    json.children.forEach(function(child) {
      // Add entity to array
      var entity = this.createEntity(child);
      if (entity != null) entities.push(entity);
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
    json = Object.assign({
      ccd: true,
      friction: json.friction || 0,
      softCcdPrediction: 0.5
    }, json);

    // Ensure className is defined
    if (json.className == undefined) {
      json.className = EntityFactory.getClassNameByType(json.type);
    }

    // Create default model json from entity class static model field
    if (json.model == undefined) {
      json.model = EntityFactory.getPropertyByClassName('model', json.className);
    }

    // Duplicate 3D model from model json
    if (json.model && game.assets.get(json.model.name)) {
      json.model = game.assets.duplicate(json.model.name);
    }

    // Create new entity from json
    let entity = EntityFactory.create(json);

    // Add custom mixin functions to entity
    Object.assign(entity, CustomEvents);

    // Return the newly created entity
    return entity;
  }
}

export { LevelFactory };