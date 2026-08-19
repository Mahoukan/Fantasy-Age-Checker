import type { Species } from '../data/species'

export type ImmortalLifecycleFamily =
  | 'ACQUIRED'
  | 'NATURALLY_IMMORTAL'
  | 'MANIFESTED'
  | 'TRANSFERRED_CYCLICAL'

export type ImmortalMaturationMode = 'FROZEN' | 'CONTINUING'

export interface AcquiredImmortalLifecycle {
  family: 'ACQUIRED'
  originSpecies: Species
  ageAtTransformation: number
  yearsSinceTransformation: number
  maturationMode: ImmortalMaturationMode
}

export interface NaturallyImmortalLifecycle {
  family: 'NATURALLY_IMMORTAL'
  recognisedAdulthoodAge: number
  maturationHalfLife: number
  currentAge: number
}

export interface ManifestedImmortalLifecycle {
  family: 'MANIFESTED'
  createdMature: true
  maturationHalfLife: number
  yearsSinceManifestation: number
}

export interface TransferredCyclicalLifecycle {
  family: 'TRANSFERRED_CYCLICAL'
  maturitySource: {
    kind: 'CURRENT_BODY_MATURITY'
    bodySpecies: Species
    currentBodyAge: number
  }
  experienceSource: {
    kind: 'CONSCIOUSNESS_EXPERIENCE'
    rememberedAdultExperience: number
  }
}

export type ImmortalLifecycle =
  | AcquiredImmortalLifecycle
  | NaturallyImmortalLifecycle
  | ManifestedImmortalLifecycle
  | TransferredCyclicalLifecycle

export type ImmortalExperienceSource =
  | {
      kind: 'ACQUIRED'
      preTransformationAdultExperience: number
      yearsSinceTransformation: number
    }
  | {
      kind: 'NATURALLY_IMMORTAL'
      currentAge: number
      recognisedAdulthoodAge: number
    }
  | {
      kind: 'MANIFESTED'
      yearsSinceManifestation: number
    }
  | {
      kind: 'REINCARNATING'
      currentLifeAdultExperience: number
      rememberedPreviousAdultExperience: number
    }
  | {
      kind: 'CONSCIOUSNESS_EXPERIENCE'
      rememberedConsciousExperience: number
    }

