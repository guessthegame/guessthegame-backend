import { isObject } from 'class-validator'

/**
 * Trim all string properties of an object
 */
export function deepTrim(value: unknown): unknown {
  // If a string, we trim
  if (typeof value === 'string') {
    return value.trim()
  }

  // If an array, we deep trim each value
  if (Array.isArray(value)) {
    return value.map(deepTrim)
  }

  // If an object, we deep trim each property
  if (isObject(value)) {
    return Object.fromEntries(Object.entries(value).map(([k, v]) => [k, deepTrim(v)]))
  }

  // Else, we leave it as it is
  return value
}
