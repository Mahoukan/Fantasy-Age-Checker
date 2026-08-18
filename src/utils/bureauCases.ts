import {
  type BureauCaseInput,
  type BureauCaseProfile,
  type GeneratedBureauCase,
} from '../data/bureauCases'
import { species, type Species, type SpeciesId } from '../data/species'
import type { Applicant } from '../types/applicant'
import { getExperienceGap } from './experience'
import { getLongevity } from './longevity'
import { getMaturityCompatibility } from './maturity'

export interface DailyBureauCase extends BureauCaseInput {
  slot: 'routine' | 'complicated' | 'extraordinary'
  caseLabel: 'CASE I — ROUTINE FILING' | 'CASE II — COMPLICATED FILING' | 'CASE III — EXTRAORDINARY FILING'
  teaser: string
}

export interface BureauCaseLoadUpdate {
  applicantA: Applicant
  applicantB: Applicant
  ageErrors: Record<string, never>
  result: null
  pendingConsultation: null
}

const PROFILES: readonly BureauCaseProfile[] = [
  'routine', 'cross-species', 'experience-gap', 'borderline', 'longevity', 'extraordinary',
]
const LONG_LIVED = species.filter((entry) => entry.typicalLifespan >= 500)
const SHORT_LIVED = species.filter((entry) => entry.typicalLifespan <= 120)
const BORDERLINE_FRIENDLY = species.filter(
  (entry) => entry.adulthoodAge / entry.typicalLifespan <= 0.22,
)

function normalizeRandom(value: number): number {
  if (!Number.isFinite(value)) return 0
  return Math.min(0.999999999999, Math.max(0, value))
}

function pick<T>(values: readonly T[], random: () => number): T {
  return values[Math.floor(normalizeRandom(random()) * values.length)]
}

function wholeAge(entry: Species, lifecyclePosition: number): number {
  return Math.max(entry.adulthoodAge, Math.round(entry.typicalLifespan * lifecyclePosition))
}

function asApplicant(entry: Species, age: number) {
  return { speciesId: entry.id as SpeciesId, age }
}

function routineCase(random: () => number): GeneratedBureauCase {
  const speciesA = pick(species, random)
  const speciesB = pick(species, random)
  const position = 0.38 + normalizeRandom(random()) * 0.38
  const variation = (normalizeRandom(random()) - 0.5) * 0.08
  return {
    profile: 'routine',
    applicantA: asApplicant(speciesA, wholeAge(speciesA, position)),
    applicantB: asApplicant(speciesB, wholeAge(speciesB, position + variation)),
  }
}

function crossSpeciesCase(random: () => number): GeneratedBureauCase {
  const candidates = species.flatMap((speciesA) => species
    .filter((speciesB) => speciesB.id !== speciesA.id)
    .filter((speciesB) => {
      const lifespanRatio = Math.max(speciesA.typicalLifespan, speciesB.typicalLifespan)
        / Math.min(speciesA.typicalLifespan, speciesB.typicalLifespan)
      return lifespanRatio >= 2.5
    })
    .map((speciesB) => [speciesA, speciesB] as const))
  const [speciesA, speciesB] = pick(candidates, random)
  const position = 0.32 + normalizeRandom(random()) * 0.43
  return {
    profile: 'cross-species',
    applicantA: asApplicant(speciesA, wholeAge(speciesA, position)),
    applicantB: asApplicant(speciesB, wholeAge(speciesB, position)),
  }
}

function experienceGapCase(random: () => number): GeneratedBureauCase {
  const longLived = pick(LONG_LIVED, random)
  const shortLived = pick(SHORT_LIVED, random)
  const position = 0.55 + normalizeRandom(random()) * 0.25
  const reverse = normalizeRandom(random()) < 0.5
  const longApplicant = asApplicant(longLived, wholeAge(longLived, position))
  const shortApplicant = asApplicant(shortLived, wholeAge(shortLived, position))
  return {
    profile: 'experience-gap',
    applicantA: reverse ? shortApplicant : longApplicant,
    applicantB: reverse ? longApplicant : shortApplicant,
  }
}

function borderlineCase(random: () => number): GeneratedBureauCase {
  const shuffledStart = Math.floor(normalizeRandom(random()) * BORDERLINE_FRIENDLY.length)
  const positions = [0.55, 0.62, 0.7, 0.78, 0.86]
  const ratios = [0.7, 0.72, 0.74]

  for (let offset = 0; offset < BORDERLINE_FRIENDLY.length; offset += 1) {
    const entry = BORDERLINE_FRIENDLY[(shuffledStart + offset) % BORDERLINE_FRIENDLY.length]
    for (const position of positions) {
      for (const ratio of ratios) {
        const olderAge = wholeAge(entry, position)
        const youngerAge = wholeAge(entry, position * ratio)
        if (getMaturityCompatibility(olderAge, entry, youngerAge, entry).category === 'BORDERLINE') {
          const reverse = normalizeRandom(random()) < 0.5
          return {
            profile: 'borderline',
            applicantA: asApplicant(entry, reverse ? youngerAge : olderAge),
            applicantB: asApplicant(entry, reverse ? olderAge : youngerAge),
          }
        }
      }
    }
  }

  return {
    profile: 'borderline',
    applicantA: { speciesId: 'human', age: 30 },
    applicantB: { speciesId: 'human', age: 42 },
  }
}

