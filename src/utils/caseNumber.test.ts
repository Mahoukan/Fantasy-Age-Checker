import { describe, expect, it } from 'vitest'
import { species, type CustomSpecies } from '../data/species'
import { generateCaseNumber, getSpeciesCaseCode } from './caseNumber'

const expectedCodes = {
  human: 'HUM',
  elf: 'ELF',
  dwarf: 'DWF',
  halfling: 'HLF',
  orc: 'ORC',
  gnome: 'GNM',
  dragonborn: 'DRB',
  goblin: 'GBL',
  dragon: 'DRG',
  'half-elf': 'HLE',
  'half-orc': 'HLO',
  fae: 'FAE',
  fairy: 'FRY',
  pixie: 'PIX',
  giant: 'GNT',
  troll: 'TRL',
  ogre: 'OGR',
  kobold: 'KOB',
  centaur: 'CEN',
  satyr: 'SAT',
  minotaur: 'MIN',
  merfolk: 'MER',
  harpy: 'HRP',
  dryad: 'DRY',
  nymph: 'NYM',
  kitsune: 'KIT',
  oni: 'ONI',
  djinn: 'DJI',
  gargoyle: 'GAR',
  sphinx: 'SPH',
} as const

describe('case number generation', () => {
  it.each(species)('maps $name to its documented three-letter code', (entry) => {
    expect(getSpeciesCaseCode(entry)).toBe(expectedCodes[entry.id])
  })

  it('uses CUS for temporary custom species without leaking its ID or name', () => {
    const custom: CustomSpecies = {
      id: 'custom-47',
      name: 'High Elf',
      adulthoodAge: 100,
      typicalLifespan: 1000,
      source: 'custom',
    }
    const human = species.find((entry) => entry.id === 'human')!
    const caseNumber = generateCaseNumber(custom, human, () => 0.123456)

    expect(caseNumber).toBe('ARB-CUS-HUM-123456')
    expect(caseNumber).not.toContain('High Elf')
    expect(caseNumber).not.toContain('custom-47')
  })

  it('keeps all built-in three-letter codes unique', () => {
    const codes = species.map(getSpeciesCaseCode)
    expect(codes.every((code) => /^[A-Z]{3}$/.test(code) && code !== 'UNK')).toBe(true)
    expect(new Set(codes).size).toBe(species.length)
  })

  it('preserves applicant order in the species codes', () => {
    const elf = species.find((entry) => entry.id === 'elf')!
    const human = species.find((entry) => entry.id === 'human')!
    expect(generateCaseNumber(elf, human, () => 0)).toBe('ARB-ELF-HUM-000000')
    expect(generateCaseNumber(human, elf, () => 0)).toBe('ARB-HUM-ELF-000000')
  })

  it('always produces exactly six serial digits', () => {
    const human = species.find((entry) => entry.id === 'human')!
    expect(generateCaseNumber(human, human, () => 0.000009)).toMatch(/^ARB-HUM-HUM-\d{6}$/)
    expect(generateCaseNumber(human, human, () => 1)).toBe('ARB-HUM-HUM-999999')
  })

  it('is deterministic with injected randomness', () => {
    const dragon = species.find((entry) => entry.id === 'dragon')!
    const goblin = species.find((entry) => entry.id === 'goblin')!
    expect(generateCaseNumber(dragon, goblin, () => 0.42)).toBe('ARB-DRG-GBL-420000')
  })

  it('normally changes serials when the random source changes', () => {
    const human = species.find((entry) => entry.id === 'human')!
    expect(generateCaseNumber(human, human, () => 0.1))
      .not.toBe(generateCaseNumber(human, human, () => 0.2))
  })
})
