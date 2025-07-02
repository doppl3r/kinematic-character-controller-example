import { Euler,  Quaternion, Vector3 } from 'three';

class EntityEvents {
  constructor() {

  }

  static teleport = event => {
    event.pair.setPosition(event.value);
  }

  static bounce = event => {
    if (event.pair.rigidBody?.isKinematic()) {
      _v.copy(event.pair.velocity);
      _v.y = 0.45;
      event.pair.velocity.copy(_v);
    }
    else {
      _v.copy(event.pair.rigidBody.linvel());
      _v.y = 20; // Bounce upwards
      event.pair.rigidBody.setLinvel(_v, true);
    }
  }
}

// Assign local helper components
const _v = new Vector3();
const _e = new Euler();
const _q = new Quaternion();

export { EntityEvents }