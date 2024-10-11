import { LoadingManager } from 'three';
import { AssetModelLoader } from './AssetModelLoader.js';
import { AssetTextureLoader } from './AssetTextureLoader.js';
import { AssetAudioLoader } from './AssetAudioLoader.js';

/*
  The AssetLoader is a singleton class that manages loaders
  that cache their data back to this manager with unique keys.
*/

class AssetLoader extends LoadingManager {
  constructor(onLoad, onProgress, onError) {
    // Inherit LoadingManager components with callback events
    super(onLoad, onLoaderProgress.bind(onProgress), onError);

    // Initialize cache and loaders
    this.cache = {};
    this.assetModelLoader = new AssetModelLoader(this);
    this.assetTextureLoader = new AssetTextureLoader(this);
    this.assetAudioLoader = new AssetAudioLoader(this);
  }

  load(urls = {}) {
    // Load loaders from public directory (ex: /json/)
    if (urls.models) this.assetModelLoader.load(urls.models);
    if (urls.textures) this.assetTextureLoader.load(urls.textures);
    if (urls.audio) this.assetAudioLoader.load(urls.audio);
  }

  get(key) {
    // Return item from cache (clone by default)
    var item = this.cache[key];
    return item;
  }

  duplicate(key) {
    var item = this.get(key);
    if (item) item = item.duplicate();
    return item;
  }
}

// Set default progress event behavior
var onLoaderProgress = function(url, itemsLoaded, itemsTotal) {
  // Calculate percent
  var percent = Math.ceil((itemsLoaded / itemsTotal) * 100);

  // Dispatch loading progress to window listeners
  dispatchEvent(
    new CustomEvent('updateLoading', {
      detail: {
        url: url,
        itemsLoaded: itemsLoaded,
        itemsTotal: itemsTotal,
        percent: percent
      }
    })
  );

  // Execute optional callback assigned from constructor
  if (typeof this == 'function') this(url, itemsLoaded, itemsTotal);
}

export { AssetLoader };