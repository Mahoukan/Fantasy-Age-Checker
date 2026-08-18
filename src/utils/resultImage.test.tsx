import { renderToStaticMarkup } from 'react-dom/server'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { ShareControls } from '../components/ShareControls'
import { species, type CustomSpecies, type Species } from '../data/species'
import { experienceVerdicts, maturityVerdicts } from '../data/verdicts'
import type { ApplicantLabel, ApplicantLifecycleFacts } from '../types/applicant'
import { createApprovedConsultation } from './consultation'
import { calculateAdultExperience, calculateRelativeAge } from './lifecycle'
import {
  RESULT_IMAGE_HEIGHT,
  RESULT_IMAGE_WIDTH,
  buildResultImageModel,
  createResultCardSvg,
  downloadResultPng,
  escapeXmlText,
  fitMeasuredText,
  renderResultSvgToPng,
  resultImageFilename,
  shareResultPng,
  supportsImageFileSharing,
  wrapMeasuredText,
  type ImageShareNavigator,
  type ResultCanvasLike,
  type ResultImageEnvironment,
  type ResultImageLike,
} from './resultImage'

const human = species.find((entry) => entry.id === 'human')!
const elf = species.find((entry) => entry.id === 'elf')!
const sphinx = species.find((entry) => entry.id === 'sphinx')!

function facts(label: ApplicantLabel, selectedSpecies: Species, age: number): ApplicantLifecycleFacts {
  return {
    label,
    species: selectedSpecies,
    age,
    adultExperience: calculateAdultExperience(selectedSpecies, age),
    relativeAge: calculateRelativeAge(selectedSpecies, age),
  }
}

function consultation(
  first = facts('A', elf, 300),
  second = facts('B', human, 34),
) {
  return createApprovedConsultation([first, second], {
    random: () => 0,
    caseRandom: () => 0.123456,
  })
}

function fakeFileFactory(blob: Blob, name: string, type: string): File {
  return { name, type, size: blob.size } as File
}

