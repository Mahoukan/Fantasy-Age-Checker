import type { Species } from '../data/species'
import type {
  AcquiredImmortalRecord,
  ManifestedImmortalRecord,
  NaturalImmortalRecord,
  PossessingImmortalRecord,
  ReincarnatingImmortalRecord,
} from '../types/immortalRecords'
import type {
  AcquiredImmortalPreset,
  CustomImmortalPresetInput,
  ImmortalPreset,
  ManifestedImmortalPreset,
  NaturalImmortalPreset,
  TransferredCyclicalPreset,
} from '../types/immortalPresets'
import { calculateAdultExperience, isAdult } from './lifecycle'
import {
  calculateAcquiredCurrentAge,
  calculateAcquiredImmortalMaturity,
  calculateManifestedImmortalMaturity,
  calculateNaturalImmortalMaturity,
} from './immortalMaturity'
import { getHumanEquivalentAge } from './maturity'

const UNDERAGE_ORIGIN_REASON = 'Transformation occurred before the origin species reached recognised adulthood.'
const UNDERAGE_FORM_REASON = 'The current form has not reached its species recognised adulthood.'

function requireFiniteNonNegative(name: string, value: number): void {
  if (!Number.isFinite(value)) throw new TypeError(`${name} must be finite.`)
  if (value < 0) throw new RangeError(`${name} must not be negative.`)
}

function requirePositive(name: string, value: number): void {
  requireFiniteNonNegative(name, value)
  if (value === 0) throw new RangeError(`${name} must be greater than zero.`)
}

function requireSpecies(name: string, species: Species | undefined): Species {
  if (!species) throw new TypeError(`${name} is required.`)
  requireFiniteNonNegative(`${name} adulthood age`, species.adulthoodAge)
  requirePositive(`${name} typical lifespan`, species.typicalLifespan)
  return species
}

function requirePresetFamily<Family extends ImmortalPreset['family']>(
  preset: ImmortalPreset | undefined,
  family: Family,
): asserts preset is Extract<ImmortalPreset, { family: Family }> {
  if (!preset) throw new TypeError('Immortal preset is required.')
  if (preset.family !== family) {
    throw new TypeError(`Preset ${preset.id} does not belong to the ${family} lifecycle family.`)
  }
}

function addFinite(name: string, first: number, second: number): number {
  const value = first + second
  if (!Number.isFinite(value)) throw new RangeError(`${name} exceeds the supported numeric range.`)
  return value
}

export function buildCustomImmortalPreset(input: CustomImmortalPresetInput): ImmortalPreset {
  switch (input.family) {
    case 'ACQUIRED': {
      if (input.maturationMode === 'FROZEN') {
        if (input.maturationHalfLife !== undefined) {
          throw new TypeError('Frozen acquired immortals do not use a maturation half-life.')
        }
        return {
          id: 'custom-immortal', name: 'Custom Immortal', family: 'ACQUIRED',
          requiresOriginSpecies: true, maturationMode: 'FROZEN',
        }
      }
      if (input.maturationHalfLife === undefined) {
        throw new TypeError('Continuing acquired immortals require a maturation half-life.')
      }
      requirePositive('Maturation half-life', input.maturationHalfLife)
      return {
        id: 'custom-immortal', name: 'Custom Immortal', family: 'ACQUIRED',
        requiresOriginSpecies: true, maturationMode: 'CONTINUING',
        maturationHalfLife: input.maturationHalfLife,
      }
    }
    case 'NATURALLY_IMMORTAL':
      requireFiniteNonNegative('Recognised adulthood age', input.recognisedAdulthoodAge)
      requirePositive('Maturation half-life', input.maturationHalfLife)
      return { id: 'custom-immortal', name: 'Custom Immortal', ...input }
    case 'MANIFESTED':
      requirePositive('Maturation half-life', input.maturationHalfLife)
      return { id: 'custom-immortal', name: 'Custom Immortal', ...input, createdMature: true }
    case 'TRANSFERRED_CYCLICAL':
      if (input.subtype !== 'REINCARNATING' && input.subtype !== 'POSSESSING') {
        throw new TypeError('Transferred immortals require a recognised subtype.')
      }
      return { id: 'custom-immortal', name: 'Custom Immortal', ...input }
    default:
      throw new TypeError('Custom immortals require a recognised lifecycle family.')
  }
}

interface BuildAcquiredInput {
  preset: ImmortalPreset | undefined
  originSpecies: Species | undefined
  ageAtTransformation: number
  yearsSinceTransformation: number
}

