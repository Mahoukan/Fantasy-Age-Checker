import type { Species } from '../data/species'
import { calculateAdultExperience } from './lifecycle'

export const EXPERIENCE_GAP_THRESHOLDS = {
  basicallyPeersMaximum: 5,
  noticeableMaximum: 15,
  considerableMaximum: 50,
  formidableMaximum: 100,
  historicalMaximum: 500,
} as const

export type ExperienceCategory =
  | 'BASICALLY_PEERS'
  | 'NOTICEABLE'
  | 'CONSIDERABLE'
  | 'FORMIDABLE'
  | 'HISTORICAL'
  | 'CIVILIZATIONS'

export type MoreExperiencedApplicant = 'A' | 'B' | 'EQUAL'

export interface ExperienceGapResult {
  category: ExperienceCategory
  applicantAAdultExperience: number
  applicantBAdultExperience: number
  adultExperienceGap: number
  chronologicalAgeGap: number
  moreExperiencedApplicant: MoreExperiencedApplicant
  /** Null means one applicant has zero adult experience while the other has more than zero. */
  experienceRatio: number | null
  applicantAHasBeenAdultLongerThanBHasBeenAlive: boolean
  applicantBHasBeenAdultLongerThanAHasBeenAlive: boolean
  oneApplicantHasBeenAdultLongerThanTheOtherHasBeenAlive: boolean
  applicantAAdultExperienceExceedsBTypicalLifespan: boolean
  applicantBAdultExperienceExceedsATypicalLifespan: boolean
  oneApplicantAdultExperienceExceedsPartnerTypicalLifespan: boolean
}

export function getExperienceCategory(adultExperienceGap: number): ExperienceCategory {
  if (adultExperienceGap <= EXPERIENCE_GAP_THRESHOLDS.basicallyPeersMaximum) return 'BASICALLY_PEERS'
  if (adultExperienceGap <= EXPERIENCE_GAP_THRESHOLDS.noticeableMaximum) return 'NOTICEABLE'
  if (adultExperienceGap <= EXPERIENCE_GAP_THRESHOLDS.considerableMaximum) return 'CONSIDERABLE'
  if (adultExperienceGap <= EXPERIENCE_GAP_THRESHOLDS.formidableMaximum) return 'FORMIDABLE'
  if (adultExperienceGap <= EXPERIENCE_GAP_THRESHOLDS.historicalMaximum) return 'HISTORICAL'
  return 'CIVILIZATIONS'
}

function getExperienceRatio(experienceA: number, experienceB: number): number | null {
  if (experienceA === 0 && experienceB === 0) return 1
  if (experienceA === 0 || experienceB === 0) return null

  const ratio = Math.max(experienceA, experienceB) / Math.min(experienceA, experienceB)
  return Number.isFinite(ratio) ? ratio : Number.MAX_VALUE
}

/**
 * Compares actual adult years without lifespan normalization. The absolute
 * adult-experience gap alone determines the category; ratios and flags are
 * factual context reserved for later explanation and quip selection.
 */
export function getExperienceGap(
  applicantAAge: number,
  speciesA: Species,
  applicantBAge: number,
  speciesB: Species,
): ExperienceGapResult {
  const applicantAAdultExperience = calculateAdultExperience(speciesA, applicantAAge)
  const applicantBAdultExperience = calculateAdultExperience(speciesB, applicantBAge)
  const adultExperienceGap = Math.max(applicantAAdultExperience, applicantBAdultExperience)
    - Math.min(applicantAAdultExperience, applicantBAdultExperience)
  const chronologicalAgeGap = Math.max(applicantAAge, applicantBAge) - Math.min(applicantAAge, applicantBAge)
  const moreExperiencedApplicant: MoreExperiencedApplicant = applicantAAdultExperience === applicantBAdultExperience
    ? 'EQUAL'
    : applicantAAdultExperience > applicantBAdultExperience ? 'A' : 'B'
  const applicantAHasBeenAdultLongerThanBHasBeenAlive = applicantAAdultExperience > applicantBAge
  const applicantBHasBeenAdultLongerThanAHasBeenAlive = applicantBAdultExperience > applicantAAge
  const applicantAAdultExperienceExceedsBTypicalLifespan = applicantAAdultExperience > speciesB.typicalLifespan
  const applicantBAdultExperienceExceedsATypicalLifespan = applicantBAdultExperience > speciesA.typicalLifespan

  return {
    category: getExperienceCategory(adultExperienceGap),
    applicantAAdultExperience,
    applicantBAdultExperience,
    adultExperienceGap,
    chronologicalAgeGap,
    moreExperiencedApplicant,
    experienceRatio: getExperienceRatio(applicantAAdultExperience, applicantBAdultExperience),
    applicantAHasBeenAdultLongerThanBHasBeenAlive,
    applicantBHasBeenAdultLongerThanAHasBeenAlive,
    oneApplicantHasBeenAdultLongerThanTheOtherHasBeenAlive:
      applicantAHasBeenAdultLongerThanBHasBeenAlive || applicantBHasBeenAdultLongerThanAHasBeenAlive,
    applicantAAdultExperienceExceedsBTypicalLifespan,
    applicantBAdultExperienceExceedsATypicalLifespan,
    oneApplicantAdultExperienceExceedsPartnerTypicalLifespan:
      applicantAAdultExperienceExceedsBTypicalLifespan || applicantBAdultExperienceExceedsATypicalLifespan,
  }
}