function renderEnvironment(options: { failImage?: boolean; nullBlob?: boolean } = {}) {
  const revoked: string[] = []
  const drawn: unknown[] = []
  const image: ResultImageLike = {
    onload: null,
    onerror: null,
    get src() { return 'blob:result-svg' },
    set src(_value: string) {
      queueMicrotask(() => options.failImage ? image.onerror?.() : image.onload?.())
    },
  }
  const canvas: ResultCanvasLike = {
    width: 0,
    height: 0,
    getContext: () => ({ drawImage: (...args) => drawn.push(args) }),
    toBlob: (callback) => callback(options.nullBlob ? null : new Blob(['png'], { type: 'image/png' })),
  }
  const environment: ResultImageEnvironment = {
    createObjectURL: () => 'blob:result-svg',
    revokeObjectURL: (url) => revoked.push(url),
    createImage: () => image,
    createCanvas: () => canvas,
  }
  return { environment, revoked, drawn, canvas }
}

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('result image model', () => {
  it('uses the submitted applicants, ages, and adult experience', () => {
    const model = buildResultImageModel(consultation())
    expect(model.applicants).toMatchObject([
      { speciesName: 'Elf', age: '300', adultExperience: '200' },
      { speciesName: 'Human', age: '34', adultExperience: '16' },
    ])
  })

  it('preserves the existing consultation case number', () => {
    const submitted = consultation()
    expect(buildResultImageModel(submitted).caseNumber).toBe(submitted.caseNumber)
  })

  it('is deterministic and does not generate a replacement case number', () => {
    const submitted = consultation()
    expect(buildResultImageModel(submitted)).toEqual(buildResultImageModel(submitted))
  })

  it('uses the already-selected experience quip for historical gaps', () => {
    const submitted = consultation()
    const source = {
      ...submitted,
      quips: {
        ...submitted.quips,
        experience: { ...submitted.quips.experience, text: 'Existing historical quip.' },
      },
    }
    expect(buildResultImageModel(source).experience.quip).toBe('Existing historical quip.')
  })

  it('uses the already-selected maturity quip for ordinary gaps', () => {
    const submitted = consultation(facts('A', human, 32), facts('B', human, 31))
    const source = {
      ...submitted,
      quips: { ...submitted.quips, maturity: { ...submitted.quips.maturity, text: 'Existing maturity quip.' } },
    }
    expect(buildResultImageModel(source).maturity.quip).toBe('Existing maturity quip.')
  })

  it('carries the selected administrative quip independently', () => {
    const submitted = consultation()
    const source = {
      ...submitted,
      quips: {
        ...submitted.quips,
        experience: { ...submitted.quips.experience, text: ' ' },
        administrative: { ...submitted.quips.administrative, text: 'Filed without incident.' },
      },
    }
    const model = buildResultImageModel(source)
    expect(model.experience.quip).toBe(' ')
    expect(model.administrativeNote).toBe('Filed without incident.')
  })

  it('allows every one of the 30 built-in species to populate a model', () => {
    expect(species).toHaveLength(30)
    for (const entry of species) {
      const model = buildResultImageModel(consultation(facts('A', entry, entry.adulthoodAge + 10)))
      expect(model.applicants[0].speciesName).toBe(entry.name)
    }
  })

  it('uses custom display names and marks them Temporary', () => {
    const custom: CustomSpecies = {
      id: 'custom-42', name: 'Moon & Star <Folk>', adulthoodAge: 20, typicalLifespan: 200, source: 'custom',
    }
    expect(buildResultImageModel(consultation(facts('A', custom, 50))).applicants[0])
      .toMatchObject({ speciesName: custom.name, isTemporary: true })
  })

  it('never puts a custom internal ID in the model or SVG', () => {
    const custom: CustomSpecies = {
      id: 'custom-999', name: 'Moonfolk', adulthoodAge: 20, typicalLifespan: 200, source: 'custom',
    }
    const svg = createResultCardSvg(buildResultImageModel(consultation(facts('A', custom, 50))))
    expect(svg).not.toContain('custom-999')
  })

  it('omits normal longevity advisories', () => {
    expect(buildResultImageModel(consultation()).longevity).toEqual([])
  })

  it('includes exceptional longevity metadata', () => {
    const model = buildResultImageModel(consultation(facts('A', elf, 900)))
    expect(model.longevity).toContainEqual(expect.objectContaining({ speciesName: 'Elf', label: 'Exceptionally Old' }))
  })

  it('includes both non-normal applicants', () => {
    const model = buildResultImageModel(consultation(facts('A', human, 10_000), facts('B', sphinx, 4_000)))
    expect(model.longevity.map((entry) => entry.speciesName)).toEqual(['Human', 'Sphinx'])
  })

  it('uses maturity and experience verdict metadata', () => {
    const submitted = consultation()
    const model = buildResultImageModel(submitted)
    expect(model.maturity.label).toBe(maturityVerdicts[submitted.maturity.category].label)
    expect(model.experience.label).toBe(experienceVerdicts[submitted.experience.category].label)
  })

  it('formats the standard adult-experience gap as 184', () => {
    expect(buildResultImageModel(consultation()).experience.gap).toBe('184')
  })
})

