import { Audio, AudioListener, AudioLoader, EventDispatcher, LoadingManager, TextureLoader } from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader'

class Assets extends EventDispatcher {
  constructor() {
    // Inherit Three.js EventDispatcher system
    super();

    // Store assets in memory
    this.cache = {};
    this.queue = [];
    
    // Define manager and assign callbacks
    this.manager = new LoadingManager();
    this.manager.onStart = (url, itemsLoaded, itemsTotal) => this.dispatchEvent({ type: 'onStart', url, itemsLoaded, itemsTotal });
    this.manager.onLoad = () => this.dispatchEvent({ type: 'onLoad' });
    this.manager.onProgress = (url, itemsLoaded, itemsTotal) => this.dispatchEvent({ type: 'onProgress', url, itemsLoaded, itemsTotal });
    this.manager.onError = url => console.error(`File "${ url }" not found`);
    
    // Initialize loaders with manager
    this.audioListener = new AudioListener();
    this.loaderOptions = [
      {
        fileTypes: ['mp3', 'ogg', 'wav'],
        loader: new AudioLoader(this.manager),
        onLoad: (fileName, data) => {
          const audio = new Audio(this.audioListener);
          this.assign(fileName, audio.setBuffer(data))
        }
      },
      {
        fileTypes: ['glb', 'gltf'],
        loader: new GLTFLoader(this.manager),
        onLoad: (fileName, data) => {
          Object.assign(data.scene, { ...data });
          this.assign(fileName, data.scene);
        }
      },
      {
        fileTypes: ['fbx'],
        loader: new FBXLoader(this.manager),
        onLoad: (fileName, data) => this.assign(fileName, data)
      },
      {
        fileTypes: ['jpg', 'jpeg', 'png'],
        loader: new TextureLoader(this.manager),
        onLoad: (fileName, data) => {
          Object.assign(data, { colorSpace: 'srgb', magFilter: 1003 })
          this.assign(fileName, data)
        }
      }
    ];
  }

  load(url, callback = a => a) {
    // Get file details
    const fileType = url.substring(url.lastIndexOf('.') + 1);
    const fileName = url.substring(url.lastIndexOf('/') + 1, url.lastIndexOf('.'));
    const isQueued = this.queue.find(item => item.name === fileName) !== undefined;
    const asset = this.get(fileName); // Default = undefined

    // Add item to the queue
    if (asset === undefined) {
      this.queue.push({ name: fileName, callback });
    }
    else {
      // Run callback with existing asset
      callback(asset);
    }

    // Start loading if asset is not queued
    if (isQueued === false) {
      // Get loader option by file type (ex: 'mp3')
      const loaderOption = this.loaderOptions.find(option => option.fileTypes.includes(fileType));

      // Load asset if loader option exists
      if (loaderOption !== undefined) {
        loaderOption.loader.load(url, data => loaderOption.onLoad(fileName, data));
      }
      else {
        console.error(`File type ".${ fileType }" not supported`);
      }
    }
  }

  loadBatch(urls) {
    urls.forEach(path => this.load(path));
  }

  assign(name, asset) {
    // Set loaded asset by name
    this.set(name, asset);
 
    // Run callbacks and remove items from queue
    for (let i = this.queue.length - 1; i >= 0; i--) {
      if (this.queue[i].name === name) {
        this.queue[i].callback(asset);
        this.queue.splice(i, 1);
      }
    }
  }

  set(key, value) {
    return this.cache[key] = value;
  }

  get(key) {
    return this.cache[key];
  }

  remove(key) {
    delete this.cache[key];
  }
}

export { Assets }