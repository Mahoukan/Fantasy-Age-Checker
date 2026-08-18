import { describe, expect, it } from 'vitest'
import { allQuips, loadingQuips } from '../data/quips'
import { species } from '../data/species'
import type { Quip, QuipContext } from '../types/quip'
import { getExperienceGap } from './experience'
import { getMaturityCompatibility } from './maturity'
import {
  getEligibleQuips,
  readQuipHistory,
  selectQuip,
  selectQuipWithHistory,
  type StorageLike,
} from './quipSelector'

const maturityCategories = new Set(['EXCELLENT', 'GOOD', 'BORDERLINE', 'INCOMPATIBLE'])
const experienceCategories = new Set([
  'BASICALLY_PEERS',
  'NOTICEABLE',
  'CONSIDERABLE',
  'FORMIDABLE',
  'HISTORICAL',
  'CIVILIZATIONS',
])
const speciesIds = new Set(species.map((entry) => entry.id))

const baseContext: QuipContext = {
  maturityCategory: 'EXCELLENT',
  experienceCategory: 'HISTORICAL',
  speciesIds: ['elf', 'human'],
  relationship: 'cross-species',
  flags: [],
}

class MemoryStorage implements StorageLike {
  values = new Map<string, string>()

  getItem(key: string) {
    return this.values.get(key) ?? null
  }

  setItem(key: string, value: string) {
    this.values.set(key, value)
  }
}

describe('quip library', () => {
  it('contains the reviewed v1 library with unique IDs, unique text, and no empty lines', () => {
    expect(allQuips).toHaveLength(348)
    expect(new Set(allQuips.map((quip) => quip.id)).size).toBe(allQuips.length)
    expect(new Set(allQuips.map((quip) => quip.text.trim())).size).toBe(allQuips.length)
    expect(allQuips.every((quip) => quip.text.trim().length > 0)).toBe(true)
  })

  it('contains at least 35 loading lines with stable unique IDs', () => {
    expect(loadingQuips.length).toBeGreaterThanOrEqual(35)
    expect(new Set(loadingQuips.map((quip) => quip.id)).size).toBe(loadingQuips.length)
    expect(loadingQuips.every((quip) => quip.slot === 'LOADING' && quip.text.trim())).toBe(true)
  })

  it('references only valid maturity and experience categories', () => {
    for (const quip of allQuips) {
      expect(quip.maturityCategories?.every((category) => maturityCategories.has(category))).not.toBe(false)
      expect(quip.experienceCategories?.every((category) => experienceCategories.has(category))).not.toBe(false)
    }
  })

  it('references only canonical species IDs', () => {
    expect(allQuips.every((quip) => quip.species?.every((id) => speciesIds.has(id)) ?? true)).toBe(true)
  })
})

describe('quip eligibility and priority', () => {
  it('returns only eligible Excellent maturity commentary', () => {
    const eligible = getEligibleQuips(allQuips, 'MATURITY', baseContext)
    expect(eligible.length).toBeGreaterThan(0)
    expect(eligible.every((quip) => !quip.maturityCategories || quip.maturityCategories.includes('EXCELLENT'))).toBe(true)
  })

  it('does not return Noticeable-only commentary for Historical experience', () => {
    const eligible = getEligibleQuips(allQuips, 'EXPERIENCE', baseContext)
    expect(eligible.some((quip) => quip.experienceCategories?.includes('NOTICEABLE'))).toBe(false)
  })

  it('excludes cross-species quips from a same-species context', () => {
    const context = { ...baseContext, speciesIds: ['human', 'human'], relationship: 'same-species' as const }
    expect(getEligibleQuips(allQuips, 'MATURITY', context).some(
      (quip) => quip.relationship === 'cross-species',
    )).toBe(false)
  })

  it('prefers an eligible cross-species quip over a generic fallback', () => {
    const pool: Quip[] = [
      { id: 'generic', text: 'Generic', slot: 'MATURITY' },
      { id: 'cross', text: 'Cross', slot: 'MATURITY', relationship: 'cross-species' },
    ]
    expect(selectQuip(pool, 'MATURITY', baseContext, [], () => 0)?.id).toBe('cross')
  })

  it('excludes a contextual flag quip when its fact is false', () => {
    const flagQuip: Quip = {
      id: 'flagged',
      text: 'Flagged',
      slot: 'EXPERIENCE',
      flags: ['ADULT_LONGER_THAN_PARTNER_ALIVE'],
    }
    expect(getEligibleQuips([flagQuip], 'EXPERIENCE', baseContext)).toHaveLength(0)
  })

  it('makes a contextual flag quip eligible when its fact is true', () => {
    const flagQuip: Quip = {
      id: 'flagged',
      text: 'Flagged',
      slot: 'EXPERIENCE',
      flags: ['ADULT_LONGER_THAN_PARTNER_ALIVE'],
    }
    const context: QuipContext = { ...baseContext, flags: ['ADULT_LONGER_THAN_PARTNER_ALIVE'] }
    expect(getEligibleQuips([flagQuip], 'EXPERIENCE', context)).toEqual([flagQuip])
  })
})

