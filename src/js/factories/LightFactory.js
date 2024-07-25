import { AmbientLight, DirectionalLight, DirectionalLightHelper, HemisphereLight, HemisphereLightHelper, PointLight, PointLightHelper } from 'three';

/*
  This class creates new light instances with optional helpers
  that are compatible with Three.js
*/

class LightFactory {
  constructor() {
    
  }

  static create(type, options = {}) {
    var light;
    var helper;
    
    // Set default options
    if (options.color == null) options.color = 0xffffff;
    if (options.skyColor == null) options.skyColor = 0xffffff;
    if (options.groundColor == null) options.groundColor = 0xffffff;
    if (options.intensity == null) options.intensity = Math.PI;
    if (options.distance == null) options.distance = 0; // no limit
    if (options.shadow == null) options.shadow = false;
    if (options.decay == null) options.decay = 2;
    
    // Conditionally create camera
    if (type == 'ambient') {
      light = new AmbientLight(options.color, options.intensity);
    }
    else if (type == 'directional') {
      light = new DirectionalLight(options.color, options.intensity);
      helper = new DirectionalLightHelper(light);
    }
    else if (type == 'hemisphere') {
      light = new HemisphereLight(options.skyColor, options.groundColor, options.intensity);
      helper = new HemisphereLightHelper(light);
    }
    else if (type == 'point') {
      light = new PointLight(options.color, options.intensity, options.distance, options.decay);
      helper = new PointLightHelper(light);
    }

    // Add shadow option
    if (options.shadow) {
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