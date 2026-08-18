import { describe, expect, it } from 'vitest'
import { allQuips, longevityQuips } from '../data/quips'
import { species, type CustomSpecies, type Species } from '../data/species'
import type { ApplicantLabel, ApplicantLifecycleFacts } from '../types/applicant'
import { createApprovedConsultation } from './consultation'
import { getExperienceGap } from './experience'
import { calculateAdultExperience, calculateRelativeAge, isAdult, validateAge } from './lifecycle'
import { getLongevity } from './longevity'
import { getMaturityCompatibility } from './maturity'
import { createQuipContext, getEligibleQuips } from './quipSelector'

const human = species.find((entry) => entry.id === 'human')!
const elf = species.find((entry) => entry.id === 'elf')!

function facts(label: ApplicantLabel, selectedSpecies: Species, age: number): ApplicantLifecycleFacts {
  return {
    label,
    species: selectedSpecies,
    age,
    adultExperience: calculateAdultExperience(selectedSpecies, age),
    relativeAge: calculateRelativeAge(selectedSpecies, age),
  }
}

function contextFor(speciesA: Species, ageA: number, speciesB: Species, ageB: number) {
  const applicants = [facts('A', speciesA, ageA), facts('B', speciesB, ageB)] as const
  return createQuipContext(
    applicants,
    getMaturityCompatibility(ageA, speciesA, ageB, speciesB),
    getExperienceGap(ageA, speciesA, ageB, speciesB),
  )
}

describe('longevity thresholds', () => {
  it('classifies Human age 84 at ratio 1 as NORMAL', () => {
    expect(getLongevity(84, 84)).toEqual({
      ratio: 1,
      category: 'NORMAL',
      exceedsTypicalLifespan: false,
      excessYears: 0,
      lifespanMultiples: 1,
    })
  })

  it('classifies Human age 84.01 as EXCEPTIONAL', () => {
    expect(getLongevity(84.01, 84).category).toBe('EXCEPTIONAL')
  })

  it('keeps ratio exactly 1.25 in EXCEPTIONAL', () => {
    expect(getLongevity(105, 84).category).toBe('EXCEPTIONAL')
  })

  it('classifies a ratio just above 1.25 as ANCIENT', () => {
    expect(getLongevity(105.000001, 84).category).toBe('ANCIENT')
  })

  it('keeps ratio exactly 2 in ANCIENT', () => {
    expect(getLongevity(168, 84).category).toBe('ANCIENT')
  })

  it('classifies a ratio just above 2 as LEGENDARY', () => {
    expect(getLongevity(168.000001, 84).category).toBe('LEGENDARY')
  })

  it('keeps ratio exactly 5 in LEGENDARY', () => {
    expect(getLongevity(420, 84).category).toBe('LEGENDARY')
  })

  it('classifies a ratio above 5 as ANOMALOUS', () => {
    expect(getLongevity(420.000001, 84).category).toBe('ANOMALOUS')
  })
})

describe('longevity calculations', () => {
  it('classifies Elf 900 / 750 as exceptional with 150 excess years', () => {
    const result = getLongevity(900, 750)
    expect(result.ratio).toBe(1.2)
    expect(result.category).toBe('EXCEPTIONAL')
    expect(result.excessYears).toBe(150)
  })

  it('classifies Elf 1500 / 750 as ANCIENT', () => {
    expect(getLongevity(1500, 750)).toMatchObject({ ratio: 2, category: 'ANCIENT' })
  })

  it('classifies Elf 1501 / 750 as LEGENDARY', () => {
    expect(getLongevity(1501, 750).category).toBe('LEGENDARY')
  })

  it('classifies Human 10000 / 84 as ANOMALOUS', () => {
    expect(getLongevity(10000, 84)).toMatchObject({
      category: 'ANOMALOUS',
      exceedsTypicalLifespan: true,
    })
  })

  it('supports decimal ages without rounding calculation data', () => {
    expect(getLongevity(100.5, 84).ratio).toBeCloseTo(100.5 / 84)
  })

  it('supports very large finite ages without imposing a cap', () => {
    const age = Number.MAX_VALUE / 2
    const result = getLongevity(age, 84)
    expect(result.ratio).toBe(age / 84)
    expect(result.category).toBe('ANOMALOUS')
  })

  it('uses the same calculation for custom species', () => {
    const starborn: CustomSpecies = {
      id: 'custom-1', name: 'Starborn', adulthoodAge: 30, typicalLifespan: 200, source: 'custom',
    }
    expect(getLongevity(450, starborn.typicalLifespan)).toMatchObject({
      ratio: 2.25,
      category: 'LEGENDARY',
      excessYears: 250,
    })
  })

  it('does not treat typical lifespan as validation or adulthood maximum', () => {
    expect(validateAge(10000).valid).toBe(true)
    expect(isAdult(human, 10000)).toBe(true)
  })
})

