<script setup>
  import { computed } from 'vue';

  // Initialize props with defaults
  const props = defineProps({
    progress: {
      type: Object,
      default: {
        url: '',
        itemsLoaded: 0,
        itemsTotal: 0
      }
    }
  });

  // Initialize progress functions
  const percent = computed(() => Math.round((props.progress.itemsLoaded / props.progress.itemsTotal) * 100));
  const isFinished = computed(() => props.progress.itemsLoaded === props.progress.itemsTotal);
</script>

<template>
  <Transition name="fade-progress-bar">
    <div class="progress-bar" v-if="isFinished === false">
      <div class="bar">
        <div class="progress" :style="{ width: percent + '%' }"></div>
      </div>
      <div class="label">Loading: {{ percent }}%</div>
    </div>
  </Transition>
</template>

<style lang="scss" scoped>
  .fade-progress-bar-enter-active,
  .fade-progress-bar-leave-active { transition: opacity 0.5s ease; }
  .fade-progress-bar-enter-from,
  .fade-progress-bar-leave-to { opacity: 0; }

  .progress-bar {
    background-color: #000000;
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
      border: 0.25em solid #fff;
      border-radius: 0.5em;
      position: relative;

      .progress {
        background-color: #ffffff;
        border-radius: 0.125em;
        transition: all 0.25s ease;
        height: 1em;
      }
    }

    .label {
      color: #ffffff;
      font-size: 1em;
    }
  }

  @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
</style>