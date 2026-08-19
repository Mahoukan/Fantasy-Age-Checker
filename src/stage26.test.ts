import { describe, expect, it } from 'vitest'
import { species } from './data/species'
import { createDefaultFbiApplicantDraft, resolveFbiApplicantDraft } from './utils/fbiApplicant'
import { compareFbiApplicants } from './utils/fbiComparison'
import { classifyFbiChronology, createFbiSubmittedReview } from './utils/fbiPresentation'

function resolvedApplicant(draft: ReturnType<typeof createDefaultFbiApplicantDraft>) {
  const resolution = resolveFbiApplicantDraft(draft, species)
  if (!resolution.valid) throw new Error('Test applicant did not resolve.')
  return resolution.applicant
}

describe('Stage 26 FBI dossier presentation', () => {
  it('creates a stable case, exact chronology bands, and no more than two prioritized findings without changing comparison facts', () => {
    const mortal = resolvedApplicant(createDefaultFbiApplicantDraft('A'))
    const vampire = resolvedApplicant({
      ...createDefaultFbiApplicantDraft('B'),
      presetId: 'vampire',
      ageAtTransformation: 34,
      yearsSinceTransformation: 600,
    })
    const comparison = compareFbiApplicants(mortal, vampire)
    const before = JSON.stringify(comparison)
    const first = createFbiSubmittedReview(comparison, [mortal, vampire])
    const second = createFbiSubmittedReview(comparison, [mortal, vampire])

    expect(first).toEqual(second)
    expect(first.presentation?.caseNumber).toMatch(/^FBI-HUM-VAM-\d{6}$/)
    expect(first.presentation?.chronology.map((entry) => entry.category)).toEqual(['RECENT_RECORD', 'DEEP_CENTURY'])
    expect(first.presentation?.specialFindings.length).toBeLessThanOrEqual(2)
    expect(first.presentation?.specialFindings.map((finding) => finding.id)).toEqual(['civilisations', 'frozen-centuries'])
    expect(first.presentation?.contradictionNote).not.toBeNull()
    expect(JSON.stringify(comparison)).toBe(before)

    expect(classifyFbiChronology(100_000)).toBe('PRIMORDIAL')
  })

  it('keeps ineligible records factual and omits all dossier theatre', () => {
    const mortal = resolvedApplicant(createDefaultFbiApplicantDraft('A'))
    const possessing = resolvedApplicant({
      ...createDefaultFbiApplicantDraft('B'),
      presetId: 'possessing-spirit',
      currentFormAge: 17,
      rememberedConsciousExperience: 5_000,
    })
    const review = createFbiSubmittedReview(compareFbiApplicants(mortal, possessing), [mortal, possessing])

    expect(review.comparison.status).toBe('INELIGIBLE')
    expect(review.presentation).toBeNull()
    expect(review).not.toHaveProperty('caseNumber')
  })
})
