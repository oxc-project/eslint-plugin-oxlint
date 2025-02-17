/**
 * Detects it the value is an object
 */
export const isObject = (value: unknown): boolean =>
  typeof value === 'object' && value !== null && !Array.isArray(value);
