import { Interval } from './Interval.js';
import { AssetLoader } from './loaders/AssetLoader.js';
import { Graphics } from './Graphics.js';
import { Physics } from './Physics.js';

class Game {
  constructor(onLoad) {
    this.interval = new Interval();
    this.physics = new Physics();
    this.graphics;
    this.assets = new AssetLoader(this.onLoad.bind(this, onLoad));
  }

  init(canvas) {
    // Initialize components
    this.graphics = new Graphics(canvas);
    this.graphics.scene.add(this.physics.debugger);
    this.physics.debugger.disable();

    // Load public assets with callbacks (onLoad, onProgress, onError)
    this.assets.load({
      models: '../json/assets-models.json',
      textures: '../json/assets-textures.json',
      audio: '../json/assets-audio.json',
      json: '../json/assets-json.json'
    });
  }

  update({ delay }) {
    // Update entity physics
    this.physics.update(delay / 1000);
  }

  render({ alpha, sum }) {
    // Update all entities animation properties
    this.physics.animate(sum / 1000, alpha);

    // Render graphics
    this.graphics.render();
  }

  onLoad(onLoad) {
    // Add and start game loops
    this.interval.add(loop => this.update(loop), 1000 / 30); // Physics
    this.interval.add(loop => this.render(loop)); // Render
    this.interval.start();
  
    // Run optional callback
    if (typeof onLoad == 'function') onLoad();
  }
}

export { Game };