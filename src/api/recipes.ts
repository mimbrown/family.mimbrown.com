import { inject, provide } from 'vue';
import { useSession } from './session';

export interface CategoryDefinitionLite {
  id: string;
  label: string;
}
export interface CategoryDefinition extends CategoryDefinitionLite {
  color: string;
  content: string;
}
export const categories = [{
  label: 'Appetizers',
  color: '170,108,57',
  content: 'For those first impressions',
  id: 'appetizer',
}, {
  label: 'Soups & Salads',
  color: '34,102,102',
  content: 'Dressed to impress',
  id: 'soupAndSalad',
}, {
  label: 'Side Dishes',
  color: '136,46,97',
  content: 'Because one is never enough',
  id: 'sideDish',
}, {
  label: 'Main Courses',
  color: '46,136,46',
  content: 'All aboard the gravy train',
  id: 'mainCourse',
}, {
  label: 'Desserts',
  color: '212,154,106',
  content: 'All’s well that ends well',
  id: 'dessert',
}, {
  label: 'Beverages',
  color: '64,127,127',
  content: 'Solids can’t have all the fun',
  id: 'beverage',
}, {
  label: 'Breads',
  color: '170,85,133',
  content: 'You’re gonna wish you had a tandoor',
  id: 'bread',
}] as const;
export type Category = typeof categories[number]['id'];

export const tags = [
  'quick',
  'easy',
  'cheap',
  'healthy',
  'fancy',
  'gluten-free',
  'dairy-free',
  'vegetarian',
] as const;
export type Tag = typeof tags[number];

interface KeyValue {
  key: string;
  value: string;
}

export interface RecipeId {
  id: string;
}

export interface RecipeLite {
  id: string;
  name: string;
  description: string;
  category: Category;
  tags: Tag[];
  createdTime: string;
}

export interface FullRecipe extends RecipeLite {
  ingredients: string[];
  steps: string[];
  meta: KeyValue[];
}

export type RecipeFields = Omit<FullRecipe, "id" | "createdTime">;

export interface ListOptions {
  filterByFormula?: string;
  maxRecords?: number;
  pageSize?: number;
  offset?: string;
}

export type CancelablePromise<T> = Promise<T> & { cancel: () => void };

export interface Recipes {
  records: RecipeLite[];
  offset?: string;
}

const fieldsKey = encodeURIComponent('fields[]');

const key = Symbol();

interface RecipeApi {
  getRecipes: (options?: ListOptions) => Promise<Recipes>;
  getRecipe: (id: string) => Promise<FullRecipe>;
  createRecipe: (fields: RecipeFields) => Promise<RecipeId>;
  editRecipe: (id: string, fields: Partial<RecipeFields>) => Promise<RecipeId>;
  deleteRecipe: (id: string) => Promise<RecipeId>;
}

export function provideRecipeApi() {
  const { runLambda } = useSession();

  provide<RecipeApi>(key, {
    getRecipes: (options: ListOptions = {}) =>
      runLambda<Recipes>('getRecipes', {
        query: [
          `${fieldsKey}=name&${fieldsKey}=description&${fieldsKey}=tags&${fieldsKey}=category`,
          ...Object
            .keys(options)
            .filter(key => options[key as keyof ListOptions])
            .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(options[key as keyof ListOptions]!)}`),
        ].join('&'),
      }),

    getRecipe: (id: string) =>
      runLambda<FullRecipe>('getRecipe', { id }),

    createRecipe: (fields: RecipeFields) =>
      runLambda<RecipeId>('createRecipe', fields),

    editRecipe: (id: string, fields: Partial<RecipeFields>) =>
      runLambda<RecipeId>('editRecipe', { id, fields }),

    deleteRecipe: (id: string) =>
      runLambda<RecipeId>('deleteRecipe', { id }),
  });
}

export function useRecipeApi() {
  return inject(key) as RecipeApi;
}
