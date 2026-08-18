import { describe, expect, it } from 'vitest'
import { species } from '../data/species'
import { formatPercentage } from './format'
import {
  calculateAdultExperience,
  calculateRelativeAge,
  findSpeciesById,
  isAdult,
  validateAge,
} from './lifecycle'

const human = species.find((entry) => entry.id === 'human')!
const elf = species.find((entry) => entry.id === 'elf')!

describe('lifecycle utilities', () => {
  it('finds a species by id and handles an unknown id', () => {
    expect(findSpeciesById('human')).toEqual(human)
    expect(findSpeciesById('unknown')).toBeUndefined()
  })

  it.each([
    [human, 18, true],
    [human, 17, false],
    [elf, 100, true],
    [elf, 99, false],
  ])('determines adulthood at the recognised threshold', (speciesEntry, age, expected) => {
    expect(isAdult(speciesEntry, age)).toBe(expected)
  })

  it('calculates adult experience and clamps non-adults to zero', () => {
    expect(calculateAdultExperience(human, 34)).toBe(16)
    expect(calculateAdultExperience(human, 10)).toBe(0)
  })

  it('calculates relative lifespan position as a ratio', () => {
    expect(calculateRelativeAge(elf, 300)).toBe(0.4)
    expect(calculateRelativeAge(human, 34)).toBeCloseTo(34 / 84)
  })

  it('accepts zero and decimal ages', () => {
    expect(validateAge(0)).toEqual({ valid: true, value: 0 })
    expect(validateAge(18.5)).toEqual({ valid: true, value: 18.5 })
  })

  it('rejects missing, negative, and non-finite ages', () => {
    expect(validateAge('').valid).toBe(false)
    expect(validateAge(-1).valid).toBe(false)
    expect(validateAge(Number.POSITIVE_INFINITY).valid).toBe(false)
  })

  it('handles a very large finite age', () => {
    const age = Number.MAX_VALUE
    const relativeAge = calculateRelativeAge(human, age)
    expect(validateAge(age)).toEqual({ valid: true, value: age })
    expect(relativeAge).toBeGreaterThan(0)
    expect(formatPercentage(relativeAge)).not.toContain('Infinity')
  })
})
