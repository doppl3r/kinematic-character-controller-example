<script setup>
  import { ref } from 'vue';

  // Initialize progress variable (urls, index, max, percent)
  var progress = ref({ urls: '', index: 0, max: 1, percent: 0 })

  function updateLoading(data) {
    progress.value = data;
  }
  
  function isFinished() {
    return progress.value.percent == 100;
  }

  // Refresh UI when game object dispatches custom events
  window.addEventListener('updateLoading', function(e) {
    updateLoading(e.detail);
  });
</script>

<template>
  <Transition name="fade-loading">
    <div class="loading" v-show="isFinished() == false">
      <div class="bar">
        <div class="progress" :style="{ width: progress.percent + '%' }"></div>
      </div>
      <label>Loading: {{ progress.percent }}%</label>
    </div>
  </Transition>
</template>

<style>
  
</style>

<style lang="scss" scoped>
  // Used for <Translation> elements
  .fade-loading-enter-active,
  .fade-loading-leave-active { transition: opacity 1s ease; }
  .fade-loading-enter-from,
  .fade-loading-leave-to { opacity: 0; }

  // Loading overlay
  .loading {
    background-color: #ffffff;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    pointer-events: none;
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
    z-index: 1;

    .bar {
      width: 50%;
      padding: 0.25em;
      margin: 1em 0em;
      border: 0.25em solid #000000;
      border-radius: 0.5em;

      .progress {
        background-color: #000000;
        border-radius: 0.125em;
        transition: all 0.25s ease;
        height: 1em;
      }
    }

    label {
      color: #000000;
      font-size: 1em;
    }
  }
</style>