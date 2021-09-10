<template>
  <ul class="recipe-categories">
    <li v-for="(item, index) of categories" :key="index" class="card" :style="{ '--primary': item.color }">
      <h6>{{ item.label }}</h6>
      <div class="content">
        {{item.content}}
      </div>
      <div style="flex:1"></div>
      <div class="actions">
        <router-link role="button" class="outlined" :to="`/recipes/browse?category=${item.id}`">Browse</router-link>
        <router-link v-if="isSignedIn" role="button" :to="`/recipes/new?category=${item.id}`">Create</router-link>
      </div>
    </li>
  </ul>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { categories } from '../api/recipes';
import { useSignInStatus } from '../api/session';

export default defineComponent({
  emits: ['set-title'],
  setup(props, { emit }) {
    emit('set-title', 'Recipes');
    return {
      categories,
      isSignedIn: useSignInStatus(),
    }
  },
});
</script>

<style lang="scss">
.recipe-categories {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1rem;
  padding: 16px;
  margin: 0;
  .card {
    border: 10px solid rgb(var(--primary));
    background-color: rgba(var(--primary), 0.2);
    a[role=button] {
      color: rgb(var(--primary));
    }
  }
}
</style>