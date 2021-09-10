import { ComplexNumber, divide, frac, Fraction, multiply } from './fraction';

interface BasicUnit {
  label: string;
  ratio: Fraction;
  match: RegExp;
}

interface ComplexUnit {
  label: string;
  convert: (value: ComplexNumber) => ComplexNumber;
  unconvert: (value: ComplexNumber) => ComplexNumber;
  match: RegExp;
}

export type Unit = BasicUnit | ComplexUnit;

export const measurements: { [key: string]: { defaultValue: number; types: Unit[] } } = {
  liquid: {
    defaultValue: 1,
    types: [
      { label: 'Teaspoons', ratio: frac(1, 6), match: /^(?:teaspoon|ts)/i },
      { label: 'Tablespoons', ratio: frac(1, 2), match: /^(?:tablespoon|tb)/i },
      { label: 'Fluid Ounces', ratio: frac(1, 1), match: /^(?:fl(?:uid|\.)?\s+(?:ounce|oz))/i },
      { label: 'Cups', ratio: frac(8, 1), match: /^cup/i },
      { label: 'Pints', ratio: frac(16, 1), match: /^(?:pint|pt)/i },
      { label: 'Quarts', ratio: frac(32, 1), match: /^(?:quart|qt)/i },
      { label: 'Gallons', ratio: frac(128, 1), match: /^gal/i },
    ],
  },
  dry: {
    defaultValue: 1,
    types: [
      { label: 'Grams', convert: value => multiply(value, 28.35), unconvert: value => divide(value, 28.35), match: /^(?:g|grams?|gm)$/i },
      { label: 'Ounces', ratio: frac(1, 1), match: /^(?:ounce|oz)/i },
      { label: 'Pounds', ratio: frac(16, 1), match: /^(?:pound|lb)/i },
    ],
  },
  temperature: {
    defaultValue: 350,
    types: [
      {
        label: 'Fahrenheit',
        convert: value => value,
        unconvert: value => value,
        match: /^(?:(?:°|deg(?:rees?)?)\s*)?f(?:ahrenheit)?$/i,
      },
      {
        label: 'Celcius',
        convert: value => (value as number - 32) * 5 / 9,
        unconvert: value => value as number * 9 / 5 + 32,
        match: /^(?:(?:°|deg(?:rees?)?)\s*)?c(?:elcius)?$/i,
      },
    ],
  },
};
export const convert = (value: ComplexNumber, unit: Unit) =>
  ('ratio' in unit ? divide(value, unit.ratio) : unit.convert(value)).toLocaleString('en', {
    useGrouping: false,
    maximumFractionDigits: 2,
  });
export const unconvert = (value: ComplexNumber, unit: Unit) => 'ratio' in unit ? multiply(value, unit.ratio) : unit.unconvert(value);
