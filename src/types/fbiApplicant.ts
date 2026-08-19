import type { Species } from '../data/species'
import type {
  AcquiredImmortalRecord,
  ManifestedImmortalRecord,
  NaturalImmortalRecord,
  PossessingImmortalRecord,
  ReincarnatingImmortalRecord,
} from './immortalRecords'
import type {
  ImmortalPresetId,
  TransferredCyclicalSubtype,
} from './immortalPresets'
import type { ImmortalLifecycleFamily, ImmortalMaturationMode } from './immortal'

export type FbiApplicantMode = 'MORTAL' | 'IMMORTAL'
export type DraftNumber = number | ''

export interface FbiApplicantDraft {
  mode: FbiApplicantMode
  name: string
  mortalSpeciesId: string
  mortalAge: DraftNumber
  presetId: ImmortalPresetId
  customFamily: ImmortalLifecycleFamily
  customMaturationMode: ImmortalMaturationMode
  customMaturationHalfLife: DraftNumber
  customRecognisedAdulthoodAge: DraftNumber
  customTransferredSubtype: TransferredCyclicalSubtype
  originSpeciesId: string
  ageAtTransformation: DraftNumber
  yearsSinceTransformation: DraftNumber
  naturalCurrentAge: DraftNumber
  yearsSinceManifestation: DraftNumber
  currentFormSpeciesId: string
  currentFormAge: DraftNumber
  memoriesRetained: boolean
  rememberedPreviousAdultExperience: DraftNumber
  rememberedConsciousExperience: DraftNumber
}

export type FbiApplicantDraftField = keyof FbiApplicantDraft | 'form'
export type FbiApplicantErrors = Partial<Record<FbiApplicantDraftField, string>>

export interface MortalFbiRecord {
  family: 'MORTAL'
  species: Species
  age: number
  effectiveMaturity: number
  adultExperience: number
  adultComparisonEligible: boolean
  ineligibilityReason: string | null
}

export type ImmortalFbiRecord =
  | AcquiredImmortalRecord
  | NaturalImmortalRecord
  | ManifestedImmortalRecord
  | ReincarnatingImmortalRecord
  | PossessingImmortalRecord

export type FbiApplicantRecord =
  | { mode: 'MORTAL'; name?: string; classification: string; record: MortalFbiRecord }
  | { mode: 'IMMORTAL'; name?: string; classification: string; record: ImmortalFbiRecord }

export type FbiApplicantResolution =
  | { valid: true; errors: FbiApplicantErrors; applicant: FbiApplicantRecord }
  | { valid: false; errors: FbiApplicantErrors; applicant?: undefined }

