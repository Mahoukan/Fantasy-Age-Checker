import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { ShareControls } from './components/ShareControls'
import {
  DEFAULT_RESULT_CARD_FORMAT_ID,
  resultCardFormatIds,
  resultCardFormats,
} from './data/resultCardFormats'
import { species, type CustomSpecies, type Species } from './data/species'
import type { ApplicantLabel, ApplicantLifecycleFacts } from './types/applicant'
import { createApprovedConsultation } from './utils/consultation'
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

const elf = species.find((entry) => entry.id === 'elf')!
const human = species.find((entry) => entry.id === 'human')!

function facts(label: ApplicantLabel, entry: Species, age: number, name?: string): ApplicantLifecycleFacts {
  return {
    label, species: entry, age,
    ...(name ? { name } : {}),
    adultExperience: calculateAdultExperience(entry, age),
    relativeAge: calculateRelativeAge(entry, age),
  }
}

function consultation(first = facts('A', elf, 300), second = facts('B', human, 34)) {
  return createApprovedConsultation([first, second], { random: () => 0, caseRandom: () => 0.123456 })
}

function svgPlainText(svg: string): string {
  return svg
    .replace(/<\/tspan>\s*<tspan[^>]*>/g, ' ')
    .replace(/<[^>]+>/g, '')
    .replaceAll('&apos;', "'")
    .replaceAll('&amp;', '&')
    .replaceAll('&lt;', '<')
    .replaceAll('&gt;', '>')
}

function captureEnvironment() {
  let source = ''
  const canvas: ResultCanvasLike = {
    width: 0, height: 0,
    getContext: () => ({ drawImage: () => undefined }),
    toBlob: (callback) => callback(new Blob(['png'], { type: 'image/png' })),
  }
  const image: ResultImageLike = {
    onload: null, onerror: null,
    get src() { return 'blob:svg' },
    set src(_value: string) { queueMicrotask(() => image.onload?.()) },
  }
  const environment: ResultImageEnvironment = {
    createObjectURL: (blob) => { void blob.text().then((text) => { source = text }); return 'blob:svg' },
    revokeObjectURL: () => undefined,
    createImage: () => image,
    createCanvas: () => canvas,
  }
  return { environment, canvas, source: () => source }
}

describe('Stage 16 card format registry and controls', () => {
  it('defines exactly three stable, unique format IDs with Standard as default', () => {
    expect(resultCardFormatIds).toEqual(['compact', 'standard', 'full-dossier'])
    expect(new Set(resultCardFormatIds).size).toBe(3)
    expect(resultCardFormats.map((format) => format.id)).toEqual([...resultCardFormatIds])
    expect(DEFAULT_RESULT_CARD_FORMAT_ID).toBe('standard')
  })

  it('renders an accessible visible format group with Standard selected', () => {
    const markup = renderToStaticMarkup(<ShareControls result={consultation()} />)
    expect(markup).toContain('<legend>Card Format</legend>')
    expect(markup).toContain('Selected format: Standard')
    for (const format of resultCardFormats) {
      expect(markup).toContain(`value="${format.id}"`)
      expect(markup).toContain(format.description)
    }
  })
})

