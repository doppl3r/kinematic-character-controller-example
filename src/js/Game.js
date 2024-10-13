import { Loop } from './Loop';
import { Graphics } from './Graphics.js';
import { AssetLoader } from './loaders/AssetLoader.js';
import { Physics } from './Physics.js';
import { Level } from './Level.js';

class Game {
  constructor() {
    
  }

  init(canvas) {
    // Initialize core game engine
    this.loop = new Loop();
    this.graphics = new Graphics(canvas);
    this.graphics.addStats();

    // Initialize components
    this.physics = new Physics();

    // Initialize level
    this.level = new Level();

    // Load public assets with callbacks (onLoad, onProgress, onError)
    this.assets = new AssetLoader(this.onLoad.bind(this));
    this.assets.load({
      models: '../json/models.json',
      textures: '../json/textures.json',
      audio: '../json/audio.json',
    });
  }

  update(data) {
    // Update world physics
    this.physics.update(data.delta, data.alpha);
  }

  render(data) {
    this.physics.animate(data.delta, data.alpha);

    // Render graphics
    this.graphics.render();
  }

  async onLoad() {
    // Initialize entity manager
    this.physics.setFrequency(30);
    this.graphics.scene.add(this.physics.debugger);
    this.graphics.scene.add(this.level)

    // Load level and add to physics
    var entities = await this.level.load();
    entities.forEach(function(entity) {
      this.physics.add(entity);

      // Set camera to player camera
      if (entity == this.level.player) {
        this.graphics.setCamera(entity.camera);
      }
    }.bind(this));

    // Update camera
    this.graphics.setCamera(this.level.player.camera);

    // Add game loops
    this.loop.add(this.update.bind(this), 30); // Physics
    this.loop.add(this.render.bind(this), -1); // Render
    this.loop.start();
  }
}

export { Game };