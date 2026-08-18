import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { Header } from './components/Header'
import { ShareControls } from './components/ShareControls'
import {
  DEFAULT_RESULT_IMAGE_THEME_ID,
  resultImageThemeIds,
  resultImageThemes,
} from './data/resultImageThemes'
import { websiteThemes } from './data/siteThemes'
import { species } from './data/species'
import type { ApplicantLabel, ApplicantLifecycleFacts } from './types/applicant'
import { createApprovedConsultation } from './utils/consultation'
import { calculateAdultExperience, calculateRelativeAge } from './utils/lifecycle'
import { createShareUrl, parseSharedConsultation } from './utils/share'
import {
  applySiteTheme,
  DEFAULT_SITE_THEME_ID,
  readSiteTheme,
  saveSiteTheme,
  SITE_THEME_STORAGE_KEY,
  type ThemeRootLike,
} from './utils/siteTheme'

function applicant(label: ApplicantLabel, speciesId: 'elf' | 'human', age: number, name?: string): ApplicantLifecycleFacts {
  const selectedSpecies = species.find((entry) => entry.id === speciesId)!
  return {
    label,
    species: selectedSpecies,
    age,
    adultExperience: calculateAdultExperience(selectedSpecies, age),
    relativeAge: calculateRelativeAge(selectedSpecies, age),
    ...(name ? { name } : {}),
  }
}

function consultation() {
  return createApprovedConsultation([
    applicant('A', 'elf', 300, 'Elara'),
    applicant('B', 'human', 34, 'Thomas'),
  ], { random: () => 0, caseRandom: () => 0.123456 })
}

function memoryStorage(initial: Record<string, string> = {}) {
  const values = new Map(Object.entries(initial))
  const writes: Array<[string, string]> = []
  return {
    storage: {
      getItem: (key: string) => values.get(key) ?? null,
      setItem: (key: string, value: string) => { values.set(key, value); writes.push([key, value]) },
    },
    values,
    writes,
  }
}

describe('shared website theme registry', () => {
  it('contains exactly ten identities shared one-to-one with image themes', () => {
    expect(websiteThemes).toHaveLength(10)
    expect(websiteThemes.map(({ id }) => id)).toEqual([...resultImageThemeIds])
    expect(websiteThemes.map(({ id }) => id)).toEqual(resultImageThemes.map(({ id }) => id))
  })

  it('keeps stable unique IDs and unique names', () => {
    expect(new Set(websiteThemes.map(({ id }) => id)).size).toBe(10)
    expect(new Set(websiteThemes.map(({ name }) => name)).size).toBe(10)
    expect(resultImageThemeIds).toEqual([
      'bureau-classic', 'royal-decree', 'elven-archive', 'dwarven-registry',
      'goblin-administration', 'arcane-terminal', 'fae-court', 'dragon-archive',
      'celestial-tribunal', 'obsidian-records',
    ])
  })

  it('uses Bureau Classic as both default identities', () => {
    expect(DEFAULT_SITE_THEME_ID).toBe('bureau-classic')
    expect(DEFAULT_SITE_THEME_ID).toBe(DEFAULT_RESULT_IMAGE_THEME_ID)
  })

  it.each(websiteThemes)('$name has complete semantic colours, typography, and shared description', (theme) => {
    expect(Object.keys(theme.site.palette)).toHaveLength(22)
    expect(Object.values(theme.site.palette).every((value) => value.trim().length > 0)).toBe(true)
    expect(theme.site.headingFont.trim()).not.toBe('')
    expect(theme.site.bodyFont.trim()).not.toBe('')
    expect(theme.site.decorativeStyle.trim()).not.toBe('')
    expect(theme.description).toBe(resultImageThemes.find(({ id }) => id === theme.id)?.description)
  })
})

