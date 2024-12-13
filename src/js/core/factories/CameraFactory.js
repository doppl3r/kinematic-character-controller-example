import { CameraHelper, OrthographicCamera, PerspectiveCamera } from 'three';

/*
  This class creates new camera instances with optional helpers
  that are compatible with Three.js
*/

class CameraFactory {
  constructor() {

  }

  static create(type = 'PerspectiveCamera', options) {
    var camera;
    var helper;
    var width = window.innerWidth;
    var height = window.innerHeight;
    var ratio = width / height;

    // Set options with default values
    options = Object.assign({
      far: 100,
      fov: 45,
      near: 0.05,
      zoom: 1
    }, options);

    // Conditionally create camera
    if (type == 'PerspectiveCamera') {
      camera = new PerspectiveCamera(options.fov, ratio, options.near, options.far);
    }
    else if (type == 'OrthographicCamera') {
      camera = new OrthographicCamera(-ratio, ratio, 1, -1, options.near, options.far);
    }

    // Set camera options
    camera.fov = options.fov;
    camera.zoom = options.zoom;
    camera.updateProjectionMatrix();

    // Add helper after camera has been added
    if (options.helper == true) {
      helper = new CameraHelper(camera);
      camera.addEventListener('added', function(e) { camera.parent.add(helper); });
      camera.addEventListener('removed', function(e) { helper.removeFromParent(); });
    }

    // Return new camera
    return camera;
  }
}

export { CameraFactory };