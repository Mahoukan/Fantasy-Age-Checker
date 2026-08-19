import type { ImmortalLifecycleFamily, ImmortalMaturationMode } from './immortal'

export type AcquiredImmortalPresetId =
  | 'vampire'
  | 'lich'
  | 'ageless-cursed-immortal'
  | 'ascended-immortal'
  | 'custom-immortal'

export type NaturalImmortalPresetId =
  | 'angel'
  | 'demon'
  | 'god-divine-being'
  | 'primordial'
  | 'custom-immortal'

export type ManifestedImmortalPresetId = 'manifested-being' | 'custom-immortal'

export type TransferredCyclicalPresetId =
  | 'reincarnating-being'
  | 'possessing-spirit'
  | 'custom-immortal'

export type ImmortalPresetId =
  | AcquiredImmortalPresetId
  | NaturalImmortalPresetId
  | ManifestedImmortalPresetId
  | TransferredCyclicalPresetId

export type TransferredCyclicalSubtype = 'REINCARNATING' | 'POSSESSING'

interface ImmortalPresetBase<Id extends ImmortalPresetId> {
  id: Id
  name: string
  family: ImmortalLifecycleFamily
}

export interface AcquiredImmortalPreset extends ImmortalPresetBase<AcquiredImmortalPresetId> {
  family: 'ACQUIRED'
  requiresOriginSpecies: true
  maturationMode: ImmortalMaturationMode
  maturationHalfLife?: number
}

export interface NaturalImmortalPreset extends ImmortalPresetBase<NaturalImmortalPresetId> {
  family: 'NATURALLY_IMMORTAL'
  recognisedAdulthoodAge: number
  maturationHalfLife: number
}

export interface ManifestedImmortalPreset extends ImmortalPresetBase<ManifestedImmortalPresetId> {
  family: 'MANIFESTED'
  createdMature: true
  maturationHalfLife: number
}

export interface TransferredCyclicalPreset extends ImmortalPresetBase<TransferredCyclicalPresetId> {
  family: 'TRANSFERRED_CYCLICAL'
  subtype: TransferredCyclicalSubtype
}

export type ImmortalPreset =
  | AcquiredImmortalPreset
  | NaturalImmortalPreset
  | ManifestedImmortalPreset
  | TransferredCyclicalPreset

export type CustomImmortalPresetInput =
  | {
      family: 'ACQUIRED'
      maturationMode: ImmortalMaturationMode
      maturationHalfLife?: number
    }
  | {
      family: 'NATURALLY_IMMORTAL'
      recognisedAdulthoodAge: number
      maturationHalfLife: number
    }
  | {
      family: 'MANIFESTED'
      maturationHalfLife: number
    }
  | {
      family: 'TRANSFERRED_CYCLICAL'
      subtype: TransferredCyclicalSubtype
    }
