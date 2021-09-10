<script lang="ts">
import { defineComponent, h } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { categories, Category, useRecipeApi, RecipeFields } from '../api/recipes';
import RecipeForm from '../components/RecipeForm.vue';

export default defineComponent({
  emits: ['set-title'],
  setup(props, { emit }) {
    emit('set-title', 'Create a Recipe');
    const { category } = useRoute().query as Record<string, string>;
    const router = useRouter();
    const { createRecipe } = useRecipeApi();
    const prefill: Partial<RecipeFields> = {};
    if (category && categories.some(c => c.id === category)) {
      prefill.category = category as Category;
    }
    return {
      prefill,
      async save(fields: RecipeFields) {
        try {
          const { id } = await createRecipe(fields);
          router.push(`/recipes/${id}`);
        } catch (err) {
          console.error(err);
        }
      },
    };
  },
  render() {
    return h(RecipeForm, { onSave: this.save, prefill: this.prefill });
  },
});
</script>
