<template>
  <div class="loader-wrap">
    <div class="loader"></div>
  </div>
</template>

<script>
import { defineComponent } from 'vue';

export default defineComponent({

});
</script>

<style lang="scss">
@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.loader-wrap {
  display: flex;
  align-items: center;
  justify-content: center;
}

.loader {
  border: 6px solid transparent;
  border-right: 6px solid rgb(var(--secondary));
  border-left: 6px solid rgb(var(--secondary));
  border-radius: 50%;
  width: 40px;
  height: 40px;
  animation: spin 1s infinite;
}
</style>