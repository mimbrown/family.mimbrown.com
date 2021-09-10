<template>
  <div v-bind="rootAttrs">
    <label class="text">
      <select v-model="value">
        <option v-for="category in categories" :key="category.id" :value="category.id">
          {{ category.label }}
        </option>
      </select>
      <span class="label-text">{{ label }}</span>
    </label>
    <p class="sublabel">{{ subText }}</p>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, ref } from 'vue';
import { useFormField } from './forms';
import { categories, Category } from '../api/recipes';

export default defineComponent({
  inheritAttrs: false,
  props: {
    label: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    rootAttrs: Object,
    helpText: String,
  },
  setup(props) {
    const value = ref<Category>();
    const {
      errors,
      initialValue,
      refreshState,
      isInErrorState,
    } = useFormField(
      props.name,
      () => value.value,
    );
    value.value = initialValue;
    return {
      categories,
      value,
      isInErrorState,
      refreshState,
      subText: computed(() => {
        return isInErrorState.value ? errors.value[0] : props.helpText;
      }),
    };
  },
});
</script>