describe('safe SVG card construction', () => {
  it.each([
    ['&', '&amp;'], ['<', '&lt;'], ['>', '&gt;'], ['"', '&quot;'], ["'", '&apos;'],
  ])('escapes XML character %s', (unsafe, safe) => {
    expect(escapeXmlText(unsafe)).toBe(safe)
  })

  it('cannot be broken by a custom XML-like species name', () => {
    const custom: CustomSpecies = {
      id: 'custom-1', name: 'Moon & Star <Folk>', adulthoodAge: 20, typicalLifespan: 200, source: 'custom',
    }
    const svg = createResultCardSvg(buildResultImageModel(consultation(facts('A', custom, 50))))
    expect(svg).toContain('Moon &amp; Star')
    expect(svg).toContain('&lt;Folk&gt;')
    expect(svg).not.toContain('Moon & Star <Folk>')
  })

  it('declares the required 1080 by 1350 dimensions', () => {
    const svg = createResultCardSvg(buildResultImageModel(consultation()))
    expect(svg).toContain(`width="${RESULT_IMAGE_WIDTH}"`)
    expect(svg).toContain(`height="${RESULT_IMAGE_HEIGHT}"`)
  })

  it('contains Bureau branding, seal wording, and case number', () => {
    const model = buildResultImageModel(consultation())
    const svg = createResultCardSvg(model)
    expect(svg).toContain('FANTASY AGE CHECKER')
    expect(svg).toContain('BUREAU REVIEWED')
    expect(svg).toContain(model.caseNumber)
  })

  it('contains both applicant display names and ages', () => {
    const svg = createResultCardSvg(buildResultImageModel(consultation()))
    expect(svg).toContain('Elf')
    expect(svg).toContain('300 years old')
    expect(svg).toContain('Human')
    expect(svg).toContain('34 years old')
  })

  it('uses plain SVG text and tspan elements without foreignObject', () => {
    const svg = createResultCardSvg(buildResultImageModel(consultation()))
    expect(svg).toContain('<text')
    expect(svg).toContain('<tspan')
    expect(svg).not.toContain('foreignObject')
  })

  it('wraps measured Half-Elf and Dragonborn labels within bounds', () => {
    const measure = (text: string, style: { fontSize: number }) => text.length * style.fontSize * 0.6
    for (const name of ['Half-Elf', 'Dragonborn']) {
      const lines = wrapMeasuredText(name, 120, { fontSize: 30, fontFamily: 'serif' }, measure)
      expect(lines.every((line) => measure(line, { fontSize: 30 }) <= 120)).toBe(true)
    }
  })

  it('fits a 40-character unbroken custom name inside configured bounds', () => {
    const measure = (text: string, style: { fontSize: number }) => text.length * style.fontSize * 0.6
    const fitted = fitMeasuredText('A'.repeat(40), {
      maxWidth: 350, maxLines: 2, fontSizes: [38, 34, 30, 26], measureText: measure,
    })
    expect(fitted.lines).toHaveLength(2)
    expect(fitted.lines.every((line) => measure(line, { fontSize: fitted.fontSize }) <= 350)).toBe(true)
  })

  it('wraps a long quip into multiple escaped tspans', () => {
    const model = buildResultImageModel(consultation())
    model.maturity.quip = 'The Bureau has reviewed this unusually verbose submission and discovered enough paperwork to occupy several shelves in the western archive indefinitely.'
    const svg = createResultCardSvg(model, { measureText: (text, style) => text.length * style.fontSize * 0.65 })
    const quoteStart = svg.indexOf('id="maturity-quip"')
    const quoteRegion = svg.slice(quoteStart, svg.indexOf('</g>', quoteStart))
    expect((quoteRegion.match(/<tspan/g) ?? []).length).toBeGreaterThan(1)
  })

  it('does not throw for extreme finite ages and gaps', () => {
    const submitted = consultation(facts('A', human, Number.MAX_VALUE), facts('B', elf, Number.MAX_VALUE / 2))
    expect(() => createResultCardSvg(buildResultImageModel(submitted))).not.toThrow()
  })
})

