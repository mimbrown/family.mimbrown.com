<script lang="ts">
import uuid from '@/utils/uuid';
import { defineComponent, h, PropType, reactive, ref, VNode } from 'vue';
import { useFormField } from './forms';

function beginDrag(event: MouseEvent) {
  (event.currentTarget as HTMLDivElement).parentElement!.draggable = true;
}
function onDragOver(event: DragEvent) {
  event.preventDefault();
}

interface ValueWrapper<T> {
  key: string;
  value: T;
}

export default defineComponent({
  props: {
    name: {
      type: String,
      required: true,
    },
    builder: {
      type: Function as PropType<(value: unknown, setter: (newValue: unknown) => void) => VNode>,
      required: true,
    },
    creator: {
      type: Function as PropType<() => unknown>,
      required: true,
    },
    orderable: Boolean,
  },
  setup(props) {
    // eslint-disable-next-line prefer-const
    let items!: ValueWrapper<unknown>[];
    const {
      // errors,
      initialValue,
      // isInErrorState,
    } = useFormField(
      props.name,
      () => items.map(({ value }) => value),
    );
    items = reactive<ValueWrapper<unknown>[]>(
      initialValue?.map(value => ({ key: uuid(), value })) || [],
    );

    const dTarget = ref<number>();

    const onDragEnd = (event: DragEvent) => {
      (event.currentTarget as HTMLDivElement).draggable = false;
      dTarget.value = undefined;
    };

    function swap(a: number, b: number) {
      const itemA = items[a];
      const itemB = items[b];
      items[a] = itemB;
      items[b] = itemA;
    }

    return {
      addItem: () =>
        items.push({ key: uuid(), value: props.creator() }),
      items,
      itemBuilder: ({ key, value }: ValueWrapper<unknown>, i: number) => {
        const children: VNode[] = [
          h('button', { class: 'icon contained array-field-icon', type: 'button' },
            h('i', { class: 'material-icons' }, 'close'),
          ),
          props.builder(value, (newValue: unknown) => items[i].value = newValue),
        ];
        if (props.orderable) {
          children.push(
            h('div', { class: 'drag-handle', onMouseDown: beginDrag },
              h('i', { class: 'material-icons' }, 'drag_indicator'),
            ),
          );
        }
        return h('div', {
          class: {
            'array-field-item': true,
            'drop-target': i === dTarget.value,
          },
          key,
          onDragOver,
          onDragEnter: () => {
            dTarget.value = i;
          },
          onDrop(event: DragEvent) {
            const source = parseInt(event.dataTransfer!.getData('text/plain'));
            if (i !== source) {
              swap(i, source);
            }
          },
          onDragStart: (event: DragEvent) => {
            event.dataTransfer!.dropEffect = 'move';
            event.dataTransfer!.effectAllowed = 'move';
            event.dataTransfer!.setData('text/plain', i.toString());
            dTarget.value = i;
          },
          onDragEnd,
        }, children);
      },
    };
  },
  render() {
    const children: VNode[] = this.items.map(this.itemBuilder);
    children.push(h('button', { class: 'icon contained array-field-add', type: 'button', onClick: this.addItem },
      h('i', { class: 'material-icons' }, 'add'),
    ));
    return h('div', { class: 'array-field' }, children);
  },
});
</script>

<style lang="scss">
.array-field-add {
  margin-top: 4px;
}
.array-field-item {
  display: flex;
  margin: 4px 0;
  > * {
    flex: 1;
  }
  .array-field-icon {
    margin: 4px 8px 0 0;
    flex: none;
  }
  .drag-handle {
    flex: none;
    align-self: center;
    cursor: grab;
  }
  &.drop-target {
    background-color: rgba(var(--primary),.12);
  }
}
</style>
