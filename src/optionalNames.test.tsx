import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it, vi } from 'vitest'
import { ApplicantCard } from './components/ApplicantCard'
import { ResultShell } from './components/ResultShell'
import { species, type CustomSpecies, type Species } from './data/species'
import type { Applicant, ApplicantLabel, ApplicantLifecycleFacts } from './types/applicant'
import {
  APPLICANT_NAME_MAX_LENGTH,
  limitApplicantName,
  normalizeApplicantName,
} from './utils/applicantName'
import { createApprovedConsultation } from './utils/consultation'
import { calculateAdultExperience, calculateRelativeAge } from './utils/lifecycle'
import { buildResultImageModel, createResultCardSvg, fitMeasuredText } from './utils/resultImage'
import {
  createShareParams,
  createShareResultText,
  createShareUrl,
  parseSharedConsultation,
  resolveSharedApplicants,
} from './utils/share'

const elf = species.find((entry) => entry.id === 'elf')!
const human = species.find((entry) => entry.id === 'human')!

function facts(
  label: ApplicantLabel,
  selectedSpecies: Species,
  age: number,
  name?: string,
): ApplicantLifecycleFacts {
  return {
    label,
    ...(name !== undefined ? { name } : {}),
    species: selectedSpecies,
    age,
    adultExperience: calculateAdultExperience(selectedSpecies, age),
    relativeAge: calculateRelativeAge(selectedSpecies, age),
  }
}

function consultation(nameA?: string, nameB?: string) {
  return createApprovedConsultation(
    [facts('A', elf, 300, nameA), facts('B', human, 34, nameB)],
    { random: () => 0, caseRandom: () => 0.123456 },
  )
}

describe('optional applicant-name input and normalization', () => {
  it('keeps Applicant A and Applicant B names optional', () => {
    const applicantA: Applicant = { speciesId: 'elf', age: 300 }
    const applicantB: Applicant = { speciesId: 'human', age: 34 }
    expect(applicantA.name).toBeUndefined()
    expect(applicantB.name).toBeUndefined()
  })

  it('treats a blank name exactly like no name', () => {
    expect(normalizeApplicantName('')).toBeUndefined()
    expect(consultation('').applicants[0].name).toBeUndefined()
  })

  it('turns whitespace-only input into an empty name', () => {
    expect(normalizeApplicantName('  \t\n  ')).toBeUndefined()
  })

  it('trims leading and trailing whitespace on submission', () => {
    expect(consultation('  Elara  ').applicants[0].name).toBe('Elara')
  })

  it('accepts a 40-character name', () => {
    const name = 'A'.repeat(APPLICANT_NAME_MAX_LENGTH)
    expect(normalizeApplicantName(name)).toBe(name)
  })

  it('limits over-40-character values to 40 Unicode characters', () => {
    expect(Array.from(limitApplicantName('A'.repeat(41)))).toHaveLength(40)
    expect(Array.from(normalizeApplicantName('🌙'.repeat(41)) ?? '')).toHaveLength(40)
  })

  it('supports Unicode names', () => {
    expect(normalizeApplicantName('Tāne')).toBe('Tāne')
    expect(normalizeApplicantName('Éowyn')).toBe('Éowyn')
  })

  it('supports apostrophes, hyphens, spaces, and ordinary punctuation', () => {
    expect(normalizeApplicantName(" O'Rin-of the Vale! ")).toBe("O'Rin-of the Vale!")
  })

  it('renders properly labelled name controls with a native maximum length', () => {
    const markup = renderToStaticMarkup(
      <ApplicantCard
        applicant={{ name: '', speciesId: 'elf', age: 300 }}
        label="A"
        availableSpecies={species}
        onChange={vi.fn()}
      />,
    )
    expect(markup).toContain('Name (optional)')
    expect(markup).toContain('id="applicant-a-name"')
    expect(markup).toContain('maxLength="40"')
    expect(markup).toContain('Used only for this consultation')
  })

  it('captures a detached, stable submitted name', () => {
    const applicant = facts('A', elf, 300, 'Elara')
    const result = createApprovedConsultation([applicant, facts('B', human, 34)], {
      random: () => 0, caseRandom: () => 0,
    })
    applicant.name = 'Changed draft'
    expect(result.applicants[0].name).toBe('Elara')
  })
})

describe('presentation-only consultation behavior', () => {
  it('shows provided names and retains species in the web result', () => {
    const markup = renderToStaticMarkup(<ResultShell {...consultation('Elara', 'Thomas')} />)
    expect(markup).toContain('<h4>Elara</h4>')
    expect(markup).toContain('<h4>Thomas</h4>')
    expect(markup).toContain('applicant-species-name">Elf')
    expect(markup).toContain('applicant-species-name">Human')
  })

  it('retains Applicant A and Applicant B semantics when unnamed', () => {
    const markup = renderToStaticMarkup(<ResultShell {...consultation()} />)
    expect(markup).toContain('Applicant A maturity equivalent')
    expect(markup).toContain('Applicant B maturity equivalent')
    expect(markup).toContain('<h4>Elf</h4>')
    expect(markup).toContain('<h4>Human</h4>')
  })

  it('uses a provided name in longevity notices', () => {
    const submitted = createApprovedConsultation(
      [facts('A', human, 10_000, 'Elara'), facts('B', elf, 300)],
      { random: () => 0, caseRandom: () => 0 },
    )
    const markup = renderToStaticMarkup(<ResultShell {...submitted} />)
    expect(markup).toContain('Elara has exceeded the typical lifespan')
    expect(markup).toContain('for Elara: Chronological Anomaly')
  })

  it('produces the same case number for different names', () => {
    expect(consultation('Elara', 'Thomas').caseNumber).toBe(consultation('Lyra', 'Rowan').caseNumber)
  })

  it('produces identical maths for different names', () => {
    const first = consultation('Elara', 'Thomas')
    const second = consultation('Lyra', 'Rowan')
    expect(second.maturity).toEqual(first.maturity)
    expect(second.experience).toEqual(first.experience)
    expect(second.longevity).toEqual(first.longevity)
  })

  it('does not use names when selecting quips', () => {
    const first = consultation('Elara', 'Thomas')
    const second = consultation('Lyra', 'Rowan')
    expect(second.quips).toEqual(first.quips)
  })
})

