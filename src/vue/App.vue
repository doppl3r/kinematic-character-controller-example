<script setup>
  import '../scss/Stylesheet.scss';
  import { ref, onMounted } from 'vue';
  import { Game } from '../js/core/Game.js';
  import { EntityFactory } from '../js/factories/EntityFactory.js';
  import Button from './Button.vue';
  import Loading from './Loading.vue';
  import CustomEvents from '../js/mixins/CustomEvents.js';

  // Initialize app and expose to window scope
  var canvas = ref();
  var game = window.game = new Game(onLoad);
  
  // Load level when game assets are ready
  async function onLoad() {
    // Change engine step rate from 60 to 30
    game.physics.setFrequency(30);
    game.physics.debugger.enable();

    // Load level entities from JSON data
    loadLevel('level-1');
  }

  async function loadLevel(name) {
    game.physics.clear();

    // Load level from JSON
    const json = game.assets.get(name);
    const entities = [];
    
    // Loop through level children
    if (json) {
      json.children.forEach(function(child) {
        const entity = EntityFactory.create({
          ccd: true,
          friction: json.friction || 0,
          softCcdPrediction: 0.5,
          ...child,
        });
  
        // Add 3D object after entity is added
        entity.addEventListener('added', function(e) {
          game.graphics.scene.add(entity.object);
        });
  
        // Add custom mixin functions to entity
        Object.assign(entity, CustomEvents);
  
        // Assign rendering camera from player
        if (entity.type == 'player') {
          game.player = entity;
          game.physics.createController(entity);
          game.graphics.setCamera(entity.camera);
        }
  
        // Add entity to physics entity map
        game.physics.add(entity);
        entities.push(entity);
      });
    }

    // Return final entity list
    return entities;
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