import { allQuips, fallbackQuips } from '../data/quips'
import type {
  ConsultationQuips,
  QuipContextFlag,
  Quip,
  QuipContext,
  QuipSlot,
} from '../types/quip'
import type { ApplicantLifecycleFacts } from '../types/applicant'
import type { ExperienceGapResult } from './experience'
import type { MaturityCompatibilityResult } from './maturity'
import { getLongevity, type ApplicantLongevityResult } from './longevity'

export const QUIP_HISTORY_LIMIT = 15
export const QUIP_HISTORY_KEY_PREFIX = 'fantasy-age-checker:quip-history:'

export interface StorageLike {
  getItem(key: string): string | null
  setItem(key: string, value: string): void
}

interface SelectionOptions {
  random?: () => number
  storage?: StorageLike
  historyLimit?: number
}

function matchesContext(quip: Quip, slot: QuipSlot, context: QuipContext): boolean {
  if (quip.slot !== slot) return false
  if (quip.maturityCategories && !quip.maturityCategories.includes(context.maturityCategory)) return false
  if (quip.experienceCategories && !quip.experienceCategories.includes(context.experienceCategory)) return false
  if (quip.relationship && quip.relationship !== context.relationship) return false
  if (quip.species && !quip.species.some((speciesId) => context.speciesIds.includes(speciesId))) return false
  if (quip.flags && !quip.flags.every((flag) => context.flags.includes(flag))) return false
  return true
}

function getSpecificity(quip: Quip): number {
  return (quip.flags?.length ?? 0) * 8
    + (quip.species ? 4 : 0)
    + (quip.relationship ? 2 : 0)
    + (quip.maturityCategories || quip.experienceCategories ? 1 : 0)
}

function pickRandom<T>(items: readonly T[], random: () => number): T | undefined {
  if (items.length === 0) return undefined
  const normalizedRandom = Math.min(Math.max(random(), 0), 0.9999999999999999)
  return items[Math.floor(normalizedRandom * items.length)]
}

export function getEligibleQuips(
  quips: readonly Quip[],
  slot: QuipSlot,
  context: QuipContext,
): Quip[] {
  return quips.filter((quip) => matchesContext(quip, slot, context))
}

/** Pure selection: prefer the most specific non-recent tier, then older history. */
export function selectQuip(
  quips: readonly Quip[],
  slot: QuipSlot,
  context: QuipContext,
  recentIds: readonly string[] = [],
  random: () => number = Math.random,
): Quip | undefined {
  const eligible = getEligibleQuips(quips, slot, context)
  if (eligible.length === 0) return undefined

  const recentSet = new Set(recentIds)
  const scores = [...new Set(eligible.map(getSpecificity))].sort((a, b) => b - a)

  for (const score of scores) {
    const unusedTier = eligible.filter((quip) => getSpecificity(quip) === score && !recentSet.has(quip.id))
    const selected = pickRandom(unusedTier, random)
    if (selected) return selected
  }

  const historyPosition = new Map(recentIds.map((id, index) => [id, index]))
  return [...eligible].sort((a, b) => {
    const historyDifference = (historyPosition.get(a.id) ?? -1) - (historyPosition.get(b.id) ?? -1)
    return historyDifference || getSpecificity(b) - getSpecificity(a)
  })[0]
}

function getHistoryKey(slot: QuipSlot): string {
  return `${QUIP_HISTORY_KEY_PREFIX}${slot.toLowerCase()}`
}

export function readQuipHistory(storage: StorageLike | undefined, slot: QuipSlot): string[] {
  if (!storage) return []
  try {
    const stored = storage.getItem(getHistoryKey(slot))
    if (!stored) return []
    const parsed: unknown = JSON.parse(stored)
    return Array.isArray(parsed) ? parsed.filter((id): id is string => typeof id === 'string') : []
  } catch {
    return []
  }
}

function writeQuipHistory(
  storage: StorageLike | undefined,
  slot: QuipSlot,
  history: readonly string[],
): void {
  if (!storage) return
  try {
    storage.setItem(getHistoryKey(slot), JSON.stringify(history))
  } catch {
    // Humour history is optional; storage failure must never block a ruling.
  }
}