export function buildAcquiredImmortalRecord({
  preset,
  originSpecies: unresolvedOriginSpecies,
  ageAtTransformation,
  yearsSinceTransformation,
}: BuildAcquiredInput): AcquiredImmortalRecord {
  requirePresetFamily(preset, 'ACQUIRED')
  if (!preset.requiresOriginSpecies) throw new TypeError('Acquired presets require a mortal origin species.')
  const originSpecies = requireSpecies('Origin species', unresolvedOriginSpecies)
  requireFiniteNonNegative('Age at transformation', ageAtTransformation)
  requireFiniteNonNegative('Years since transformation', yearsSinceTransformation)
  const currentAge = calculateAcquiredCurrentAge(ageAtTransformation, yearsSinceTransformation)
  const maturityAtTransformation = getHumanEquivalentAge(ageAtTransformation, originSpecies.typicalLifespan)
  const common = {
    family: 'ACQUIRED' as const,
    presetId: preset.id,
    originSpecies,
    originAdulthoodAge: originSpecies.adulthoodAge,
    originTypicalLifespan: originSpecies.typicalLifespan,
    ageAtTransformation,
    yearsSinceTransformation,
    currentAge,
    maturityAtTransformation,
    maturationMode: preset.maturationMode,
  }

  if (!isAdult(originSpecies, ageAtTransformation)) {
    return {
      ...common,
      adultComparisonEligible: false,
      ineligibilityReason: UNDERAGE_ORIGIN_REASON,
      effectiveMaturity: null,
      preTransformationAdultExperience: null,
      adultExperience: null,
    }
  }

  const effectiveMaturity = preset.maturationMode === 'FROZEN'
    ? calculateAcquiredImmortalMaturity({
        maturationMode: 'FROZEN', maturityAtTransformation, yearsSinceTransformation,
      })
    : calculateAcquiredImmortalMaturity({
        maturationMode: 'CONTINUING',
        maturityAtTransformation,
        yearsSinceTransformation,
        maturationHalfLife: requireAcquiredHalfLife(preset),
      })
  const preTransformationAdultExperience = ageAtTransformation - originSpecies.adulthoodAge

  return {
    ...common,
    adultComparisonEligible: true,
    ineligibilityReason: null,
    effectiveMaturity,
    preTransformationAdultExperience,
    adultExperience: addFinite(
      'Acquired adult experience', preTransformationAdultExperience, yearsSinceTransformation,
    ),
  }
}

function requireAcquiredHalfLife(preset: AcquiredImmortalPreset): number {
  if (preset.maturationMode !== 'CONTINUING' || preset.maturationHalfLife === undefined) {
    throw new TypeError('Continuing acquired presets require a maturation half-life.')
  }
  requirePositive('Maturation half-life', preset.maturationHalfLife)
  return preset.maturationHalfLife
}

interface BuildNaturalInput {
  preset: ImmortalPreset | undefined
  currentAge: number
}

export function buildNaturalImmortalRecord({ preset, currentAge }: BuildNaturalInput): NaturalImmortalRecord {
  requirePresetFamily(preset, 'NATURALLY_IMMORTAL')
  validateNaturalPreset(preset)
  requireFiniteNonNegative('Current age', currentAge)
  const common = {
    family: 'NATURALLY_IMMORTAL' as const,
    presetId: preset.id,
    recognisedAdulthoodAge: preset.recognisedAdulthoodAge,
    maturationHalfLife: preset.maturationHalfLife,
    currentAge,
  }
  if (currentAge < preset.recognisedAdulthoodAge) {
    return {
      ...common,
      adultComparisonEligible: false,
      ineligibilityReason: UNDERAGE_FORM_REASON,
      elapsedImmortalMaturation: null,
      effectiveMaturity: null,
      adultExperience: null,
    }
  }

  const elapsedImmortalMaturation = currentAge - preset.recognisedAdulthoodAge
  return {
    ...common,
    adultComparisonEligible: true,
    ineligibilityReason: null,
    elapsedImmortalMaturation,
    effectiveMaturity: calculateNaturalImmortalMaturity(
      currentAge, preset.recognisedAdulthoodAge, preset.maturationHalfLife,
    ),
    adultExperience: elapsedImmortalMaturation,
  }
}

function validateNaturalPreset(preset: NaturalImmortalPreset): void {
  requireFiniteNonNegative('Recognised adulthood age', preset.recognisedAdulthoodAge)
  requirePositive('Maturation half-life', preset.maturationHalfLife)
}

interface BuildManifestedInput {
  preset: ImmortalPreset | undefined
  yearsSinceManifestation: number
}

