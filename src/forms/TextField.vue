<template>
  <div v-bind="rootAttrs">
    <TextInput
      v-bind="$attrs"
      :labelAttrs="{ class: { error: isInErrorState } }"
      v-model="value"
      @blur="refreshState"
    />
    <p class="sublabel">{{ subText }}</p>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, ref } from 'vue';
import { useFormField } from './forms';
import TextInput from './TextInput.vue';

export default defineComponent({
  inheritAttrs: false,
  components: {
    TextInput,
  },
  props: {
    name: {
      type: String,
      required: true,
    },
    rootAttrs: Object,
    helpText: String,
  },
  setup(props) {
    const value = ref<string>();
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
