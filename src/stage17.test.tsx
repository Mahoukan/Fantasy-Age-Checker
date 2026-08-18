import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { App } from './App'
import { BureauCases } from './components/BureauCases'
import { curatedBureauCases, type BureauCaseProfile } from './data/bureauCases'
import { species } from './data/species'
import {
  createBureauCaseLoadUpdate,
  createSeededRandom,
  generateRandomBureauCase,
  getBureauCaseFacts,
  getDailyBureauCases,
  getLocalDateKey,
  isValidGeneratedBureauCase,
} from './utils/bureauCases'
import { navigationItems } from './utils/navigation'

const profiles: readonly BureauCaseProfile[] = [
  'routine', 'cross-species', 'experience-gap', 'borderline', 'longevity', 'extraordinary',
]

describe('Stage 17 random Bureau Cases', () => {
  it('returns valid adult applicants from the canonical built-in registry for every profile', () => {
    for (const profile of profiles) {
      for (let seed = 0; seed < 20; seed += 1) {
        const caseData = generateRandomBureauCase({ profile, random: createSeededRandom(`${profile}-${seed}`) })
        expect(isValidGeneratedBureauCase(caseData)).toBe(true)
        expect(species.some((entry) => entry.id === caseData.applicantA.speciesId)).toBe(true)
        expect(species.some((entry) => entry.id === caseData.applicantB.speciesId)).toBe(true)
      }
    }
  })

  it('is reproducible with a seeded RNG', () => {
    const first = generateRandomBureauCase({ random: createSeededRandom('repeatable-file') })
    const second = generateRandomBureauCase({ random: createSeededRandom('repeatable-file') })
    expect(first).toEqual(second)
  })

  it('meets representative profile constraints through the existing calculation utilities', () => {
    const routine = generateRandomBureauCase({ profile: 'routine', random: createSeededRandom('routine-check') })
    expect(getBureauCaseFacts(routine).maturity.category).not.toBe('INCOMPATIBLE')

    const crossSpecies = generateRandomBureauCase({ profile: 'cross-species', random: createSeededRandom('cross-check') })
    expect(crossSpecies.applicantA.speciesId).not.toBe(crossSpecies.applicantB.speciesId)

    const experienceGap = generateRandomBureauCase({ profile: 'experience-gap', random: createSeededRandom('gap-check') })
    expect(getBureauCaseFacts(experienceGap).experience.adultExperienceGap).toBeGreaterThan(100)
    expect(getBureauCaseFacts(experienceGap).maturity.category).not.toBe('INCOMPATIBLE')

    const borderline = generateRandomBureauCase({ profile: 'borderline', random: createSeededRandom('borderline-check') })
    expect(getBureauCaseFacts(borderline).maturity.category).toBe('BORDERLINE')

    const longevity = generateRandomBureauCase({ profile: 'longevity', random: createSeededRandom('longevity-check') })
    expect(getBureauCaseFacts(longevity).longevity.some((entry) => entry.exceedsTypicalLifespan)).toBe(true)
  })
})

describe('Stage 17 Daily Bureau Cases', () => {
  it('uses a stable local date key and produces the same three cases for that date', () => {
    const morning = new Date(2026, 7, 19, 8, 30)
    const evening = new Date(2026, 7, 19, 22, 45)
    expect(getLocalDateKey(morning)).toBe('2026-08-19')
    expect(getDailyBureauCases(morning)).toEqual(getDailyBureauCases(evening))
  })

  it('changes the daily set on a different local date', () => {
    expect(getDailyBureauCases(new Date(2026, 7, 19)))
      .not.toEqual(getDailyBureauCases(new Date(2026, 7, 20)))
  })

  it('always contains exactly Routine, Complicated, and Extraordinary slots', () => {
    const daily = getDailyBureauCases(new Date(2026, 7, 19))
    expect(daily).toHaveLength(3)
    expect(daily.map((entry) => entry.slot)).toEqual(['routine', 'complicated', 'extraordinary'])
    expect(daily.every(isValidGeneratedBureauCase)).toBe(true)
  })
})

describe('Stage 17 curated archive and loading', () => {
  it('contains ten unique, valid, built-in-only cases', () => {
    expect(curatedBureauCases).toHaveLength(10)
    expect(new Set(curatedBureauCases.map((entry) => entry.id)).size).toBe(10)
    expect(curatedBureauCases.every(isValidGeneratedBureauCase)).toBe(true)
  })

  it('verifies the labelled Borderline example using the current maturity model', () => {
    const caseData = curatedBureauCases.find((entry) => entry.id === 'borderline-filing')!
    expect(getBureauCaseFacts(caseData).maturity.category).toBe('BORDERLINE')
  })

  it('verifies the extreme archive example using the current longevity model', () => {
    const caseData = curatedBureauCases.find((entry) => entry.id === 'archive-has-questions')!
    const facts = getBureauCaseFacts(caseData)
    expect(facts.longevity.every((entry) => entry.exceedsTypicalLifespan)).toBe(true)
    expect(facts.longevity.every((entry) => entry.category === 'ANOMALOUS')).toBe(true)
  })

  it('creates a shared Checker update that clears names, errors, pending work, and stale results', () => {
    const update = createBureauCaseLoadUpdate(curatedBureauCases[0])
    expect(update.applicantA).toEqual({ speciesId: 'elf', age: 300 })
    expect(update.applicantB).toEqual({ speciesId: 'human', age: 34 })
    expect(update.applicantA).not.toHaveProperty('name')
    expect(update.applicantB).not.toHaveProperty('name')
    expect(update.ageErrors).toEqual({})
    expect(update.result).toBeNull()
    expect(update.pendingConsultation).toBeNull()
  })

  it('renders the accessible section, one assignment action, three daily files, and ten archive files', () => {
    const markup = renderToStaticMarkup(<BureauCases onLoadCase={() => undefined} today={new Date(2026, 7, 19)} />)
    expect(markup).toContain('id="bureau-cases"')
    expect(markup).toContain('aria-labelledby="bureau-cases-title"')
    expect(markup).toContain('role="status"')
    expect((markup.match(/<article/g) ?? [])).toHaveLength(13)
    expect((markup.match(/<button/g) ?? [])).toHaveLength(14)
    expect(markup).toContain('Today&#x27;s Bureau Files')
    expect(markup).toContain('Notable Cases from the Archive')
  })

  it('adds Bureau Cases to same-page navigation between Checker and Species Guide', () => {
    expect(navigationItems.map((entry) => entry.id)).toEqual([
      'checker', 'reverse-lookup', 'bureau-cases', 'species-guide', 'how-it-works', 'about',
    ])
    const markup = renderToStaticMarkup(<App />)
    expect(markup).toContain('href="#bureau-cases"')
    expect(markup.indexOf('id="checker"')).toBeLessThan(markup.indexOf('id="bureau-cases"'))
    expect(markup.indexOf('id="bureau-cases"')).toBeLessThan(markup.indexOf('id="species-guide"'))
  })
})
