export const IMMORTAL_MATURITY_CEILING = 100
export const NATURAL_IMMORTAL_ADULTHOOD_EQUIVALENT = 18
export const MANIFESTED_MATURE_STARTING_EQUIVALENT = 25

export interface ContinuingImmortalMaturityInput {
  startingMaturity: number
  elapsedYears: number
  maturationHalfLife: number
}

export type AcquiredImmortalMaturityInput = {
  maturationMode: 'FROZEN'
  maturityAtTransformation: number
  yearsSinceTransformation: number
} | {
  maturationMode: 'CONTINUING'
  maturityAtTransformation: number
  yearsSinceTransformation: number
  maturationHalfLife: number
}

function requireFinite(name: string, value: number): void {
  if (!Number.isFinite(value)) throw new TypeError(`${name} must be finite.`)
}

function requireNonNegative(name: string, value: number): void {
  requireFinite(name, value)
  if (value < 0) throw new RangeError(`${name} must not be negative.`)
}

function validateStartingMaturity(startingMaturity: number): void {
  requireNonNegative('Starting maturity', startingMaturity)
  if (startingMaturity >= IMMORTAL_MATURITY_CEILING) {
    throw new RangeError(`Starting maturity must be below ${IMMORTAL_MATURITY_CEILING}.`)
  }
}

export function calculateContinuingImmortalMaturity({
  startingMaturity,
  elapsedYears,
  maturationHalfLife,
}: ContinuingImmortalMaturityInput): number {
  validateStartingMaturity(startingMaturity)
  requireNonNegative('Elapsed years', elapsedYears)
  requireFinite('Maturation half-life', maturationHalfLife)
  if (maturationHalfLife <= 0) throw new RangeError('Maturation half-life must be greater than zero.')

  const remainingDistance = (IMMORTAL_MATURITY_CEILING - startingMaturity)
    * Math.pow(0.5, elapsedYears / maturationHalfLife)
  const maturity = IMMORTAL_MATURITY_CEILING - remainingDistance

  // Extremely large finite intervals can underflow the remaining distance to zero.
  return maturity < IMMORTAL_MATURITY_CEILING
    ? maturity
    : IMMORTAL_MATURITY_CEILING - Number.EPSILON * IMMORTAL_MATURITY_CEILING
}

export function calculateAcquiredCurrentAge(ageAtTransformation: number, yearsSinceTransformation: number): number {
  requireNonNegative('Age at transformation', ageAtTransformation)
  requireNonNegative('Years since transformation', yearsSinceTransformation)
  const currentAge = ageAtTransformation + yearsSinceTransformation
  requireFinite('Current age', currentAge)
  return currentAge
}

export function calculateAcquiredImmortalMaturity(input: AcquiredImmortalMaturityInput): number {
  requireNonNegative('Maturity at transformation', input.maturityAtTransformation)
  requireNonNegative('Years since transformation', input.yearsSinceTransformation)
  if (input.maturationMode === 'FROZEN') return input.maturityAtTransformation

  return calculateContinuingImmortalMaturity({
    startingMaturity: input.maturityAtTransformation,
    elapsedYears: input.yearsSinceTransformation,
    maturationHalfLife: input.maturationHalfLife,
  })
}

export function calculateNaturalImmortalMaturity(
  currentAge: number,
  recognisedAdulthoodAge: number,
  maturationHalfLife: number,
): number {
  requireNonNegative('Current age', currentAge)
  requireNonNegative('Recognised adulthood age', recognisedAdulthoodAge)
  if (currentAge < recognisedAdulthoodAge) {
    throw new RangeError('Current age must meet recognised adulthood before adult maturity can be calculated.')
  }
  return calculateContinuingImmortalMaturity({
    startingMaturity: NATURAL_IMMORTAL_ADULTHOOD_EQUIVALENT,
    elapsedYears: currentAge - recognisedAdulthoodAge,
    maturationHalfLife,
  })
}

export function calculateManifestedImmortalMaturity(
  yearsSinceManifestation: number,
  maturationHalfLife: number,
): number {
  return calculateContinuingImmortalMaturity({
    startingMaturity: MANIFESTED_MATURE_STARTING_EQUIVALENT,
    elapsedYears: yearsSinceManifestation,
    maturationHalfLife,
  })
}
