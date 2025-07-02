<script setup>
  import '../scss/Global.scss';
  import { onMounted, onUnmounted } from 'vue';
  import { useRoute } from 'vue-router';

  // Initialize components
  const route = useRoute();

  onMounted(() => {
    
  });

  onUnmounted(() => {
    
  });
</script>

<template>
  <!-- Render page component using Routes.js -->
  <div class="page" :class="route.name">
    <router-view v-slot="{ Component }">
      <transition name="fade">
        <component :is="Component" />
      </transition>
    </router-view>
  </div>
</template>

<style lang="scss" scoped>

</style>