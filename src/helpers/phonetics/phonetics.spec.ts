import { toPhonetics } from './phonetics'

describe('phonetics', () => {
  describe('toPhonetics()', () => {
    it('should transform strings to phonetics', () => {
      ;[
        ['Age of Empires 2: The Age Of Kings', 'AKOFEMPR0AKOFKNK'],
        ['Age of Empires 2', 'AKOFEMPR'],
        ['Age of Empires II', 'AKOFEMPR'],
        ['Age of Empires II HD', 'AKOFEMPRT'],
        ['AOE II', 'AOE'],
        ['AOE 2', 'AOE'],
        ['LoL', 'LOL'],
        ['wow', 'WOW'],
        ['GTA4', 'GTA'],
        ['GTA-IV', 'GTA'],
        ['FFIX', 'FFIX'],
        ['FFXIII', 'FKS'],
        ['Grand Theft Auto IV', 'KRNT0FTAT'],
        ['Grand Theft Auto V', 'KRNT0FTAT'],
        ['Pokémon', 'PKMN'],
        ['The Lord Of The Rings: The Fellowship Of The Ring', '0LRTOF0RNK0FLXPOF0RNK'],
        ['The Witcher® 3: Wild Hunt', '0WXRWLTHNT'],
        ['S.T.A.L.K.E.R.: Shadow of Chernobyl', 'STALKERXTOFXRNBL'],
        ['LEGO® Star Wars™ - The Complete Saga', 'LKSTRWR0KMPLTSK'],
      ].forEach(([original, phonetic]) => {
        expect(toPhonetics(original)).toEqual(phonetic)
      })
    })
  })
})
