<script lang="ts">
import { defineComponent, h, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { RecipeFields, useRecipeApi } from '../api/recipes';
import RecipeForm from '../components/RecipeForm.vue';
import NotFound from '../components/NotFound.vue';
import Loader from '../components/Loader.vue';
import { useDialog } from '../components/Dialog.vue';
import { useSnackbar } from '../components/Snackbar.vue';

function isEqual(a: any, b: any): boolean {
  if (Array.isArray(a)) {
    return a.length === b.length && a.every((item, index) => isEqual(item, b[index]));
  } else if (typeof a === 'object') {
    return Object.keys(a).every(key => isEqual(a[key], b[key]));
  }
  return a === b;
}

export default defineComponent({
  emits: ['set-title'],
  setup(props, { emit }) {
    emit('set-title', 'Recipe Editor');
    const { getRecipe, editRecipe, deleteRecipe } = useRecipeApi();
    const snackbar = useSnackbar();
    const prefill = ref<RecipeFields>();
    const recipeId = ref<string>();
    const recipeCreatedTime = ref<Date>();
    const error = ref<string>();
    const route = useRoute();
    const router = useRouter();
    const dialog = useDialog();
    getRecipe(route.params.recipeId as string)
      .then(({ id, createdTime, ...fields }) => {
        prefill.value = fields;
        recipeId.value = id;
        recipeCreatedTime.value = new Date(createdTime);
      })
      .catch(() => error.value = 'Huh, for someone reason we can\'t find that recipe.');
    return {
      prefill,
      recipeId,
      recipeCreatedTime,
      error,
      async save(fields: RecipeFields) {
        const initialValues = prefill.value!;
        const toSave: Partial<RecipeFields> = {};
        for (const k in initialValues) {
          if (!isEqual(
            initialValues[k as keyof RecipeFields],
            fields[k as keyof RecipeFields],
          )) {
            toSave[k as keyof RecipeFields] = fields[k as keyof RecipeFields] as any;
          }
        }
        if (Object.keys(toSave).length > 0) {
          try {
            await editRecipe(recipeId.value!, toSave);
          } catch (err) {
            console.error(err);
            return;
          }
        }
        router.push(`/recipes/${recipeId.value!}`);
      },
      async onDelete(id: string) {
        if (await dialog.deleteDialog('Are you sure?')) {
          try {
            await deleteRecipe(id);
            router.push('/recipes');
            snackbar('Your recipe has been deleted.');
          } catch (err) {
            console.error(err);
          }
        }
      }
    };
  },
  render() {
    if (this.recipeId) {
      return h(RecipeForm, {
        prefill: this.prefill,
        recipeId: this.recipeId,
        recipeCreatedTime: this.recipeCreatedTime,
        onSave: this.save,
        onDelete: this.onDelete,
      });
    }
    if (this.error) {
      return h(NotFound, h('p', this.error));
    }
    return h(Loader, { style: 'margin-top:32px' });
  },
});
</script>
