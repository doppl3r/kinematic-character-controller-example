<script setup>
  import '../scss/Stylesheet.scss';
  import { ref, onMounted } from 'vue';
  import { Game } from '../js/core/Game.js';
  import { LevelFactory } from '../js/core/factories/LevelFactory.js';
  import Button from './Button.vue';
  import Loading from './Loading.vue';

  // Initialize app and expose to window scope
  var canvas = ref();
  var game = window.game = new Game(onLoad);
  
  // Load level when game assets are ready
  async function onLoad() {
    // Change engine step rate from 60 to 30
    game.physics.setFrequency(30);
    game.ticker.get(0).rate = 1 / 30;

    // Load level entities from JSON data
    const json = await LevelFactory.loadFile('../json/level-1.json');
    loadLevel(json);
  }

  async function loadLevel(json) {
    game.physics.clear();
    
    // Load level from JSON
    var entities = await LevelFactory.loadFromJSON(json);

    // Loop through entities
    entities.forEach(function(entity) {
      // Add 3D object after entity is added
      entity.addEventListener('added', function(e) {
        game.graphics.scene.add(entity.object);
      });

      // Add entity to physics entities map
      game.physics.add(entity);

      // Assign rendering camera from player
      if (entity.type == 'player') {
        game.player = entity;
        game.physics.createController(entity);
        game.graphics.setCamera(entity.camera);
      }
    });
  }
  
  // Initialize app after canvas has been mounted
  onMounted(function() {
    game.init(canvas.value);
  });
</script>

<template>
  <canvas ref="canvas"></canvas>
  <div class="ui">
    <Loading />
    <Button :href="'https://github.com/doppl3r/kinematic-character-controller-example'" class="top-right">by doppl3r</Button>
  </div>
</template>