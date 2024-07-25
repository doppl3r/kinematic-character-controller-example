import { Loop } from './Loop';
import { Graphics } from './Graphics.js';
import { AssetManager } from './AssetManager.js';
import { LightFactory } from './factories/LightFactory.js';
import { CameraFactory } from './factories/CameraFactory.js';
import { WorldManager } from './WorldManager.js';

class Game {
  constructor() {
    
  }

  init(canvas) {
    // Initialize core game engine
    this.loop = new Loop();
    this.graphics = new Graphics(canvas);
    this.graphics.setCamera(CameraFactory.create());

    // Initialize components
    this.worldManager = new WorldManager();

    // Load public assets with callbacks (onLoad, onProgress, onError)
    this.assets = new AssetManager(this.onLoad.bind(this), this.onProgress.bind(this));
    this.assets.load('./json/');
  }

  onLoad() {
    // Initialize entity manager
    this.worldManager.init();
    this.worldManager.setFrequency(30);;

    // Add entities to the 3D scene
    this.worldManager.addEntitiesToScene(this.graphics.scene);

    // Update camera
    this.graphics.camera.position.add({ x: 0, y: 5, z: 5 });
    this.graphics.camera.lookAt(0, 0, 0);

    // Add lights
    var light_hemisphere = LightFactory.create('ambient');
    light_hemisphere.position.set(0, 1, 0);
    this.graphics.scene.add(light_hemisphere);
    this.graphics.setShadows(true);

    // Add game loops
    this.loop.add(this.update.bind(this), 30); // Physics
    this.loop.add(this.render.bind(this), -1); // Render
    this.loop.start();
  }

  onProgress(url, itemsLoaded, itemsTotal) {
    var percent = Math.ceil((itemsLoaded / itemsTotal) * 100);
    window.dispatchEvent(new CustomEvent('updateLoading', { detail: { url: url, itemsLoaded: itemsLoaded, itemsTotal: itemsTotal, percent: percent }}));
  }

  update(data) {
    // Update world physics
    this.worldManager.update(data.delta, data.alpha);
  }

  render(data) {
    this.worldManager.render(data.delta, data.alpha);

    // Render graphics
    this.graphics.render();
  }
}

export { Game };