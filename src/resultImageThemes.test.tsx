import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { ShareControls } from './components/ShareControls'
import {
  DEFAULT_RESULT_IMAGE_THEME_ID,
  getResultImageTheme,
  resultImageThemeIds,
  resultImageThemes,
  type ResultImageThemeId,
} from './data/resultImageThemes'
import { species, type CustomSpecies, type Species } from './data/species'
import type { ApplicantLabel, ApplicantLifecycleFacts } from './types/applicant'
import { createApprovedConsultation, type ApprovedConsultation } from './utils/consultation'
import { calculateAdultExperience, calculateRelativeAge } from './utils/lifecycle'
import {
  buildResultImageModel,
  createResultCardSvg,
  createResultPng,
  type ResultCanvasLike,
  type ResultImageEnvironment,
  type ResultImageLike,
} from './utils/resultImage'
import { createShareResultText, createShareUrl } from './utils/share'

const human = species.find((entry) => entry.id === 'human')!
const elf = species.find((entry) => entry.id === 'elf')!
const dragonborn = species.find((entry) => entry.id === 'dragonborn')!
const halfElf = species.find((entry) => entry.id === 'half-elf')!
const sphinx = species.find((entry) => entry.id === 'sphinx')!

function facts(
  label: ApplicantLabel,
  selectedSpecies: Species,
  age: number,
  name?: string,
): ApplicantLifecycleFacts {
  return {
    label,
    species: selectedSpecies,
    age,
    adultExperience: calculateAdultExperience(selectedSpecies, age),
    relativeAge: calculateRelativeAge(selectedSpecies, age),
    ...(name ? { name } : {}),
  }
}

function consultation(
  first = facts('A', elf, 300, 'Elara'),
  second = facts('B', human, 34, 'Thomas'),
): ApprovedConsultation {
  const submitted = createApprovedConsultation([first, second], {
    random: () => 0,
    caseRandom: () => 0.123456,
  })
  return {
    ...submitted,
    quips: {
      maturity: { ...submitted.quips.maturity, text: 'MATURITY_QUIP_TOKEN' },
      experience: { ...submitted.quips.experience, text: 'EXPERIENCE_QUIP_TOKEN' },
      administrative: { ...submitted.quips.administrative, text: 'ADMINISTRATIVE_NOTE_TOKEN' },
    },
  }
}

function group(svg: string, id: string): string {
  const start = svg.indexOf(`id="${id}"`)
  return svg.slice(start, svg.indexOf('</g>', start))
}

function longContentConsultation(): ApprovedConsultation {
  const custom: CustomSpecies = {
    id: 'custom-987654',
    name: 'Moon & Star <Folk> of the Extremely Long Archival Designation',
    adulthoodAge: 20,
    typicalLifespan: 200,
    source: 'custom',
  }
  const submitted = consultation(
    facts('A', custom, 10_000, 'Aurelia'.repeat(7)),
    facts('B', sphinx, 4_000, 'Theodoric'.repeat(5)),
  )
  return {
    ...submitted,
    quips: {
      maturity: { ...submitted.quips.maturity, text: `Long maturity ${'annotation '.repeat(35)}Ω.` },
      experience: { ...submitted.quips.experience, text: `Long experience ${'commentary '.repeat(35)}—filed.` },
      administrative: { ...submitted.quips.administrative, text: `Long Bureau Note ${'memorandum '.repeat(45)}✓.` },
    },
  }
}

function svgCaptureEnvironment() {
  let sourceBlob: Blob | undefined
  const image: ResultImageLike = {
    onload: null,
    onerror: null,
    set src(_value: string) { queueMicrotask(() => image.onload?.()) },
  }
  const canvas: ResultCanvasLike = {
    width: 0,
    height: 0,
    getContext: () => ({ drawImage: () => undefined }),
    toBlob: (callback) => callback(new Blob(['png'], { type: 'image/png' })),
  }
  const environment: ResultImageEnvironment = {
    createObjectURL: (blob) => {
      sourceBlob = blob
      return 'blob:captured-svg'
    },
    revokeObjectURL: () => undefined,
    createImage: () => image,
    createCanvas: () => canvas,
  }
  return { environment, sourceSvg: async () => sourceBlob?.text() ?? '' }
}

