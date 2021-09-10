<script lang="ts">
import { computed, defineComponent, h, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { categories, CategoryDefinitionLite, Tag } from '../api/recipes';
import TextInput from '../forms/TextInput.vue';
import TagSelector from '../components/TagSelector.vue';

const categoryOptions: CategoryDefinitionLite[] = [
  { label: 'All', id: 'all' },
  ...categories,
];

const getCategory = (category: string) => categories.find(c => c.id === category);

export default defineComponent({
  emits: [],
  setup() {
    const route = useRoute();
    const router = useRouter();
    const updateParam = (key: string, value?: string) => {
      const query = {...route.query};
      if (value) {
        query[key] = value;
      } else {
        delete query[key];
      }
      router.replace({ query });
    }

    const isActive = ref(false);

    const searchSummary = computed(() => {
      const { category, name, tags } = route.query as { [key: string]: string };
      let str = 'Showing all ' + (getCategory(category)?.label.toLowerCase() || 'recipes');
      if (tags) {
        str += ` tagged with ${tags.split(',').map(tag => `<span class="chip-summary">${tag}</span>`).join(' ')}`;
      }
      if (name) {
        str += ` where the name contains "${name}"`;
      }
      return str;
    });

    return {
      route,
      isActive,
      searchSummary,
      setCategory: (event: Event) => {
        const newCategory = (event.target as HTMLSelectElement).value;
        updateParam('category', getCategory(newCategory) ? newCategory : undefined);
      },
      setName: (newName: string) => updateParam('name', newName),
      setTags: (newTags: Tag[]) => updateParam('tags', newTags.join(',')),
      toggleActive: () => isActive.value = !isActive.value,
    };
  },
  render() {
    const { route } = this;
    return h('div', { class: 'recipe-browse-filters' }, [
      h('p', { class: 'search-summary', onClick: this.toggleActive }, [
        h('i', { class: 'material-icons' }, this.isActive ? 'remove' : 'add'),
        h('span', { innerHTML: this.searchSummary }),
      ]),
      h('div', { class: ['recipe-browse-fields', { active: this.isActive }] }, [
        h(TextInput, {
          label: 'Name',
          modelValue: route.query.name as string,
          'onUpdate:modelValue': this.setName,
        }),
        h('label', { class: 'text' }, [
          h('select', { value: route.query.category || 'all', onChange: this.setCategory },
            categoryOptions.map(option => h('option', { key: option.id, value: option.id }, option.label)),
          ),
          h('span', { class: 'label-text' }, 'Category'),
        ]),
        h(TagSelector, {
          'onUpdate:modelValue': this.setTags,
          initialValue: (route.query.tags as string | undefined)?.split(',') || [],
        }),
      ]),
    ]);
  },
});
</script>

<style lang="scss">
.search-summary {
  margin: 0;
  font-size: 18px;
  display: flex;
  align-items: center;
  cursor: pointer;
  user-select: none;
  i {
    margin-inline-end: 8px;
  }
}
.chip-summary {
  height: 24px;
  display: inline-flex;
  align-items: center;
  padding: 0 9px;
  border-radius: 12px;
  font-size: 0.8em;
  background-color: whitesmoke;
}
.recipe-browse-filters {
  padding: 16px;
}
.recipe-browse-fields {
  display: none;
  flex-wrap: wrap;
  gap: 12px;
  margin-top: 16px;
  &.active {
    display: flex;
  }
  .text {
    flex: 1;
    // max-width: 400px;
  }
}
</style>
