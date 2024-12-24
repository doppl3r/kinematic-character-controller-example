import { Euler, Quaternion } from 'three';

/*
  Entity Events are custom functions that can be assign to all entities.
*/

export default {
  bounce({ pair, target, value = 30 }) {
    const quaternion = new Quaternion().copy(target.rigidBody.rotation());
    const euler = new Euler().setFromQuaternion(quaternion);
    const angle = euler.z;
    
    // Update Bounce entity
    target.applyVelocityAtAxisAngle({ x: 1, y: 0, z: 1 }, { x: 0, y: 0, z: 1 }, angle); // Cancel y-velocity
    target.applyImpulseAtAngle({ x: 0, y: -value * target.object.scale.y, z: 0 }, angle); // Bounce
    
    // Update collision pair
    pair.applyVelocityAtAxisAngle({ x: 1, y: 0, z: 1 }, { x: 0, y: 0, z: 1 }, angle); // Cancel y-velocity
    pair.applyImpulseAtAngle({ x: 0, y: value * pair.rigidBody.mass(), z: 0 }, angle); // Bounce
  },
  teleport({ pair, value }) {
    // Teleport player
    pair.setPosition(value);
  }
}