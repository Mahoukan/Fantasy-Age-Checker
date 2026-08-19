import { customImmortalPreset, findImmortalPreset } from '../data/immortalPresets'
import type { Species } from '../data/species'
import type {
  DraftNumber,
  FbiApplicantDraft,
  FbiApplicantDraftField,
  FbiApplicantErrors,
  FbiApplicantResolution,
  MortalFbiRecord,
} from '../types/fbiApplicant'
import type { CustomImmortalPresetInput, ImmortalPreset } from '../types/immortalPresets'
import { normalizeApplicantName } from './applicantName'
import {
  buildAcquiredImmortalRecord,
  buildCustomImmortalPreset,
  buildManifestedImmortalRecord,
  buildNaturalImmortalRecord,
  buildPossessingImmortalRecord,
  buildReincarnatingImmortalRecord,
} from './immortalRecords'
import { calculateAdultExperience, findSpeciesById, isAdult } from './lifecycle'
import { getHumanEquivalentAge } from './maturity'

const MORTAL_INELIGIBILITY = 'The mortal applicant has not reached recognised adulthood.'

export function createDefaultFbiApplicantDraft(label: 'A' | 'B'): FbiApplicantDraft {
  return {
    mode: label === 'A' ? 'MORTAL' : 'IMMORTAL',
    name: '',
    mortalSpeciesId: 'human',
    mortalAge: 34,
    presetId: label === 'A' ? 'vampire' : 'angel',
    customFamily: 'ACQUIRED',
    customMaturationMode: 'FROZEN',
    customMaturationHalfLife: 1000,
    customRecognisedAdulthoodAge: 100,
    customTransferredSubtype: 'REINCARNATING',
    originSpeciesId: 'human',
    ageAtTransformation: 34,
    yearsSinceTransformation: 500,
    naturalCurrentAge: 600,
    yearsSinceManifestation: 100,
    currentFormSpeciesId: 'human',
    currentFormAge: 34,
    memoriesRetained: true,
    rememberedPreviousAdultExperience: 100,
    rememberedConsciousExperience: 100,
  }
}

function readNumber(
  value: DraftNumber,
  field: FbiApplicantDraftField,
  label: string,
  errors: FbiApplicantErrors,
  positive = false,
): number | undefined {
  if (value === '') {
    errors[field] = `Enter ${label.toLowerCase()}.`
    return undefined
  }
  if (!Number.isFinite(value)) {
    errors[field] = `${label} must be finite.`
    return undefined
  }
  if (value < 0 || (positive && value === 0)) {
    errors[field] = positive ? `${label} must be greater than zero.` : `${label} cannot be negative.`
    return undefined
  }
  return value
}

function readSpecies(
  id: string,
  field: FbiApplicantDraftField,
  label: string,
  availableSpecies: readonly Species[],
  errors: FbiApplicantErrors,
): Species | undefined {
  const selected = findSpeciesById(id, availableSpecies)
  if (!selected) errors[field] = `Select a recognised ${label.toLowerCase()}.`
  return selected
}

function buildMortalRecord(species: Species, age: number): MortalFbiRecord {
  const adultComparisonEligible = isAdult(species, age)
  return {
    family: 'MORTAL',
    species,
    age,
    effectiveMaturity: getHumanEquivalentAge(age, species.typicalLifespan),
    adultExperience: calculateAdultExperience(species, age),
    adultComparisonEligible,
    ineligibilityReason: adultComparisonEligible ? null : MORTAL_INELIGIBILITY,
  }
}

function resolveCustomPreset(draft: FbiApplicantDraft, errors: FbiApplicantErrors): ImmortalPreset | undefined {
  let input: CustomImmortalPresetInput | undefined
  switch (draft.customFamily) {
    case 'ACQUIRED': {
      if (draft.customMaturationMode === 'FROZEN') {
        input = { family: 'ACQUIRED', maturationMode: 'FROZEN' }
      } else {
        const halfLife = readNumber(
          draft.customMaturationHalfLife, 'customMaturationHalfLife', 'Maturation half-life', errors, true,
        )
        if (halfLife !== undefined) {
          input = { family: 'ACQUIRED', maturationMode: 'CONTINUING', maturationHalfLife: halfLife }
        }
      }
      break
    }
    case 'NATURALLY_IMMORTAL': {
      const adulthood = readNumber(
        draft.customRecognisedAdulthoodAge,
        'customRecognisedAdulthoodAge',
        'Recognised adulthood age',
        errors,
      )
      const halfLife = readNumber(
        draft.customMaturationHalfLife, 'customMaturationHalfLife', 'Maturation half-life', errors, true,
      )
      if (adulthood !== undefined && halfLife !== undefined) {
        input = {
          family: 'NATURALLY_IMMORTAL',
          recognisedAdulthoodAge: adulthood,
          maturationHalfLife: halfLife,
        }
      }
      break
    }
    case 'MANIFESTED': {
      const halfLife = readNumber(
        draft.customMaturationHalfLife, 'customMaturationHalfLife', 'Maturation half-life', errors, true,
      )
      if (halfLife !== undefined) input = { family: 'MANIFESTED', maturationHalfLife: halfLife }
      break
    }
    case 'TRANSFERRED_CYCLICAL':
      input = { family: 'TRANSFERRED_CYCLICAL', subtype: draft.customTransferredSubtype }
      break
  }
  if (!input) return undefined
  try {
    return buildCustomImmortalPreset(input)
  } catch (error) {
    errors.form = error instanceof Error ? error.message : 'Custom immortal configuration is invalid.'
    return undefined
  }
}

