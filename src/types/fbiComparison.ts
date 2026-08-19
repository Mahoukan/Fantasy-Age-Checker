import type { ExperienceCategory, MoreExperiencedApplicant } from '../utils/experience'
import type { MaturityCompatibilityResult } from '../utils/maturity'
import type { FbiApplicantMode, FbiApplicantRecord } from './fbiApplicant'

export interface NormalizedFbiApplicant {
  label: 'A' | 'B'
  name?: string
  displayName: string
  mode: FbiApplicantMode
  lifecycleFamily: FbiApplicantRecord['record']['family']
  classification: string
  effectiveMaturity: number | null
  adultExperience: number | null
  adultComparisonEligible: boolean
  ineligibilityReason: string | null
  chronologicalAge: number | null
  finiteTypicalLifespan: number | null
}

export type ComparableFbiApplicant = NormalizedFbiApplicant & {
  effectiveMaturity: number
  adultExperience: number
  adultComparisonEligible: true
}

export interface FbiExperienceComparison {
  category: ExperienceCategory
  applicantAAdultExperience: number
  applicantBAdultExperience: number
  adultExperienceGap: number
  moreExperiencedApplicant: MoreExperiencedApplicant
  experienceRatio: number | null
  applicantAHasMoreAdultExperienceThanBChronologicalAge: boolean | null
  applicantBHasMoreAdultExperienceThanAChronologicalAge: boolean | null
  oneApplicantHasMoreAdultExperienceThanOtherChronologicalAge: boolean | null
  applicantAAdultExperienceExceedsBFiniteLifespan: boolean | null
  applicantBAdultExperienceExceedsAFiniteLifespan: boolean | null
  extremeExperienceDisparity: boolean
}

export interface FbiChronologyContext {
  applicantAChronologicalAge: number | null
  applicantBChronologicalAge: number | null
  chronologicalAgeGap: number | null
}

export type FbiComparisonResult =
  | {
      status: 'INELIGIBLE'
      applicants: readonly [NormalizedFbiApplicant, NormalizedFbiApplicant]
      reasons: readonly { applicant: 'A' | 'B'; reason: string }[]
    }
  | {
      status: 'APPROVED_FOR_COMPARISON'
      applicants: readonly [ComparableFbiApplicant, ComparableFbiApplicant]
      maturity: MaturityCompatibilityResult
      experience: FbiExperienceComparison
      chronology: FbiChronologyContext
    }
