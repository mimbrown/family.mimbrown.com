<script lang="ts">
import { defineComponent, h } from 'vue';
import { Tag } from '../api/recipes';
import TagSelector from './TagSelector.vue';
import { useFormField } from '../forms/forms';

export default defineComponent({
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
    let selectedTags: Tag[] | undefined;
    const {
      initialValue
    } = useFormField(props.name, () => selectedTags || []);
    selectedTags = initialValue;

    return {
      initialValue,
      update: (tags: Tag[]) => selectedTags = tags,
    };
  },

  render() {
    const { initialValue, update } = this;
    return h(TagSelector, {
      initialValue,
      'onUpdate:modelValue': update,
    });
  }
});
</script>

<style lang="scss">
// .tags-field {
//   display: flex;
//   flex-wrap: wrap;
//   align-items: center;
// }
// .tags-field-input {
//   flex: 1;
// }
</style>