<script setup>
  import '../scss/Stylesheet.scss';
  import { ref, onMounted } from 'vue';
  import { Game } from '../js/Game.js';
  import Button from './Button.vue';
  import Loading from './Loading.vue';

  // Initialize app and expose to window scope
  var canvas = ref();
  var game = window.game = new Game();

  // Initialize app after canvas has been mounted
  onMounted(function() {
    game.init(canvas.value);
  });
</script>

<template>
  <canvas ref="canvas"></canvas>
  <div class="ui">
    <Loading />
    <Button :href="'https://dopplercreative.com'">by doppler</Button>
  </div>
</template>