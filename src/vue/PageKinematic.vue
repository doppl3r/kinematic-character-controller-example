<script setup>
  import { onMounted, onUnmounted, ref } from 'vue';
  import { useI18n } from 'vue-i18n';
  import { Game } from '../js/Game.js';
  import { EntityFactory } from '../js/EntityFactory.js';
  import { EntityControllerKinematic } from '../js/EntityControllerKinematic.js';
  import ProgressBar from './ProgressBar.vue';

  // Initialize Vue components
  const i18n = useI18n();
  const canvas = ref();
  const progress = ref({ url: '', itemsLoaded: 0, itemsTotal: 0 });

  // Declare game components
  let entityController;
  let game;

  const loadLevel = async e => {
    // Start game
    game.start();
  }

  // Initialize app after canvas has been mounted
  onMounted(async () => {
    // Create new instances of game components
    game = window.game = new Game();

    // Create controller
    const optionsController = {
      maxSlopeClimbAngle: 60 * Math.PI / 180,
      minSlopeClimbAngle: 30 * Math.PI / 180
    };
    const controller = EntityFactory.createController(optionsController, game.world);
    entityController = new EntityControllerKinematic(controller);
    entityController.setCamera(game.graphics.camera);

    // Load game entities
    await game.load('json/level-1.json');
    game.debugger.enable();
    game.graphics.addStats();

    // Assign player entity to controller
    game.entities.forEach(entity => {
      if (entity.name === 'player') {
        entityController.setEntity(entity);
      }
    });

    // Load level after assets are loaded
    game.assets.addEventListener('onStart', e => progress.value = e);
    game.assets.addEventListener('onProgress', e => progress.value = e);
    game.assets.addEventListener('onLoad', loadLevel);

    // Replace canvas element
    canvas.value.replaceWith(game.graphics.canvas);
  });

  onUnmounted(() => {
    game.stop();
    game.unload();
    game.world.free();
    entityController.destroy();
  });
</script>

<template>
  <div>
    <!-- Game canvas -->
    <canvas ref="canvas"></canvas>

    <!-- Page title (see translations: "/src/json/i18n/en.json") -->
    <h1>{{ i18n.t('home.title') }}</h1>

    <!-- Add asset progress bar -->
    <ProgressBar :progress="progress" />
  </div>
</template>

<style lang="scss" scoped>
  h1 {
    color: #ffffff;
    position: absolute;
    text-shadow: 0.125em 0.125em 0 #000000;
    top: 0;
    left: 0;
  }
</style>