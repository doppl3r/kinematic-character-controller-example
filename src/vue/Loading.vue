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
  .fade-loading-enter-active,
  .fade-loading-leave-active { transition: opacity 0.5s ease; }
  .fade-loading-enter-from,
  .fade-loading-leave-to { opacity: 0; }
</style>