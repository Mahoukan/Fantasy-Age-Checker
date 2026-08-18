import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { ApplicantCard } from './components/ApplicantCard'
import { SpeciesGuide } from './components/SpeciesGuide'
import { expandedSpeciesQuips } from './data/quips'
import { species, type CustomSpecies, type Species } from './data/species'
import { speciesDisplayGroups } from './data/speciesGroups'
import type { ApplicantLifecycleFacts } from './types/applicant'
import type { QuipContext, QuipSlot } from './types/quip'
import { getSpeciesCaseCode } from './utils/caseNumber'
import { createCustomSpecies } from './utils/customSpecies'
import { getExperienceGap } from './utils/experience'
import { getBuiltInSpeciesGuideRecords } from './utils/information'
import { calculateAdultExperience, calculateRelativeAge } from './utils/lifecycle'
import { getLongevity } from './utils/longevity'
import { getMaturityCompatibility } from './utils/maturity'
import { getEligibleQuips } from './utils/quipSelector'
import { createShareParams, parseSharedConsultation, resolveSharedApplicants } from './utils/share'

const originalSpecies = [
  ['human', 'Human', 18, 84],
  ['elf', 'Elf', 100, 750],
  ['dwarf', 'Dwarf', 40, 300],
  ['halfling', 'Halfling', 33, 110],
  ['orc', 'Orc', 16, 70],
  ['gnome', 'Gnome', 40, 350],
  ['dragonborn', 'Dragonborn', 15, 80],
  ['goblin', 'Goblin', 12, 60],
  ['dragon', 'Dragon', 100, 1500],
] as const

const newSpeciesIds = [
  'half-elf', 'half-orc', 'fae', 'fairy', 'pixie', 'giant', 'troll', 'ogre', 'kobold',
  'centaur', 'satyr', 'minotaur', 'merfolk', 'harpy', 'dryad', 'nymph', 'kitsune', 'oni',
  'djinn', 'gargoyle', 'sphinx',
] as const

function byId(id: string): Species {
  const entry = species.find((candidate) => candidate.id === id)
  if (!entry) throw new Error(`Missing species ${id}`)
  return entry
}

function facts(label: 'A' | 'B', entry: Species, age: number): ApplicantLifecycleFacts {
  return {
    label,
    species: entry,
    age,
    adultExperience: calculateAdultExperience(entry, age),
    relativeAge: calculateRelativeAge(entry, age),
  }
}

function context(speciesIds: string[]): QuipContext {
  return {
    maturityCategory: 'EXCELLENT',
    experienceCategory: 'NOTICEABLE',
    speciesIds,
    relationship: 'cross-species',
    flags: [],
  }
}

describe('expanded canonical species register', () => {
  it('contains 30 valid, uniquely identified built-ins', () => {
    expect(species).toHaveLength(30)
    expect(new Set(species.map((entry) => entry.id)).size).toBe(30)
    expect(new Set(species.map((entry) => entry.name.toLocaleLowerCase())).size).toBe(30)
    expect(species.every((entry) => Number.isFinite(entry.adulthoodAge) && entry.adulthoodAge > 0)).toBe(true)
    expect(species.every((entry) => Number.isFinite(entry.typicalLifespan)
      && entry.typicalLifespan > entry.adulthoodAge)).toBe(true)
  })

  it('preserves the original nine IDs and lifecycle values exactly', () => {
    expect(species.slice(0, 9).map((entry) => [
      entry.id, entry.name, entry.adulthoodAge, entry.typicalLifespan,
    ])).toEqual(originalSpecies)
  })

  it('assigns every built-in to exactly one presentation group', () => {
    const groupedIds = speciesDisplayGroups.flatMap((group) => group.speciesIds)
    expect(groupedIds).toHaveLength(30)
    expect(new Set(groupedIds).size).toBe(30)
    expect(new Set(groupedIds)).toEqual(new Set(species.map((entry) => entry.id)))
  })

  it('gives every new species a setting-neutral guide description', () => {
    expect(newSpeciesIds.every((id) => Boolean(byId(id).description?.trim()))).toBe(true)
  })
})

describe('selector and guide integration', () => {
  const custom: CustomSpecies = {
    id: 'custom-1', name: 'Starborn', adulthoodAge: 30, typicalLifespan: 200, source: 'custom',
  }
  const selector = renderToStaticMarkup(
    <ApplicantCard
      applicant={{ speciesId: 'human', age: 34 }}
      label="A"
      availableSpecies={[...species, custom]}
      onChange={() => undefined}
    />,
  )
  const guide = renderToStaticMarkup(<SpeciesGuide />)

  it('renders all new built-ins in the native selector', () => {
    for (const id of newSpeciesIds) expect(selector).toContain(`value="${id}"`)
    for (const group of speciesDisplayGroups) expect(selector).toContain(`label="${group.label.replace('&', '&amp;')}"`)
  })

  it('keeps temporary custom species in their own optgroup', () => {
    expect(selector).toContain('label="Temporary Custom Species"')
    expect(selector).toContain('value="custom-1"')
    expect(selector).toContain('Starborn (Custom)')
  })

  it('renders every canonical species and derived record in the grouped guide', () => {
    expect(getBuiltInSpeciesGuideRecords()).toHaveLength(30)
    for (const entry of species) {
      expect(guide).toContain(`data-species-id="${entry.id}"`)
      expect(guide).toContain(`<strong>${entry.name}</strong>`)
    }
  })
})

