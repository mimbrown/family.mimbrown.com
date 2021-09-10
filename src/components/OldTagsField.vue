<template>
  <div class="tags-field">
    <div v-for="tag of tags" :key="tag" class="chip tag-item">
      {{ tag }}
      <i class="material-icons" @click="removeTag(tag)">cancel</i>
    </div>
    <TextInput :list="datalistId" v-model="currentValue" :label="label" :labelAttrs="{ class: 'tags-field-input' }" @keyup="addTag" />
    <datalist :id="datalistId">
      <option v-for="tag of datalistItems" :key="tag" :value="tag" />
    </datalist>
  </div>
</template>

<script lang="ts">
import { defineComponent, reactive, ref } from 'vue';
import idGenerator from '../utils/idGenerator';
import TextInput from '../forms/TextInput.vue';
import { useFormField } from '../forms/forms';

const nextId = idGenerator('tag-field-datalist');
const commaRegEx = /,/g;

function setMinus<T>(a: T[], b: T[]) {
  const newArray: T[] = [];
  for (const item of a) {
    if (!b.includes(item)) {
      newArray.push(item);
    }
  }
  return newArray;
}

export default defineComponent({
  components: {
    TextInput,
  },
  props: {
    label: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      required: true,
    }
  },
  setup(props) {
    const unwrappedTags: string[] = [];
    const {
      initialValue
    } = useFormField(props.name, () => unwrappedTags);
    if (initialValue) {
      unwrappedTags.push(...initialValue);
    }

    const datalistId = nextId();
    const datalistItems = reactive(setMinus([
      'brown',
      'losey',
      'voris',
      'kimbriel',
      'christmas',
      'thanksgiving',
      'cheap',
      'easy',
      'quick',
    ], unwrappedTags));
    const tags = reactive(unwrappedTags);

    const currentValue = ref('');
    const helpText = ref('');

    return {
      addTag: (event: KeyboardEvent) => {
        if (event.key === 'Enter' || event.key === ',') {
          const tag = (event.target as HTMLInputElement).value.replace(commaRegEx, '');
          const tagIndex = datalistItems.indexOf(tag);
          if (tagIndex > -1) {
            datalistItems.splice(tagIndex, 1);
            tags.push(tag);
            currentValue.value = '';
          } else {
            helpText.value = 'Invalid tag';
          }
        }
      },
      removeTag: (tag: string) => {
        const tagIndex = tags.indexOf(tag);
        if (tagIndex > -1) {
          tags.splice(tagIndex, 1);
          datalistItems.push(tag);
        }
      },
      currentValue,
      datalistId,
      datalistItems,
      helpText,
      tags,
    };
  },
});
</script>

<style lang="scss">
.tags-field {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
}
.tags-field-input {
  flex: 1;
}
</style>