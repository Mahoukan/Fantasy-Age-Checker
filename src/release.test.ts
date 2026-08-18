import { describe, expect, it } from 'vitest'
import { species, type CustomSpecies } from './data/species'
import { formatEquivalentYears, formatPercentage, formatYears } from './utils/format'
import { getExperienceGap } from './utils/experience'
import { isAdult, validateAge } from './utils/lifecycle'
import { getLongevity } from './utils/longevity'
import { getMaturityCompatibility } from './utils/maturity'

const human = species.find((entry) => entry.id === 'human')!
const elf = species.find((entry) => entry.id === 'elf')!

describe('v1 release matrix', () => {
  it.each([
    ['Elf 300 + Human 34', 300, elf, 34, human, 'EXCELLENT', 'HISTORICAL'],
    ['Human 30 + Human 28', 30, human, 28, human, 'EXCELLENT', 'BASICALLY_PEERS'],
    ['Human 30 + Human 22', 30, human, 22, human, 'BORDERLINE', 'NOTICEABLE'],
    ['Human 60 + Human 18', 60, human, 18, human, 'INCOMPATIBLE', 'CONSIDERABLE'],
  ] as const)('keeps the expected verdicts for %s', (
    _name,
    ageA,
    speciesA,
    ageB,
    speciesB,
    maturity,
    experience,
  ) => {
    expect(getMaturityCompatibility(ageA, speciesA, ageB, speciesB).category).toBe(maturity)
    expect(getExperienceGap(ageA, speciesA, ageB, speciesB).category).toBe(experience)
  })

  it('treats Human 10000 as a valid chronological anomaly', () => {
    expect(isAdult(human, 10_000)).toBe(true)
    expect(getLongevity(10_000, human.typicalLifespan).category).toBe('ANOMALOUS')
  })

  it('keeps the High Elf custom-species filing excellent and historical', () => {
    const highElf: CustomSpecies = {
      id: 'custom-1',
      name: 'High Elf',
      adulthoodAge: 120,
      typicalLifespan: 1_000,
      source: 'custom',
    }
    expect(getMaturityCompatibility(400, highElf, 34, human).category).toBe('EXCELLENT')
    expect(getExperienceGap(400, highElf, 34, human).category).toBe('HISTORICAL')
  })

  it('retains adulthood and invalid-input safeguards', () => {
    expect(isAdult(human, 17)).toBe(false)
    expect(validateAge('')).toMatchObject({ valid: false })
    expect(validateAge(-1)).toMatchObject({ valid: false })
    expect(validateAge(Number.POSITIVE_INFINITY)).toMatchObject({ valid: false })
  })

  it('formats extreme valid custom-species values without unbroken raw digits', () => {
    expect(formatYears(1_000_000_000)).toBe('1,000,000,000')
    expect(formatEquivalentYears(420_000_000)).toBe('420,000,000.0')
    expect(formatPercentage(5_000_000)).toBe('500,000,000.0%')
  })
})
