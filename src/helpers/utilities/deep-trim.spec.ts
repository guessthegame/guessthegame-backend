import { deepTrim } from './deep-trim'

describe('deepTrim()', () => {
  describe('not trimmable', () => {
    it('should return the value as is', () => {
      expect(deepTrim(undefined)).toEqual(undefined)
      expect(deepTrim(null)).toEqual(null)
      expect(deepTrim(1)).toEqual(1)
    })
  })
  describe('string', () => {
    it('should trim the string', () => {
      expect(deepTrim('  a ')).toEqual('a')
      expect(deepTrim('a   ')).toEqual('a')
      expect(deepTrim('   a')).toEqual('a')
    })
  })
  describe('Array', () => {
    it('should trim each property', () => {
      expect(deepTrim(['  a ', null, undefined, 1, '  b    ', []])).toEqual([
        'a',
        null,
        undefined,
        1,
        'b',
        [],
      ])
      expect(deepTrim([['  a '], [[' b ', '  c'], '   d']])).toEqual([['a'], [['b', 'c'], 'd']])
    })
  })
  describe('Objects', () => {
    expect(deepTrim({})).toEqual({})
    expect(deepTrim({ a: false, b: [], c: [1, false, Math.PI], d: 1, e: {} })).toEqual({
      a: false,
      b: [],
      c: [1, false, Math.PI],
      d: 1,
      e: {},
    })
    expect(deepTrim({ a: '  a ', b: 'b', c: 'c   ', d: '    d' })).toEqual({
      a: 'a',
      b: 'b',
      c: 'c',
      d: 'd',
    })
    expect(deepTrim({ a: ['  a', 'a   ', { b: '   b ', c: { a: '  a ', b: ['  b '] } }] })).toEqual(
      { a: ['a', 'a', { b: 'b', c: { a: 'a', b: ['b'] } }] }
    )
  })
})
