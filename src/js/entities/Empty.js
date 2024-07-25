import { Entity } from './Entity.js';
import { Cuboid } from '@dimforge/rapier3d';

/*
  An empty includes a cuboid shape (Rapier.js)
  with no 3D mesh information
*/

class Empty extends Entity {
  constructor(options) {
    // Resolve null option values
    if (options == null) options = {};
    if (options.position == null) options.position = { x: 0, y: 0, z: 0 };
    if (options.rotation == null) options.rotation = { x: 0, y: 0, z: 0 };
    if (options.scale == null) options.scale = { x: 0, y: 0, z: 0 };

    // Set empty options
    options.shape = new Cuboid(options.scale.x / 2, options.scale.y / 2, options.scale.z / 2)
    options.isSensor = true;
    options.type = 'Fixed';
    options.group = 0x00000000; // Hexadecimal (default = 4294967295, or 0xFFFFFFFF, or 0b11111111111111111111111111111111)

    // Inherit Entity class
    super(options);
  }
}

export { Empty };