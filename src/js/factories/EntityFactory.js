import { EntityFactory as EntityFactoryCore } from '../core/factories/EntityFactory.js';
import { Bounce } from '../entities/Bounce';
import { Cube } from '../core/entities/Cube';
import { Light } from '../core/entities/Light';
import { Player } from '../entities/Player';
import { Sphere } from '../core/entities/Sphere';
import { TriMesh } from '../core/entities/TriMesh';

/*
  This class creates new entity instances that are compatible
  with Three.js and Rapier.js
*/

class EntityFactory extends EntityFactoryCore {
  static Bounce = Bounce;
  static Cube = Cube;
  static Light = Light;
  static Player = Player;
  static Sphere = Sphere;
  static TriMesh = TriMesh;

  static create(options) {
    // Ensure className is defined
    if (options.className == undefined) {
      options.className = EntityFactory.getClassNameByType(options.type);
    }
    
    // Create default model json from entity class static model field
    if (options.model == undefined) {
      options.model = EntityFactory.getPropertyByClassName('model', options.className);
    }

    // Duplicate 3D model from model json
    if (options.model && game.assets.get(options.model.name)) {
      options.model = game.assets.duplicate(options.model.name);
    }

    // Call function by className value
    return super.create(options);
  }
}

export { EntityFactory }