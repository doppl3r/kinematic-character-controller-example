import { Ticker } from './Ticker.js';
import { AssetLoader } from './loaders/AssetLoader.js';
import { Graphics } from './Graphics.js';
import { Physics } from './Physics.js';

class Game {
  constructor(onLoad) {
    this.ticker = new Ticker();
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

  update(data = { delta: 1 / 60 }) {
    // Update entity physics
    this.physics.update(data.delta);
  }

  render(data = { delta: 1 / 60, alpha: 0 }) {
    // Update all entities animation properties
    this.physics.animate(data.delta, data.alpha);

    // Render graphics
    this.graphics.render();
  }

  onLoad(onLoad) {
    // Add and start game loops
    this.ticker.add(this.update.bind(this), 1000 / 60); // Physics
    this.ticker.add(this.render.bind(this), -1); // Render
    this.ticker.start();
  
    // Run optional callback
    if (typeof onLoad == 'function') onLoad();
  }
}

export { Game };