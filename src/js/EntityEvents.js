import { Euler,  Quaternion, Vector3 } from 'three';

/*
  Add custom "entity events" to this file. The EntityFactory
  will execute these functions by "key" when the entity
  collider event is triggered.
*/

class EntityEvents {
  constructor() {

  }

  static teleport = event => {
    event.pair.setPosition(event.value);
  }

  static bounce = event => {
    if (event.pair.rigidBody?.isKinematic()) {
      _v.copy(event.pair.velocity);
      _v.y = 0.15;
      event.pair.velocity.copy(_v);
    }
    else {
      _v.copy(event.pair.rigidBody.linvel());
      _v.y = 5; // Bounce upwards
      event.pair.rigidBody.setLinvel(_v, true);
    }
  }
}

// Assign local helper components
const _v = new Vector3();
const _e = new Euler();
const _q = new Quaternion();

export { EntityEvents }