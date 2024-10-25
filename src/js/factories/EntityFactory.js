import { Bounce } from '../entities/Bounce';
import { Character } from '../entities/Character';
import { Cube } from '../entities/Cube';
import { Light } from '../entities/Light';
import { Player } from '../entities/Player';
import { Sphere } from '../entities/Sphere';
import { Teleport } from '../entities/Teleport';
import { TriMesh } from '../entities/TriMesh';

/*
  This class creates new entity instances that are compatible
  with Three.js and Rapier.js
*/

class EntityFactory {
  constructor() {
    
  }

  static create(options) {
    // Call function by class name
    if (options.type != null) {
      var type = options.type.charAt(0).toUpperCase() + options.type.slice(1);
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
  
  static createTeleport(options) {
    return new Teleport(options);
  }

  static createTrimesh(options) {
    return new TriMesh(options);
  }
}

export { EntityFactory }