import type { Species } from '../data/species'

export const HUMAN_REFERENCE_LIFESPAN = 84
export const TRADITIONAL_MINIMUM_OFFSET = 7
export const TRADITIONAL_MAXIMUM_OFFSET = TRADITIONAL_MINIMUM_OFFSET * 2
export const EXCELLENT_DIFFERENCE_THRESHOLD = 0.1
export const GOOD_DIFFERENCE_THRESHOLD = 0.25

export type MaturityCategory = 'EXCELLENT' | 'GOOD' | 'BORDERLINE' | 'INCOMPATIBLE'

export interface MaturityRange {
  minimum: number
  maximum: number
}

export interface MaturityCompatibilityResult {
  category: MaturityCategory
  applicantAEquivalentAge: number
  applicantBEquivalentAge: number
  applicantAMinimumEquivalentAge: number
  applicantAMaximumEquivalentAge: number
  applicantBMinimumEquivalentAge: number
  applicantBMaximumEquivalentAge: number
  applicantAWithinBRange: boolean
  applicantBWithinARange: boolean
  mutuallyCompatible: boolean
  relativeDifference: number
}

/**
 * Converts a chronological age to the same fraction of the reference human
 * lifespan. Finite overflow is saturated only at JavaScript's numeric limit;
 * ages are never capped to a species' typical lifespan.
 */
export function getHumanEquivalentAge(age: number, lifespan: number): number {
  if (!Number.isFinite(lifespan) || lifespan <= 0) {
    throw new RangeError('Typical lifespan must be a positive finite number.')
  }

  const scale = HUMAN_REFERENCE_LIFESPAN / lifespan
  if (age > Number.MAX_VALUE / scale) return Number.MAX_VALUE
  return age * scale
}

/** Traditional half-age-plus-seven range on the shared human scale. */
export function getMaturityRange(humanEquivalentAge: number): MaturityRange {
  const maximum = humanEquivalentAge > Number.MAX_VALUE / 2
    ? Number.MAX_VALUE
    : humanEquivalentAge * 2 - TRADITIONAL_MAXIMUM_OFFSET

  return {
    minimum: humanEquivalentAge / 2 + TRADITIONAL_MINIMUM_OFFSET,
    maximum,
  }
}

export function isWithinMaturityRange(
  subjectEquivalentAge: number,
  partnerEquivalentAge: number,
): boolean {
  const range = getMaturityRange(subjectEquivalentAge)
  return partnerEquivalentAge >= range.minimum && partnerEquivalentAge <= range.maximum
}

/**
 * Compatibility is mutual. Compatible pairs are categorized by their age
 * difference divided by the older human-equivalent age: <=10% excellent,
 * <=25% good, and otherwise borderline.
 */
export function getMaturityCompatibility(
  applicantAAge: number,
  speciesA: Species,
  applicantBAge: number,
  speciesB: Species,
): MaturityCompatibilityResult {
  const applicantAEquivalentAge = getHumanEquivalentAge(applicantAAge, speciesA.typicalLifespan)
  const applicantBEquivalentAge = getHumanEquivalentAge(applicantBAge, speciesB.typicalLifespan)
  const applicantARange = getMaturityRange(applicantAEquivalentAge)
  const applicantBRange = getMaturityRange(applicantBEquivalentAge)
  const applicantBWithinARange = isWithinMaturityRange(applicantAEquivalentAge, applicantBEquivalentAge)
  const applicantAWithinBRange = isWithinMaturityRange(applicantBEquivalentAge, applicantAEquivalentAge)
  const mutuallyCompatible = applicantAWithinBRange && applicantBWithinARange
  const olderEquivalentAge = Math.max(applicantAEquivalentAge, applicantBEquivalentAge)
  const difference = Math.abs(applicantAEquivalentAge - applicantBEquivalentAge)
  const relativeDifference = olderEquivalentAge === 0 ? 0 : difference / olderEquivalentAge

  let category: MaturityCategory
  if (!mutuallyCompatible) category = 'INCOMPATIBLE'
  else if (relativeDifference <= EXCELLENT_DIFFERENCE_THRESHOLD) category = 'EXCELLENT'
  else if (relativeDifference <= GOOD_DIFFERENCE_THRESHOLD) category = 'GOOD'
  else category = 'BORDERLINE'

  return {
    category,
    applicantAEquivalentAge,
    applicantBEquivalentAge,
    applicantAMinimumEquivalentAge: applicantARange.minimum,
    applicantAMaximumEquivalentAge: applicantARange.maximum,
    applicantBMinimumEquivalentAge: applicantBRange.minimum,
    applicantBMaximumEquivalentAge: applicantBRange.maximum,
    applicantAWithinBRange,
    applicantBWithinARange,
    mutuallyCompatible,
    relativeDifference,
  }
}
