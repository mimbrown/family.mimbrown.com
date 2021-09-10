<template>
  <label class="text" :class="{ filled }" v-bind="labelAttrs">
    <input v-bind="$attrs" :value="currentValue" @input="handleInput" @focus="focus" @blur="blur">
    <span class="label-text">{{ label }}</span>
  </label>
</template>

<script lang="ts">
import { defineComponent, ref, watch } from 'vue';

export default defineComponent({
  inheritAttrs: false,
  props: {
    labelAttrs: Object,
    modelValue: String,
    label: {
      type: String,
      required: true,
    },
  },
  setup(props, { emit }) {
    const filled = ref(!!props.modelValue);
    const currentValue = ref(props.modelValue);

    let isFocused = false;

    const updateValue = (value: string | undefined) => {
      if (currentValue.value !== value && !isFocused) {
        currentValue.value = value;
      }
    }

    watch(() => props.modelValue, updateValue);
    return {
      filled,
      currentValue,
      handleInput: (event: InputEvent) => {
        const value = (event.target as HTMLInputElement).value;
        currentValue.value = value;
        filled.value = !!value;
        emit('update:modelValue', value);
      },
      focus() {
        isFocused = true;
      },
      blur() {
        isFocused = false;
        updateValue(props.modelValue);
      },
    };
  },
});
</script>
