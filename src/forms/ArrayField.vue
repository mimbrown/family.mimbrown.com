<template>
  <div class="array-field" ref="root">
    <ArrayFieldItem
      v-for="(item, index) in items"
      :key="item.key"
      :orderable="orderable"
      :order="index"
      dragGroup="meta"
      v-model:dropTarget="dropTarget"
      @delete="deleteItem"
      @swap="swap"
    >
      <slot
        :item="item"
        :index="index"
        :items="items"
        :wrapValue="wrapValue"
        :insertItem="insertItem"
      ></slot>
    </ArrayFieldItem>
    <div class="array-field-bottom">
      <button class="icon contained array-field-button" type="button" @click="addItem">
        <i class="material-icons">add</i>
      </button>
      <p v-if="isInErrorState" class="sublabel error">
        {{ errors[0] }}
      </p>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, nextTick, PropType, reactive, ref } from 'vue';
import { useFormField } from './forms';
import ArrayFieldItem from './ArrayFieldItem.vue';

export interface ValueWrapper<T> {
  key: number;
  value: T;
}

export default defineComponent({
  components: {
    ArrayFieldItem,
  },
  props: {
    name: {
      type: String,
      required: true,
    },
    creator: {
      type: Function as PropType<() => unknown>,
      required: true,
    },
    orderable: Boolean,
  },
  setup(props) {
    const nextKey = (() => {
      let key = 0;
      return () => key++;
    })();
    const wrapValue = (value: unknown) => ({ key: nextKey(), value });
    // eslint-disable-next-line prefer-const
    let unwrappedItems!: ValueWrapper<unknown>[];
    const {
      errors,
      initialValue,
      isInErrorState,
    } = useFormField(
      props.name,
      () => unwrappedItems.map(({ value }) => value),
    );
    unwrappedItems = initialValue?.map(wrapValue) || [];
    const items = reactive<ValueWrapper<unknown>[]>(unwrappedItems);

    function swap(a: number, b: number) {
      const itemA = items[a];
      const itemB = items[b];
      items[a] = itemB;
      items[b] = itemA;
    }

    const initNew = () => wrapValue(props.creator());

    const dropTarget = ref<number>();

    const root = ref<HTMLDivElement>();
    const focus = async (index: number) => {
      await nextTick();
      const div = root.value!.children[index];
      (div.children[1] as HTMLElement | undefined)?.focus();
    }

    return {
      root,
      addItem: () => items.push(initNew()),
      insertItem: (index: number) => {
        items.splice(index, 0, initNew());
        focus(index);
      },
      deleteItem: (index: number) => items.splice(index, 1),
      isInErrorState,
      errors,
      wrapValue,
      dropTarget,
      updateDropTarget: (index: number) => dropTarget.value = index,
      items,
      swap,
    };
  },
});
</script>

<style lang="scss">
.array-field-button {
  margin: 6px 8px 0 0;
  flex: none;
}
.array-field-bottom {
  display: flex;
}
</style>
