import { createRouter, createWebHistory, RouteRecordRaw, RouterLink, useRoute } from 'vue-router';
import Home from '../views/Home.vue';
import Recipes from '../views/Recipes.vue';
import RecipeCategories from '../components/RecipeCategories.vue';
import Recipe from '../views/Recipe.vue';
import RecipeEditor from '../views/RecipeEditor.vue';
import RecipeCreator from '../views/RecipeCreator.vue';
import BrowseCategory from '../views/BrowseCategory.vue';
import SessionBase from '../views/SessionBase.vue';
import Login from '../views/Login.vue';
import CreatePassword from '../views/CreatePassword.vue';
import { createCommentVNode, defineComponent, h, VNode } from 'vue';
import { useSignInStatus } from '../api/session';

declare module 'vue-router' {
  interface RouteMeta {
    actions?: () => VNode;
  }
}

const EditRecipe = defineComponent({
  setup() {
    return {
      route: useRoute(),
      isSignedIn: useSignInStatus(),
    }
  },
  render() {
    return this.isSignedIn ? h(RouterLink, {
      role: 'button',
      class: 'icon',
      title: 'Edit this recipe',
      to: `/recipes/${this.route.params.recipeId}/edit`,
    }, {
      default: () => h('i', { class: 'material-icons' }, 'edit'),
    }) : createCommentVNode();
  },
});

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    component: Home,
  },
  {
    path: '/login',
    component: SessionBase,
    children: [
      {
        path: '',
        component: Login,
      },
      {
        path: 'new-password',
        component: CreatePassword,
      },
    ],
  },
  {
    path: '/recipes',
    // component: () => import(/* webpackChunkName: "about" */ '../views/About.vue')
    component: Recipes,
    children: [
      {
        path: '',
        component: RecipeCategories,
        // meta: {
        //   actions: [
        //     () => h(RouterLink, {
        //       role: 'button',
        //       class: 'icon',
        //       to: '/recipes/new',
        //     }, h('i', { class: 'material-icons' }, 'create')),
        //   ],
        // },
      },
      {
        path: 'browse',
        component: BrowseCategory,
      },
      {
        path: 'new',
        component: RecipeCreator,
      },
      {
        path: ':recipeId',
        component: Recipe,
        meta: {
          actions: () => h(EditRecipe),
        },
      },
      {
        path: ':recipeId/edit',
        component: RecipeEditor,
      },
    ]
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
