<script lang="ts">
import { createCommentVNode, defineComponent, Fragment, h, inject, provide, ref } from 'vue';

const key = Symbol();

const Snackbar = defineComponent({
  render() {
    return h('aside', { class: 'snackbar-wrapper'},
      h('div', { class: 'snackbar' },
        this.$slots.default!(),
      ),
    );
  },
});

type UseSnackbar = (text: string) => void;

export function useSnackbarContainer() {
  const snackbarText = ref<string>();

  const close = () => {
    snackbarText.value = undefined;
  }

  let timer: number | undefined;

  provide<UseSnackbar>(key, (text: string) => {
    if (timer) {
      clearTimeout(timer);
    }
    snackbarText.value = text;
    timer = setTimeout(close, 5000);
  });

  return () => snackbarText.value
    ? h(Snackbar, { key: snackbarText.value }, { default: () => snackbarText.value })
    : createCommentVNode('snackbar');
}

export const useSnackbar = () => inject(key) as UseSnackbar;

export default defineComponent({
  setup() {
    return {
      build: useSnackbarContainer(),
    };
  },
  render() {
    return h(Fragment, [
      this.build(),
      this.$slots.default!(),
    ]);
  }
});
</script>

<style lang="scss">
@keyframes slide-up {
  from { transform: translateY(72px); }
  to { transform: translateY(0); }
}

.snackbar-wrapper {
  position: fixed;
  bottom: 12px;
  left: 0;
  width: 100%;
  z-index: 2000;
  padding: 0 12px;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.snackbar {
  background-color: #323232;
  padding: 16px;
  color: #c7c7c7;
  min-height: 48px;
  // min-width: 344px;
  max-width: calc(100% - 24px);
  display: flex;
  align-items: center;
  border-radius: 4px;
  animation: 300ms slide-up;
}
</style>
