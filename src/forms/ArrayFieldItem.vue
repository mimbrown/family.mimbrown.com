<template>
  <div
    class="array-field-item"
    :class="{ 'drop-target': isDropTarget }"
    ref="root"
    @dragover="onDragOver"
    @dragenter="onDragEnter"
    @drop="onDrop"
    @dragstart="onDragStart"
    @dragend="onDragEnd"
  >
    <button class="icon array-field-button" type="button" @click="deleteItem">
      <i class="material-icons">close</i>
    </button>
    <slot></slot>
    <div v-if="orderable" class="drag-handle" @mousedown="onMouseDown">
      <i class="material-icons">drag_indicator</i>
    </div>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, ref } from 'vue';

export default defineComponent({
  props: {
    order: {
      type: Number,
      required: true,
    },
    orderable: Boolean,
    dragGroup: String,
    dropTarget: Number,
  },
  emits: ['delete', 'swap', 'update:dropTarget'],
  setup(props, { emit }) {
    const root = ref<HTMLDivElement>();

    return {
      root,
      deleteItem: () => emit('delete', props.order),
      isDropTarget: computed(() => props.dropTarget === props.order),
      onDragOver: (event: DragEvent) => event.preventDefault(),
      onDragEnter: () => emit('update:dropTarget', props.order),
      onDrop: (event: DragEvent) => {
        const data = event.dataTransfer!.getData('text/plain');
        const dataKey = `${props.dragGroup}-`;
        if (data.startsWith(dataKey)) {
          emit('swap', props.order, parseInt(data.replace(dataKey, '')));
        }
      },
      onDragStart: (event: DragEvent) => {
        const dataTransfer = event.dataTransfer!;
        dataTransfer.dropEffect = 'move';
        dataTransfer.effectAllowed = 'move';
        dataTransfer.setData('text/plain', `${props.dragGroup}-${props.order}`);
        emit('update:dropTarget', props.order);
      },
      onDragEnd: () => {
        root.value!.draggable = false;
        emit('update:dropTarget');
      },
      onMouseDown: () => {
        root.value!.draggable = true;
      },
    };
  },
});
</script>

<style lang="scss">
.array-field-item {
  display: flex;
  margin: 4px 0;
  > * {
    flex: 1;
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