describe('result image theme registry', () => {
  it('contains exactly ten themes', () => expect(resultImageThemes).toHaveLength(10))
  it('has ten unique theme IDs', () => expect(new Set(resultImageThemes.map(({ id }) => id)).size).toBe(10))
  it('has ten unique theme names', () => expect(new Set(resultImageThemes.map(({ name }) => name)).size).toBe(10))
  it('contains Bureau Classic', () => expect(resultImageThemeIds).toContain('bureau-classic'))
  it('uses Bureau Classic by default', () => expect(DEFAULT_RESULT_IMAGE_THEME_ID).toBe('bureau-classic'))

  it.each(resultImageThemes)('$name has complete visual tokens and a description', (theme) => {
    expect(theme.description.trim()).not.toBe('')
    expect(Object.keys(theme.palette)).toHaveLength(11)
    expect(Object.values(theme.palette).every((value) => value.trim().length > 0)).toBe(true)
    expect(theme.displayFont).not.toBe('')
    expect(theme.bodyFont).not.toBe('')
  })

  it('renders all ten text-labelled, CSS-only options with Bureau Classic selected', () => {
    const markup = renderToStaticMarkup(<ShareControls result={consultation()} />)
    expect((markup.match(/type="radio"/g) ?? [])).toHaveLength(10)
    for (const theme of resultImageThemes) {
      expect(markup).toContain(theme.name)
      expect(markup).toContain(theme.description)
    }
    expect(markup).toContain('Selected: Bureau Classic')
    expect(markup).toContain('aria-hidden="true"')
  })
})

describe('complete image content in every theme', () => {
  it('copies the exact three submitted quips into separate model fields', () => {
    const model = buildResultImageModel(consultation())
    expect(model.maturity.quip).toBe('MATURITY_QUIP_TOKEN')
    expect(model.experience.quip).toBe('EXPERIENCE_QUIP_TOKEN')
    expect(model.administrativeNote).toBe('ADMINISTRATIVE_NOTE_TOKEN')
  })

  it.each(resultImageThemes)('$name produces a valid 1080x1350 SVG with the complete ruling', (theme) => {
    const svg = createResultCardSvg(buildResultImageModel(consultation()), { themeId: theme.id })
    expect(svg.startsWith('<?xml')).toBe(true)
    expect(svg).toContain('<svg xmlns="http://www.w3.org/2000/svg" width="1080" height="1350"')
    expect(svg).toContain(`data-theme="${theme.id}"`)
    for (const token of [
      'Elara', 'Elf', '300 years old', 'Thomas', 'Human', '34 years old',
      'ASSESSMENT I', 'MATURITY COMPATIBILITY', 'MATURITY_QUIP_TOKEN',
      'ASSESSMENT II', 'EXPERIENCE GAP', 'EXPERIENCE_QUIP_TOKEN',
      'BUREAU NOTE', 'ADMINISTRATIVE_NOTE_TOKEN', 'BUREAU REVIEWED',
      'ARB-ELF-HUM-123456',
    ]) expect(svg).toContain(token)
    expect(svg).not.toContain('foreignObject')
  })

  it.each(resultImageThemes)('$name places each quip in its required semantic section', (theme) => {
    const svg = createResultCardSvg(buildResultImageModel(consultation()), { themeId: theme.id })
    expect(group(group(svg, 'assessment-i'), 'maturity-quip')).toContain('MATURITY_QUIP_TOKEN')
    expect(group(group(svg, 'assessment-ii'), 'experience-quip')).toContain('EXPERIENCE_QUIP_TOKEN')
    expect(group(group(svg, 'bureau-note'), 'administrative-note')).toContain('ADMINISTRATIVE_NOTE_TOKEN')
  })

  it('changes presentation while retaining one immutable image model', () => {
    const model = buildResultImageModel(consultation())
    const snapshots = resultImageThemeIds.map((themeId) => createResultCardSvg(model, { themeId }))
    expect(new Set(snapshots).size).toBe(10)
    expect(buildResultImageModel(consultation())).toEqual(model)
    for (const svg of snapshots) {
      expect(svg).toContain(model.caseNumber)
      expect(svg).toContain(model.maturity.label)
      expect(svg).toContain(model.experience.label)
      expect(svg).toContain(model.experience.gap)
      expect(svg).toContain(model.maturity.quip)
      expect(svg).toContain(model.experience.quip)
      expect(svg).toContain(model.administrativeNote)
    }
  })

  it('repeated image creation never changes submitted quips', () => {
    const source = consultation()
    const before = structuredClone(source.quips)
    for (let index = 0; index < 20; index += 1) {
      createResultCardSvg(buildResultImageModel(source), {
        themeId: resultImageThemeIds[index % resultImageThemeIds.length],
      })
    }
    expect(source.quips).toEqual(before)
  })

  it('image rendering never reads or writes quip anti-repetition storage', () => {
    let reads = 0
    let writes = 0
    const source = createApprovedConsultation(
      [facts('A', elf, 300), facts('B', human, 34)],
      {
        random: () => 0,
        storage: {
          getItem: () => { reads += 1; return null },
          setItem: () => { writes += 1 },
        },
      },
    )
    const selectedCounts = { reads, writes }
    for (const themeId of resultImageThemeIds) createResultCardSvg(buildResultImageModel(source), { themeId })
    expect({ reads, writes }).toEqual(selectedCounts)
  })
})