describe('consultation integration remains additive', () => {
  it('leaves the existing maturity result unchanged for an over-lifespan applicant', () => {
    const expected = getMaturityCompatibility(900, elf, 34, human)
    const consultation = createApprovedConsultation([facts('A', elf, 900), facts('B', human, 34)], {
      random: () => 0,
      caseRandom: () => 0,
    })
    expect(consultation.maturity).toEqual(expected)
  })

  it('leaves the existing experience result unchanged for an over-lifespan applicant', () => {
    const expected = getExperienceGap(900, elf, 34, human)
    const consultation = createApprovedConsultation([facts('A', elf, 900), facts('B', human, 34)], {
      random: () => 0,
      caseRandom: () => 0,
    })
    expect(consultation.experience).toEqual(expected)
  })

  it('captures one longevity record per approved applicant', () => {
    const consultation = createApprovedConsultation([facts('A', elf, 900), facts('B', human, 34)], {
      random: () => 0,
      caseRandom: () => 0,
    })
    expect(consultation.longevity).toMatchObject([
      { applicant: 'A', category: 'EXCEPTIONAL' },
      { applicant: 'B', category: 'NORMAL' },
    ])
  })

  it('selects longevity commentary for an eligible over-lifespan consultation', () => {
    const consultation = createApprovedConsultation([facts('A', elf, 900), facts('B', human, 34)], {
      random: () => 0,
      caseRandom: () => 0,
    })
    expect([
      ...Object.values(consultation.quips),
      consultation.loadingMessage,
    ].some((quip) => quip.id.startsWith('longevity-'))).toBe(true)
  })

  it('keeps ordinary consultations free of longevity-restricted commentary', () => {
    const consultation = createApprovedConsultation([facts('A', elf, 300), facts('B', human, 34)], {
      random: () => 0,
      caseRandom: () => 0,
    })
    expect([
      ...Object.values(consultation.quips),
      consultation.loadingMessage,
    ].every((quip) => !quip.id.startsWith('longevity-'))).toBe(true)
  })
})

describe('longevity quip context', () => {
  it('contains 40 to 50 new longevity/contextual lines with unique IDs', () => {
    expect(longevityQuips.length).toBeGreaterThanOrEqual(40)
    expect(longevityQuips.length).toBeLessThanOrEqual(50)
    expect(new Set(longevityQuips.map((quip) => quip.id)).size).toBe(longevityQuips.length)
  })

  it('does not make longevity-restricted quips eligible for normal applicants', () => {
    const context = contextFor(elf, 300, human, 34)
    expect(longevityQuips.some((quip) => getEligibleQuips([quip], quip.slot, context).length > 0)).toBe(false)
    expect(context.flags).not.toContain('EXCEEDS_TYPICAL_LIFESPAN')
  })

  it('makes exceptional longevity quips eligible only when lifespan is exceeded', () => {
    const context = contextFor(elf, 900, human, 34)
    expect(context.flags).toContain('APPLICANT_A_EXCEEDS_TYPICAL_LIFESPAN')
    expect(getEligibleQuips(longevityQuips, 'MATURITY', context).length).toBeGreaterThan(0)
  })

  it('does not make multiple-lifespan quips eligible for a merely exceptional age', () => {
    const context = contextFor(elf, 800, human, 34)
    expect(context.flags).not.toContain('MULTIPLE_TYPICAL_LIFESPANS_OLD')
    expect(getEligibleQuips(longevityQuips, 'EXPERIENCE', context).some(
      (quip) => quip.flags?.includes('MULTIPLE_TYPICAL_LIFESPANS_OLD'),
    )).toBe(false)
  })

  it('adds directional flags when one or both applicants trigger a condition', () => {
    const one = contextFor(elf, 1600, human, 34)
    expect(one.flags).toContain('APPLICANT_A_MULTIPLE_TYPICAL_LIFESPANS_OLD')
    expect(one.flags).not.toContain('APPLICANT_B_EXCEEDS_TYPICAL_LIFESPAN')

    const both = contextFor(elf, 1600, human, 500)
    expect(both.flags).toContain('APPLICANT_A_MULTIPLE_TYPICAL_LIFESPANS_OLD')
    expect(both.flags).toContain('APPLICANT_B_MULTIPLE_TYPICAL_LIFESPANS_OLD')
  })

  it('allows a custom species to trigger longevity contextual quips', () => {
    const starborn: CustomSpecies = {
      id: 'custom-7', name: 'Starborn', adulthoodAge: 30, typicalLifespan: 200, source: 'custom',
    }
    const context = contextFor(starborn, 450, human, 34)
    expect(context.flags).toContain('APPLICANT_A_MULTIPLE_TYPICAL_LIFESPANS_OLD')
    expect(getEligibleQuips(longevityQuips, 'EXPERIENCE', context).length).toBeGreaterThan(0)
  })

  it('preserves built-in species matching without inferring from custom names', () => {
    const highElf: CustomSpecies = {
      id: 'custom-9', name: 'High Elf', adulthoodAge: 100, typicalLifespan: 750, source: 'custom',
    }
    const context = contextFor(highElf, 900, highElf, 900)
    const eligible = getEligibleQuips(allQuips, 'MATURITY', context)
    expect(eligible.some((quip) => quip.species?.includes('elf'))).toBe(false)
  })

  it('makes anomaly loading context available without changing loading architecture', () => {
    const context = contextFor(human, 10000, elf, 300)
    expect(getEligibleQuips(longevityQuips, 'LOADING', context).some(
      (quip) => quip.flags?.includes('EXTREME_CHRONOLOGICAL_ANOMALY'),
    )).toBe(true)
  })
})
