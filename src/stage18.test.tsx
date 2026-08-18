import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { SpeciesGuide } from './components/SpeciesGuide'
import { curatedBureauCases } from './data/bureauCases'
import { species } from './data/species'
import { getSpeciesProfile, speciesProfiles } from './data/speciesProfiles'
import { getBuiltInSpeciesGuideRecords } from './utils/information'

describe('Stage 18 Bureau Species Register', () => {
  it('provides exactly one complete presentation profile for every canonical built-in species', () => {
    const canonicalIds = species.map((entry) => entry.id)
    const profileIds = Object.keys(speciesProfiles)
    const curatedIds = new Set(curatedBureauCases.map((entry) => entry.id))

    expect(profileIds).toHaveLength(30)
    expect(new Set(profileIds).size).toBe(30)
    expect(profileIds.sort()).toEqual([...canonicalIds].sort())

    for (const entry of species) {
      const profile = getSpeciesProfile(entry.id)
      expect(profile.speciesId).toBe(entry.id)
      expect(profile.classification.trim()).not.toBe('')
      expect(profile.lifecycleSummary.trim()).not.toBe('')
      expect(profile.bureauObservation.trim()).not.toBe('')
      expect(profile.commonFilingIssue.trim()).not.toBe('')
      expect(profile.chronologicalPeculiarity.trim()).not.toBe('')
      expect(profile.archivalNotes).toHaveLength(2)
      expect(profile.archivalNotes.every((note) => note.trim().length > 0)).toBe(true)
      expect(profile.relatedCaseIds?.every((id) => curatedIds.has(id)) ?? true).toBe(true)
    }
  })

  it('keeps lifecycle facts canonical while rendering accessible presentation-only disclosures', () => {
    const records = getBuiltInSpeciesGuideRecords()
    expect(records.map(({ species: entry }) => [entry.id, entry.adulthoodAge, entry.typicalLifespan]))
      .toEqual(species.map((entry) => [entry.id, entry.adulthoodAge, entry.typicalLifespan]))

    for (const profile of Object.values(speciesProfiles)) {
      expect(profile).not.toHaveProperty('adulthoodAge')
      expect(profile).not.toHaveProperty('typicalLifespan')
      expect(profile).not.toHaveProperty('caseCode')
    }

    const markup = renderToStaticMarkup(<SpeciesGuide />)
    expect((markup.match(/<details/g) ?? [])).toHaveLength(30)
    expect((markup.match(/<summary/g) ?? [])).toHaveLength(30)
    expect(markup).toContain('Bureau Species Register')
    expect(markup).toContain('Typical lifespan is a reference value, not a maximum age.')
    expect(markup).toContain('Related Bureau Files')
  })
})
