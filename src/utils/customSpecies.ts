import type { CustomSpecies, CustomSpeciesId, Species } from '../data/species'

export const CUSTOM_SPECIES_NAME_MINIMUM = 2
export const CUSTOM_SPECIES_NAME_MAXIMUM = 40

export interface CustomSpeciesDraft {
  name: string
  adulthoodAge: number | ''
  typicalLifespan: number | ''
}

export interface CustomSpeciesErrors {
  name?: string
  adulthoodAge?: string
  typicalLifespan?: string
}

export type CustomSpeciesCreationResult =
  | { success: true; species: CustomSpecies }
  | { success: false; errors: CustomSpeciesErrors }

export interface CustomSpeciesRemovalResult {
  removed: boolean
  species: CustomSpecies[]
  reason?: 'in-use' | 'not-found'
}

export function validateCustomSpecies(
  draft: CustomSpeciesDraft,
  availableSpecies: readonly Species[],
): CustomSpeciesErrors {
  const errors: CustomSpeciesErrors = {}
  const name = draft.name.trim()
  const visibleLength = Array.from(name).length

  if (visibleLength === 0) errors.name = 'Enter a species name.'
  else if (visibleLength < CUSTOM_SPECIES_NAME_MINIMUM) {
    errors.name = 'Species name must contain at least 2 visible characters.'
  } else if (visibleLength > CUSTOM_SPECIES_NAME_MAXIMUM) {
    errors.name = 'Species name must be 40 characters or fewer.'
  } else if (availableSpecies.some((entry) => entry.name.trim().toLocaleLowerCase() === name.toLocaleLowerCase())) {
    errors.name = 'A species with this name is already registered.'
  }

  if (draft.adulthoodAge === '' || !Number.isFinite(draft.adulthoodAge)) {
    errors.adulthoodAge = 'Enter a finite adulthood age.'
  } else if (draft.adulthoodAge <= 0) {
    errors.adulthoodAge = 'Adulthood age must be greater than zero.'
  }

  if (draft.typicalLifespan === '' || !Number.isFinite(draft.typicalLifespan)) {
    errors.typicalLifespan = 'Enter a finite typical lifespan.'
  } else if (draft.typicalLifespan <= 0) {
    errors.typicalLifespan = 'Typical lifespan must be greater than zero.'
  } else if (
    typeof draft.adulthoodAge === 'number'
    && Number.isFinite(draft.adulthoodAge)
    && draft.typicalLifespan <= draft.adulthoodAge
  ) {
    errors.typicalLifespan = 'Typical lifespan must be greater than the adulthood age.'
  }

  return errors
}

export function getNextCustomSpeciesId(availableSpecies: readonly Species[]): CustomSpeciesId {
  const existingIds = new Set(availableSpecies.map((entry) => entry.id))
  let ordinal = 1
  while (existingIds.has(`custom-${ordinal}`)) ordinal += 1
  return `custom-${ordinal}`
}

export function createCustomSpecies(
  draft: CustomSpeciesDraft,
  availableSpecies: readonly Species[],
): CustomSpeciesCreationResult {
  const errors = validateCustomSpecies(draft, availableSpecies)
  if (Object.keys(errors).length > 0) return { success: false, errors }

  return {
    success: true,
    species: {
      id: getNextCustomSpeciesId(availableSpecies),
      name: draft.name.trim(),
      adulthoodAge: draft.adulthoodAge as number,
      typicalLifespan: draft.typicalLifespan as number,
      source: 'custom',
    },
  }
}

export function removeCustomSpecies(
  customSpecies: readonly CustomSpecies[],
  speciesId: CustomSpeciesId,
  inUseSpeciesIds: readonly string[],
): CustomSpeciesRemovalResult {
  if (inUseSpeciesIds.includes(speciesId)) {
    return { removed: false, species: [...customSpecies], reason: 'in-use' }
  }
  if (!customSpecies.some((entry) => entry.id === speciesId)) {
    return { removed: false, species: [...customSpecies], reason: 'not-found' }
  }
  return { removed: true, species: customSpecies.filter((entry) => entry.id !== speciesId) }
}