describe('website theme persistence', () => {
  it('stores only the selected theme ID under the namespaced key', () => {
    const memory = memoryStorage()
    expect(saveSiteTheme('elven-archive', memory.storage)).toBe(true)
    expect(memory.writes).toEqual([[SITE_THEME_STORAGE_KEY, 'elven-archive']])
    expect([...memory.values.entries()]).toEqual([[SITE_THEME_STORAGE_KEY, 'elven-archive']])
  })

  it('restores every valid saved theme', () => {
    for (const themeId of resultImageThemeIds) {
      expect(readSiteTheme(memoryStorage({ [SITE_THEME_STORAGE_KEY]: themeId }).storage)).toBe(themeId)
    }
  })

  it.each([undefined, '', 'unknown-theme', '{broken-json'])('falls back safely for missing or invalid value %s', (value) => {
    const initial: Record<string, string> = value === undefined ? {} : { [SITE_THEME_STORAGE_KEY]: value }
    expect(readSiteTheme(memoryStorage(initial).storage)).toBe('bureau-classic')
  })

  it('survives blocked storage reads and writes', () => {
    const blocked = {
      getItem: () => { throw new Error('blocked') },
      setItem: () => { throw new Error('blocked') },
    }
    expect(readSiteTheme(blocked)).toBe('bureau-classic')
    expect(saveSiteTheme('fae-court', blocked)).toBe(false)
  })

  it('does not write names, applicants, species, ages, custom records, or quip keys', () => {
    const memory = memoryStorage({ 'fantasy-age-checker-recent-quips': '["unchanged"]' })
    saveSiteTheme('obsidian-records', memory.storage)
    expect(memory.writes).toEqual([[SITE_THEME_STORAGE_KEY, 'obsidian-records']])
    const storedText = JSON.stringify([...memory.values.entries()])
    for (const forbidden of ['Elara', 'Thomas', 'elf', '300', 'custom-', 'quip']) {
      if (forbidden === 'quip') continue
      expect(storedText).not.toContain(forbidden)
    }
    expect(memory.values.get('fantasy-age-checker-recent-quips')).toBe('["unchanged"]')
  })

  it.each(websiteThemes)('applies $name to root data and all semantic properties', (theme) => {
    const properties = new Map<string, string>()
    const root: ThemeRootLike = {
      dataset: {},
      style: { setProperty: (name, value) => { properties.set(name, value) } },
    }
    applySiteTheme(theme.id, root)
    expect(root.dataset.theme).toBe(theme.id)
    expect(properties.size).toBe(38)
    expect(root.dataset.presentation).toBe(theme.site.presentation.strategy)
    expect(root.dataset.decorativeStyle).toBe(theme.site.decorativeStyle)
    expect(properties.get('--site-bg')).toBe(theme.site.palette.background)
    expect(properties.get('--input-text')).toBe(theme.site.palette.inputText)
    expect(properties.get('--focus')).toBe(theme.site.palette.focus)
    expect(properties.get('--heading-font')).toBe(theme.site.headingFont)
    expect(properties.get('--panel-radius')).toBe(theme.site.presentation.panelRadius)
    expect(properties.get('--theme-label-result')).toBe(JSON.stringify(theme.site.presentation.labels.result))
  })
})

describe('website theme UI and image-theme initialization', () => {
  it('renders an accessible compact header selector with all ten options', () => {
    const markup = renderToStaticMarkup(
      <Header activeSection="checker" siteThemeId="celestial-tribunal" onNavigate={() => undefined} />,
    )
    expect(markup).toContain('aria-label="Website theme"')
    expect((markup.match(/<option/g) ?? [])).toHaveLength(10)
    expect(markup).toContain('<option value="celestial-tribunal" selected="">Celestial Tribunal</option>')
  })

  it.each(resultImageThemeIds)('initializes a new result-card picker from website theme %s', (themeId) => {
    const markup = renderToStaticMarkup(<ShareControls result={consultation()} initialThemeId={themeId} />)
    const selectedTheme = resultImageThemes.find((theme) => theme.id === themeId)!
    expect(markup).toContain(`Selected: ${selectedTheme.name}`)
    expect(markup).toContain(`checked="" value="${themeId}"`)
  })

  it('keeps theme IDs out of the stable permalink and restored maths inputs', () => {
    const result = consultation()
    const expected = 'https://example.test/?sa=elf&aa=300&sb=human&ab=34#checker'
    for (const theme of websiteThemes) {
      const url = createShareUrl(result.applicants, { origin: 'https://example.test', pathname: '/' })
      expect(url).toBe(expected)
      expect(url).not.toContain(theme.id)
      expect(parseSharedConsultation(new URL(url!).search)).toEqual({
        status: 'valid',
        consultation: {
          applicantA: { speciesId: 'elf', age: 300 },
          applicantB: { speciesId: 'human', age: 34 },
        },
      })
    }
  })
})
