<script lang="ts">
import { createCommentVNode, defineComponent } from 'vue';
import { useRoute } from 'vue-router';

export default defineComponent({
  setup() {
    const route = useRoute();
    return {
      route,
    };
  },
  render() {
    return this.route.meta.actions?.() ?? createCommentVNode();
  },
});
</script>