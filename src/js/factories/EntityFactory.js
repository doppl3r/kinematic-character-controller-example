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

class EntityFactory {
  static Bounce = Bounce;
  static Cube = Cube;
  static Light = Light;
  static Player = Player;
  static Sphere = Sphere;
  static TriMesh = TriMesh;

  static create(options) {
    // Call function by className value
    if (options.className != null) {
      return new EntityFactory[options.className](options);
    }
    else {
      console.error(`Error: Entity property "className" is undefined.`);
    }
  }

  static getClassNameByType(type) {
    // Get className from matching (lowercase) type value
    const properties = Object.keys(EntityFactory);
    const className = properties.find(className => className.toLowerCase() == type);
    return className;
  }

  static getPropertyByType(name, type) {
    const className = EntityFactory.getClassNameByType(type);
    return EntityFactory.getPropertyByClassName(name, className);
  }

  static getPropertyByClassName(name, className) {
    const property = EntityFactory[className];
    if (property) return property[name];
    return;
  }
}

export { EntityFactory }