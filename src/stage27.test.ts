import { describe, expect, it } from 'vitest'
import { species } from './data/species'
import { buildFbiResultImageModel } from './utils/fbiResultImage'
import { createDefaultFbiApplicantDraft, resolveFbiApplicantDraft } from './utils/fbiApplicant'
import { compareFbiApplicants } from './utils/fbiComparison'
import { createFbiSubmittedReview } from './utils/fbiPresentation'
import { createFbiShareUrl, parseSharedFbiConsultation } from './utils/fbiShare'
import { createShareUrl, resolveSharedApplicants } from './utils/share'

function resolve(draft: ReturnType<typeof createDefaultFbiApplicantDraft>) {
  const result = resolveFbiApplicantDraft(draft, species)
  if (!result.valid) throw new Error('Expected a valid FBI draft.')
  return result.applicant
}

describe('Stage 27 FBI sharing', () => {
  it('round-trips canonical acquired/mortal inputs without presentation state and builds images from the stored dossier', () => {
    const vampireDraft = { ...createDefaultFbiApplicantDraft('A'), mode: 'IMMORTAL' as const, name: 'Count Example', presetId: 'vampire' as const, originSpeciesId: 'human', ageAtTransformation: 34, yearsSinceTransformation: 600 }
    const mortalDraft = { ...createDefaultFbiApplicantDraft('B'), mode: 'MORTAL' as const, name: 'Not In Link', mortalSpeciesId: 'human', mortalAge: 34 }
    const url = createFbiShareUrl([vampireDraft, mortalDraft], { origin: 'https://example.test', pathname: '/age-checker' })
    expect(url).toBeDefined()
    expect(url).toContain('?fbi=1&fam=i&fap=vampire&fao=human&fat=34&fay=600&fbm=m&fbs=human&fba=34#immortal-affairs')
    expect(url).not.toMatch(/Count|Not.In.Link|case|theme|format|finding|filing|presentation/i)

    const restored = parseSharedFbiConsultation(new URL(url!).search)
    expect(restored.status).toBe('valid')
    if (restored.status !== 'valid') return
    expect(restored.drafts[0]).toMatchObject({ mode: 'IMMORTAL', name: '', presetId: 'vampire', originSpeciesId: 'human', ageAtTransformation: 34, yearsSinceTransformation: 600 })
    expect(restored.drafts[1]).toMatchObject({ mode: 'MORTAL', name: '', mortalSpeciesId: 'human', mortalAge: 34 })

    const records = [resolve(vampireDraft), resolve(mortalDraft)] as const
    const dossier = createFbiSubmittedReview(compareFbiApplicants(...records), records)
    expect(dossier.presentation).not.toBeNull()
    if (dossier.presentation === null) return
    const image = buildFbiResultImageModel(dossier, records)
    expect(image.caseNumber).toBe(dossier.presentation.caseNumber)
    expect(image.specialFindings).toBe(dossier.presentation.specialFindings)

    const normalApplicants = resolveSharedApplicants({ applicantA: { speciesId: 'elf', age: 300 }, applicantB: { speciesId: 'human', age: 34 } })
    expect(createShareUrl(normalApplicants, { origin: 'https://example.test', pathname: '/age-checker' })).toBe('https://example.test/age-checker?sa=elf&aa=300&sb=human&ab=34#checker')
  })
})
