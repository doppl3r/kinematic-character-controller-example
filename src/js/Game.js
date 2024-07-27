import { Loop } from './Loop';
import { Graphics } from './Graphics.js';
import { AssetManager } from './AssetManager.js';
import { LightFactory } from './factories/LightFactory.js';
import { WorldManager } from './WorldManager.js';

class Game {
  constructor() {
    
  }

  init(canvas) {
    // Initialize core game engine
    this.loop = new Loop();
    this.graphics = new Graphics(canvas);

    // Initialize components
    this.worldManager = new WorldManager();

    // Load public assets with callbacks (onLoad, onProgress, onError)
    this.assets = new AssetManager(this.onLoad.bind(this), this.onProgress.bind(this));
    this.assets.load('./json/');
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

  onLoad() {
    // Initialize entity manager
    this.worldManager.init();
    this.worldManager.setFrequency(30);

    // Create map entity with model
    var mapModel = this.assets.get('ramps');
    var map = this.worldManager.create({
      class: 'TriMesh',
      model: mapModel
    });
    
    // Create a player character entity
    var playerModel = this.assets.get('player');
    var player = this.worldManager.create({
      class: 'Character',
      model: playerModel,
      position: { x: 0, y: 0.5, z: 0 }
    });
    player.model.play('Idle', 0); // Start idle animation
    player.addEventListeners();
    
    // Add entities to scene
    this.worldManager.add(map, player);
    this.worldManager.addToScene(this.graphics.scene);

    // Update camera
    this.graphics.setCamera(player.camera);
    //this.orbitControls = new OrbitControls(this.graphics.camera, this.graphics.canvas);

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
    // Emit loader progress to global window object
    var percent = Math.ceil((itemsLoaded / itemsTotal) * 100);
    window.dispatchEvent(new CustomEvent('updateLoading', { detail: { url: url, itemsLoaded: itemsLoaded, itemsTotal: itemsTotal, percent: percent }}));
  }
}

export { Game };