import { computed, inject, InjectionKey, onMounted, onUnmounted, provide, ref } from 'vue';

const key: InjectionKey<FormContext> = Symbol();
const errorResponse = Symbol();

export type Validator<T> = (value?: T) => string | undefined;

export interface FormContext {
  getFieldConfig<T>(name: string): FieldConfig<T>;
  register<T>(name: string, getValue: () => T | typeof errorResponse): void;
  deregister(name: string): void;
}

export interface FormFieldOptions<T> {
  defaultValue?: T;
  required?: boolean;
  validators?: Validator<T>[];
}

export class FieldConfig<T> {
  initialValue?: T;
  validators: Validator<T>[] = [];

  constructor (initialValue?: T) {
    this.initialValue = initialValue;
  }

  required(message = 'This field is required') {
    this.validators.push(value => (
      value === null ||
      value === undefined ||
      value as unknown as string === ''
    ) ? message : undefined);
    return this;
  }

  validate(...validators: Validator<T>[]) {
    this.validators.push(...validators);
    return this;
  }
}

export function value<T>(initialValue: T) {
  return new FieldConfig(initialValue);
}

export function useFormContainer<T extends { [key: string]: FieldConfig<any> }>(fields: T) {
  const getters: { [name: string]: () => any } = {};
  const formContext: FormContext = {
    getFieldConfig<T>(name: string) {
      if (!(name in fields)) {
        throw new Error('Unknown form field ' + name);
      }
      return fields[name] as FieldConfig<T>;
    },
    register<T>(name: string, getValue: () => T | typeof errorResponse) {
      getters[name] = getValue;
    },
    deregister(name: string) {
      delete getters[name];
    },
  };
  provide(key, formContext);

  const isInErrorState = ref(false);

  return {
    isInErrorState,
    getValues(): { [key: string]: any } | undefined {
      let hasError = false;
      const values: { [key: string]: any } = {};
      for (const name in fields) {
        const fieldConfig = fields[name];
        const value = name in getters ? getters[name]() : fieldConfig.initialValue;
        if (value === errorResponse) {
          hasError = true;
        } else {
          values[name] = value;
        }
      }
      isInErrorState.value = hasError;
      if (!hasError) {
        return values;
      }
    },
  };
}

export function useFormField<T>(name: string, getValue: () => T) {
  const formContext = inject(key);
  if (!formContext) {
    throw new Error('Form validation used outside a form');
  }
  const fieldConfig = formContext.getFieldConfig<T>(name);

  const errors = ref<string[]>([]);
  const isInErrorState = computed(() => errors.value.length > 0);

  const calculateErrors = (value: T) => {
    const foundErrors: string[] = [];
    for (const validator of fieldConfig.validators) {
      const error = validator(value);
      if (error) {
        foundErrors.push(error);
      }
    }
    errors.value = foundErrors;
  }

  onMounted(() => {
    formContext.register(name, () => {
      const value = getValue();
      calculateErrors(value);
      if (isInErrorState.value) {
        return errorResponse;
      }
      return value;
    });
  });
  onUnmounted(() => {
    formContext.deregister(name);
  });
  return {
    errors,
    initialValue: fieldConfig.initialValue,
    refreshState: () => calculateErrors(getValue()),
    isInErrorState,
  };
}
