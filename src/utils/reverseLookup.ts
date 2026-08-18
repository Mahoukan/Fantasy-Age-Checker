import type { Species } from '../data/species'
import { isAdult } from './lifecycle'
import {
  getChronologicalAgeFromHumanEquivalent,
  getHumanEquivalentAge,
  getMaturityRange,
} from './maturity'

export interface ReverseLookupInput {
  sourceSpecies: Species
  sourceAge: number
  targetSpecies: Species
}

export interface ReverseLookupUnavailable {
  status: 'source-underage'
  sourceAdulthoodAge: number
}

export interface ReverseLookupAvailable {
  status: 'available'
  sourceEquivalentAge: number
  targetEquivalentAge: number
  rawTargetMinimumAge: number
  rawTargetMaximumAge: number
  adultTargetMinimumAge?: number
  adultTargetMaximumAge?: number
  targetAdulthoodAge: number
  hasAdultTargetRange: boolean
  targetRangeStartsBelowAdulthood: boolean
  closestTargetIsAdult: boolean
  sourceExceedsTypicalLifespan: boolean
  targetEquivalentExceedsTypicalLifespan: boolean
}

export type ReverseLookupResult = ReverseLookupUnavailable | ReverseLookupAvailable

/**
 * Performs a one-directional lifecycle lookup. It deliberately does not run
 * mutual compatibility, experience, consultation, or presentation analysis.
 */
export function reverseLookup({
  sourceSpecies,
  sourceAge,
  targetSpecies,
}: ReverseLookupInput): ReverseLookupResult {
  if (!Number.isFinite(sourceAge) || sourceAge < 0) {
    throw new RangeError('Source age must be a non-negative finite number.')
  }
  if (!isAdult(sourceSpecies, sourceAge)) {
    return {
      status: 'source-underage',
      sourceAdulthoodAge: sourceSpecies.adulthoodAge,
    }
  }

  const sourceEquivalentAge = getHumanEquivalentAge(sourceAge, sourceSpecies.typicalLifespan)
  const equivalentRange = getMaturityRange(sourceEquivalentAge)
  const targetEquivalentAge = getChronologicalAgeFromHumanEquivalent(
    sourceEquivalentAge,
    targetSpecies.typicalLifespan,
  )
  const rawTargetMinimumAge = getChronologicalAgeFromHumanEquivalent(
    equivalentRange.minimum,
    targetSpecies.typicalLifespan,
  )
  const rawTargetMaximumAge = getChronologicalAgeFromHumanEquivalent(
    equivalentRange.maximum,
    targetSpecies.typicalLifespan,
  )
  const adultTargetMinimumAge = Math.max(rawTargetMinimumAge, targetSpecies.adulthoodAge)
  const hasAdultTargetRange = rawTargetMinimumAge <= rawTargetMaximumAge
    && adultTargetMinimumAge <= rawTargetMaximumAge

  return {
    status: 'available',
    sourceEquivalentAge,
    targetEquivalentAge,
    rawTargetMinimumAge,
    rawTargetMaximumAge,
    ...(hasAdultTargetRange ? {
      adultTargetMinimumAge,
      adultTargetMaximumAge: rawTargetMaximumAge,
    } : {}),
    targetAdulthoodAge: targetSpecies.adulthoodAge,
    hasAdultTargetRange,
    targetRangeStartsBelowAdulthood: rawTargetMinimumAge < targetSpecies.adulthoodAge,
    closestTargetIsAdult: isAdult(targetSpecies, targetEquivalentAge),
    sourceExceedsTypicalLifespan: sourceAge > sourceSpecies.typicalLifespan,
    targetEquivalentExceedsTypicalLifespan: targetEquivalentAge > targetSpecies.typicalLifespan,
  }
}
