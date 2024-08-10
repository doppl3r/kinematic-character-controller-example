import { CameraHelper, OrthographicCamera, PerspectiveCamera } from 'three';

/*
  This class creates new camera instances with optional helpers
  that are compatible with Three.js
*/

class CameraFactory {
  constructor() {

  }

  static create(type = 'perspective', options = {}) {
    var camera;
    var helper;
    var width = window.innerWidth;
    var height = window.innerHeight;
    var ratio = width / height;

    // Set options with default values
    options = Object.assign({
      fov: 45,
      zoom: 1
    }, options);

    // Conditionally create camera
    if (type == 'perspective') {
      camera = new PerspectiveCamera(options.fov, ratio, 0.05, 100);
    }
    else if (type == 'orthographic') {
      camera = new OrthographicCamera(-ratio, ratio, 1, -1, 0.05, 100);
    }

    // Set camera options
    camera.fov = options.fov;
    camera.zoom = options.zoom;

    // Add helper after camera has been added
    if (options.helper == true) {
      helper = new CameraHelper(camera);
      camera.addEventListener('added', function(e) { camera.parent.add(helper); });
      camera.addEventListener('removed', function(e) { helper.removeFromParent(); });
    }

    // Add resize event listener
    camera.addEventListener('resize', this.resize);

    // Return new camera
    return camera;
  }

  static resize(event) {
    var camera = event.target;
    var width = window.innerWidth;
    var height = window.innerHeight;
    var ratio = width / height;
    
    // Update orthographic frustum
    if (camera.isOrthographicCamera) {
      camera.left = -ratio;
      camera.right = ratio;
      camera.top = 1;
      camera.bottom = -1;
    }

    // Update camera ratio
    camera.aspect = ratio;
    camera.updateProjectionMatrix();
  }
}

export { CameraFactory };