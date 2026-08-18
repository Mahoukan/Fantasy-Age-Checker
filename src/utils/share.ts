import { species, type SpeciesId } from '../data/species'
import { experienceVerdicts, longevityLabels, maturityVerdicts } from '../data/verdicts'
import type { ApplicantLifecycleFacts } from '../types/applicant'
import type { ConsultationQuips } from '../types/quip'
import type { ExperienceGapResult } from './experience'
import { formatEquivalentYears, formatYears } from './format'
import { calculateAdultExperience, calculateRelativeAge } from './lifecycle'
import type { ApplicantLongevityResult } from './longevity'
import type { MaturityCompatibilityResult } from './maturity'

const SHARE_KEYS = ['sa', 'aa', 'sb', 'ab'] as const
const NUMERIC_AGE_PATTERN = /^[+-]?(?:\d+\.?\d*|\.\d+)(?:e[+-]?\d+)?$/i

export interface SharedConsultationInput {
  applicantA: { speciesId: SpeciesId; age: number }
  applicantB: { speciesId: SpeciesId; age: number }
}

export type SharedConsultationParseResult =
  | { status: 'none' }
  | { status: 'invalid'; message: string }
  | { status: 'valid'; consultation: SharedConsultationInput }

export interface ShareUrlBase {
  origin: string
  pathname: string
}

export interface ShareResultModel {
  applicants: ApplicantLifecycleFacts[]
  maturity: MaturityCompatibilityResult
  experience: ExperienceGapResult
  longevity: ApplicantLongevityResult[]
  quips: ConsultationQuips
  caseNumber?: string
}

export interface ClipboardLike {
  writeText(text: string): Promise<void>
}

export interface NativeSharePayload {
  title: string
  text: string
  url?: string
}

export type NativeShareFunction = (payload: NativeSharePayload) => Promise<void>
export type NativeShareResult = 'shared' | 'cancelled' | 'failed' | 'unavailable'

function isBuiltInSpeciesId(id: string): id is SpeciesId {
  return species.some((entry) => entry.id === id && entry.source === 'builtin')
}

function parseSharedAge(value: string | null): number | undefined {
  if (value === null || value.length === 0 || !NUMERIC_AGE_PATTERN.test(value)) return undefined
  const age = Number(value)
  return Number.isFinite(age) && age >= 0 ? age : undefined
}

export function createShareParams(
  applicants: readonly ApplicantLifecycleFacts[],
): URLSearchParams | undefined {
  const [applicantA, applicantB] = applicants
  if (applicants.length !== 2 || !applicantA || !applicantB) return undefined
  if (applicantA.species.source !== 'builtin' || applicantB.species.source !== 'builtin') return undefined
  if (!isBuiltInSpeciesId(applicantA.species.id) || !isBuiltInSpeciesId(applicantB.species.id)) return undefined
  if (!Number.isFinite(applicantA.age) || applicantA.age < 0
    || !Number.isFinite(applicantB.age) || applicantB.age < 0) return undefined

  return new URLSearchParams({
    sa: applicantA.species.id,
    aa: String(applicantA.age),
    sb: applicantB.species.id,
    ab: String(applicantB.age),
  })
}

export function parseSharedConsultation(search: string): SharedConsultationParseResult {
  const params = new URLSearchParams(search)
  const presentKeys = SHARE_KEYS.filter((key) => params.has(key))
  if (presentKeys.length === 0) return { status: 'none' }
  if (presentKeys.length !== SHARE_KEYS.length) {
    return { status: 'invalid', message: 'The Bureau could not restore this shared consultation.' }
  }

  const speciesA = params.get('sa')
  const speciesB = params.get('sb')
  const ageA = parseSharedAge(params.get('aa'))
  const ageB = parseSharedAge(params.get('ab'))
  if (!speciesA || !speciesB || !isBuiltInSpeciesId(speciesA) || !isBuiltInSpeciesId(speciesB)
    || ageA === undefined || ageB === undefined) {
    return { status: 'invalid', message: 'The Bureau could not restore this shared consultation.' }
  }

  return {
    status: 'valid',
    consultation: {
      applicantA: { speciesId: speciesA, age: ageA },
      applicantB: { speciesId: speciesB, age: ageB },
    },
  }
}