export function resolveFbiApplicantDraft(
  draft: FbiApplicantDraft,
  availableSpecies: readonly Species[],
): FbiApplicantResolution {
  const errors: FbiApplicantErrors = {}
  const name = normalizeApplicantName(draft.name)
  if (draft.mode === 'MORTAL') {
    const species = readSpecies(
      draft.mortalSpeciesId, 'mortalSpeciesId', 'species', availableSpecies, errors,
    )
    const age = readNumber(draft.mortalAge, 'mortalAge', 'Age', errors)
    if (!species || age === undefined) return { valid: false, errors }
    return {
      valid: true,
      errors,
      applicant: {
        mode: 'MORTAL',
        ...(name ? { name } : {}),
        classification: 'Mortal lifecycle record',
        record: buildMortalRecord(species, age),
      },
    }
  }

  const preset = draft.presetId === customImmortalPreset.id
    ? resolveCustomPreset(draft, errors)
    : findImmortalPreset(draft.presetId)
  if (!preset) {
    if (!errors.form) errors.presetId = 'Select a recognised immortal classification.'
    return { valid: false, errors }
  }

  try {
    switch (preset.family) {
      case 'ACQUIRED': {
        const originSpecies = readSpecies(
          draft.originSpeciesId, 'originSpeciesId', 'origin species', availableSpecies, errors,
        )
        const ageAtTransformation = readNumber(
          draft.ageAtTransformation, 'ageAtTransformation', 'Age at transformation', errors,
        )
        const yearsSinceTransformation = readNumber(
          draft.yearsSinceTransformation,
          'yearsSinceTransformation',
          'Years since transformation',
          errors,
        )
        if (!originSpecies || ageAtTransformation === undefined || yearsSinceTransformation === undefined) {
          return { valid: false, errors }
        }
        return {
          valid: true,
          errors,
          applicant: {
            mode: 'IMMORTAL', ...(name ? { name } : {}), classification: preset.name,
            record: buildAcquiredImmortalRecord({
              preset, originSpecies, ageAtTransformation, yearsSinceTransformation,
            }),
          },
        }
      }
      case 'NATURALLY_IMMORTAL': {
        const currentAge = readNumber(draft.naturalCurrentAge, 'naturalCurrentAge', 'Current age', errors)
        if (currentAge === undefined) return { valid: false, errors }
        return {
          valid: true,
          errors,
          applicant: {
            mode: 'IMMORTAL', ...(name ? { name } : {}), classification: preset.name,
            record: buildNaturalImmortalRecord({ preset, currentAge }),
          },
        }
      }
      case 'MANIFESTED': {
        const elapsed = readNumber(
          draft.yearsSinceManifestation,
          'yearsSinceManifestation',
          'Years since manifestation',
          errors,
        )
        if (elapsed === undefined) return { valid: false, errors }
        return {
          valid: true,
          errors,
          applicant: {
            mode: 'IMMORTAL', ...(name ? { name } : {}), classification: preset.name,
            record: buildManifestedImmortalRecord({ preset, yearsSinceManifestation: elapsed }),
          },
        }
      }
      case 'TRANSFERRED_CYCLICAL': {
        const currentFormSpecies = readSpecies(
          draft.currentFormSpeciesId,
          'currentFormSpeciesId',
          preset.subtype === 'POSSESSING' ? 'current host species' : 'current form species',
          availableSpecies,
          errors,
        )
        const currentFormAge = readNumber(
          draft.currentFormAge,
          'currentFormAge',
          preset.subtype === 'POSSESSING' ? 'Current host age' : 'Current form age',
          errors,
        )
        if (!currentFormSpecies || currentFormAge === undefined) return { valid: false, errors }
        if (preset.subtype === 'REINCARNATING') {
          const rememberedExperience = draft.memoriesRetained
            ? readNumber(
                draft.rememberedPreviousAdultExperience,
                'rememberedPreviousAdultExperience',
                'Remembered previous adult experience',
                errors,
              )
            : 0
          if (rememberedExperience === undefined) return { valid: false, errors }
          return {
            valid: true,
            errors,
            applicant: {
              mode: 'IMMORTAL', ...(name ? { name } : {}), classification: preset.name,
              record: buildReincarnatingImmortalRecord({
                preset,
                currentFormSpecies,
                currentFormAge,
                memoriesRetained: draft.memoriesRetained,
                rememberedPreviousAdultExperience: rememberedExperience,
              }),
            },
          }
        }
        const rememberedExperience = readNumber(
          draft.rememberedConsciousExperience,
          'rememberedConsciousExperience',
          'Remembered conscious experience',
          errors,
        )
        if (rememberedExperience === undefined) return { valid: false, errors }
        return {
          valid: true,
          errors,
          applicant: {
            mode: 'IMMORTAL', ...(name ? { name } : {}), classification: preset.name,
            record: buildPossessingImmortalRecord({
              preset,
              currentHostSpecies: currentFormSpecies,
              currentHostAge: currentFormAge,
              rememberedConsciousExperience: rememberedExperience,
            }),
          },
        }
      }
    }
  } catch (error) {
    errors.form = error instanceof Error ? error.message : 'The immortal record could not be validated.'
    return { valid: false, errors }
  }
}