export function selectQuipWithHistory(
  quips: readonly Quip[],
  slot: QuipSlot,
  context: QuipContext,
  options: SelectionOptions = {},
): Quip | undefined {
  const { random = Math.random, storage, historyLimit = QUIP_HISTORY_LIMIT } = options
  const recentIds = readQuipHistory(storage, slot)
  const selected = selectQuip(quips, slot, context, recentIds, random)

  if (selected) {
    const nextHistory = [...recentIds.filter((id) => id !== selected.id), selected.id]
      .filter((id) => quips.some((quip) => quip.id === id))
      .slice(-Math.max(1, historyLimit))
    writeQuipHistory(storage, slot, nextHistory)
  }

  return selected
}

export function getBrowserStorage(): StorageLike | undefined {
  try {
    return typeof window === 'undefined' ? undefined : window.localStorage
  } catch {
    return undefined
  }
}

export function createQuipContext(
  applicants: readonly ApplicantLifecycleFacts[],
  maturity: MaturityCompatibilityResult,
  experience: ExperienceGapResult,
  suppliedLongevity?: readonly ApplicantLongevityResult[],
): QuipContext {
  const flags: QuipContextFlag[] = []
  if (experience.oneApplicantHasBeenAdultLongerThanTheOtherHasBeenAlive) {
    flags.push('ADULT_LONGER_THAN_PARTNER_ALIVE')
  }
  if (experience.oneApplicantAdultExperienceExceedsPartnerTypicalLifespan) {
    flags.push('ADULT_EXPERIENCE_EXCEEDS_PARTNER_LIFESPAN')
  }

  const longevity = suppliedLongevity ?? applicants.map((applicant) => ({
    applicant: applicant.label,
    ...getLongevity(applicant.age, applicant.species.typicalLifespan),
  }))
  const addAggregateFlag = (flag: QuipContextFlag) => {
    if (!flags.includes(flag)) flags.push(flag)
  }

  longevity.forEach((result) => {
    const direction = result.applicant === 'A' ? 'APPLICANT_A' : 'APPLICANT_B'
    if (result.ratio > 1) {
      addAggregateFlag('EXCEEDS_TYPICAL_LIFESPAN')
      flags.push(`${direction}_EXCEEDS_TYPICAL_LIFESPAN` as QuipContextFlag)
    }
    if (result.ratio > 1.25) {
      addAggregateFlag('ANCIENT_BEYOND_TYPICAL_LIFESPAN')
      flags.push(`${direction}_ANCIENT_BEYOND_TYPICAL_LIFESPAN` as QuipContextFlag)
    }
    if (result.ratio > 2) {
      addAggregateFlag('MULTIPLE_TYPICAL_LIFESPANS_OLD')
      flags.push(`${direction}_MULTIPLE_TYPICAL_LIFESPANS_OLD` as QuipContextFlag)
    }
    if (result.ratio > 5) {
      addAggregateFlag('EXTREME_CHRONOLOGICAL_ANOMALY')
      flags.push(`${direction}_EXTREME_CHRONOLOGICAL_ANOMALY` as QuipContextFlag)
    }
  })

  return {
    maturityCategory: maturity.category,
    experienceCategory: experience.category,
    speciesIds: applicants.map((applicant) => applicant.species.id),
    relationship: applicants[0]?.species.id === applicants[1]?.species.id
      ? 'same-species'
      : 'cross-species',
    flags,
  }
}

export function selectConsultationQuips(
  context: QuipContext,
  options: SelectionOptions = {},
): ConsultationQuips {
  const storage = options.storage ?? getBrowserStorage()
  const select = (slot: QuipSlot) => selectQuipWithHistory(allQuips, slot, context, {
    ...options,
    storage,
  }) ?? fallbackQuips[slot]

  return {
    maturity: select('MATURITY'),
    experience: select('EXPERIENCE'),
    administrative: select('ADMINISTRATIVE'),
  }
}

export function selectLoadingQuip(
  context: QuipContext,
  options: SelectionOptions = {},
): Quip {
  const storage = options.storage ?? getBrowserStorage()
  return selectQuipWithHistory(allQuips, 'LOADING', context, { ...options, storage })
    ?? fallbackQuips.LOADING
}
