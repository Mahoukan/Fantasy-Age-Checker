import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { App } from '../App'
import { species, type CustomSpecies } from '../data/species'
import { getBuiltInSpeciesGuideRecords, getSpeciesMaturityConstants, getWorkedExample } from '../utils/information'
import { getNavigationSection, navigationItems } from '../utils/navigation'
import { About } from './About'
import { Header } from './Header'
import { HowItWorks } from './HowItWorks'
import { SpeciesGuide } from './SpeciesGuide'

describe('Species Guide', () => {
  it('renders all 30 canonical built-in species', () => {
    const markup = renderToStaticMarkup(<SpeciesGuide />)
    expect(getBuiltInSpeciesGuideRecords()).toHaveLength(30)
    for (const entry of species) expect(markup).toContain(`<h4>${entry.name}</h4>`)
  })

  it('derives guide lifecycle values directly from the canonical registry', () => {
    const records = getBuiltInSpeciesGuideRecords()
    expect(records.map((record) => record.species)).toEqual([...species])
    expect(records.map(({ species: entry }) => [entry.adulthoodAge, entry.typicalLifespan]))
      .toEqual(species.map((entry) => [entry.adulthoodAge, entry.typicalLifespan]))
  })

  it('does not add temporary custom species to permanent records', () => {
    const starborn: CustomSpecies = {
      id: 'custom-1', name: 'Starborn', adulthoodAge: 30, typicalLifespan: 200, source: 'custom',
    }
    expect(getBuiltInSpeciesGuideRecords().some((record) => record.species.id === starborn.id)).toBe(false)
    expect(renderToStaticMarkup(<SpeciesGuide />)).not.toContain(starborn.name)
  })

  it('derives Species Seven from lifespan divided by 12', () => {
    for (const record of getBuiltInSpeciesGuideRecords()) {
      expect(record.speciesSeven).toBe(record.species.typicalLifespan / 12)
    }
  })

  it('derives Species Fourteen from lifespan divided by 6', () => {
    for (const record of getBuiltInSpeciesGuideRecords()) {
      expect(record.speciesFourteen).toBe(record.species.typicalLifespan / 6)
    }
  })

  it('produces +7 / -14 for Human lifespan 84', () => {
    expect(getSpeciesMaturityConstants(84)).toEqual({ speciesSeven: 7, speciesFourteen: 14 })
    expect(renderToStaticMarkup(<SpeciesGuide />)).toContain('+7 / -14')
  })

  it('produces +62.5 / -125 for Elf lifespan 750', () => {
    expect(getSpeciesMaturityConstants(750)).toEqual({ speciesSeven: 62.5, speciesFourteen: 125 })
    expect(renderToStaticMarkup(<SpeciesGuide />)).toContain('+62.5 / -125')
  })
})

describe('How It Works', () => {
  const markup = renderToStaticMarkup(<HowItWorks />)

  it('includes the adulthood safeguard explanation', () => {
    expect(markup).toContain('Adulthood Safeguard')
    expect(markup).toContain('recognised adulthood age')
  })

  it('includes maturity formulas and mutual compatibility', () => {
    expect(markup).toContain('Maturity Compatibility')
    expect(markup).toContain('humanEquivalentAge')
    expect(markup).toContain('both directions')
  })

  it('includes non-normalised experience and every current range', () => {
    expect(markup).toContain('Experience Gap')
    expect(markup).toContain('adultExperience')
    expect(markup).toContain('deliberately not normalised')
    expect(markup).toContain('&gt;500 years')
  })

  it('includes longevity as non-verdict context with current thresholds', () => {
    expect(markup).toContain('Longevity Context')
    expect(markup).toContain('Typical lifespan is not a maximum')
    expect(markup).toContain('Chronological Anomaly')
  })

  it('derives the Elf 300 + Human 34 worked filing from current utilities', () => {
    const example = getWorkedExample()
    expect(example.maturity.applicantAEquivalentAge).toBeCloseTo(33.6)
    expect(example.maturity.applicantBEquivalentAge).toBe(34)
    expect(example.maturityLabel).toBe('Remarkably Well Matched')
    expect(example.experience.applicantAAdultExperience).toBe(200)
    expect(example.experience.applicantBAdultExperience).toBe(16)
    expect(example.experience.adultExperienceGap).toBe(184)
    expect(example.experienceLabel).toBe('Historical Documentary Territory')
  })
})

describe('About and navigation', () => {
  it('clearly states the fictional entertainment purpose and lack of advice', () => {
    const markup = renderToStaticMarkup(<About />)
    expect(markup).toContain('fictional entertainment project')
    expect(markup).toContain('not relationship, legal, or personal advice')
    expect(markup).toContain('exactly zero known kingdoms')
  })

  it('exposes all four destinations as keyboard-accessible links', () => {
    const markup = renderToStaticMarkup(<Header activeSection="species-guide" onNavigate={() => undefined} />)
    for (const item of navigationItems) {
      expect(markup).toContain(`href="#${item.id}"`)
      expect(markup).toContain(`>${item.label}</a>`)
    }
    expect(markup).toContain('aria-current="location"')
    expect(markup).not.toContain('aria-disabled')
  })

  it('resolves recognised hashes and safely defaults unknown hashes to Checker', () => {
    expect(getNavigationSection('#how-it-works')).toBe('how-it-works')
    expect(getNavigationSection('#about')).toBe('about')
    expect(getNavigationSection('#unknown')).toBe('checker')
    expect(getNavigationSection('')).toBe('checker')
  })

  it('keeps Checker and all information destinations mounted together', () => {
    const markup = renderToStaticMarkup(<App />)
    expect(markup).toContain('id="checker"')
    expect(markup).toContain('id="species-guide"')
    expect(markup).toContain('id="how-it-works"')
    expect(markup).toContain('id="about"')
    expect(markup).toContain('+ Add Custom Species')
    expect(markup.indexOf('id="checker"')).toBeLessThan(markup.indexOf('id="species-guide"'))
  })

  it('renders the restrained entertainment footer with useful section links', () => {
    const markup = renderToStaticMarkup(<App />)
    expect(markup).toContain('legally binding in exactly zero jurisdictions')
    expect(markup).toContain('For fictional entertainment only')
    expect(markup).toContain('href="#how-it-works"')
    expect(markup).toContain('href="#about"')
  })
})
