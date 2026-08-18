import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { App } from './App'
import { ThemeOrnament, type ThemeOrnamentLocation } from './components/ThemeOrnament'
import { resultImageThemeIds } from './data/resultImageThemes'
import { getWebsiteTheme, websiteThemes } from './data/siteThemes'
import type { CustomSpecies, Species } from './data/species'
import type { ApplicantLifecycleFacts } from './types/applicant'
import { createApprovedConsultation } from './utils/consultation'
import { calculateAdultExperience, calculateRelativeAge } from './utils/lifecycle'
import { createShareResultText, createShareUrl } from './utils/share'
import { applySiteTheme, type ThemeRootLike } from './utils/siteTheme'

const locations: ThemeOrnamentLocation[] = [
  'header', 'hero', 'checker', 'applicant', 'consultation',
  'result', 'assessment', 'calculations', 'information', 'footer',
]

function facts(label: 'A' | 'B', entry: Species, age: number, name: string): ApplicantLifecycleFacts {
  return {
    label, species: entry, age, name,
    adultExperience: calculateAdultExperience(entry, age),
    relativeAge: calculateRelativeAge(entry, age),
  }
}

function luminance(hex: string): number {
  const channels = hex.slice(1).match(/.{2}/g)?.map((value) => parseInt(value, 16) / 255) ?? []
  const linear = channels.map((value) => (value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4))
  return 0.2126 * linear[0] + 0.7152 * linear[1] + 0.0722 * linear[2]
}

function contrast(foreground: string, background: string): number {
  const [lighter, darker] = [luminance(foreground), luminance(background)].sort((a, b) => b - a)
  return (lighter + 0.05) / (darker + 0.05)
}

describe('Stage 15 presentation architecture', () => {
  it('keeps all stable IDs and Bureau Classic default ordering', () => {
    expect(websiteThemes.map((theme) => theme.id)).toEqual([...resultImageThemeIds])
    expect(websiteThemes[0].id).toBe('bureau-classic')
  })

  it.each(websiteThemes)('$name has a complete, identifying structural strategy', (theme) => {
    const { presentation } = theme.site
    expect(Object.keys(presentation.labels)).toEqual(locations)
    expect(Object.values(presentation.labels).every(Boolean)).toBe(true)
    for (const field of [
      presentation.strategy, presentation.shellStyle, presentation.panelStyle,
      presentation.headingStyle, presentation.dividerStyle, presentation.labelStyle,
      presentation.controlStyle, presentation.sealStyle, presentation.consultationStyle,
      presentation.resultStyle, presentation.footerStyle, presentation.panelRadius,
      presentation.panelBorderWidth, presentation.panelShadow,
    ]) expect(field.trim()).not.toBe('')
  })

  it('gives every theme a unique strategy and identifying decorative label set', () => {
    expect(new Set(websiteThemes.map((theme) => theme.site.presentation.strategy)).size).toBe(10)
    expect(new Set(websiteThemes.map((theme) => theme.site.presentation.labels.hero)).size).toBe(10)
  })

  it.each(websiteThemes)('$name keeps core text and controls at WCAG AA normal-text contrast', (theme) => {
    const { palette } = theme.site
    expect(contrast(palette.textPrimary, palette.surface)).toBeGreaterThanOrEqual(4.5)
    expect(contrast(palette.textSecondary, palette.surface)).toBeGreaterThanOrEqual(4.5)
    expect(contrast(palette.inputText, palette.inputBackground)).toBeGreaterThanOrEqual(4.5)
    expect(contrast(palette.buttonText, palette.buttonBackground)).toBeGreaterThanOrEqual(4.5)
  })

  it.each(locations)('renders the shared %s ornament as assistive-technology-hidden geometry', (location) => {
    const markup = renderToStaticMarkup(<ThemeOrnament location={location} />)
    expect(markup).toContain(`data-theme-ornament="${location}"`)
    expect(markup).toContain('aria-hidden="true"')
    expect(markup).toContain('<i></i><b></b><i></i>')
  })

  it('falls back to Bureau Classic for an unknown theme without throwing', () => {
    expect(getWebsiteTheme('missing-department').id).toBe('bureau-classic')
    const properties = new Map<string, string>()
    const root: ThemeRootLike = {
      dataset: {},
      style: { setProperty: (name, value) => { properties.set(name, value) } },
    }
    expect(() => applySiteTheme('missing-department', root)).not.toThrow()
    expect(root.dataset.theme).toBe('bureau-classic')
    expect(root.dataset.presentation).toBe('document')
  })

  it('mounts the shared framing across the complete page without theme-specific component forks', () => {
    const markup = renderToStaticMarkup(<App initialSiteThemeId="arcane-terminal" />)
    for (const location of ['header', 'hero', 'checker', 'applicant', 'information', 'footer']) {
      expect(markup).toContain(`data-theme-ornament="${location}"`)
    }
    expect(markup).toContain('Is 300 too old for 34?')
    expect(markup).toContain('Fantasy Age Compatibility Assessment')
  })
})

describe('Stage 15 result and sharing stability', () => {
  const custom: CustomSpecies = {
    id: 'custom-15', name: 'A & B <Archive> Species With A Deliberately Long Name',
    adulthoodAge: 24, typicalLifespan: 240, source: 'custom',
  }
  const human: Species = {
    id: 'human', name: 'Human', adulthoodAge: 18, typicalLifespan: 84, source: 'builtin',
  }
  const consultation = createApprovedConsultation([
    facts('A', custom, 100, 'Elara & <Clerk>'),
    facts('B', human, 34, 'Thomas'),
  ], { random: () => 0, caseRandom: () => 0.314159 })
  const canonicalSnapshot = JSON.stringify(consultation)
  const copiedText = createShareResultText(consultation)

  it.each(resultImageThemeIds)('keeps consultation fields byte-identical while applying %s', (themeId) => {
    const root: ThemeRootLike = { dataset: {}, style: { setProperty: () => undefined } }
    applySiteTheme(themeId, root)
    expect(JSON.stringify(consultation)).toBe(canonicalSnapshot)
    expect(createShareResultText(consultation)).toBe(copiedText)
    expect(consultation.applicants.map(({ name, species, age }) => ({ name, species: species.name, age }))).toEqual([
      { name: 'Elara & <Clerk>', species: custom.name, age: 100 },
      { name: 'Thomas', species: 'Human', age: 34 },
    ])
  })

  it('keeps theme state out of the unchanged permalink contract', () => {
    const builtInApplicants = [
      facts('A', { ...human, id: 'elf', name: 'Elf', adulthoodAge: 100, typicalLifespan: 750 }, 300, 'Elara'),
      facts('B', human, 34, 'Thomas'),
    ]
    for (const themeId of resultImageThemeIds) {
      expect(createShareUrl(builtInApplicants, { origin: 'https://example.test', pathname: '/' }))
        .toBe('https://example.test/?sa=elf&aa=300&sb=human&ab=34#checker')
      expect(copiedText).not.toContain(themeId)
    }
  })
})
