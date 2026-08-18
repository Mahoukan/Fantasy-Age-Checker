import type { SpeciesId } from '../data/species'
import type { ExperienceCategory } from '../utils/experience'
import type { MaturityCategory } from '../utils/maturity'

export type QuipSlot = 'MATURITY' | 'EXPERIENCE' | 'ADMINISTRATIVE' | 'LOADING'
export type QuipRelationship = 'same-species' | 'cross-species'
export type ExperienceContextFlag =
  | 'ADULT_LONGER_THAN_PARTNER_ALIVE'
  | 'ADULT_EXPERIENCE_EXCEEDS_PARTNER_LIFESPAN'
export type LongevityContextFlag =
  | 'EXCEEDS_TYPICAL_LIFESPAN'
  | 'ANCIENT_BEYOND_TYPICAL_LIFESPAN'
  | 'MULTIPLE_TYPICAL_LIFESPANS_OLD'
  | 'EXTREME_CHRONOLOGICAL_ANOMALY'
  | 'APPLICANT_A_EXCEEDS_TYPICAL_LIFESPAN'
  | 'APPLICANT_B_EXCEEDS_TYPICAL_LIFESPAN'
  | 'APPLICANT_A_ANCIENT_BEYOND_TYPICAL_LIFESPAN'
  | 'APPLICANT_B_ANCIENT_BEYOND_TYPICAL_LIFESPAN'
  | 'APPLICANT_A_MULTIPLE_TYPICAL_LIFESPANS_OLD'
  | 'APPLICANT_B_MULTIPLE_TYPICAL_LIFESPANS_OLD'
  | 'APPLICANT_A_EXTREME_CHRONOLOGICAL_ANOMALY'
  | 'APPLICANT_B_EXTREME_CHRONOLOGICAL_ANOMALY'
export type QuipContextFlag = ExperienceContextFlag | LongevityContextFlag

export interface Quip {
  id: string
  text: string
  slot: QuipSlot
  maturityCategories?: readonly MaturityCategory[]
  experienceCategories?: readonly ExperienceCategory[]
  species?: readonly SpeciesId[]
  relationship?: QuipRelationship
  flags?: readonly QuipContextFlag[]
}

export interface QuipContext {
  maturityCategory: MaturityCategory
  experienceCategory: ExperienceCategory
  speciesIds: string[]
  relationship: QuipRelationship
  flags: QuipContextFlag[]
}

export interface ConsultationQuips {
  maturity: Quip
  experience: Quip
  administrative: Quip
}
