<template>
  <div class="not-found">
    <h1>404</h1>
    <slot />
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({});
</script>

<style lang="scss">
.not-found {
  text-align: center;
}
</style>
