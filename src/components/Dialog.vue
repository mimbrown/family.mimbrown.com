<script lang="ts">
import { createCommentVNode, defineComponent, Fragment, h, inject, PropType, provide, ref, VNode } from 'vue';

const key = Symbol();

interface Action {
  text: string;
  handler?: () => void;
  disabled?: () => boolean;
}

const Dialog = defineComponent({
  emits: ['close'],
  props: {
    actions: Array as PropType<Action[]>,
  },
  render() {
    const { actions } = this;
    const { title, body } = this.$slots;
    const items = [];
    if (title) {
      items.push(h('h6', title()));
    }
    if (body) {
      items.push(
        h('div', { class: 'dialog-body' }, body()),
      );
    }
    if (actions) {
      items.push(
        h('div', { class: 'dialog-actions' }, actions.map(action =>
          h('button', {
            onClick: () => {
              this.$emit('close');
              action.handler?.();
            },
            disabled: action.disabled?.() ?? false,
          }, action.text),
        )),
      );
    }
    return h('div', { class: 'dialog-container' },
      h('div', { class: 'dialog' }, items),
    );
  },
});

interface DialogCreators {
  deleteDialog(title: string): Promise<boolean>;
  dialog(options: DialogOptions): () => void;
}

type Slot = (() => VNode | string) | undefined;
interface DialogOptions {
  body?: Slot,
  title?: Slot,
  actions?: Action[],
}

export function useDialogContainer() {
  const active = ref(false);

  const onClose = () => {
    active.value = false;
  }

  let actions: Action[] | undefined;
  let body: Slot;
  let title: Slot;

  provide<DialogCreators>(key, {
    deleteDialog(dialogTitle: string) {
      return new Promise(resolve => {
        title = () => dialogTitle;
        body = undefined;
        actions = [{
          text: 'Cancel',
          handler: () => resolve(false),
        }, {
          text: 'Delete',
          handler: () => resolve(true),
        }];
        active.value = true;
      });
    },
    dialog(options: DialogOptions) {
      ({ body, title, actions } = options);
      active.value = true;
      return onClose;
    },
  });

  return () => active.value
    ? h(Dialog, { onClose, actions }, { title, body })
    : createCommentVNode('dialog');
}

export const useDialog = () => inject(key) as DialogCreators;

export const DialogContainer = defineComponent({
  setup() {
    return {
      build: useDialogContainer(),
    };
  },
  render() {
    return h(Fragment, [
      this.build(),
      this.$slots.default!(),
    ]);
  }
});

export default Dialog;
</script>

<style lang="scss">
.dialog-container {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  top: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 700;
  background-color: rgb(0 0 0 / 50%);
}
.dialog {
  background-color: rgb(var(--theme-background));
  width: 280px;
  border-radius: 4px;
  box-shadow: 0px 11px 15px -7px rgb(0 0 0 / 20%), 0px 24px 38px 3px rgb(0 0 0 / 14%), 0px 9px 46px 8px rgb(0 0 0 / 12%);
  padding: 0 24px 8px;
  h6 {
    height: 64px;
    display: flex;
    align-items: center;
  }
}
.dialog-body {
  padding: 0 0 16px;
}
.dialog-actions {
  display: flex;
  justify-content: flex-end;
  margin: 0 -16px;
}
</style>
