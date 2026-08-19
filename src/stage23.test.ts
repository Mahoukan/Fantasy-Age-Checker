import { describe, expect, it } from 'vitest'
import { findImmortalPreset } from './data/immortalPresets'
import { species } from './data/species'
import {
  buildAcquiredImmortalRecord,
  buildPossessingImmortalRecord,
  buildReincarnatingImmortalRecord,
} from './utils/immortalRecords'

const human = species.find((entry) => entry.id === 'human')!

describe('Stage 23 immortal record builders', () => {
  it('keeps Vampire maturity frozen while Ascended maturity continues toward 100', () => {
    const vampire = buildAcquiredImmortalRecord({
      preset: findImmortalPreset('vampire'),
      originSpecies: human,
      ageAtTransformation: 34,
      yearsSinceTransformation: 1000,
    })
    const ascended = buildAcquiredImmortalRecord({
      preset: findImmortalPreset('ascended-immortal'),
      originSpecies: human,
      ageAtTransformation: 34,
      yearsSinceTransformation: 1000,
    })

    expect(vampire).toMatchObject({
      maturationMode: 'FROZEN',
      maturityAtTransformation: 34,
      effectiveMaturity: 34,
      currentAge: 1034,
      preTransformationAdultExperience: 16,
      adultExperience: 1016,
      adultComparisonEligible: true,
    })
    expect(ascended.effectiveMaturity).toBeGreaterThan(ascended.maturityAtTransformation)
    expect(ascended.effectiveMaturity).toBeLessThan(100)
  })

  it('keeps ancient reincarnating and possessing consciousnesses ineligible in an underage form', () => {
    const reincarnating = buildReincarnatingImmortalRecord({
      preset: findImmortalPreset('reincarnating-being'),
      currentFormSpecies: human,
      currentFormAge: 17,
      memoriesRetained: true,
      rememberedPreviousAdultExperience: 5000,
    })
    const possessing = buildPossessingImmortalRecord({
      preset: findImmortalPreset('possessing-spirit'),
      currentHostSpecies: human,
      currentHostAge: 17,
      rememberedConsciousExperience: 5000,
    })

    expect(reincarnating).toMatchObject({
      adultComparisonEligible: false,
      currentLifeAdultExperience: 0,
      adultExperience: 5000,
    })
    expect(possessing).toMatchObject({
      adultComparisonEligible: false,
      adultExperience: 5000,
    })
  })
})

