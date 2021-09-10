export default function (prefix: string) {
  let index = 0;
  return () => `${prefix}-${index++}`;
}
