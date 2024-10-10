import { LoadingManager } from 'three';
import { AssetAudioLoader } from './AssetAudioLoader.js';
import { AssetTextureLoader } from './AssetTextureLoader.js';
import { AssetModelLoader } from './AssetModelLoader.js';

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

  load(paths) {
    // Initialize default paths
    paths = Object.assign({
      models: '../json/models.json',
      textures: '../json/textures.json',
      audio: '../json/audio.json',
    }, paths);

    // Load loaders from public directory (ex: /json/)
    if (paths.models) this.assetModelLoader.load(paths.models);
    if (paths.textures) this.assetTextureLoader.load(paths.textures);
    if (paths.audio) this.assetAudioLoader.load(paths.audio);
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

// Declare default function for super class
var onLoaderProgress = function(url, itemsLoaded, itemsTotal) {
  // Execute optional callback assigned from constructor
  if (typeof this == 'function') this(url, itemsLoaded, itemsTotal);

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
}

export { AssetLoader };