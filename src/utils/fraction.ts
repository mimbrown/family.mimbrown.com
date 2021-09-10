const junk = /[,]/g;
const matchFrac = /^(?:(\d+)\s+)?(\d+)\/(\d+)$/;

export type ComplexNumber = Fraction | number;

function gcd(x: number, y: number) {
  x = Math.abs(x);
  y = Math.abs(y);
  while(y) {
    const t = y;
    y = x % y;
    x = t;
  }
  return x;
}

export class Fraction {
  numer: number;
  denom: number;

  constructor(numer: number, denom: number) {
    const div = gcd(numer, denom);
    this.numer = numer / div;
    this.denom = denom / div;
  }

  toString() {
    let str = `${this.numer}`;
    if (this.denom !== 1) {
      str += `/${this.denom}`;
    }
    return str;
  }

  static fromString(str: string): ComplexNumber {
    const match = matchFrac.exec(str.trim().replace(junk, ''));
    if (match) {
      const [, alone, numer, denom] = match;
      let num = parseInt(numer, 10);
      const den = parseInt(denom, 10);
      if (alone) {
        num = den * parseInt(alone) + num;
      }
      return new Fraction(num, den);
    } else {
      return parseFloat(str);
    }
  }
}

export const frac = (numer: number, denom: number) => new Fraction(numer, denom);

const isInt = (num: number) => Math.trunc(num) === num;

export function multiply(a: ComplexNumber, b: ComplexNumber): ComplexNumber {
  if (typeof a === 'number') {
    if (typeof b === 'number') {
      return a * b;
    }
    return isInt(a) ? frac(b.numer * a, b.denom) : b.numer * a / b.denom;
  }
  if (typeof b === 'number') {
    return isInt(b) ? frac(a.numer * b, a.denom) : a.numer * b / a.denom;
  }
  return frac(a.numer * b.numer, a.denom * b.denom);
}

export function divide(a: ComplexNumber, b: ComplexNumber): ComplexNumber {
  if (typeof a === 'number') {
    if (typeof b === 'number') {
      return a / b;
    }
    return isInt(a) ? frac(b.denom * a, b.numer) : b.denom * a / b.numer;
  }
  if (typeof b === 'number') {
    return isInt(b) ? frac(a.numer, a.denom * b) : a.numer / (a.denom * b);
  }
  return frac(a.numer * b.denom, a.denom * b.numer);
}
