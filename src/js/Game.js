import { Loop } from './Loop';
import { Graphics } from './Graphics.js';
import { AssetLoader } from './loaders/AssetLoader.js';
import { Physics } from './Physics.js';
import { LevelFactory } from './factories/LevelFactory.js';

class Game {
  constructor(onLoad) {
    // Initialize core game engine
    this.loop = new Loop();
    this.graphics;
    this.physics = new Physics();
    this.assets = new AssetLoader(this.onLoad.bind(this, onLoad));
  }

  init(canvas) {
    this.graphics = new Graphics(canvas);
    this.graphics.addStats();

    // Load public assets with callbacks (onLoad, onProgress, onError)
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

  async onLoad(onLoad) {
    // Initialize entity manager
    this.physics.setFrequency(30);
    this.graphics.scene.add(this.physics.debugger);

    // Add game loops
    this.loop.add(this.update.bind(this), 30); // Physics
    this.loop.add(this.render.bind(this), -1); // Render
    this.loop.start();

    // Run optional callback
    if (typeof onLoad == 'function') await onLoad();
  }

  async loadLevel(path) {
    this.physics.clear();
    
    // Load level from JSON
    var entities = await LevelFactory.loadFile(path);

    // Loop through entities
    entities.forEach(function(entity) {
      this.physics.add(entity);
      this.graphics.scene.add(entity.object);

      // TODO: Assign custom functions from deprecated Level.js

      // Use the player camera for rendering graphics
      if (entity.type == 'player') {
        this.graphics.setCamera(entity.camera);
      }
    }.bind(this));
  }
}

export { Game };