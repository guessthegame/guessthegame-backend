import { v4 } from 'uuid'

export function newScreenshot() {
  return {
    gameName: v4(),
    year: 2000,
  }
}

export function newValidatedScreenshot() {
  return {
    ...newScreenshot(),
    isValidated: true,
  }
}
