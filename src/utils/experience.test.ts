import { describe, expect, it } from 'vitest'
import { species } from '../data/species'
import { calculateAdultExperience } from './lifecycle'
import { getExperienceCategory, getExperienceGap } from './experience'

const human = species.find((entry) => entry.id === 'human')!
const elf = species.find((entry) => entry.id === 'elf')!

describe('experience gap calculations', () => {
  it('calculates Human 34 adult experience as 16', () => {
    expect(calculateAdultExperience(human, 34)).toBe(16)
  })

  it('calculates Elf 300 adult experience as 200', () => {
    expect(calculateAdultExperience(elf, 300)).toBe(200)
  })

  it('classifies Elf 300 and Human 34 as historical with a 184-year gap', () => {
    const result = getExperienceGap(300, elf, 34, human)
    expect(result.applicantAAdultExperience).toBe(200)
    expect(result.applicantBAdultExperience).toBe(16)
    expect(result.adultExperienceGap).toBe(184)
    expect(result.category).toBe('HISTORICAL')
  })

  it('classifies equal adult experience as basically peers', () => {
    expect(getExperienceGap(30, human, 30, human).category).toBe('BASICALLY_PEERS')
  })

  it.each([
    [5, 'BASICALLY_PEERS'],
    [5.01, 'NOTICEABLE'],
    [15, 'NOTICEABLE'],
    [15.01, 'CONSIDERABLE'],
    [50, 'CONSIDERABLE'],
    [50.01, 'FORMIDABLE'],
    [100, 'FORMIDABLE'],
    [100.01, 'HISTORICAL'],
    [500, 'HISTORICAL'],
    [500.01, 'CIVILIZATIONS'],
  ] as const)('classifies an adult-experience gap of %s as %s', (gap, category) => {
    expect(getExperienceCategory(gap)).toBe(category)
  })

  it('uses a safe ratio of one when both applicants have zero adult experience', () => {
    expect(getExperienceGap(18, human, 18, human).experienceRatio).toBe(1)
  })

  it('uses null when only one applicant has zero adult experience', () => {
    const result = getExperienceGap(18, human, 20, human)
    expect(result.experienceRatio).toBeNull()
    expect(result.adultExperienceGap).toBe(2)
  })

  it('supports decimal adult experience', () => {
    const result = getExperienceGap(18.5, human, 19.25, human)
    expect(result.applicantAAdultExperience).toBeCloseTo(0.5)
    expect(result.adultExperienceGap).toBeCloseTo(0.75)
    expect(result.category).toBe('BASICALLY_PEERS')
  })

  it('handles very large finite ages without capping or non-finite numeric results', () => {
    const result = getExperienceGap(Number.MAX_VALUE, human, 18, human)
    expect(result.adultExperienceGap).toBe(Number.MAX_VALUE)
    expect(result.category).toBe('CIVILIZATIONS')
    expect(Object.values(result)
      .filter((value): value is number => typeof value === 'number')
      .every(Number.isFinite)).toBe(true)
  })

  it('identifies when Elf 300 has been an adult longer than Human 34 has been alive', () => {
    const result = getExperienceGap(300, elf, 34, human)
    expect(result.applicantAHasBeenAdultLongerThanBHasBeenAlive).toBe(true)
    expect(result.oneApplicantHasBeenAdultLongerThanTheOtherHasBeenAlive).toBe(true)
  })

  it("identifies when Elf 300's adult experience exceeds a Human typical lifespan", () => {
    const result = getExperienceGap(300, elf, 34, human)
    expect(result.applicantAAdultExperienceExceedsBTypicalLifespan).toBe(true)
    expect(result.oneApplicantAdultExperienceExceedsPartnerTypicalLifespan).toBe(true)
  })
})
