import { Loop } from './Loop';
import { Graphics } from './Graphics.js';
import { AssetLoader } from './loaders/AssetLoader.js';
import { LightFactory } from './factories/LightFactory.js';
import { Physics } from './Physics.js';

class Game {
  constructor() {
    
  }

  init(canvas) {
    // Initialize core game engine
    this.loop = new Loop();
    this.graphics = new Graphics(canvas);

    // Initialize components
    this.physics = new Physics();

    // Load public assets with callbacks (onLoad, onProgress, onError)
    this.assets = new AssetLoader(this.onLoad.bind(this), this.onProgress.bind(this));
    this.assets.load('./json/');
  }

  update(data) {
    // Update world physics
    this.physics.update(data.delta, data.alpha);
  }

  render(data) {
    this.physics.render(data.delta, data.alpha);

    // Render graphics
    this.graphics.render();
  }

  onLoad() {
    // Initialize entity manager
    this.physics.init();
    this.physics.setFrequency(30);
    this.physics.setScene(this.graphics.scene);

    // Create map entity with model
    var mapEntity = this.physics.create({
      class: 'TriMesh',
      model: this.assets.get('ramps')
    });

    // Create cube entity
    var cubeEntity = this.physics.create({
      class: 'Cube',
      color: '#ff0000',
      ccd: true,
      scale: { x: 0.5, y: 0.5, z: 0.5 },
      position: { x: -3, y: 8, z: -1.5 }
    });

    // Create sphere entity
    var sphereEntity = this.physics.create({
      class: 'Sphere',
      color: '#ffff00',
      ccd: true,
      radius: 0.25,
      position: { x: 3, y: 8, z: -1.5 }
    });

    // Create a player character entity
    var playerEntity = this.physics.create({
      class: 'Character',
      ccd: true,
      model: this.assets.get('player'),
      position: { x: 0, y: 0.5, z: 0 }
    });
    playerEntity.model.play('Idle', 0); // Start idle animation
    playerEntity.addEventListeners();
    
    // Add entities to scene
    this.physics.add(mapEntity, cubeEntity, sphereEntity, playerEntity);

    // Update camera
    this.graphics.setCamera(playerEntity.camera);

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