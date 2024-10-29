import { Bounce } from '../entities/Bounce';
import { Character } from '../entities/Character';
import { Cube } from '../entities/Cube';
import { Light } from '../entities/Light';
import { Player } from '../entities/Player';
import { Sphere } from '../entities/Sphere';
import { TriMesh } from '../entities/TriMesh';

/*
  This class creates new entity instances that are compatible
  with Three.js and Rapier.js
*/

class EntityFactory {
  static Bounce = Bounce;
  static Character = Character;
  static Cube = Cube;
  static Light = Light;
  static Player = Player;
  static Sphere = Sphere;
  static TriMesh = TriMesh;

  static create(options) {
    // Call function by class name
    if (options.type != null) {
      var type = this.getClassName(options.type);
      var fn = this['create' + type];
      if (fn == null) {
        console.error(`Error: Entity type "${ type }" not found.`);
        return;
      }
      return fn(options);
    }
    else {
      console.error(`Error: Entity type is undefined.`)
    }
  }

  static createBounce(options) {
    return new Bounce(options);
  }

  static createCharacter(options) {
    return new Character(options);
  }
  
  static createCube(options) {
    return new Cube(options);
  }

  static createLight(options) {
    return new Light(options);
  }

  static createPlayer(options) {
    return new Player(options);
  }

  static createSphere(options) {
    return new Sphere(options);
  }

  static createTrimesh(options) {
    return new TriMesh(options);
  }

  static getClassName(type) {
    return type.charAt(0).toUpperCase() + type.slice(1);
  }

  static getProperty(type, property) {
    const className = this.getClassName(type);
    if (className) {
      const staticClass = this[className];
      if (staticClass) return staticClass[property];
      else {
        console.error(`Error: Static class "${ className }" does not exist.`)
      }
    }
    return;
  }
}

export { EntityFactory }