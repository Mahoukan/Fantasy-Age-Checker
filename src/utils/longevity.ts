import type { ApplicantLabel } from '../types/applicant'

export const LONGEVITY_THRESHOLDS = {
  normalMaximum: 1,
  exceptionalMaximum: 1.25,
  ancientMaximum: 2,
  legendaryMaximum: 5,
} as const

export type LongevityCategory =
  | 'NORMAL'
  | 'EXCEPTIONAL'
  | 'ANCIENT'
  | 'LEGENDARY'
  | 'ANOMALOUS'

export interface LongevityResult {
  ratio: number
  category: LongevityCategory
  exceedsTypicalLifespan: boolean
  excessYears: number
  lifespanMultiples: number
}

export interface ApplicantLongevityResult extends LongevityResult {
  applicant: ApplicantLabel
}

export function getLongevityCategory(ratio: number): LongevityCategory {
  if (ratio <= LONGEVITY_THRESHOLDS.normalMaximum) return 'NORMAL'
  if (ratio <= LONGEVITY_THRESHOLDS.exceptionalMaximum) return 'EXCEPTIONAL'
  if (ratio <= LONGEVITY_THRESHOLDS.ancientMaximum) return 'ANCIENT'
  if (ratio <= LONGEVITY_THRESHOLDS.legendaryMaximum) return 'LEGENDARY'
  return 'ANOMALOUS'
}

/** Typical lifespan is a reference point, never a maximum or validation boundary. */
export function getLongevity(age: number, typicalLifespan: number): LongevityResult {
  if (!Number.isFinite(age) || age < 0) {
    throw new RangeError('Age must be a non-negative finite number.')
  }
  if (!Number.isFinite(typicalLifespan) || typicalLifespan <= 0) {
    throw new RangeError('Typical lifespan must be a positive finite number.')
  }

  const ratio = age / typicalLifespan
  return {
    ratio,
    category: getLongevityCategory(ratio),
    exceedsTypicalLifespan: ratio > LONGEVITY_THRESHOLDS.normalMaximum,
    excessYears: Math.max(0, age - typicalLifespan),
    lifespanMultiples: ratio,
  }
}
