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
      solverGroups: 0xFFFFFF00,
      model: this.assets.get('ramps')
    });

    // Create cube entity
    var cubeEntity = this.physics.create({
      ccd: true,
      class: 'Cube',
      color: '#ff0000',
      isSensor: true,
      position: { x: -7, y: 4.5, z: 1 },
      type: 'Fixed'
    });

    // Create sphere entity
    var sphereEntity = this.physics.create({
      angularDamping: 1,
      ccd: true,
      class: 'Sphere',
      color: '#ffff00',
      position: { x: 6, y: 16, z: -3 },
      radius: 0.5
    });

    // Create a player character entity
    this.player = this.physics.create({
      ccd: true,
      class: 'Player',
      height: 0.25,
      jumpSpeed: 4,
      model: this.assets.get('player'),
      moveSpeed: 5,
      position: { x: 0, y: 0.5, z: 0 },
      radius: 0.25,
      scale: { x: 1, y: 1, z: 1 }
    });
    this.player.model.play('Idle', 0); // Start idle animation
    this.player.addEventListeners();
    
    // Add entities to scene
    this.physics.add(mapEntity, cubeEntity, sphereEntity, this.player);

    // Update camera
    this.graphics.setCamera(this.player.camera);

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
    dispatchEvent(new CustomEvent('updateLoading', { detail: { url: url, itemsLoaded: itemsLoaded, itemsTotal: itemsTotal, percent: percent }}));
  }
}

export { Game };