import { describe, expect, it } from 'vitest'
import {
  IMMORTAL_MATURITY_CEILING,
  MANIFESTED_MATURE_STARTING_EQUIVALENT,
  NATURAL_IMMORTAL_ADULTHOOD_EQUIVALENT,
  calculateAcquiredCurrentAge,
  calculateAcquiredImmortalMaturity,
  calculateContinuingImmortalMaturity,
  calculateManifestedImmortalMaturity,
  calculateNaturalImmortalMaturity,
} from './utils/immortalMaturity'

describe('Stage 22 immortal maturity foundation', () => {
  it('moves a naturally immortal adult halfway from 18 toward 100 after one half-life', () => {
    expect(NATURAL_IMMORTAL_ADULTHOOD_EQUIVALENT).toBe(18)
    expect(IMMORTAL_MATURITY_CEILING).toBe(100)
    expect(calculateContinuingImmortalMaturity({
      startingMaturity: NATURAL_IMMORTAL_ADULTHOOD_EQUIVALENT,
      elapsedYears: 500,
      maturationHalfLife: 500,
    })).toBe(59)
    expect(calculateNaturalImmortalMaturity(518, 18, 500)).toBe(59)
  })

  it('anchors a mature manifested being at 25 and reaches 62.5 after one half-life', () => {
    expect(MANIFESTED_MATURE_STARTING_EQUIVALENT).toBe(25)
    expect(calculateManifestedImmortalMaturity(0, 400)).toBe(25)
    expect(calculateManifestedImmortalMaturity(400, 400)).toBe(62.5)
  })

  it('keeps frozen acquired maturity invariant and rejects invalid curve inputs', () => {
    expect(calculateAcquiredCurrentAge(34, 700)).toBe(734)
    expect(calculateAcquiredImmortalMaturity({
      maturationMode: 'FROZEN',
      maturityAtTransformation: 34,
      yearsSinceTransformation: 700,
    })).toBe(34)

    expect(() => calculateContinuingImmortalMaturity({
      startingMaturity: 18,
      elapsedYears: -1,
      maturationHalfLife: 500,
    })).toThrow(RangeError)
    expect(() => calculateContinuingImmortalMaturity({
      startingMaturity: 18,
      elapsedYears: 1,
      maturationHalfLife: 0,
    })).toThrow(RangeError)
    expect(() => calculateContinuingImmortalMaturity({
      startingMaturity: 100,
      elapsedYears: 1,
      maturationHalfLife: 500,
    })).toThrow(RangeError)
    expect(() => calculateContinuingImmortalMaturity({
      startingMaturity: 18,
      elapsedYears: Number.POSITIVE_INFINITY,
      maturationHalfLife: 500,
    })).toThrow(TypeError)
  })
})
