export const compose = (...fns) => (initialValue) =>
  fns.reduce((val, fn) => fn(val), initialValue)