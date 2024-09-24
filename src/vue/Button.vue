<script setup>
  import { defineProps } from 'vue';

  defineProps(['href']);

  function openLink(link) {
    window.open(link, '_blank');
  }
</script>

<template>
  <button @click="openLink(href)">
    <slot />
  </button>
</template>