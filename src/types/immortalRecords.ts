import type { Species } from '../data/species'
import type { ImmortalMaturationMode } from './immortal'
import type { ImmortalPresetId, TransferredCyclicalSubtype } from './immortalPresets'

interface EligibleAdultRecord {
  adultComparisonEligible: true
  ineligibilityReason: null
}

interface IneligibleAdultRecord {
  adultComparisonEligible: false
  ineligibilityReason: string
}

export type AdultEligibility = EligibleAdultRecord | IneligibleAdultRecord

interface AcquiredRecordBase {
  family: 'ACQUIRED'
  presetId: ImmortalPresetId
  originSpecies: Species
  originAdulthoodAge: number
  originTypicalLifespan: number
  ageAtTransformation: number
  yearsSinceTransformation: number
  currentAge: number
  maturityAtTransformation: number
  maturationMode: ImmortalMaturationMode
}

export type AcquiredImmortalRecord = AcquiredRecordBase & (
  | EligibleAdultRecord & {
      effectiveMaturity: number
      preTransformationAdultExperience: number
      adultExperience: number
    }
  | IneligibleAdultRecord & {
      effectiveMaturity: null
      preTransformationAdultExperience: null
      adultExperience: null
    }
)

interface NaturalRecordBase {
  family: 'NATURALLY_IMMORTAL'
  presetId: ImmortalPresetId
  recognisedAdulthoodAge: number
  maturationHalfLife: number
  currentAge: number
}

export type NaturalImmortalRecord = NaturalRecordBase & (
  | EligibleAdultRecord & {
      elapsedImmortalMaturation: number
      effectiveMaturity: number
      adultExperience: number
    }
  | IneligibleAdultRecord & {
      elapsedImmortalMaturation: null
      effectiveMaturity: null
      adultExperience: null
    }
)

export interface ManifestedImmortalRecord extends EligibleAdultRecord {
  family: 'MANIFESTED'
  presetId: ImmortalPresetId
  createdMature: true
  maturationHalfLife: number
  yearsSinceManifestation: number
  effectiveMaturity: number
  adultExperience: number
}

interface TransferredRecordBase {
  family: 'TRANSFERRED_CYCLICAL'
  presetId: ImmortalPresetId
  subtype: TransferredCyclicalSubtype
  currentFormSpecies: Species
  currentFormAge: number
  effectiveMaturity: number
  adultComparisonEligible: boolean
  ineligibilityReason: string | null
  adultExperience: number
}

export interface ReincarnatingImmortalRecord extends TransferredRecordBase {
  subtype: 'REINCARNATING'
  memoriesRetained: boolean
  currentLifeAdultExperience: number
  rememberedPreviousAdultExperience: number
}

export interface PossessingImmortalRecord extends TransferredRecordBase {
  subtype: 'POSSESSING'
  rememberedConsciousExperience: number
}

