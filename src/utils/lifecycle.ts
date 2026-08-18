import { species, type Species } from '../data/species'

export type AgeValidationResult =
  | { valid: true; value: number }
  | { valid: false; message: string }

export function findSpeciesById(
  id: string,
  availableSpecies: readonly Species[] = species,
): Species | undefined {
  return availableSpecies.find((entry) => entry.id === id)
}

export function validateAge(age: number | ''): AgeValidationResult {
  if (age === '') {
    return { valid: false, message: 'Enter an age for this applicant.' }
  }

  if (!Number.isFinite(age)) {
    return { valid: false, message: 'Age must be a finite number.' }
  }

  if (age < 0) {
    return { valid: false, message: 'Age cannot be negative.' }
  }

  return { valid: true, value: age }
}

export function isAdult(speciesEntry: Species, age: number): boolean {
  return age >= speciesEntry.adulthoodAge
}

export function calculateAdultExperience(speciesEntry: Species, age: number): number {
  return Math.max(0, age - speciesEntry.adulthoodAge)
}

export function calculateRelativeAge(speciesEntry: Species, age: number): number {
  return age / speciesEntry.typicalLifespan
}
