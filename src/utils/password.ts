export const passwordIsValid = (value: string): boolean =>
  /[a-z]/.test(value) && /\d/.test(value) && value.length >= 8;
