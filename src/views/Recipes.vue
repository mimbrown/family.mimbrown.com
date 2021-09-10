<template>
  <header class="recipes-header">
    <div class="recipes-header-wrap">
      <h6>{{ title }}</h6>
      <div class="secondary-actions">
        <HeaderActions />
        <button
          :class="{ icon: true, contained: conversionsActive }"
          @click="conversionsActive = !conversionsActive"
          title="Show/hide conversions"
        >
          <i class="material-icons">table_chart</i>
        </button>
      </div>
    </div>
  </header>
  <main>
    <div v-if="conversionsActive" class="conversions">
      <label class="text">
        <select :value="measurementCategory" @change="onCategoryChange">
          <option v-for="category of measurementCategories" :key="category" :value="category">
            {{ category.toUpperCase() }}
          </option>
        </select>
        <span class="label-text">Measurement</span>
      </label>
      <TextInput
        v-for="unit of units"
        :key="unit.label"
        :label="unit.label"
        :modelValue="convert(currentValue, unit)"
        @update:modelValue="setCurrentValue($event, unit)"
      />
    </div>
    <router-view @set-title="title = $event" @set-conversion="updateConversion" />
  </main>
</template>

<script lang="ts">
import { computed, defineComponent, ref } from 'vue';
import { ComplexNumber, Fraction } from '../utils/fraction';
import { measurements, convert, unconvert, Unit } from '../utils/measurement';
import { provideRecipeApi } from '../api/recipes';
import HeaderActions from '../components/HeaderActions.vue';
import TextInput from '../forms/TextInput.vue';

const measurementCategories = Object.keys(measurements);

export default defineComponent({
  components: {
    HeaderActions,
    TextInput,
  },
  setup() {
    const title = ref('');
    const conversionsActive = ref(false);
    const currentValue = ref<ComplexNumber>(1);
    const measurementCategory = ref('liquid');
    const units = computed(() => measurements[measurementCategory.value].types);

    provideRecipeApi();

    return {
      conversionsActive,
      convert,
      unconvert,
      currentValue,
      measurementCategory,
      measurementCategories,
      onCategoryChange: (event: InputEvent) => {
        const category = (event.target as HTMLSelectElement).value;
        measurementCategory.value = category;
        currentValue.value = measurements[category].defaultValue;
      },
      setCurrentValue(rawValue: string, unit: Unit) {
        const value = Fraction.fromString(rawValue);
        if (value instanceof Fraction || !isNaN(value)) {
          currentValue.value = unconvert(value, unit);
        }
      },
      title,
      units,
      updateConversion(value: ComplexNumber, type: string) {
        measurementCategory.value = type;
        conversionsActive.value = true;
        currentValue.value = value;
      }
    };
  },
});
</script>

<style lang="scss">
.recipes-header {
  height: auto;
  min-height: 56px;
  flex-wrap: wrap;
  padding-left: 16px;
}
.recipes-header-wrap {
  padding-left: 72px - 16px;
  width: 100%;
  display: flex;
  align-items: center;
}
.conversions {
  width: 100%;
  padding: 16px;
  border-bottom: 1px solid rgb(0 0 0 / 20%);
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 1rem;
  // position: sticky;
  // top: 56px;
  // box-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
  // background-color: rgb(var(--background));
}
</style>
