import { Cube } from '../entities/Cube';
import { Light } from '../entities/Light';
import { Sphere } from '../entities/Sphere';
import { TriMesh } from '../entities/TriMesh';

/*
  This class creates new entity instances that are compatible
  with Three.js and Rapier.js
*/

class EntityFactory {
  static Cube = Cube;
  static Light = Light;
  static Sphere = Sphere;
  static TriMesh = TriMesh;

  static create(options) {
    // Call function by className value
    return new this[options.className](options);
  }

  static getClassNameByType(type) {
    // Get properties from base (this) and subclasses
    const properties = Object.keys({ ...this, ...EntityFactory });

    // Get className from matching (lowercase) type value
    const className = properties.find(className => className.toLowerCase() == type);
    return className;
  }

  static getPropertyByClassName(name, className) {
    // Return a static property by classname
    const property = this[className];
    if (property) return property[name];
    return;
  }
}

export { EntityFactory }