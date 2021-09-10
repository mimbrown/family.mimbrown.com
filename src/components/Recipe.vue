<template>
  <!-- <h2>{{ recipe.name }}</h2> -->
  <section class="recipe-meta">
    <div class="recipe-meta-item" v-for="item of recipe.meta" :key="item.key">
      <dt>{{ item.key }}</dt>
      <dd>{{ item.value }}</dd>
    </div>
  </section>
  <p class="recipe-description" v-html="format(recipe.description)"></p>
  <section ref="mainElement" class="recipe-main">
    <section class="ingredients">
      <h4>Ingredients</h4>
      <ul>
        <li v-for="(ingredient, index) in recipe.ingredients" :key="index" v-html="format(ingredient)">
        </li>
      </ul>
    </section>
    <section class="directions">
      <h4>Directions</h4>
      <ol>
        <li v-for="(step, index) in recipe.steps" :key="index" v-html="format(step)">
        </li>
      </ol>
    </section>
  </section>
  <div class="recipe-tags">
    Tagged with:
    <div
      v-for="tag of recipe.tags"
      :key="tag"
      class="chip active"
    >
      {{ tag }}
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, onMounted, PropType, ref } from 'vue';
import { FullRecipe } from '../api/recipes';
import { measurements } from '../utils/measurement';
import format from '../utils/format';
import { Fraction } from '../utils/fraction';

export default defineComponent({
  emits: ['set-conversion'],
  props: {
    recipe: {
      type: Object as PropType<FullRecipe>,
      required: true,
    },
  },
  setup(props, { emit }) {
    const mainElement = ref<HTMLElement>();

    function showPopup(this: HTMLElement): void {
      emit('set-conversion', Fraction.fromString(this.dataset.value as string), this.dataset.type as string);
    }
    onMounted(() => {
      mainElement.value?.querySelectorAll('.measurement').forEach((span) => {
        span.addEventListener('click', showPopup);
      });
    });
    return {
      measurements,
      mainElement,
      format,
      // recipe: props.recipe,
    };
  },
});
</script>

<style lang="scss">
.ingredients {
  sub,sup {
    font-size: 0.5em;
  }
  sub {
    vertical-align: 0;
  }
  sup {
    vertical-align: 0.6em;
  }
}
.recipe-meta {
  padding: 16px 16px 0;
  display: flex;
  justify-content: space-around;
  flex-wrap: wrap;
  margin-bottom: -8px;
}
.recipe-meta-item {
  text-align: center;
  margin-bottom: 8px;
  dt {
    text-transform: uppercase;
    font-weight: bold;
  }
  dd {
    display: inline;
    margin-inline-start: 0;
  }
}
.recipe-tags {
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
  justify-content: center;
  align-items: center;
  padding: 16px;
}
.recipe-main {
  padding: 16px 16px 8px;
  // display: grid;
  // grid-template-columns: minmax(100%, 400px) repeat(auto-fill, minmax(400px, 1fr));
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
}
.recipe-description {
  padding: 16px;
  border-top: 2px solid rgb(var(--primary));
  text-align: center;
  font-style: italic;
  // border-bottom: 2px dotted rgb(var(--primary));
}
.ingredients {
  flex: 1;
  max-width: 400px;
  padding: 14px 16px 16px 14px;
  border-top: 2px solid rgb(var(--primary));
  border-left: 2px solid rgb(var(--primary));
  // border-bottom-right-radius: 16px;
}
.directions {
  flex: 1;
  padding: 16px 14px 14px 16px;
  border-bottom: 2px solid rgb(var(--primary));
  border-right: 2px solid rgb(var(--primary));
  // border-top-left-radius: 16px;
}
.measurement {
  color: rgb(var(--primary));
  cursor: pointer;
}
.quick-conversion {
  position: absolute;
  background-color: rgb(var(--background));
}
</style>