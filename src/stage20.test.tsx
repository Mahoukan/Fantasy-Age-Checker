import { describe, expect, it } from 'vitest'
import { species, type Species } from './data/species'
import type { ApplicantLabel, ApplicantLifecycleFacts } from './types/applicant'
import { createApprovedConsultation } from './utils/consultation'
import { calculateAdultExperience, calculateRelativeAge } from './utils/lifecycle'
import {
  getChronologicalAgeFromHumanEquivalent,
  getHumanEquivalentAge,
} from './utils/maturity'
import { reverseLookup } from './utils/reverseLookup'

const human = species.find((entry) => entry.id === 'human')!
const elf = species.find((entry) => entry.id === 'elf')!
const dragon = species.find((entry) => entry.id === 'dragon')!

function facts(label: ApplicantLabel, selectedSpecies: Species, age: number): ApplicantLifecycleFacts {
  return {
    label,
    species: selectedSpecies,
    age,
    adultExperience: calculateAdultExperience(selectedSpecies, age),
    relativeAge: calculateRelativeAge(selectedSpecies, age),
  }
}

describe('Stage 20 Reverse Lookup', () => {
  it('round-trips shared maturity and converts long-lived records through the real utilities', () => {
    const humanEquivalent = getHumanEquivalentAge(34, human.typicalLifespan)
    expect(getChronologicalAgeFromHumanEquivalent(humanEquivalent, human.typicalLifespan)).toBe(34)

    const result = reverseLookup({ sourceSpecies: elf, sourceAge: 300, targetSpecies: human })
    expect(result.status).toBe('available')
    if (result.status !== 'available') return
    expect(result.sourceEquivalentAge).toBeCloseTo(33.6)
    expect(result.targetEquivalentAge).toBeCloseTo(33.6)
  })

  it('clamps partial ranges to target adulthood and exposes no adult range when none exists', () => {
    const partialRange = reverseLookup({ sourceSpecies: human, sourceAge: 18, targetSpecies: human })
    expect(partialRange).toMatchObject({
      status: 'available',
      rawTargetMinimumAge: 16,
      rawTargetMaximumAge: 22,
      adultTargetMinimumAge: 18,
      adultTargetMaximumAge: 22,
      hasAdultTargetRange: true,
      targetRangeStartsBelowAdulthood: true,
    })

    const noAdultRange = reverseLookup({ sourceSpecies: dragon, sourceAge: 100, targetSpecies: human })
    expect(noAdultRange).toMatchObject({
      status: 'available',
      hasAdultTargetRange: false,
      closestTargetIsAdult: false,
    })
    expect('adultTargetMinimumAge' in noAdultRange).toBe(false)

    expect(reverseLookup({ sourceSpecies: human, sourceAge: 17, targetSpecies: elf }))
      .toEqual({ status: 'source-underage', sourceAdulthoodAge: 18 })
  })

  it('does not create or mutate normal consultation state', () => {
    const consultation = createApprovedConsultation(
      [facts('A', elf, 300), facts('B', human, 34)],
      { random: () => 0, caseRandom: () => 0.123456 },
    )
    const beforeLookup = JSON.stringify(consultation)
    const result = reverseLookup({ sourceSpecies: elf, sourceAge: 300, targetSpecies: human })

    expect(JSON.stringify(consultation)).toBe(beforeLookup)
    expect(result).not.toHaveProperty('caseNumber')
    expect(result).not.toHaveProperty('quips')
    expect(result).not.toHaveProperty('experience')
  })
})
