import { metaphone } from './metadone'
import { stemmer } from './stemmer'

/**
 * Transform a string to phonetics using a stemmer + metaphone
 * More info: https://github.com/words/metaphone#api
 */
export function toPhonetics(string: string): string {
  // Remove accents, special characters, and all form of numbers
  const cleanedString = clean(string)

  // If the cleaned name is 4 characters or less, don't make it phonetic
  if (cleanedString.length <= 4) {
    return cleanedString.toUpperCase()
  }

  // Remove digits and roman numerals, stem, then metaphone
  return transform(cleanedString)
}

/**
 * Remove accents, special characters, and all form of numbers
 */
function clean(string: string) {
  return normalize(string.trim())
    .split(/\W+/)
    .map(removeSpecialCharacters)
    .filter((word) => !isRomanNumerals(word))
    .join(' ')
}

/**
 * Stem + Metaphone each word
 */
function transform(string: string): string {
  return string.split(/\W+/).map(stem).map(metaphone).join('')
}

/**
 * Apply Porter Stemmer
 * https://github.com/words/stemmer
 */
function stem(string: string): string {
  return string.split(/\W/).map(stemmer).join(' ')
}

/**
 * Remove accentuated characters
 * https://stackoverflow.com/a/37511463
 */
function normalize(string: string): string {
  return string.normalize('NFD').replace(/\p{Diacritic}/gu, '')
}

/**
 * Remove all special characters: leave only letters
 */
function removeSpecialCharacters(string: string): string {
  return string.replace(/[^a-zA-Z]+/gu, '')
}

/**
 * Return wether a given word is a Roman Numeral
 */
function isRomanNumerals(word: string): boolean {
  return Boolean(word.match(/^(X{0,3})(IX|IV|V?I{0,3})$/))
}
