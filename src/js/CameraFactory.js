import { CameraHelper, OrthographicCamera, PerspectiveCamera } from 'three';

/*
  This class creates new camera instances with optional helpers
  that are compatible with Three.js
*/

class CameraFactory {
  constructor() {

  }

  static create(options) {
    const camera = new CameraFactory[options.type](...options.arguments);
    return camera;
  }

  static createHelper(camera) {
    const helper = new CameraHelper(camera);
    camera.addEventListener('added', () => { camera.parent.add(helper); });
    camera.addEventListener('removed', () => { helper.removeFromParent(); });
  }

  static PerspectiveCamera = PerspectiveCamera;
  static OrthographicCamera = OrthographicCamera;
}

export { CameraFactory };