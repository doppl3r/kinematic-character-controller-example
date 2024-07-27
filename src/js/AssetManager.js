import { LoadingManager } from 'three';
import { AssetAudioLoader } from './loaders/AssetAudioLoader.js';
import { AssetTextureLoader } from './loaders/AssetTextureLoader.js';
import { AssetModelLoader } from './loaders/AssetModelLoader.js';

/*
  The AssetManager is a singleton class that manages loaders
  that cache their data back to this manager with unique keys.
*/

class AssetManager extends LoadingManager {
  constructor(onLoad, onProgress, onError) {
    // Inherit LoadingManager with events
    super(onLoad, onProgress, onError);

    // Initialize cache and loaders
    this.cache = {};
    this.assetModelLoader = new AssetModelLoader(this);
    this.assetTextureLoader = new AssetTextureLoader(this);
    this.assetAudioLoader = new AssetAudioLoader(this);
  }

  load(directory = '') {
    // Load loaders from public directory (ex: /json/)
    this.assetModelLoader.load(directory);
    this.assetTextureLoader.load(directory);
    this.assetAudioLoader.load(directory);
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

export { AssetManager };