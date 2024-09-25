<script setup>
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

<style lang="scss" scoped>
  button {
    background-color: #ffffff;
    border: none;
    border-radius: 0;
    box-shadow: 0.25em 0.25em 0 #000000;
    color: #000000;
    cursor: pointer;
    font-family: inherit;
    font-size: 0.75em;
    padding: 0.5em 1em;

    &.top-right {
      position: absolute;
      right: 1em;
      top: 1em;
    }

    &:hover {
      background-color: #ffb547;
      color: #ffffff;
      box-shadow: none;
    }
  }
</style>