import { findImmortalPreset } from '../data/immortalPresets'
import { species } from '../data/species'
import { experienceVerdicts, maturityVerdicts } from '../data/verdicts'
import type { FbiApplicantDraft, FbiApplicantRecord } from '../types/fbiApplicant'
import type { FbiSubmittedReview } from '../types/fbiPresentation'
import { createDefaultFbiApplicantDraft, resolveFbiApplicantDraft } from './fbiApplicant'
import { formatEquivalentYears, formatYears } from './format'
import type { ShareUrlBase } from './share'

const PREFIXES = ['fa', 'fb'] as const
const NUMBER_PATTERN = /^(?:\d+\.?\d*|\.\d+)(?:e[+-]?\d+)?$/i

export type FbiDraftPair = readonly [FbiApplicantDraft, FbiApplicantDraft]
export type SharedFbiParseResult =
  | { status: 'none' }
  | { status: 'invalid'; message: string }
  | { status: 'valid'; drafts: FbiDraftPair }

function isBuiltInSpecies(id: string | null): id is string {
  return Boolean(id && species.some((entry) => entry.id === id && entry.source === 'builtin'))
}

function numberValue(value: string | null): number | undefined {
  if (!value || !NUMBER_PATTERN.test(value)) return undefined
  const parsed = Number(value)
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : undefined
}

function serializeDraft(params: URLSearchParams, prefix: string, draft: FbiApplicantDraft): boolean {
  if (draft.mode === 'MORTAL') {
    if (!isBuiltInSpecies(draft.mortalSpeciesId) || draft.mortalAge === '' || !Number.isFinite(draft.mortalAge) || draft.mortalAge < 0) return false
    params.set(`${prefix}m`, 'm')
    params.set(`${prefix}s`, draft.mortalSpeciesId)
    params.set(`${prefix}a`, String(draft.mortalAge))
    return true
  }

  if (draft.presetId === 'custom-immortal') return false
  const preset = findImmortalPreset(draft.presetId)
  if (!preset) return false
  params.set(`${prefix}m`, 'i')
  params.set(`${prefix}p`, preset.id)
  if (preset.family === 'ACQUIRED') {
    if (!isBuiltInSpecies(draft.originSpeciesId) || draft.ageAtTransformation === '' || draft.yearsSinceTransformation === '') return false
    params.set(`${prefix}o`, draft.originSpeciesId)
    params.set(`${prefix}t`, String(draft.ageAtTransformation))
    params.set(`${prefix}y`, String(draft.yearsSinceTransformation))
  } else if (preset.family === 'NATURALLY_IMMORTAL') {
    if (draft.naturalCurrentAge === '') return false
    params.set(`${prefix}a`, String(draft.naturalCurrentAge))
  } else if (preset.family === 'MANIFESTED') {
    if (draft.yearsSinceManifestation === '') return false
    params.set(`${prefix}y`, String(draft.yearsSinceManifestation))
  } else {
    if (!isBuiltInSpecies(draft.currentFormSpeciesId) || draft.currentFormAge === '') return false
    params.set(`${prefix}s`, draft.currentFormSpeciesId)
    params.set(`${prefix}a`, String(draft.currentFormAge))
    if (preset.subtype === 'REINCARNATING') {
      params.set(`${prefix}r`, draft.memoriesRetained ? '1' : '0')
      if (draft.memoriesRetained) {
        if (draft.rememberedPreviousAdultExperience === '') return false
        params.set(`${prefix}e`, String(draft.rememberedPreviousAdultExperience))
      }
    } else {
      if (draft.rememberedConsciousExperience === '') return false
      params.set(`${prefix}e`, String(draft.rememberedConsciousExperience))
    }
  }
  return true
}

export function createFbiShareParams(drafts: FbiDraftPair): URLSearchParams | undefined {
  const params = new URLSearchParams({ fbi: '1' })
  if (!serializeDraft(params, PREFIXES[0], drafts[0]) || !serializeDraft(params, PREFIXES[1], drafts[1])) return undefined
  return params
}