describe('PNG, download, and file sharing boundaries', () => {
  it('renders a PNG Blob at the required canvas dimensions', async () => {
    const mock = renderEnvironment()
    const png = await renderResultSvgToPng('<svg/>', mock.environment)
    expect(png.type).toBe('image/png')
    expect(mock.canvas).toMatchObject({ width: 1080, height: 1350 })
    expect(mock.drawn).toHaveLength(1)
  })

  it('rejects image-load failures and revokes the SVG object URL', async () => {
    const mock = renderEnvironment({ failImage: true })
    await expect(renderResultSvgToPng('<svg/>', mock.environment)).rejects.toThrow('could not be loaded')
    expect(mock.revoked).toEqual(['blob:result-svg'])
  })

  it('rejects null canvas encoding and revokes the SVG object URL', async () => {
    const mock = renderEnvironment({ nullBlob: true })
    await expect(renderResultSvgToPng('<svg/>', mock.environment)).rejects.toThrow('could not encode')
    expect(mock.revoked).toEqual(['blob:result-svg'])
  })

  it('sanitizes a case number for the download filename', () => {
    expect(resultImageFilename('FAC/26: A&B')).toBe('fantasy-age-ruling-FAC-26-A-B.png')
  })

  it('downloads with the case filename and revokes its object URL', () => {
    const revoked: string[] = []
    const anchor = { href: '', download: '', click: vi.fn() }
    const filename = downloadResultPng(new Blob(['png']), 'FAC-2601', {
      createObjectURL: () => 'blob:png',
      revokeObjectURL: (url) => revoked.push(url),
      createAnchor: () => anchor,
      schedule: (callback) => callback(),
    })
    expect(filename).toBe('fantasy-age-ruling-FAC-2601.png')
    expect(anchor.click).toHaveBeenCalledOnce()
    expect(revoked).toEqual(['blob:png'])
  })

  it('detects file sharing only when canShare accepts files', () => {
    const supported = { share: vi.fn(), canShare: vi.fn(() => true) }
    const rejected = { share: vi.fn(), canShare: vi.fn(() => false) }
    expect(supportsImageFileSharing(supported, fakeFileFactory)).toBe(true)
    expect(supportsImageFileSharing(rejected, fakeFileFactory)).toBe(false)
  })

  it('does not treat navigator.share without canShare(files) as image sharing', async () => {
    const share = vi.fn(async () => undefined)
    const navigatorLike: ImageShareNavigator = { share }
    expect(supportsImageFileSharing(navigatorLike, fakeFileFactory)).toBe(false)
    await expect(shareResultPng(new Blob(), 'FAC-1', navigatorLike, fakeFileFactory)).resolves.toBe('unsupported')
    expect(share).not.toHaveBeenCalled()
  })

  it('shares a generated File after rechecking the real file payload', async () => {
    const navigatorLike = { share: vi.fn(async () => undefined), canShare: vi.fn(() => true) }
    await expect(shareResultPng(new Blob(['png']), 'FAC-1', navigatorLike, fakeFileFactory)).resolves.toBe('shared')
    expect(navigatorLike.canShare).toHaveBeenCalledWith(expect.objectContaining({ files: [expect.anything()] }))
    expect(navigatorLike.share).toHaveBeenCalledOnce()
  })

  it('converts share rejection into a non-throwing failure outcome', async () => {
    const navigatorLike = { share: vi.fn(async () => { throw new Error('no') }), canShare: vi.fn(() => true) }
    await expect(shareResultPng(new Blob(), 'FAC-1', navigatorLike, fakeFileFactory)).resolves.toBe('failed')
  })

  it('renders Save Image for a custom result while its permanent link is disabled', () => {
    const custom: CustomSpecies = {
      id: 'custom-5', name: 'Forty Character Temporary Bureau Species', adulthoodAge: 20,
      typicalLifespan: 200, source: 'custom',
    }
    const markup = renderToStaticMarkup(<ShareControls result={consultation(facts('A', custom, 50))} />)
    expect(markup).toContain('Save Image')
    expect(markup).toMatch(/<button[^>]*disabled=""[^>]*>Copy Link/)
  })

  it('keeps Share Image hidden when browser file sharing is unavailable', () => {
    const markup = renderToStaticMarkup(<ShareControls result={consultation()} />)
    expect(markup).toContain('Save Image')
    expect(markup).not.toContain('Share Image')
  })
})