export function buildManifestedImmortalRecord({
  preset,
  yearsSinceManifestation,
}: BuildManifestedInput): ManifestedImmortalRecord {
  requirePresetFamily(preset, 'MANIFESTED')
  validateManifestedPreset(preset)
  requireFiniteNonNegative('Years since manifestation', yearsSinceManifestation)
  return {
    family: 'MANIFESTED',
    presetId: preset.id,
    createdMature: true,
    maturationHalfLife: preset.maturationHalfLife,
    yearsSinceManifestation,
    effectiveMaturity: calculateManifestedImmortalMaturity(
      yearsSinceManifestation, preset.maturationHalfLife,
    ),
    adultExperience: yearsSinceManifestation,
    adultComparisonEligible: true,
    ineligibilityReason: null,
  }
}

function validateManifestedPreset(preset: ManifestedImmortalPreset): void {
  if (!preset.createdMature) throw new TypeError('Manifested preset must be explicitly created mature.')
  requirePositive('Maturation half-life', preset.maturationHalfLife)
}

interface BuildReincarnatingInput {
  preset: ImmortalPreset | undefined
  currentFormSpecies: Species | undefined
  currentFormAge: number
  memoriesRetained: boolean
  rememberedPreviousAdultExperience: number
}

export function buildReincarnatingImmortalRecord({
  preset,
  currentFormSpecies: unresolvedCurrentFormSpecies,
  currentFormAge,
  memoriesRetained,
  rememberedPreviousAdultExperience,
}: BuildReincarnatingInput): ReincarnatingImmortalRecord {
  requireTransferredPreset(preset, 'REINCARNATING')
  const currentFormSpecies = requireSpecies('Current form species', unresolvedCurrentFormSpecies)
  requireFiniteNonNegative('Current form age', currentFormAge)
  requireFiniteNonNegative('Remembered previous adult experience', rememberedPreviousAdultExperience)
  const currentLifeAdultExperience = calculateAdultExperience(currentFormSpecies, currentFormAge)
  const adultExperience = memoriesRetained
    ? addFinite('Reincarnating adult experience', currentLifeAdultExperience, rememberedPreviousAdultExperience)
    : currentLifeAdultExperience

  return buildTransferredCommon({
    preset,
    currentFormSpecies,
    currentFormAge,
    adultExperience,
    extra: {
      subtype: 'REINCARNATING' as const,
      memoriesRetained,
      currentLifeAdultExperience,
      rememberedPreviousAdultExperience,
    },
  })
}

interface BuildPossessingInput {
  preset: ImmortalPreset | undefined
  currentHostSpecies: Species | undefined
  currentHostAge: number
  rememberedConsciousExperience: number
}

export function buildPossessingImmortalRecord({
  preset,
  currentHostSpecies,
  currentHostAge,
  rememberedConsciousExperience,
}: BuildPossessingInput): PossessingImmortalRecord {
  requireTransferredPreset(preset, 'POSSESSING')
  const hostSpecies = requireSpecies('Current host species', currentHostSpecies)
  requireFiniteNonNegative('Current host age', currentHostAge)
  requireFiniteNonNegative('Remembered conscious experience', rememberedConsciousExperience)

  return buildTransferredCommon({
    preset,
    currentFormSpecies: hostSpecies,
    currentFormAge: currentHostAge,
    adultExperience: rememberedConsciousExperience,
    extra: {
      subtype: 'POSSESSING' as const,
      rememberedConsciousExperience,
    },
  })
}

function requireTransferredPreset<Subtype extends TransferredCyclicalPreset['subtype']>(
  preset: ImmortalPreset | undefined,
  subtype: Subtype,
): asserts preset is TransferredCyclicalPreset & { subtype: Subtype } {
  requirePresetFamily(preset, 'TRANSFERRED_CYCLICAL')
  if (preset.subtype !== subtype) {
    throw new TypeError(`Transferred preset ${preset.id} does not use the ${subtype} subtype.`)
  }
}

interface BuildTransferredCommonInput<Extra extends { subtype: TransferredCyclicalPreset['subtype'] }> {
  preset: TransferredCyclicalPreset
  currentFormSpecies: Species
  currentFormAge: number
  adultExperience: number
  extra: Extra
}

function buildTransferredCommon<Extra extends { subtype: TransferredCyclicalPreset['subtype'] }>({
  preset,
  currentFormSpecies,
  currentFormAge,
  adultExperience,
  extra,
}: BuildTransferredCommonInput<Extra>) {
  const adultComparisonEligible = isAdult(currentFormSpecies, currentFormAge)
  return {
    family: 'TRANSFERRED_CYCLICAL' as const,
    presetId: preset.id,
    currentFormSpecies,
    currentFormAge,
    effectiveMaturity: getHumanEquivalentAge(currentFormAge, currentFormSpecies.typicalLifespan),
    adultComparisonEligible,
    ineligibilityReason: adultComparisonEligible ? null : UNDERAGE_FORM_REASON,
    adultExperience,
    ...extra,
  }
}
