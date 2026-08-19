import { describe, expect, it } from 'vitest'
import { species } from './data/species'
import { compareFbiApplicants } from './utils/fbiComparison'
import { createDefaultFbiApplicantDraft, resolveFbiApplicantDraft } from './utils/fbiApplicant'

function resolvedApplicant(draft: ReturnType<typeof createDefaultFbiApplicantDraft>) {
  const resolution = resolveFbiApplicantDraft(draft, species)
  if (!resolution.valid) throw new Error('Test applicant did not resolve.')
  return resolution.applicant
}

describe('Stage 25 FBI comparison engine', () => {
  it('independently compares mortal maturity and acquired-immortal experience with existing categories', () => {
    const mortal = resolvedApplicant(createDefaultFbiApplicantDraft('A'))
    const vampire = resolvedApplicant({
      ...createDefaultFbiApplicantDraft('B'),
      presetId: 'vampire',
      ageAtTransformation: 34,
      yearsSinceTransformation: 600,
    })
    const before = JSON.stringify([mortal, vampire])
    const result = compareFbiApplicants(mortal, vampire)

    expect(result.status).toBe('APPROVED_FOR_COMPARISON')
    if (result.status !== 'APPROVED_FOR_COMPARISON') return
    expect(result.maturity).toMatchObject({
      category: 'EXCELLENT',
      applicantAEquivalentAge: 34,
      applicantBEquivalentAge: 34,
      mutuallyCompatible: true,
    })
    expect(result.experience).toMatchObject({
      category: 'CIVILIZATIONS',
      applicantAAdultExperience: 16,
      applicantBAdultExperience: 616,
      adultExperienceGap: 600,
      moreExperiencedApplicant: 'B',
      applicantBHasMoreAdultExperienceThanAChronologicalAge: true,
      applicantBAdultExperienceExceedsAFiniteLifespan: true,
    })
    expect(result.chronology.chronologicalAgeGap).toBe(600)
    expect(JSON.stringify([mortal, vampire])).toBe(before)
  })

  it('centrally rejects an ancient consciousness in an underage current host', () => {
    const mortal = resolvedApplicant(createDefaultFbiApplicantDraft('A'))
    const possessing = resolvedApplicant({
      ...createDefaultFbiApplicantDraft('B'),
      presetId: 'possessing-spirit',
      currentFormAge: 17,
      rememberedConsciousExperience: 5000,
    })
    const result = compareFbiApplicants(mortal, possessing)

    expect(result.status).toBe('INELIGIBLE')
    if (result.status !== 'INELIGIBLE') return
    expect(result.reasons).toEqual([expect.objectContaining({ applicant: 'B' })])
    expect(result).not.toHaveProperty('maturity')
    expect(result).not.toHaveProperty('experience')
  })
})

