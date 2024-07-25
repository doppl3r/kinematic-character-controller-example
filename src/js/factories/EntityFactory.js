import { Cube } from '../entities/Cube';
import { Sphere } from '../entities/Sphere';
import { Marble } from '../entities/Marble';
import { TriMesh } from '../entities/TriMesh';
import { Background } from '../entities/Background';
import { Empty } from '../entities/Empty';

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

  static createBackground(options) {
    return new Background(options);
  }
  
  static createCube(options) {
    return new Cube(options);
  }

  static createEmpty(options) {
    return new Empty(options);
  }

  static createMarble(options) {
    return new Marble(options);
  }
  
  static createSphere(options) {
    return new Sphere(options);
  }
  
  static createTriMesh(options) {
    return new TriMesh(options);
  }

  
}

export { EntityFactory }