describe('theme content stability and layout safety', () => {
  it.each(resultImageThemes)('$name safely renders long names, custom species, long quips, Unicode, XML, and longevity', (theme) => {
    const svg = createResultCardSvg(buildResultImageModel(longContentConsultation()), { themeId: theme.id })
    expect(svg).toContain('id="maturity-quip"')
    expect(svg).toContain('id="experience-quip"')
    expect(svg).toContain('id="administrative-note"')
    expect(svg).toContain('id="longevity-advisory"')
    expect(svg).toContain('Moon &amp; Star')
    expect(svg).toContain('&lt;Folk&gt;')
    expect(svg).not.toContain('custom-987654')
    expect(svg).not.toContain('Moon & Star <Folk>')
    expect((svg.match(/<tspan/g) ?? []).length).toBeGreaterThan(20)
  })

  it.each(resultImageThemes)('$name safely renders Dragonborn and Half-Elf', (theme) => {
    const source = consultation(facts('A', dragonborn, 60), facts('B', halfElf, 80))
    expect(() => createResultCardSvg(buildResultImageModel(source), { themeId: theme.id })).not.toThrow()
  })

  it.each(resultImageThemes)('$name safely renders extreme finite ages and two longevity notices', (theme) => {
    const source = consultation(facts('A', human, Number.MAX_VALUE), facts('B', sphinx, Number.MAX_VALUE / 2))
    const svg = createResultCardSvg(buildResultImageModel(source), { themeId: theme.id })
    expect(svg).toContain('id="longevity-advisory"')
    expect(svg).toContain('MATURITY_QUIP_TOKEN')
    expect(svg).toContain('EXPERIENCE_QUIP_TOKEN')
    expect(svg).toContain('ADMINISTRATIVE_NOTE_TOKEN')
  })

  it('keeps permalink and copied result text independent of image theme', () => {
    const source = consultation()
    const expectedUrl = createShareUrl(source.applicants, { origin: 'https://example.test', pathname: '/checker' })
    const expectedText = createShareResultText(source)
    for (const themeId of resultImageThemeIds) {
      createResultCardSvg(buildResultImageModel(source), { themeId })
      expect(createShareUrl(source.applicants, { origin: 'https://example.test', pathname: '/checker' })).toBe(expectedUrl)
      expect(createShareResultText(source)).toBe(expectedText)
    }
    expect(expectedUrl).not.toContain('theme')
  })
})

describe('selected theme PNG routing', () => {
  it.each<[string, ResultImageThemeId]>([
    ['Save Image', 'royal-decree'],
    ['Share Image', 'arcane-terminal'],
  ])('%s image generation uses the selected theme', async (_action, themeId) => {
    const capture = svgCaptureEnvironment()
    await createResultPng(consultation(), capture.environment, undefined, themeId)
    expect(await capture.sourceSvg()).toContain(`data-theme="${themeId}"`)
  })

  it('saving after a theme change changes only presentation', async () => {
    const first = svgCaptureEnvironment()
    const second = svgCaptureEnvironment()
    const source = consultation()
    await createResultPng(source, first.environment, undefined, 'bureau-classic')
    await createResultPng(source, second.environment, undefined, 'obsidian-records')
    const firstSvg = await first.sourceSvg()
    const secondSvg = await second.sourceSvg()
    expect(firstSvg).not.toBe(secondSvg)
    for (const token of ['MATURITY_QUIP_TOKEN', 'EXPERIENCE_QUIP_TOKEN', 'ADMINISTRATIVE_NOTE_TOKEN']) {
      expect(firstSvg).toContain(token)
      expect(secondSvg).toContain(token)
    }
  })

  it('falls back to the default registry theme when looked up normally', () => {
    expect(getResultImageTheme(DEFAULT_RESULT_IMAGE_THEME_ID).name).toBe('Bureau Classic')
  })
})