describe('name-free permalinks and named share text', () => {
  it('produces the same permalink parameters for different names', () => {
    expect(createShareParams(consultation('Elara', 'Thomas').applicants)?.toString())
      .toBe(createShareParams(consultation('Lyra', 'Rowan').applicants)?.toString())
  })

  it('never serializes names into the permalink URL', () => {
    const url = createShareUrl(consultation('Elara', 'Thomas').applicants, {
      origin: 'https://example.test', pathname: '/',
    })!
    expect(url).toBe('https://example.test/?sa=elf&aa=300&sb=human&ab=34#checker')
    expect(url).not.toContain('Elara')
    expect(url).not.toContain('Thomas')
    expect([...new URL(url).searchParams.keys()]).toEqual(['sa', 'aa', 'sb', 'ab'])
  })

  it('restores a permalink with both names blank', () => {
    const parsed = parseSharedConsultation('?sa=elf&aa=300&sb=human&ab=34')
    if (parsed.status !== 'valid') throw new Error('Expected a valid permalink')
    const restored = resolveSharedApplicants(parsed.consultation)
    expect(restored.map((applicant) => applicant.name)).toEqual([undefined, undefined])
  })

  it('includes provided names and species in copied/native-share text', () => {
    const text = createShareResultText(consultation('Elara', 'Thomas'))
    expect(text).toContain('Elara — Elf, age 300')
    expect(text).toContain('Thomas — Human, age 34')
  })

  it('keeps existing unnamed share text unchanged', () => {
    const text = createShareResultText(consultation())
    expect(text).toContain('Elf, age 300')
    expect(text).toContain('Human, age 34')
    expect(text).not.toContain('Applicant A —')
  })
})

describe('named result-image safety and layout', () => {
  it('puts submitted display names in the image model', () => {
    expect(buildResultImageModel(consultation('Elara', 'Thomas')).applicants)
      .toMatchObject([{ displayName: 'Elara', speciesName: 'Elf' }, { displayName: 'Thomas', speciesName: 'Human' }])
  })

  it('puts both names, species, and ages in the generated SVG', () => {
    const svg = createResultCardSvg(buildResultImageModel(consultation('Elara', 'Thomas')))
    for (const text of ['Elara', 'Elf', '300 years old', 'Thomas', 'Human', '34 years old']) {
      expect(svg).toContain(text)
    }
  })

  it('escapes XML-special characters in names while retaining Unicode', () => {
    const svg = createResultCardSvg(buildResultImageModel(consultation('Aria & <The Wanderer>', 'Tāne "O\'Rin"')))
    expect(svg).toContain('Aria &amp;')
    expect(svg).toContain('&lt;The Wanderer&gt;')
    expect(svg).toContain('Tāne &quot;O&apos;Rin&quot;')
    expect(svg).not.toContain('Aria & <The Wanderer>')
  })

  it('fits a 40-character name to the applicant-card width', () => {
    const measure = (text: string, style: { fontSize: number }) => text.length * style.fontSize * 0.6
    const fitted = fitMeasuredText('A'.repeat(40), {
      maxWidth: 350, maxLines: 2, fontSizes: [32, 29, 26, 23], measureText: measure,
    })
    expect(fitted.lines.length).toBeLessThanOrEqual(2)
    expect(fitted.lines.every((line) => measure(line, { fontSize: fitted.fontSize }) <= 350)).toBe(true)
  })

  it('renders two maximum-length names without breaking SVG bounds', () => {
    const svg = createResultCardSvg(buildResultImageModel(consultation('A'.repeat(40), 'B'.repeat(40))))
    expect(svg).toContain('width="1080"')
    expect(svg).toContain('height="1350"')
    expect(svg).not.toContain('foreignObject')
  })

  it('supports a name alongside a special-character custom species without exposing its ID', () => {
    const custom: CustomSpecies = {
      id: 'custom-77', name: 'Moon & Star <Folk>', adulthoodAge: 20, typicalLifespan: 240, source: 'custom',
    }
    const submitted = createApprovedConsultation(
      [facts('A', custom, 450, 'Lyra'), facts('B', human, 34)],
      { random: () => 0, caseRandom: () => 0 },
    )
    const web = renderToStaticMarkup(<ResultShell {...submitted} />)
    const svg = createResultCardSvg(buildResultImageModel(submitted))
    expect(web).toContain('Lyra')
    expect(web).toContain('Moon &amp; Star &lt;Folk&gt;')
    expect(svg).toContain('Lyra')
    expect(svg).toContain('Moon &amp; Star')
    expect(svg).not.toContain('custom-77')
  })

  it('keeps the unnamed image presentation available', () => {
    const svg = createResultCardSvg(buildResultImageModel(consultation()))
    expect(svg).toContain('APPLICANT A')
    expect(svg).toContain('APPLICANT B')
    expect(svg).toContain('Elf')
    expect(svg).toContain('Human')
  })
})