function longevityCase(random: () => number): GeneratedBureauCase {
  const speciesA = pick(species, random)
  const speciesB = pick(species, random)
  const longevityMultiple = 1.05 + normalizeRandom(random()) * 1.45
  const ordinaryPosition = 0.38 + normalizeRandom(random()) * 0.42
  const exceptionalApplicant = asApplicant(speciesA, wholeAge(speciesA, longevityMultiple))
  const ordinaryApplicant = asApplicant(speciesB, wholeAge(speciesB, ordinaryPosition))
  const reverse = normalizeRandom(random()) < 0.5
  return {
    profile: 'longevity',
    applicantA: reverse ? ordinaryApplicant : exceptionalApplicant,
    applicantB: reverse ? exceptionalApplicant : ordinaryApplicant,
  }
}

function extraordinaryCase(random: () => number): GeneratedBureauCase {
  const ancient = pick(LONG_LIVED, random)
  const counterpart = pick(species.filter((entry) => entry.id !== ancient.id), random)
  const ancientMultiple = 2.5 + normalizeRandom(random()) * 5.5
  const counterpartPosition = normalizeRandom(random()) < 0.45
    ? 1.2 + normalizeRandom(random()) * 3.8
    : 0.35 + normalizeRandom(random()) * 0.55
  return {
    profile: 'extraordinary',
    applicantA: asApplicant(ancient, wholeAge(ancient, ancientMultiple)),
    applicantB: asApplicant(counterpart, wholeAge(counterpart, counterpartPosition)),
  }
}

export function generateRandomBureauCase(options: {
  random?: () => number
  profile?: BureauCaseProfile
} = {}): GeneratedBureauCase {
  const random = options.random ?? Math.random
  const profile = options.profile ?? pick(PROFILES, random)
  if (profile === 'routine') return routineCase(random)
  if (profile === 'cross-species') return crossSpeciesCase(random)
  if (profile === 'experience-gap') return experienceGapCase(random)
  if (profile === 'borderline') return borderlineCase(random)
  if (profile === 'longevity') return longevityCase(random)
  return extraordinaryCase(random)
}

function hashSeed(value: string): number {
  let hash = 2166136261
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index)
    hash = Math.imul(hash, 16777619)
  }
  return hash >>> 0
}

export function createSeededRandom(seed: string | number): () => number {
  let state = typeof seed === 'number' ? seed >>> 0 : hashSeed(seed)
  return () => {
    state = (state + 0x6d2b79f5) >>> 0
    let value = state
    value = Math.imul(value ^ (value >>> 15), value | 1)
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61)
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296
  }
}

export function getLocalDateKey(date: Date): string {
  if (Number.isNaN(date.getTime())) throw new RangeError('Daily Bureau Case date must be valid.')
  const year = String(date.getFullYear()).padStart(4, '0')
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export function getDailyBureauCases(date = new Date()): readonly DailyBureauCase[] {
  const dateKey = getLocalDateKey(date)
  const routine = generateRandomBureauCase({
    profile: 'routine', random: createSeededRandom(`${dateKey}|routine`),
  })
  const complicatedRandom = createSeededRandom(`${dateKey}|complicated`)
  const complicatedProfiles = ['cross-species', 'experience-gap', 'borderline'] as const
  const complicated = generateRandomBureauCase({
    profile: pick(complicatedProfiles, complicatedRandom), random: complicatedRandom,
  })
  const extraordinary = generateRandomBureauCase({
    profile: 'extraordinary', random: createSeededRandom(`${dateKey}|extraordinary`),
  })
  return [
    {
      slot: 'routine',
      caseLabel: 'CASE I — ROUTINE FILING',
      teaser: 'A generally ordinary adult filing, subject to the usual extraordinary quantity of paperwork.',
      applicantA: routine.applicantA,
      applicantB: routine.applicantB,
    },
    {
      slot: 'complicated',
      caseLabel: 'CASE II — COMPLICATED FILING',
      teaser: 'The calendar and the lifecycle register appear to have submitted different opinions.',
      applicantA: complicated.applicantA,
      applicantB: complicated.applicantB,
    },
    {
      slot: 'extraordinary',
      caseLabel: 'CASE III — EXTRAORDINARY FILING',
      teaser: 'Additional archival shelving has been requested as a precaution.',
      applicantA: extraordinary.applicantA,
      applicantB: extraordinary.applicantB,
    },
  ]
}

export function createBureauCaseLoadUpdate(caseData: BureauCaseInput): BureauCaseLoadUpdate {
  return {
    applicantA: { speciesId: caseData.applicantA.speciesId, age: caseData.applicantA.age },
    applicantB: { speciesId: caseData.applicantB.speciesId, age: caseData.applicantB.age },
    ageErrors: {},
    result: null,
    pendingConsultation: null,
  }
}

export function isValidGeneratedBureauCase(caseData: BureauCaseInput): boolean {
  return [caseData.applicantA, caseData.applicantB].every((applicant) => {
    const entry = species.find((candidate) => candidate.id === applicant.speciesId)
    return Boolean(entry)
      && Number.isFinite(applicant.age)
      && applicant.age > 0
      && applicant.age >= (entry?.adulthoodAge ?? Number.POSITIVE_INFINITY)
  })
}

export function getBureauCaseFacts(caseData: BureauCaseInput) {
  const speciesA = species.find((entry) => entry.id === caseData.applicantA.speciesId)!
  const speciesB = species.find((entry) => entry.id === caseData.applicantB.speciesId)!
  return {
    maturity: getMaturityCompatibility(caseData.applicantA.age, speciesA, caseData.applicantB.age, speciesB),
    experience: getExperienceGap(caseData.applicantA.age, speciesA, caseData.applicantB.age, speciesB),
    longevity: [
      getLongevity(caseData.applicantA.age, speciesA.typicalLifespan),
      getLongevity(caseData.applicantB.age, speciesB.typicalLifespan),
    ] as const,
  }
}