describe('case numbers, permalinks, and standard calculations', () => {
  it('provides unique valid case codes for every new built-in', () => {
    const codes = newSpeciesIds.map((id) => getSpeciesCaseCode(byId(id)))
    expect(codes.every((code) => /^[A-Z]{3}$/.test(code) && code !== 'UNK')).toBe(true)
    expect(new Set(codes).size).toBe(newSpeciesIds.length)
  })

  it.each([
    ['kitsune', 200, 'human', 34],
    ['djinn', 400, 'elf', 300],
  ] as const)('serialises and restores %s through the canonical permalink path', (idA, ageA, idB, ageB) => {
    const params = createShareParams([facts('A', byId(idA), ageA), facts('B', byId(idB), ageB)])
    expect(params?.toString()).toBe(`sa=${idA}&aa=${ageA}&sb=${idB}&ab=${ageB}`)
    const parsed = parseSharedConsultation(`?${params}`)
    expect(parsed.status).toBe('valid')
    if (parsed.status === 'valid') {
      expect(resolveSharedApplicants(parsed.consultation).map((entry) => entry.species.id)).toEqual([idA, idB])
    }
  })

  it.each(newSpeciesIds)('runs unchanged maturity, experience, and longevity engines for %s', (id) => {
    const entry = byId(id)
    const age = entry.adulthoodAge + 10
    const maturity = getMaturityCompatibility(age, entry, 34, byId('human'))
    const experience = getExperienceGap(age, entry, 34, byId('human'))
    const longevity = getLongevity(age, entry.typicalLifespan)
    expect(Number.isFinite(maturity.applicantAEquivalentAge)).toBe(true)
    expect(experience.applicantAAdultExperience).toBe(10)
    expect(Number.isFinite(longevity.ratio)).toBe(true)
  })

  it('uses the unchanged longevity thresholds for Djinn and Sphinx', () => {
    expect(getLongevity(1200, byId('djinn').typicalLifespan).category).toBe('EXCEPTIONAL')
    expect(getLongevity(4000, byId('sphinx').typicalLifespan).category).toBe('ANOMALOUS')
  })
})

describe('expanded species commentary isolation', () => {
  it('adds exactly four scoped lines for each new species', () => {
    expect(expandedSpeciesQuips).toHaveLength(84)
    for (const id of newSpeciesIds) {
      expect(expandedSpeciesQuips.filter((quip) => quip.species?.[0] === id)).toHaveLength(4)
    }
  })

  it('matches every expanded line only to its declared canonical ID', () => {
    for (const quip of expandedSpeciesQuips) {
      const id = quip.species?.[0]
      expect(id).toBeDefined()
      expect(getEligibleQuips([quip], quip.slot, context([id!]))).toEqual([quip])
      expect(getEligibleQuips([quip], quip.slot, context(['human']))).toEqual([])
    }
  })

  it('does not conflate related IDs', () => {
    const slots: QuipSlot[] = ['MATURITY', 'EXPERIENCE', 'ADMINISTRATIVE', 'LOADING']
    for (const slot of slots) {
      const halfElf = getEligibleQuips(expandedSpeciesQuips, slot, context(['half-elf']))
      const halfOrc = getEligibleQuips(expandedSpeciesQuips, slot, context(['half-orc']))
      const fae = getEligibleQuips(expandedSpeciesQuips, slot, context(['fae']))
      expect(halfElf.every((quip) => quip.species?.includes('half-elf'))).toBe(true)
      expect(halfOrc.every((quip) => quip.species?.includes('half-orc'))).toBe(true)
      expect(fae.every((quip) => quip.species?.includes('fae'))).toBe(true)
      expect(fae.some((quip) => quip.species?.includes('fairy'))).toBe(false)
    }
  })

  it('does not infer expanded quips from a similar custom name', () => {
    const result = createCustomSpecies({
      name: 'Moon Kitsune', adulthoodAge: 20, typicalLifespan: 500,
    }, species)
    if (!result.success) throw new Error('Expected custom species creation to succeed')
    for (const slot of ['MATURITY', 'EXPERIENCE', 'ADMINISTRATIVE', 'LOADING'] as const) {
      expect(getEligibleQuips(expandedSpeciesQuips, slot, context([result.species.id]))).toEqual([])
    }
  })
})

describe('requested Stage 11 consultation matrix', () => {
  it.each([
    ['Kitsune 200 + Human 34', 'kitsune', 200, 'human', 34, 'EXCELLENT', 'HISTORICAL'],
    ['Djinn 400 + Elf 300', 'djinn', 400, 'elf', 300, 'EXCELLENT', 'HISTORICAL'],
    ['Giant 90 + Dwarf 80', 'giant', 90, 'dwarf', 80, 'EXCELLENT', 'NOTICEABLE'],
    ['Sphinx 4000 + Human 40', 'sphinx', 4000, 'human', 40, 'INCOMPATIBLE', 'CIVILIZATIONS'],
    ['Half-Elf 60 + Elf 250', 'half-elf', 60, 'elf', 250, 'EXCELLENT', 'HISTORICAL'],
  ] as const)('keeps expected results for %s', (_name, idA, ageA, idB, ageB, maturity, experience) => {
    expect(getMaturityCompatibility(ageA, byId(idA), ageB, byId(idB)).category).toBe(maturity)
    expect(getExperienceGap(ageA, byId(idA), ageB, byId(idB)).category).toBe(experience)
  })
})
