<template>
  <div class="key-value-field">
    <TextInput
      :labelAttrs="{ class: 'key-field' }"
      label="Title"
      :modelValue="modelKey"
      @update:modelValue="$emit('update:modelKey', $event)"
    />
    <TextInput
      :labelAttrs="{ class: 'value-field' }"
      label="Value"
      :modelValue="modelValue"
      @update:modelValue="$emit('update:modelValue', $event)"
    />
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import TextInput from '../forms/TextInput.vue';

export interface KeyValuePair {
  key: string;
  value: string;
}

export default defineComponent({
  components: {
    TextInput,
  },
  props: {
    modelKey: String,
    modelValue: String,
  },
  // setup(props) {

  //   return {
  //   };
  // },
});
</script>

<style lang="scss">
.key-field {
  flex: 1;
}
.value-field {
  border-radius: 0;
  flex: 1;
}
.key-value-field {
  display: flex;
  flex-direction: column;
  flex-wrap: wrap;
  * {
    flex: 1;
  }
}

@media only screen and (min-width: 500px) {
  .key-value-field {
    flex-direction: row;
  }
  .key-field {
    border-top-right-radius: 0;
  }
  .value-field {
    border-top-right-radius: 4px;
  }
}
</style>