describe('quip history and deterministic selection', () => {
  const pool: Quip[] = [
    { id: 'one', text: 'One', slot: 'MATURITY' },
    { id: 'two', text: 'Two', slot: 'MATURITY' },
    { id: 'three', text: 'Three', slot: 'MATURITY' },
  ]

  it('avoids recent items when an alternative exists', () => {
    expect(selectQuip(pool, 'MATURITY', baseContext, ['one'], () => 0)?.id).toBe('two')
  })

  it('does not fail with a small eligible pool', () => {
    expect(selectQuip(pool.slice(0, 1), 'MATURITY', baseContext, [], () => 0)?.id).toBe('one')
  })

  it('returns the oldest item when the recent pool is fully exhausted', () => {
    expect(selectQuip(pool, 'MATURITY', baseContext, ['one', 'two', 'three'], () => 0)?.id).toBe('one')
  })

  it('tolerates malformed stored history', () => {
    const storage: StorageLike = {
      getItem: () => '{bad json',
      setItem: () => undefined,
    }
    expect(readQuipHistory(storage, 'MATURITY')).toEqual([])
    expect(selectQuipWithHistory(pool, 'MATURITY', baseContext, { storage, random: () => 0 })).toBeDefined()
  })

  it('works without localStorage', () => {
    expect(selectQuipWithHistory(pool, 'MATURITY', baseContext, { random: () => 0 })?.id).toBe('one')
  })

  it('works when browser storage access is blocked', () => {
    const blockedStorage: StorageLike = {
      getItem: () => { throw new Error('blocked') },
      setItem: () => { throw new Error('blocked') },
    }
    expect(selectQuipWithHistory(pool, 'MATURITY', baseContext, {
      storage: blockedStorage,
      random: () => 0,
    })?.id).toBe('one')
  })

  it('uses injected randomness predictably', () => {
    expect(selectQuip(pool, 'MATURITY', baseContext, [], () => 0.75)?.id).toBe('three')
  })

  it('keeps loading history separate from result slots', () => {
    const storage = new MemoryStorage()
    selectQuipWithHistory(loadingQuips, 'LOADING', baseContext, { storage, random: () => 0 })
    expect(readQuipHistory(storage, 'LOADING')).toHaveLength(1)
    expect(readQuipHistory(storage, 'MATURITY')).toEqual([])
  })

  it('rotates loading lines while alternatives are available', () => {
    const storage = new MemoryStorage()
    const first = selectQuipWithHistory(loadingQuips, 'LOADING', baseContext, { storage, random: () => 0 })
    const second = selectQuipWithHistory(loadingQuips, 'LOADING', baseContext, { storage, random: () => 0 })
    expect(second?.id).not.toBe(first?.id)
  })

  it('tolerates malformed loading history', () => {
    const storage: StorageLike = {
      getItem: () => 'not-json',
      setItem: () => undefined,
    }
    expect(selectQuipWithHistory(loadingQuips, 'LOADING', baseContext, {
      storage,
      random: () => 0,
    })).toBeDefined()
  })

  it('selects a new quip on repeat while calculation results remain unchanged', () => {
    const storage = new MemoryStorage()
    const human = species.find((entry) => entry.id === 'human')!
    const firstMaturity = getMaturityCompatibility(30, human, 28, human)
    const firstExperience = getExperienceGap(30, human, 28, human)
    const firstQuip = selectQuipWithHistory(pool, 'MATURITY', baseContext, { storage, random: () => 0 })
    const secondMaturity = getMaturityCompatibility(30, human, 28, human)
    const secondExperience = getExperienceGap(30, human, 28, human)
    const secondQuip = selectQuipWithHistory(pool, 'MATURITY', baseContext, { storage, random: () => 0 })

    expect(secondQuip?.id).not.toBe(firstQuip?.id)
    expect(secondMaturity).toEqual(firstMaturity)
    expect(secondExperience).toEqual(firstExperience)
  })
})
