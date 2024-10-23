<script setup>
  import '../scss/Stylesheet.scss';
  import { ref, onMounted } from 'vue';
  import { Game } from '../js/Game.js';
  import Button from './Button.vue';
  import Loading from './Loading.vue';

  // Initialize app and expose to window scope
  var canvas = ref();
  var gameRef = ref(new Game(onLoad))
  var game = window.game = gameRef.value;
  
  // Load level when game assets are ready
  function onLoad() {
    game.loadLevel('../json/level-1.json');
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