import { NearestFilter, SRGBColorSpace, TextureLoader } from 'three';

class AssetTextureLoader extends TextureLoader {
  constructor(manager) {
    super(manager);
  }

  async load(directory = '') {
    var response = await fetch(directory + 'textures.json');
    var json = await response.json();

    // Loop through json keys and values
    for (const [key, value] of Object.entries(json)) {
      super.load(value.url, function(texture) {
        // Load texture into cache
        texture.colorSpace = SRGBColorSpace; // SRGBColorSpace = 'srgb'
        texture.name = key;
        texture.magFilter = value.magFilter || NearestFilter; // LinearFilter (default) = 1006, NearestFilter = 1003
        texture.duplicate = this.duplicate.bind(this, texture);
        if (value.center) texture.center.copy(value.center);
        if (value.repeat) texture.repeat.copy(value.repeat);
        this.manager.cache[key] = texture;
      }.bind(this));
    }
  }

  duplicate(texture) {
    texture = texture.clone();
    return texture;
  }
}

export { AssetTextureLoader };