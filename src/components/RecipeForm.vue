<template>
  <form class="recipe-form" @submit="onSubmit">
    <p class="form-error-message" v-if="isInErrorState">
      It looks like something is missing. Please fix the errors below and resubmit.
    </p>
    <div class="field-grid">
      <TextField label="Name" name="name" />
      <CategoryField label="Category" name="category" />
    </div>
    <MultiLineField label="Description" name="description" />
    <h5>Tags</h5>
    <TagsField label="Tags" name="tags" />
    <h5>Ingredients</h5>
    <ArrayField name="ingredients" :creator="textCreator" orderable>
      <template v-slot="{ item, index, items, wrapValue, insertItem }">
        <MultiLineInput
          label="Ingredient"
          :modelValue="item.value"
          @update:modelValue="item.value = $event"
          @paste="splitPaste($event, items, index, wrapValue)"
          @enter="insertItem(index + 1)"
        />
      </template>
    </ArrayField>
    <h5>Steps</h5>
    <ArrayField name="steps" :creator="textCreator" orderable>
      <template v-slot="{ item, index, items, wrapValue, insertItem }">
        <MultiLineInput
          :label="`Step ${index + 1}`"
          :modelValue="item.value"
          @update:modelValue="item.value = $event"
          @paste="splitPaste($event, items, index, wrapValue)"
          @enter="insertItem(index + 1)"
        />
      </template>
    </ArrayField>
    <h5>Meta Labels</h5>
    <ArrayField name="meta" :creator="metaCreator" orderable>
      <template v-slot="{ item }">
        <KeyValueField v-model:modelKey="item.value.key" v-model:modelValue="item.value.value" />
      </template>
    </ArrayField>
    <div class="form-actions">
      <button v-if="recipeId" class="outlined recipe-delete" @click="onDelete">Delete</button>
      <input role="button" class="contained recipe-submit" type="submit" :value="submitText">
    </div>
  </form>
  <!-- <footer>

  </footer> -->
</template>

<script lang="ts">
import { computed, defineComponent, PropType } from 'vue';
import { FullRecipe, RecipeFields } from '../api/recipes';
import { useFormContainer, value } from '../forms/forms';
import TextField from '../forms/TextField.vue';
import CategoryField from '../forms/CategoryField.vue';
import MultiLineField from '../forms/MultiLineField.vue';
import MultiLineInput from '../forms/MultiLineInput.vue';
import KeyValueField from './KeyValueField.vue';
import ArrayField, { ValueWrapper } from '../forms/ArrayField.vue';
import TagsField from './TagsField.vue';

const newLineRegEx = /\r?\n/g;

export default defineComponent({
  emits: ['save', 'delete'],
  components: {
    ArrayField,
    KeyValueField,
    MultiLineInput,
    MultiLineField,
    CategoryField,
    TextField,
    TagsField,
  },
  props: {
    recipeId: String,
    recipeCreatedTime: Object as PropType<Date>,
    prefill: Object as PropType<Partial<RecipeFields>>,
  },
  setup(props, { emit }) {
    const initialValues: Partial<RecipeFields> = props.prefill || {};
    const submitText = computed(() => props.recipeId ? 'Save Changes' : 'Save Recipe');
    const {
      isInErrorState,
      getValues,
    } = useFormContainer({
      name: value(initialValues.name || '').required(),
      category: value(initialValues.category || 'appetizer').required(),
      tags: value(initialValues.tags || []),
      description: value(initialValues.description || '').required(),
      ingredients: value(initialValues.ingredients || [''])
        .validate(
          list => list?.length === 0
            ? 'At least one ingredient is required'
            : undefined,
          list => list?.findIndex(ingredient => !ingredient) === -1
            ? undefined
            : 'Empty ingredients are not allowed',
        ),
      steps: value(initialValues.steps || [''])
        .validate(
          list => list?.length === 0
            ? 'At least one step is required'
            : undefined,
          list => list?.findIndex(step => !step) === -1
            ? undefined
            : 'Empty steps are not allowed',
        ),
      meta: value(initialValues.meta || [
        { key: 'servings', value: '' },
      ]),
    });
    return {
      isInErrorState,
      metaCreator: () => ({ key: '', value: '' }),
      textCreator: () => '',
      submitText,
      onDelete(event: Event) {
        event.preventDefault();
        emit('delete', props.recipeId);
      },
      onSubmit(event: Event) {
        event.preventDefault();
        const values = getValues();
        if (values) {
          emit('save', values);
        } else {
          scrollTo({ top: 0 });
        }
      },
      splitPaste(
        event: ClipboardEvent,
        items: ValueWrapper<string>[],
        index: number,
        wrapValue: (value: string) => ValueWrapper<string>,
      ) {
        const text = event.clipboardData!.getData('text/plain');
        if (newLineRegEx.test(text)) {
          event.preventDefault();
          const toInsert = text
            .split(newLineRegEx)
            .filter(i => i)
            .map(wrapValue);
          items.splice(index, 1, ...toInsert);
        }
      },
      // recipe: props.recipe,
    };
  },
});
</script>

<style lang="scss">
.recipe-form {
  max-width: 600px;
  margin: 0 auto;
  padding: 8px;
  > * {
    margin-top: 16px;
  }
}
.form-actions {
  display: flex;
  gap: 16px;
}
.recipe-submit {
  display: block;
  min-height: auto;
  flex: 1;
}
.recipe-delete {
  display: block;
  flex: 1;
}
.form-error-message {
  color: rgb(var(--primary));
}
.field-grid {
  display: flex;
  flex-wrap: wrap;
  // grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  > * {
    flex: 1;
    min-width: 200px;
    max-width: 500px;
  }
  gap: 1rem;
}
</style>