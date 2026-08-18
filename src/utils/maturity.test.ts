import { describe, expect, it } from 'vitest'
import { species } from '../data/species'
import {
  HUMAN_REFERENCE_LIFESPAN,
  getHumanEquivalentAge,
  getMaturityCompatibility,
  getMaturityRange,
} from './maturity'

const human = species.find((entry) => entry.id === 'human')!
const elf = species.find((entry) => entry.id === 'elf')!
const dwarf = species.find((entry) => entry.id === 'dwarf')!

describe('maturity calculations', () => {
  it.each([
    [42, human.typicalLifespan, 42],
    [375, elf.typicalLifespan, 42],
    [150, dwarf.typicalLifespan, 42],
  ])('normalizes age %s against lifespan %s to %s human years', (age, lifespan, expected) => {
    expect(getHumanEquivalentAge(age, lifespan)).toBeCloseTo(expected)
  })

  it('gives equal equivalent maturity to equal relative ages across species', () => {
    expect(getHumanEquivalentAge(375, elf.typicalLifespan)).toBeCloseTo(
      getHumanEquivalentAge(42, human.typicalLifespan),
    )
  })

  it('reproduces the traditional human range', () => {
    expect(getMaturityRange(30)).toEqual({ minimum: 22, maximum: 46 })
  })

  it('reproduces the lifespan-scaled same-species threshold', () => {
    const elfAge = 300
    const equivalentAge = getHumanEquivalentAge(elfAge, elf.typicalLifespan)
    const normalizedMinimum = getMaturityRange(equivalentAge).minimum
    const minimumInElfYears = normalizedMinimum / HUMAN_REFERENCE_LIFESPAN * elf.typicalLifespan

    expect(minimumInElfYears).toBeCloseTo(elfAge / 2 + elf.typicalLifespan / 12)
    expect(minimumInElfYears).toBeCloseTo(212.5)
  })

  it('classifies equal maturity as excellent', () => {
    expect(getMaturityCompatibility(375, elf, 42, human).category).toBe('EXCELLENT')
  })

  it('classifies a mutually compatible, noticeable difference as good', () => {
    expect(getMaturityCompatibility(30, human, 24, human).category).toBe('GOOD')
  })

  it('classifies a mutually compatible boundary pair as borderline', () => {
    expect(getMaturityCompatibility(30, human, 22, human).category).toBe('BORDERLINE')
  })

  it('classifies a pair outside either directional range as incompatible', () => {
    const result = getMaturityCompatibility(60, human, 18, human)
    expect(result.category).toBe('INCOMPATIBLE')
    expect(result.mutuallyCompatible).toBe(false)
  })

  it('supports decimal ages', () => {
    const result = getMaturityCompatibility(30.5, human, 29.75, human)
    expect(result.category).toBe('EXCELLENT')
    expect(result.applicantAEquivalentAge).toBeCloseTo(30.5)
  })

  it('calculates ages beyond one or multiple typical lifespans without capping', () => {
    expect(getHumanEquivalentAge(900, elf.typicalLifespan)).toBeCloseTo(100.8)
    expect(getHumanEquivalentAge(2250, elf.typicalLifespan)).toBeCloseTo(252)
  })

  it('handles very large finite ages without non-finite result fields', () => {
    const result = getMaturityCompatibility(Number.MAX_VALUE, human, Number.MAX_VALUE, human)
    expect(result.category).toBe('EXCELLENT')
    expect(Object.values(result).filter((value) => typeof value === 'number').every(Number.isFinite)).toBe(true)
  })

  it('calculates applicants exactly at their adulthood thresholds', () => {
    const result = getMaturityCompatibility(human.adulthoodAge, human, elf.adulthoodAge, elf)
    expect(Number.isFinite(result.applicantAEquivalentAge)).toBe(true)
    expect(Number.isFinite(result.applicantBEquivalentAge)).toBe(true)
  })
})
