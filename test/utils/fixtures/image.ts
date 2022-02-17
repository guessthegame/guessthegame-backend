import { v4 } from 'uuid'

export function newImage() {
  return {
    originalUuid: v4(),
    transformedUuid: v4(),
    transformations: {},
  }
}