describe('Stage 16 format SVG content', () => {
  const submitted = consultation(facts('A', elf, 300, 'Elara'), facts('B', human, 34, 'Thomas'))
  const model = buildResultImageModel(submitted)

  it('renders Compact at 1080×1080 with essentials and one submitted headline quip', () => {
    const svg = createResultCardSvg(model, { formatId: 'compact', themeId: 'bureau-classic' })
    const plain = svgPlainText(svg)
    expect(svg).toContain('width="1080" height="1080"')
    expect(svg).toContain('data-format="compact"')
    expect(svg).toContain('Elara')
    expect(svg).toContain('Thomas')
    expect(plain).toContain(model.maturity.label)
    expect(plain).toContain(model.experience.label)
    expect(plain).toContain(model.compactQuip)
    expect(svg).not.toContain('Maturity Analysis')
    expect(svg).not.toContain('Bureau Note')
  })

  it('keeps Standard at 1080×1350 with all existing commentary sections', () => {
    const svg = createResultCardSvg(model, { formatId: 'standard', themeId: 'elven-archive' })
    const plain = svgPlainText(svg)
    expect(svg).toContain('width="1080" height="1350"')
    expect(svg).toContain('data-format="standard"')
    expect(plain).toContain(model.maturity.quip)
    expect(plain).toContain(model.experience.quip)
    expect(plain).toContain(model.administrativeNote)
  })

  it('renders Full Dossier at 1080×1920 with lifecycle and calculation records', () => {
    const svg = createResultCardSvg(model, { formatId: 'full-dossier', themeId: 'dwarven-registry' })
    const plain = svgPlainText(svg)
    expect(svg).toContain('width="1080" height="1920"')
    expect(svg).toContain('data-format="full-dossier"')
    for (const text of ['FULL CASE DOSSIER', 'Recognised adulthood', 'Typical lifespan', 'Relative lifespan']) {
      expect(plain).toContain(text)
    }
    for (const heading of ['MATURITY ANALYSIS', 'EXPERIENCE ANALYSIS', 'BUREAU FINDINGS', 'BUREAU NOTE']) {
      expect(plain).toContain(heading)
    }
    expect(plain).toContain(model.maturity.quip)
    expect(plain).toContain(model.experience.quip)
    expect(plain).toContain(model.administrativeNote)
  })

  it('formats true contextual flags as named Bureau Findings', () => {
    expect(model.findings).toEqual([
      'Elara has been an adult longer than Thomas has been alive.',
      "Elara's adult experience exceeds the typical Human lifespan.",
    ])
    const svg = createResultCardSvg(model, { formatId: 'full-dossier' })
    expect(svg).toContain('Elara has been an adult longer than Thomas has been alive.')
    expect(svg).not.toContain('applicantAHasBeenAdultLongerThanBHasBeenAlive')
  })

  it('keeps custom display data safe in Compact and Full Dossier', () => {
    const custom: CustomSpecies = {
      id: 'custom-16', name: 'Moon & Star <Archive> Species Record',
      adulthoodAge: 20, typicalLifespan: 200, source: 'custom',
    }
    const customModel = buildResultImageModel(consultation(facts('A', custom, 50, 'A & B <Clerk>')))
    for (const formatId of ['compact', 'full-dossier'] as const) {
      const svg = createResultCardSvg(customModel, { formatId })
      expect(svg).toContain('Moon &amp; Star &lt;Archive&gt; Species Record')
      expect(svg).toContain('A &amp; B &lt;Clerk&gt;')
      expect(svg).not.toContain('custom-16')
    }
  })
})

describe('Stage 16 format isolation and PNG routing', () => {
  it.each(resultCardFormatIds)('does not change consultation, copied text, or permalink for %s', (formatId) => {
    const submitted = consultation()
    const snapshot = JSON.stringify(submitted)
    const copied = createShareResultText(submitted)
    const permalink = createShareUrl(submitted.applicants, { origin: 'https://example.test', pathname: '/' })
    createResultCardSvg(buildResultImageModel(submitted), { formatId, themeId: 'arcane-terminal' })
    expect(JSON.stringify(submitted)).toBe(snapshot)
    expect(createShareResultText(submitted)).toBe(copied)
    expect(createShareUrl(submitted.applicants, { origin: 'https://example.test', pathname: '/' })).toBe(permalink)
    expect(permalink).not.toContain(formatId)
  })

  it.each(resultCardFormats)('routes $name dimensions and selected theme through PNG generation', async (format) => {
    const capture = captureEnvironment()
    await createResultPng(consultation(), capture.environment, undefined, 'arcane-terminal', format.id)
    await Promise.resolve()
    expect(capture.canvas).toMatchObject({ width: format.width, height: format.height })
    expect(capture.source()).toContain('data-theme="arcane-terminal"')
    expect(capture.source()).toContain(`data-format="${format.id}"`)
  })
})
