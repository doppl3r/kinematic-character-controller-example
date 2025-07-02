import { AmbientLight, DirectionalLight, DirectionalLightHelper, HemisphereLight, HemisphereLightHelper, PointLight, PointLightHelper } from 'three';

/*
  This class creates new light instances with optional helpers
  that are compatible with Three.js
*/

class LightFactory {
  constructor() {
    
  }

  static create(options) {
    const light = new LightFactory[options.type](...options.arguments);
    return light;
  }

  static createHelper(light) {
    const helper = new LightFactory[light.type + 'Helper'](light);
    light.addEventListener('added', () => { light.parent.add(helper); });
    light.addEventListener('removed', () => { helper.removeFromParent(); });
    return helper;
  }

  static AmbientLight = AmbientLight;
  static DirectionalLight = DirectionalLight;
  static DirectionalLightHelper = DirectionalLightHelper;
  static HemisphereLight = HemisphereLight;
  static HemisphereLightHelper = HemisphereLightHelper;
  static PointLight = PointLight;
  static PointLightHelper = PointLightHelper;
}

export { LightFactory }