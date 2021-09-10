<template>
  <div id="main-nav">
    <div id="main-nav-surface" :class="{ active: activeNav }">
      <button class="icon" @click="toggleNav" :title="activeNav ? 'Close menu' : 'Open menu'">
        <i class="material-icons">
          {{ activeNav ? 'close' : 'menu' }}
        </i>
      </button>
    </div>
  </div>
  <nav :class="{ active: activeNav }">
    <div class="menu-header">
      <h6 class="no-wrap">The Browns</h6>
    </div>
    <router-link
      class="menu-item menu-option"
      v-for="item of menuItems"
      :title="`Go to the ${item.text} page`"
      :key="item.link"
      :to="item.link"
      @click="close"
    >
      <div class="nav-link">
        <i class="material-icons">{{ item.icon }}</i>
      </div>
      <div class="menu-item-label">{{ item.text }}</div>
    </router-link>
    <div style="flex:1"></div>
    <a
      class="menu-item menu-option"
      href="javascript:void 0"
      @click="signOut"
      title="Sign out of the app"
      v-if="isSignedIn"
    >
      <div class="nav-link">
        <i class="material-icons">logout</i>
      </div>
      <div class="menu-item-label">Logout</div>
    </a>
    <router-link
      class="menu-item menu-option"
      :to="`/login?redirect=${route.path}`"
      title="Sign in to the app"
      @click="close"
      v-else
    >
      <div class="nav-link">
        <i class="material-icons">login</i>
      </div>
      <div class="menu-item-label">Login</div>
    </router-link>
  </nav>
  <div v-if="activeNav" class="mask" @click="toggleNav"></div>
  <router-view/>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';
import { useRoute } from 'vue-router';
import { provideSession } from './api/session';
import { useSnackbar } from './components/Snackbar.vue';

interface MenuItem {
  icon: string;
  text: string;
  link: string;
}

const menuItems: MenuItem[] = [{
  icon: 'home',
  text: 'Home',
  link: '/',
}, {
  icon: 'restaurant_menu',
  text: 'Recipes',
  link: '/recipes',
}];

export default defineComponent({
  setup() {
    const route = useRoute();
    const activeNav = ref(false);

    const { isSignedIn, signOut } = provideSession();
    const snackbar = useSnackbar();

    const close = () => activeNav.value = false;

    return {
      activeNav,
      close,
      route,
      menuItems,
      isSignedIn,
      signOut() {
        signOut();
        close();
        snackbar('You\'ve successfully logged out.');
      },
      toggleNav: (event: Event) => {
        (event.currentTarget as HTMLButtonElement)?.blur?.();
        activeNav.value = !activeNav.value;
      }
    };
  },
});
</script>

<style lang="scss">
:root {
  font-family: Roboto, sans-serif;
  --theme-primary: 170,57,57;
  --theme-on-primary: 255,255,255;
  --theme-secondary: 170,57,57;
  --theme-on-secondary: 255,255,255;
  --theme-background: 255,255,255;
  --theme-on-background: 0,0,0;
  --theme-surface: 245,245,245;
  --theme-on-surface: 0,0,0;
  --theme-error: 255,0,0;
  --theme-on-error: 255,255,255;
}
html {
  overflow-y: scroll;
}
nav {
  display: flex;
  flex-direction: column;
  background-color: rgb(var(--theme-background));
  z-index: 300;
  border-right: 1px solid rgb(0 0 0 / 20%);
  overflow: hidden auto;
  position: fixed;
  left: -100%;
  bottom: 0;
  top: 0;
  width: 80%;
  max-width: 200px;
  will-change: left;
}
nav.active {
  left: 0;
  transition: left 300ms;
}
.mask {
  background-color: rgb(0 0 0 / 50%);
  z-index: 200;
  position: fixed;
  left: 0;
  right: 0;
  top: 0;
  bottom: 0;
  cursor: pointer;
}
.menu-item {
  margin-top: 8px;
  display: flex;
  align-items: center;
}
.menu-option {
  cursor: pointer;
  user-select: none;
  text-decoration: none;
  color: rgb(var(--theme-on-background));
  &:hover {
    background-color: rgb(0 0 0 / 7%);
  }
}
.menu-header {
  height: 56px;
  display: flex;
  align-items: center;
  padding-left: 72px;
}
.menu-item-label {
  font-size: 18px;
  margin-left: 16px;
}
.nav-link {
  color: rgb(var(--theme-primary));
  display: flex;
  align-items: center;
  justify-content: center;
  width: 56px;
  height: 56px;
  flex: 0 0 56px;
}

$inset: 29.2893218813%;
$outset: 100% - 29.2893218813%;
#main-nav {
  position: fixed;
  z-index: 500;
}
#main-nav-surface {
  --primary: var(--theme-surface);
  --on-primary: var(--theme-on-surface);
  --surface: var(--theme-primary);
  --on-surface: var(--theme-on-primary);
  background-color: rgb(var(--theme-primary));
  color: rgb(var(--theme-on-primary));
  clip-path: polygon(
    0 0,
    $outset 0,
    100% $inset,
    100% $outset,
    $outset 100%,
    $inset 100%,
    0 $outset,
    0 100%,
  );
  display: flex;
  align-items: center;
  justify-content: center;
  width: 56px;
  height: 56px;
  &.active {
    background-color: rgb(var(--theme-background));
    --primary: var(--theme-primary);
  }
}
// .secondary-nav {
//   clip-path: polygon(
//     0 $inset,
//     $inset 0,
//     $outset 0,
//     100% $inset,
//     100% $outset,
//     $outset 100%,
//     $inset 100%,
//     0 $outset,
//   );
// }
// .session-nav {
//   clip-path: polygon(
//     0 $inset,
//     $inset 0,
//     $outset 0,
//     100% $inset,
//     100% $outset,
//     $outset 100%,
//     0 100%,
//   );
// }
header {
  --primary: var(--theme-primary);
  --on-primary: var(--theme-on-primary);
  --surface: var(--theme-surface);
  --on-surface: var(--theme-on-surface);
  background-color: rgb(var(--theme-background));
  color: rgb(var(--theme-on-background));
  /* background-color: rgb(var(--background));
  color: rgb(var(--on-background)); */
  padding-left: 72px;
}
a[href]:not([role=button]) {
  color: rgb(var(--theme-primary));
}
</style>
