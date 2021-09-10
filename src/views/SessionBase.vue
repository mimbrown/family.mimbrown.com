<template>
  <main class="user-session">
    <div class="user-session-fields">
      <router-view />
    </div>
  </main>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({});
</script>

<style lang="scss">
.user-session {
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
}
.user-session-fields {
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 16px;
  width: 100%;
  max-width: 300px;
}
</style>