export function resolveSharedApplicants(
  shared: SharedConsultationInput,
): [ApplicantLifecycleFacts, ApplicantLifecycleFacts] {
  const speciesA = species.find((entry) => entry.id === shared.applicantA.speciesId)!
  const speciesB = species.find((entry) => entry.id === shared.applicantB.speciesId)!
  return [
    {
      label: 'A',
      species: speciesA,
      age: shared.applicantA.age,
      adultExperience: calculateAdultExperience(speciesA, shared.applicantA.age),
      relativeAge: calculateRelativeAge(speciesA, shared.applicantA.age),
    },
    {
      label: 'B',
      species: speciesB,
      age: shared.applicantB.age,
      adultExperience: calculateAdultExperience(speciesB, shared.applicantB.age),
      relativeAge: calculateRelativeAge(speciesB, shared.applicantB.age),
    },
  ]
}

export function createShareUrl(
  applicants: readonly ApplicantLifecycleFacts[],
  base: ShareUrlBase,
): string | undefined {
  const params = createShareParams(applicants)
  if (!params) return undefined
  try {
    const url = new URL(base.pathname, base.origin)
    url.search = params.toString()
    url.hash = 'checker'
    return url.toString()
  } catch {
    return undefined
  }
}

export function createShareResultText(result: ShareResultModel): string {
  const lines = ['Fantasy Age Checker - Arcane Relationship Bureau', '']

  result.applicants.forEach((applicant) => {
    const temporary = applicant.species.source === 'custom' ? ' (Temporary Species)' : ''
    const identity = applicant.name
      ? `${applicant.name} — ${applicant.species.name}${temporary}`
      : `${applicant.species.name}${temporary}`
    lines.push(`${identity}, age ${formatYears(applicant.age)}`)
    const longevity = result.longevity.find((entry) => entry.applicant === applicant.label)
    if (longevity && longevity.category !== 'NORMAL') {
      lines.push(`${applicant.name ? `Longevity (${applicant.name})` : 'Longevity'}: ${longevityLabels[longevity.category]}`)
    }
  })

  lines.push(
    '',
    `Maturity: ${maturityVerdicts[result.maturity.category].label}`,
    `Experience: ${experienceVerdicts[result.experience.category].label}`,
    '',
    `${result.applicants[0].name ?? result.applicants[0].species.name} equivalent maturity: ${formatEquivalentYears(result.maturity.applicantAEquivalentAge)} human years`,
    `${result.applicants[1].name ?? result.applicants[1].species.name} equivalent maturity: ${formatEquivalentYears(result.maturity.applicantBEquivalentAge)} human years`,
    `Adult experience gap: ${formatYears(result.experience.adultExperienceGap)} years`,
  )

  if (result.caseNumber) lines.push('', `Case No. ${result.caseNumber}`)
  lines.push('', `"${result.quips.maturity.text}"`, `"${result.quips.experience.text}"`)
  return lines.join('\n')
}

export async function copyText(text: string, clipboard?: ClipboardLike): Promise<boolean> {
  if (!clipboard) return false
  try {
    await clipboard.writeText(text)
    return true
  } catch {
    return false
  }
}

export function hasNativeShare(share?: NativeShareFunction): boolean {
  return typeof share === 'function'
}

export async function shareNatively(
  payload: NativeSharePayload,
  share?: NativeShareFunction,
): Promise<NativeShareResult> {
  if (!share) return 'unavailable'
  try {
    await share(payload)
    return 'shared'
  } catch (error) {
    return error instanceof Error && error.name === 'AbortError' ? 'cancelled' : 'failed'
  }
}
