<script lang="ts">
import { defineComponent, h, ref } from 'vue';
import { useRoute } from 'vue-router';
import { FullRecipe, useRecipeApi } from '../api/recipes';
import RecipeComponent from '../components/Recipe.vue';
import NotFound from '../components/NotFound.vue';

export default defineComponent({
  emits: ['set-title'],
  setup(props, { emit }) {
    const recipe = ref<FullRecipe>();
    const error = ref<string>();
    const route = useRoute();
    useRecipeApi().getRecipe(route.params.recipeId as string)
      .then(value => {
        recipe.value = value;
        emit('set-title', value.name);
      })
      .catch(() => error.value = 'Huh, for someone reason we can\'t find that recipe.');
    return {
      error,
      recipe,
    };
  },
  render() {
    if (this.recipe) {
      return h(RecipeComponent, {
        recipe: this.recipe,
      });
    }
    if (this.error) {
      return h(NotFound, h('p', this.error));
    }
    return h('p');
  },
});
</script>
