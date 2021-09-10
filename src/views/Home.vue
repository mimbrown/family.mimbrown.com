<template>
  <header>
    <h6>Welcome</h6>
  </header>
  <main class="home">
    <p>
      This is the Brown Family's personal website. There's not much here right now; mostly just <router-link to="/recipes">recipes</router-link>, which are open for anyone to browse. If you're a family member, you can <router-link to="/login">sign in</router-link> to do more (like add or edit recipes). We're glad that you're here!
    </p>
  </main>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({});
</script>

<style lang="scss">
.home {
  padding: 16px;
  line-height: 1.4;
  a {
    color: rgb(var(--theme-primary));
  }
}
</style>
