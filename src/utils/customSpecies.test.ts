import { describe, expect, it } from 'vitest'
import { allQuips } from '../data/quips'
import { species, type CustomSpecies, type Species } from '../data/species'
import type { ApplicantLifecycleFacts } from '../types/applicant'
import { calculateAdultExperience, calculateRelativeAge, isAdult } from './lifecycle'
import { getExperienceGap } from './experience'
import { getMaturityCompatibility } from './maturity'
import { createQuipContext, getEligibleQuips } from './quipSelector'
import {
  createCustomSpecies,
  removeCustomSpecies,
  validateCustomSpecies,
  type CustomSpeciesDraft,
} from './customSpecies'

const validDraft: CustomSpeciesDraft = {
  name: 'High Elf',
  adulthoodAge: 120,
  typicalLifespan: 1000,
}

function requireCustomSpecies(draft: CustomSpeciesDraft, available: readonly Species[] = species): CustomSpecies {
  const result = createCustomSpecies(draft, available)
  if (!result.success) throw new Error(`Expected valid custom species: ${JSON.stringify(result.errors)}`)
  return result.species
}

function facts(label: 'A' | 'B', speciesEntry: Species, age: number): ApplicantLifecycleFacts {
  return {
    label,
    species: speciesEntry,
    age,
    adultExperience: calculateAdultExperience(speciesEntry, age),
    relativeAge: calculateRelativeAge(speciesEntry, age),
  }
}

function relationshipFor(speciesA: Species, speciesB: Species) {
  const ageA = speciesA.adulthoodAge + 10
  const ageB = speciesB.adulthoodAge + 10
  const maturity = getMaturityCompatibility(ageA, speciesA, ageB, speciesB)
  const experience = getExperienceGap(ageA, speciesA, ageB, speciesB)
  return createQuipContext([facts('A', speciesA, ageA), facts('B', speciesB, ageB)], maturity, experience)
}

describe('custom species registration validation', () => {
  it('creates a valid custom species', () => {
    const result = createCustomSpecies(validDraft, species)
    expect(result.success).toBe(true)
    if (result.success) expect(result.species.source).toBe('custom')
  })

  it('trims the registered name', () => {
    expect(requireCustomSpecies({ ...validDraft, name: '  High Elf  ' }).name).toBe('High Elf')
  })

  it.each([
    ['', 'Enter a species name.'],
    ['X', 'Species name must contain at least 2 visible characters.'],
    ['X'.repeat(41), 'Species name must be 40 characters or fewer.'],
  ])('rejects invalid name %j', (name, message) => {
    expect(validateCustomSpecies({ ...validDraft, name }, species).name).toBe(message)
  })

  it('rejects a duplicate built-in name case-insensitively', () => {
    expect(validateCustomSpecies({ ...validDraft, name: ' elf ' }, species).name).toMatch(/already registered/)
  })

  it('rejects a duplicate temporary name case-insensitively', () => {
    const existing = requireCustomSpecies(validDraft)
    expect(validateCustomSpecies({ ...validDraft, name: 'high elf' }, [...species, existing]).name)
      .toMatch(/already registered/)
  })

  it.each([0, -1])('rejects adulthood age %s', (adulthoodAge) => {
    expect(validateCustomSpecies({ ...validDraft, adulthoodAge }, species).adulthoodAge)
      .toMatch(/greater than zero/)
  })

  it('rejects non-finite adulthood', () => {
    expect(validateCustomSpecies({ ...validDraft, adulthoodAge: Number.POSITIVE_INFINITY }, species).adulthoodAge)
      .toMatch(/finite/)
  })

  it('accepts decimal adulthood', () => {
    expect(validateCustomSpecies({ ...validDraft, adulthoodAge: 25.5 }, species).adulthoodAge).toBeUndefined()
  })

  it.each([0, -1])('rejects typical lifespan %s', (typicalLifespan) => {
    expect(validateCustomSpecies({ ...validDraft, typicalLifespan }, species).typicalLifespan)
      .toMatch(/greater than zero/)
  })

  it('rejects non-finite typical lifespan', () => {
    expect(validateCustomSpecies({ ...validDraft, typicalLifespan: Number.POSITIVE_INFINITY }, species).typicalLifespan)
      .toMatch(/finite/)
  })

  it('rejects a lifespan equal to or below adulthood', () => {
    expect(validateCustomSpecies({ ...validDraft, adulthoodAge: 120, typicalLifespan: 120 }, species).typicalLifespan)
      .toMatch(/greater than the adulthood/)
  })

  it('accepts a decimal lifespan greater than decimal adulthood', () => {
    expect(validateCustomSpecies({
      ...validDraft,
      adulthoodAge: 25.5,
      typicalLifespan: 190.5,
    }, species)).toEqual({})
  })

  it('accepts extremely large finite lifecycle values', () => {
    expect(validateCustomSpecies({
      ...validDraft,
      adulthoodAge: Number.MAX_VALUE / 2,
      typicalLifespan: Number.MAX_VALUE,
    }, species)).toEqual({})
  })
})

