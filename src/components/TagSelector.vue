<script lang="ts">
import { defineComponent, h, PropType, reactive } from 'vue';
import { tags } from '../api/recipes';

export default defineComponent({
  emits: ['update:modelValue'],
  props: {
    initialValue: {
      type: Array as PropType<string[]>,
      default: () => [],
    }
  },

  setup(props, { emit }) {
    const selectedItems = reactive(new Set([...props.initialValue]));

    return {
      selectedItems,
      toggle: (tag: string) => {
        if (selectedItems.has(tag)) {
          selectedItems.delete(tag);
        } else {
          selectedItems.add(tag);
        }
        emit('update:modelValue', Array.from(selectedItems));
      }
    }
  },

  render() {
    const { selectedItems } = this;
    return h('div', { class: 'tag-container' },
      tags.map(tag => h('div', {
        class: ['chip', { active: selectedItems.has(tag) }],
        key: tag,
        onClick: () => this.toggle(tag),
      }, tag)),
    );
  },
});
</script>

<style lang="scss">
.tag-container {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}
.chip {
  height: 32px;
  display: inline-flex;
  align-items: center;
  padding: 0 12px;
  border-radius: 16px;
  background-color: whitesmoke;
  user-select: none;
  cursor: pointer;
  // i {
  //   margin: 0 -4px 0 8px;
  //   font-size: 18px;
  //   cursor: pointer;
  // }
  &.active {
    background-color: rgb(var(--primary));
    color: rgb(var(--on-primary));
  }
}
</style>
