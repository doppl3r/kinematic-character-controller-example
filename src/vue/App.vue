<script setup>
  import '../scss/Stylesheet.scss';
  import { ref, onMounted } from 'vue';
  import { Game } from '../js/core/Game.js';
  import { LevelFactory } from '../js/factories/LevelFactory.js';
  import Button from './Button.vue';
  import Loading from './Loading.vue';

  // Initialize app and expose to window scope
  var canvas = ref();
  var game = window.game = new Game(onLoad);
  
  // Load level when game assets are ready
  function onLoad() {
    loadLevel('../json/level-1.json');
  }

  async function loadLevel(path) {
    game.physics.clear();
    
    // Load level from JSON
    var entities = await LevelFactory.loadFile(path);

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