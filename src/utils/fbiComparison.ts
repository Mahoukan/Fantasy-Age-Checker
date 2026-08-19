import type { Species } from '../data/species'
import type { FbiApplicantRecord } from '../types/fbiApplicant'
import type {
  FbiComparisonResult,
  FbiExperienceComparison,
  NormalizedFbiApplicant,
} from '../types/fbiComparison'
import { getExperienceCategory, type MoreExperiencedApplicant } from './experience'
import { HUMAN_REFERENCE_LIFESPAN, getMaturityCompatibility } from './maturity'

const humanEquivalentReference: Species = {
  id: 'fbi-human-equivalent-reference',
  name: 'Human-equivalent comparison reference',
  adulthoodAge: 0,
  typicalLifespan: HUMAN_REFERENCE_LIFESPAN,
  source: 'builtin',
}

function getChronologicalAge(applicant: FbiApplicantRecord): number | null {
  const { record } = applicant
  switch (record.family) {
    case 'MORTAL': return record.age
    case 'ACQUIRED': return record.currentAge
    case 'NATURALLY_IMMORTAL': return record.currentAge
    case 'MANIFESTED': return record.yearsSinceManifestation
    case 'TRANSFERRED_CYCLICAL': return null
  }
}

export function normalizeFbiApplicant(
  applicant: FbiApplicantRecord,
  label: 'A' | 'B',
): NormalizedFbiApplicant {
  return {
    label,
    ...(applicant.name ? { name: applicant.name } : {}),
    displayName: applicant.name ?? `Applicant ${label}`,
    mode: applicant.mode,
    lifecycleFamily: applicant.record.family,
    classification: applicant.classification,
    effectiveMaturity: applicant.record.effectiveMaturity,
    adultExperience: applicant.record.adultExperience,
    adultComparisonEligible: applicant.record.adultComparisonEligible,
    ineligibilityReason: applicant.record.ineligibilityReason,
    chronologicalAge: getChronologicalAge(applicant),
    finiteTypicalLifespan: applicant.record.family === 'MORTAL'
      ? applicant.record.species.typicalLifespan
      : null,
  }
}

function getSafeExperienceRatio(experienceA: number, experienceB: number): number | null {
  if (experienceA === 0 && experienceB === 0) return 1
  if (experienceA === 0 || experienceB === 0) return null
  const ratio = Math.max(experienceA, experienceB) / Math.min(experienceA, experienceB)
  return Number.isFinite(ratio) ? ratio : Number.MAX_VALUE
}

function compareExperience(
  applicantA: NormalizedFbiApplicant & { adultExperience: number },
  applicantB: NormalizedFbiApplicant & { adultExperience: number },
): FbiExperienceComparison {
  const experienceA = applicantA.adultExperience
  const experienceB = applicantB.adultExperience
  const adultExperienceGap = Math.abs(experienceA - experienceB)
  const category = getExperienceCategory(adultExperienceGap)
  const moreExperiencedApplicant: MoreExperiencedApplicant = experienceA === experienceB
    ? 'EQUAL'
    : experienceA > experienceB ? 'A' : 'B'
  const aExceedsBChronology = applicantB.chronologicalAge === null
    ? null
    : experienceA > applicantB.chronologicalAge
  const bExceedsAChronology = applicantA.chronologicalAge === null
    ? null
    : experienceB > applicantA.chronologicalAge

  return {
    category,
    applicantAAdultExperience: experienceA,
    applicantBAdultExperience: experienceB,
    adultExperienceGap,
    moreExperiencedApplicant,
    experienceRatio: getSafeExperienceRatio(experienceA, experienceB),
    applicantAHasMoreAdultExperienceThanBChronologicalAge: aExceedsBChronology,
    applicantBHasMoreAdultExperienceThanAChronologicalAge: bExceedsAChronology,
    oneApplicantHasMoreAdultExperienceThanOtherChronologicalAge:
      aExceedsBChronology === null && bExceedsAChronology === null
        ? null
        : Boolean(aExceedsBChronology || bExceedsAChronology),
    applicantAAdultExperienceExceedsBFiniteLifespan: applicantB.finiteTypicalLifespan === null
      ? null
      : experienceA > applicantB.finiteTypicalLifespan,
    applicantBAdultExperienceExceedsAFiniteLifespan: applicantA.finiteTypicalLifespan === null
      ? null
      : experienceB > applicantA.finiteTypicalLifespan,
    extremeExperienceDisparity: category === 'CIVILIZATIONS',
  }
}

function requireComparisonFacts(
  applicant: NormalizedFbiApplicant,
): asserts applicant is NormalizedFbiApplicant & { effectiveMaturity: number; adultExperience: number } {
  if (applicant.effectiveMaturity === null || applicant.adultExperience === null) {
    throw new TypeError(`Eligible ${applicant.displayName} is missing derived comparison facts.`)
  }
}

export function compareFbiApplicants(
  applicantARecord: FbiApplicantRecord,
  applicantBRecord: FbiApplicantRecord,
): FbiComparisonResult {
  const applicantA = normalizeFbiApplicant(applicantARecord, 'A')
  const applicantB = normalizeFbiApplicant(applicantBRecord, 'B')
  const applicants = [applicantA, applicantB] as const
  const reasons = applicants.flatMap((applicant) => applicant.adultComparisonEligible
    ? []
    : [{
        applicant: applicant.label,
        reason: applicant.ineligibilityReason ?? 'Adult-comparison eligibility was not established.',
      }])

  if (reasons.length > 0) return { status: 'INELIGIBLE', applicants, reasons }

  requireComparisonFacts(applicantA)
  requireComparisonFacts(applicantB)
  const comparableApplicants = [
    { ...applicantA, adultComparisonEligible: true as const },
    { ...applicantB, adultComparisonEligible: true as const },
  ] as const
  const chronologyA = applicantA.chronologicalAge
  const chronologyB = applicantB.chronologicalAge

  return {
    status: 'APPROVED_FOR_COMPARISON',
    applicants: comparableApplicants,
    maturity: getMaturityCompatibility(
      applicantA.effectiveMaturity,
      humanEquivalentReference,
      applicantB.effectiveMaturity,
      humanEquivalentReference,
    ),
    experience: compareExperience(applicantA, applicantB),
    chronology: {
      applicantAChronologicalAge: chronologyA,
      applicantBChronologicalAge: chronologyB,
      chronologicalAgeGap: chronologyA === null || chronologyB === null
        ? null
        : Math.abs(chronologyA - chronologyB),
    },
  }
}