function parseDraft(params: URLSearchParams, prefix: string, label: 'A' | 'B'): FbiApplicantDraft | undefined {
  const mode = params.get(`${prefix}m`)
  const draft = createDefaultFbiApplicantDraft(label)
  if (mode === 'm') {
    const speciesId = params.get(`${prefix}s`)
    const age = numberValue(params.get(`${prefix}a`))
    if (!isBuiltInSpecies(speciesId) || age === undefined) return undefined
    return { ...draft, mode: 'MORTAL', name: '', mortalSpeciesId: speciesId, mortalAge: age }
  }
  if (mode !== 'i') return undefined

  const presetId = params.get(`${prefix}p`)
  if (!presetId || presetId === 'custom-immortal') return undefined
  const preset = findImmortalPreset(presetId)
  if (!preset) return undefined
  let restored: FbiApplicantDraft = { ...draft, mode: 'IMMORTAL', name: '', presetId: preset.id }
  if (preset.family === 'ACQUIRED') {
    const origin = params.get(`${prefix}o`)
    const transformed = numberValue(params.get(`${prefix}t`))
    const elapsed = numberValue(params.get(`${prefix}y`))
    if (!isBuiltInSpecies(origin) || transformed === undefined || elapsed === undefined) return undefined
    restored = { ...restored, originSpeciesId: origin, ageAtTransformation: transformed, yearsSinceTransformation: elapsed }
  } else if (preset.family === 'NATURALLY_IMMORTAL') {
    const age = numberValue(params.get(`${prefix}a`))
    if (age === undefined) return undefined
    restored = { ...restored, naturalCurrentAge: age }
  } else if (preset.family === 'MANIFESTED') {
    const elapsed = numberValue(params.get(`${prefix}y`))
    if (elapsed === undefined) return undefined
    restored = { ...restored, yearsSinceManifestation: elapsed }
  } else {
    const currentSpecies = params.get(`${prefix}s`)
    const currentAge = numberValue(params.get(`${prefix}a`))
    const experience = numberValue(params.get(`${prefix}e`))
    if (!isBuiltInSpecies(currentSpecies) || currentAge === undefined) return undefined
    if (preset.subtype === 'REINCARNATING') {
      const memories = params.get(`${prefix}r`)
      if (memories !== '0' && memories !== '1') return undefined
      if (memories === '1' && experience === undefined) return undefined
      restored = { ...restored, currentFormSpeciesId: currentSpecies, currentFormAge: currentAge, memoriesRetained: memories === '1', rememberedPreviousAdultExperience: memories === '1' ? experience! : 0 }
    } else {
      if (experience === undefined) return undefined
      restored = { ...restored, currentFormSpeciesId: currentSpecies, currentFormAge: currentAge, rememberedConsciousExperience: experience }
    }
  }
  return restored
}

export function parseSharedFbiConsultation(search: string): SharedFbiParseResult {
  const params = new URLSearchParams(search)
  if (!params.has('fbi')) return { status: 'none' }
  if (params.get('fbi') !== '1') return { status: 'invalid', message: 'The FBI could not restore this shared lifecycle filing.' }
  const first = parseDraft(params, PREFIXES[0], 'A')
  const second = parseDraft(params, PREFIXES[1], 'B')
  if (!first || !second || !resolveFbiApplicantDraft(first, species).valid || !resolveFbiApplicantDraft(second, species).valid) {
    return { status: 'invalid', message: 'The FBI could not restore this shared lifecycle filing.' }
  }
  return { status: 'valid', drafts: [first, second] }
}

export function createFbiShareUrl(drafts: FbiDraftPair, base: ShareUrlBase): string | undefined {
  const params = createFbiShareParams(drafts)
  if (!params) return undefined
  try {
    const url = new URL(base.pathname, base.origin)
    url.search = params.toString()
    url.hash = 'immortal-affairs'
    return url.toString()
  } catch {
    return undefined
  }
}

function recordContext(record: FbiApplicantRecord): readonly string[] {
  const facts = record.record
  if (facts.family === 'MORTAL') return [`Species: ${facts.species.name}`]
  if (facts.family === 'ACQUIRED') return [`Origin: ${facts.originSpecies.name}`, `Transformed at ${formatYears(facts.ageAtTransformation)}; ${formatYears(facts.yearsSinceTransformation)} years since transformation`]
  if (facts.family === 'NATURALLY_IMMORTAL') return [`Natural immortal; current age ${formatYears(facts.currentAge)}`]
  if (facts.family === 'MANIFESTED') return [`Created mature; ${formatYears(facts.yearsSinceManifestation)} years since manifestation`]
  if (facts.subtype === 'REINCARNATING') return [`Current form: ${facts.currentFormSpecies.name}, age ${formatYears(facts.currentFormAge)}`, `Memory continuity: ${facts.memoriesRetained ? 'retained' : 'not retained'}`]
  return [`Current host: ${facts.currentFormSpecies.name}, age ${formatYears(facts.currentFormAge)}`, `Conscious experience: ${formatYears(facts.rememberedConsciousExperience)} years`]
}

export function createFbiResultText(review: Extract<FbiSubmittedReview, { presentation: object }>, records: readonly [FbiApplicantRecord, FbiApplicantRecord]): string {
  const { comparison, presentation } = review
  const lines = ['Fantasy Bureau of Immortality', `Case: ${presentation.caseNumber}`]
  comparison.applicants.forEach((applicant, index) => {
    lines.push('', `Subject ${applicant.label}:`, applicant.name ?? applicant.classification)
    if (applicant.name) lines.push(applicant.classification)
    lines.push(...recordContext(records[index]), `Effective maturity: ${formatEquivalentYears(applicant.effectiveMaturity)}`, `Adult experience: ${formatYears(applicant.adultExperience)} years`, `Chronology: ${presentation.chronology[index].categoryLabel}`)
  })
  lines.push('', 'Maturity Compatibility:', maturityVerdicts[comparison.maturity.category].label, '', 'Experience Gap:', experienceVerdicts[comparison.experience.category].label)
  lines.push('', 'Chronological Context:', ...presentation.chronology.map((entry, index) => `Subject ${index === 0 ? 'A' : 'B'}: ${entry.context.join('; ')}`))
  if (presentation.specialFindings.length) lines.push('', 'FBI Special Findings:', ...presentation.specialFindings.map((finding) => finding.label))
  lines.push('', 'FBI Filing Note:', presentation.filingNote.text)
  return lines.join('\n')
}
