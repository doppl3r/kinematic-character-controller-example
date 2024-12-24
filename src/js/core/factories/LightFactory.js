import { AmbientLight, DirectionalLight, DirectionalLightHelper, HemisphereLight, HemisphereLightHelper, PointLight, PointLightHelper } from 'three';

/*
  This class creates new light instances with optional helpers
  that are compatible with Three.js
*/

class LightFactory {
  constructor() {
    
  }

  static create(type = 'PointLight', options) {
    var light;
    var helper;
    
    // Set options with default values
    options = Object.assign({
      color: '#ffffff',
      decay: 2,
      distance: 0,
      groundColor: '#000000',
      intensity: Math.PI,
      castShadow: false,
      skyColor: '#ffffff'
    }, options);
    
    // Conditionally create camera
    if (type == 'AmbientLight') {
      light = new AmbientLight(options.color, options.intensity);
    }
    else if (type == 'DirectionalLight') {
      light = new DirectionalLight(options.color, options.intensity);
      helper = new DirectionalLightHelper(light);
    }
    else if (type == 'HemisphereLight') {
      light = new HemisphereLight(options.skyColor, options.groundColor, options.intensity);
      helper = new HemisphereLightHelper(light);
    }
    else if (type == 'PointLight') {
      light = new PointLight(options.color, options.intensity, options.distance, options.decay);
      helper = new PointLightHelper(light);
    }

    // Return error message
    if (light == null) {
      console.error(`Error: Light type "${ type }" does not exists.`);
      return;
    }

    // Add shadow option
    if (options.castShadow) {
      light.castShadow = true;
    }

    // Add helper after light has been added
    if (options.helper == true) {
      if (helper) {
        light.addEventListener('added', function(e) { light.parent.add(helper); });
        light.addEventListener('removed', function(e) { helper.removeFromParent(); })
      }
    }

    return light;
  }
}

export { LightFactory }