describe('custom species identity and integration', () => {
  it('generates an ID that does not collide with built-ins', () => {
    const custom = requireCustomSpecies(validDraft)
    expect(new Set<string>(species.map((entry) => entry.id)).has(custom.id)).toBe(false)
  })

  it('generates different IDs for two current custom species', () => {
    const first = requireCustomSpecies(validDraft)
    const second = requireCustomSpecies({ ...validDraft, name: 'Stoneborn' }, [...species, first])
    expect(second.id).not.toBe(first.id)
  })

  it('uses the standard maturity calculation', () => {
    const custom = requireCustomSpecies(validDraft)
    expect(getMaturityCompatibility(400, custom, 34, species[0]).applicantAEquivalentAge).toBeCloseTo(33.6)
  })

  it('uses the standard experience calculation', () => {
    const custom = requireCustomSpecies(validDraft)
    expect(getExperienceGap(400, custom, 34, species[0]).applicantAAdultExperience).toBe(280)
  })

  it('uses the standard adulthood safeguard', () => {
    expect(isAdult(requireCustomSpecies(validDraft), 100)).toBe(false)
  })

  it('recognises one custom species ID on both applicants as same-species', () => {
    const custom = requireCustomSpecies(validDraft)
    expect(relationshipFor(custom, custom).relationship).toBe('same-species')
  })

  it('recognises two different custom species IDs as cross-species', () => {
    const first = requireCustomSpecies(validDraft)
    const second = requireCustomSpecies({ ...validDraft, name: 'Stoneborn' }, [...species, first])
    expect(relationshipFor(first, second).relationship).toBe('cross-species')
  })

  it('recognises a custom and built-in species as cross-species', () => {
    expect(relationshipFor(requireCustomSpecies(validDraft), species[0]).relationship).toBe('cross-species')
  })

  it('does not match built-in species quips by a custom species name substring', () => {
    const moonElf = requireCustomSpecies({ ...validDraft, name: 'Moon Elf' })
    const stoneborn = requireCustomSpecies({ ...validDraft, name: 'Stoneborn' }, [...species, moonElf])
    const context = relationshipFor(moonElf, stoneborn)
    const eligible = getEligibleQuips(allQuips, 'MATURITY', context)
    expect(eligible.every((quip) => !quip.species)).toBe(true)
  })

  it('keeps generic and contextual quips eligible for custom species', () => {
    const custom = requireCustomSpecies(validDraft)
    const context = relationshipFor(custom, custom)
    const eligible = getEligibleQuips(allQuips, 'EXPERIENCE', context)
    expect(eligible.some((quip) => !quip.species && !quip.flags)).toBe(true)
  })

  it('removes an unused custom species', () => {
    const custom = requireCustomSpecies(validDraft)
    const result = removeCustomSpecies([custom], custom.id, ['human', 'elf'])
    expect(result).toMatchObject({ removed: true, species: [] })
  })

  it('prevents removal of an in-use custom species', () => {
    const custom = requireCustomSpecies(validDraft)
    const result = removeCustomSpecies([custom], custom.id, [custom.id])
    expect(result).toMatchObject({ removed: false, reason: 'in-use', species: [custom] })
  })
})
