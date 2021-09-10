<script lang="ts">
import { createCommentVNode, defineComponent, h, ref, watch } from 'vue';
import { RouterLink, useRoute } from 'vue-router';
import { useRecipeApi, RecipeLite, Recipes } from '../api/recipes';
import format from '../utils/format';
import RecipeBrowseFilters from '../components/RecipeBrowseFilters.vue';
import Loader from '../components/Loader.vue';
import { useSignInStatus } from '../api/session';

const pageSize = 6;
const delayFactor = 150;

export default defineComponent({
  emits: ['set-title'],
  setup(props, { emit }) {
    emit('set-title', 'Browse');
    const route = useRoute();

    const { getRecipes } = useRecipeApi();
    
    const recipes = ref<RecipeLite[]>();
    const offset = ref<string>();
    const loadingMore = ref(false);

    const controller = {
      timer: null as null | number,
      currentPromise: null as null | Promise<Recipes>,
      request(filterByFormula: string) {
        if (this.currentPromise) {
          // this.currentPromise.cancel();
        }
        if (this.timer) {
          clearTimeout(this.timer);
        }
        this.timer = setTimeout(() => {
          recipes.value = undefined;
          offset.value = undefined;
          this.currentPromise = getRecipes({
            filterByFormula,
            pageSize,
          });
          this.currentPromise.then(data => {
            this.currentPromise = null;
            this.timer = null;
            recipes.value = data.records;
            offset.value = data.offset;
          });
        }, 300);
      },
      nextPage() {
        const pageOffset = offset.value;
        if (this.currentPromise || this.timer || !pageOffset) {
          return;
        }
        loadingMore.value = true;
        this.currentPromise = getRecipes({
          offset: pageOffset,
          pageSize,
        });
        this.currentPromise.then(data => {
          this.currentPromise = null;
          this.timer = null;
          if (recipes.value) {
            recipes.value.push(...data.records);
            offset.value = data.offset;
          }
        }).finally(() => loadingMore.value = false);
      }
    }
    watch(
      (): string => {
        const { category, name, tags } = route.query as { [key: string]: string };
        const filters = [];
        if (name) {
          filters.push(`FIND("${name.toLowerCase().replaceAll('"', '')}",LOWER({name})) != 0`);
        }
        if (category) {
          filters.push(`{category} = "${category}"`)
        }
        if (tags) {
          tags.split(',').forEach(tag => filters.push(`FIND("${tag}",ARRAYJOIN({tags},";")) != 0`))
        }
        return filters.length > 0 ? `AND(${filters.join(',')})` : '';
      },
      filterByFormula => {
        controller.request(filterByFormula);
      },
      { immediate: true },
    );

    return {
      recipes,
      offset,
      loadingMore,
      isSignedIn: useSignInStatus(),
      nextPage: () => controller.nextPage(),
    };
  },
  render() {
    const { isSignedIn } = this;
    const recipes = this.recipes?.map((recipe, index) =>
      h('li', {
        key: recipe.id,
        class: 'card appearing-card',
        style: `animation-delay:${(index % pageSize) * delayFactor}ms`,
      }, [
        h('h6', recipe.name),
        h('div', { class: 'content content-clamped', innerHTML: format(recipe.description) }),
        h('div', { style: 'flex:1' }),
        h('div', { class: 'actions' }, [
          h(RouterLink, { role: 'button', class: 'outlined', to: `/recipes/${recipe.id}` }, {
            default: () => 'View',
          }),
          isSignedIn
            ? h(RouterLink, { role: 'button', to: `/recipes/${recipe.id}/edit` }, {
              default: () => 'Edit',
            })
            : createCommentVNode('edit'),
        ]),
      ]),
    );
    if (recipes && this.offset) {
      const { loadingMore } = this;
      recipes.push(
        h('li', {
          key: 'load-more',
          class: 'card appearing-card load-more-card',
          style: `animation-delay:${pageSize * delayFactor}ms`,
          onClick: this.nextPage,
        }, [
          h('span', 'Load more...'),
          h('i', { class: 'material-icons' }, 'add'),
          loadingMore
            ? h('div', { class: 'load-more-mask' }, h(Loader))
            : createCommentVNode('load-mask'),
        ]),
      );
    }
    return h('div', { class: 'recipe-browse' }, [
      h(RecipeBrowseFilters),
      recipes
        ? h('ul', { class: 'recipes-list' }, recipes)
        : h('div', { class: 'recipes-list-loader' }, h(Loader)),
    ]);
  },
});
</script>

<style lang="scss">
.recipes-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1rem;
  padding: 16px;
  margin: 0;
}
.recipes-list-loader {
  flex: 1;
  margin-top: 32px;
}
.content-clamped {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
}
@keyframes appear {
  from { opacity: 0; }
  to { opacity: 1; }
}
.appearing-card {
  opacity: 0;
  animation: 400ms appear forwards;
}
.load-more-card {
  background-color: transparent;
  justify-content: center;
  align-items: center;
  padding: 24px;
  color: gray;
  user-select: none;
  cursor: pointer;
  i {
    font-size: 36px;
  }
  position: relative;
}
.load-more-mask {
  position: absolute;
  left: 0;
  right: 0;
  top: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: rgb(255 255 255 / 80%);
}
</style>
