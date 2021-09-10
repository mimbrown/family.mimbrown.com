<template>
  <form @submit="onSubmit">
    <slot/>
  </form>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { useFormContainer } from '../utils/forms';

export default defineComponent({
  emits: ['save', 'error'],
  setup(props, { emit }) {
    const { totalErrors, validateForm } = useFormContainer();

    return {
      onSubmit(event: Event) {
        event.preventDefault();
        validateForm();
        if (totalErrors.value > 0) {
          emit('error', totalErrors.value);
        } else {
          emit('save');
        }
      },
    };
  },
});
</script>