<template>
  <label class="text multiline" :class="{ filled }" v-bind="labelAttrs">
    <pre><span>{{ currentValue }}</span><br></pre>
    <textarea v-bind="$attrs" :value="currentValue" @input="handleInput"></textarea>
    <span class="label-text">{{ label }}</span>
  </label>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';

export default defineComponent({
  emits: ['enter', 'update:modelValue'],
  inheritAttrs: false,
  props: {
    labelAttrs: Object,
    modelValue: String,
    allowLineBreak: {
      type: Boolean,
      default: false,
    },
    label: {
      type: String,
      required: true,
    },
  },
  setup(props, { emit }) {
    const filled = ref(!!props.modelValue);
    const currentValue = ref(props.modelValue);
    return {
      filled,
      currentValue,
      handleInput: (event: InputEvent) => {
        if (!props.allowLineBreak && event.inputType === 'insertLineBreak') {
          event.preventDefault();
          event.stopPropagation();
          return emit('enter');
        }
        const value = (event.target as HTMLTextAreaElement).value;
        currentValue.value = value;
        filled.value = !!value;
        emit('update:modelValue', value);
      }
    };
  },
});
</script>
