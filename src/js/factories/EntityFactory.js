import { Cube } from '../entities/Cube';
import { Character } from '../entities/Character';
import { Sphere } from '../entities/Sphere';
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
    var fn = this['create' + options.class].bind(this);
    if (fn == null) return;
    return fn(options);
  }
  
  static createCube(options) {
    return new Cube(options);
  }
  
  static createCharacter(options) {
    return new Character(options);
  }

  static createSphere(options) {
    return new Sphere(options);
  }
  
  static createTriMesh(options) {
    return new TriMesh(options);
  }
}

export { EntityFactory }