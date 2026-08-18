import { describe, expect, it, vi } from 'vitest'
import { species, type CustomSpecies, type Species } from '../data/species'
import type { ApplicantLabel, ApplicantLifecycleFacts } from '../types/applicant'
import { createApprovedConsultation } from './consultation'
import { calculateAdultExperience, calculateRelativeAge, isAdult } from './lifecycle'
import { getNavigationSection } from './navigation'
import {
  copyText,
  createShareParams,
  createShareResultText,
  createShareUrl,
  hasNativeShare,
  parseSharedConsultation,
  resolveSharedApplicants,
  shareNatively,
} from './share'

const human = species.find((entry) => entry.id === 'human')!
const elf = species.find((entry) => entry.id === 'elf')!

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
  applicantA = facts('A', elf, 300),
  applicantB = facts('B', human, 34),
  caseRandom = () => 0.123456,
) {
  return createApprovedConsultation([applicantA, applicantB], {
    random: () => 0,
    caseRandom,
  })
}

describe('built-in consultation permalinks', () => {
  it('serializes a built-in consultation to source-only parameters', () => {
    const params = createShareParams(consultation().applicants)!
    expect([...params.keys()]).toEqual(['sa', 'aa', 'sb', 'ab'])
  })

  it('serializes Elf 300 + Human 34 with expected species and age fields', () => {
    expect(createShareParams(consultation().applicants)?.toString())
      .toBe('sa=elf&aa=300&sb=human&ab=34')
  })

  it('preserves a decimal age through serialization and parsing', () => {
    const applicants = [facts('A', elf, 300.25), facts('B', human, 34.5)] as const
    const parsed = parseSharedConsultation(`?${createShareParams(applicants)}`)
    expect(parsed).toEqual({
      status: 'valid',
      consultation: {
        applicantA: { speciesId: 'elf', age: 300.25 },
        applicantB: { speciesId: 'human', age: 34.5 },
      },
    })
  })

  it('preserves a very large finite age through parsing', () => {
    const params = createShareParams([facts('A', human, Number.MAX_VALUE), facts('B', human, 34)])!
    const parsed = parseSharedConsultation(`?${params}`)
    expect(parsed.status === 'valid' && parsed.consultation.applicantA.age).toBe(Number.MAX_VALUE)
  })

  it('rejects an unknown built-in species safely', () => {
    expect(parseSharedConsultation('?sa=unknown&aa=300&sb=human&ab=34').status).toBe('invalid')
  })

  it('rejects a negative shared age safely', () => {
    expect(parseSharedConsultation('?sa=elf&aa=-1&sb=human&ab=34').status).toBe('invalid')
  })

  it.each(['Infinity', '-Infinity', 'NaN', '1e309'])('rejects non-finite age %s', (age) => {
    expect(parseSharedConsultation(`?sa=elf&aa=${age}&sb=human&ab=34`).status).toBe('invalid')
  })

  it('ignores arbitrary query strings without crashing', () => {
    expect(parseSharedConsultation('?campaign=autumn')).toEqual({ status: 'none' })
    expect(parseSharedConsultation('')).toEqual({ status: 'none' })
  })

  it('treats a partial share payload as invalid and unsuitable for auto-submit', () => {
    expect(parseSharedConsultation('?sa=elf&aa=300&sb=human')).toMatchObject({ status: 'invalid' })
  })

  it('restores canonical applicant input facts', () => {
    const parsed = parseSharedConsultation('?sa=elf&aa=300&sb=human&ab=34')
    if (parsed.status !== 'valid') throw new Error('Expected valid shared consultation')
    const [applicantA, applicantB] = resolveSharedApplicants(parsed.consultation)
    expect(applicantA).toMatchObject({ label: 'A', species: { id: 'elf' }, age: 300 })
    expect(applicantB).toMatchObject({ label: 'B', species: { id: 'human' }, age: 34 })
  })

  it('recreates the current maturity result from restored inputs', () => {
    const parsed = parseSharedConsultation('?sa=elf&aa=300&sb=human&ab=34')
    if (parsed.status !== 'valid') throw new Error('Expected valid shared consultation')
    expect(createApprovedConsultation(resolveSharedApplicants(parsed.consultation)).maturity.category).toBe('EXCELLENT')
  })

  it('recreates the current experience result from restored inputs', () => {
    const parsed = parseSharedConsultation('?sa=elf&aa=300&sb=human&ab=34')
    if (parsed.status !== 'valid') throw new Error('Expected valid shared consultation')
    const result = createApprovedConsultation(resolveSharedApplicants(parsed.consultation)).experience
    expect(result).toMatchObject({ category: 'HISTORICAL', adultExperienceGap: 184 })
  })

  it('recreates current longevity results from restored inputs', () => {
    const parsed = parseSharedConsultation('?sa=human&aa=10000&sb=elf&ab=300')
    if (parsed.status !== 'valid') throw new Error('Expected valid shared consultation')
    expect(createApprovedConsultation(resolveSharedApplicants(parsed.consultation)).longevity[0])
      .toMatchObject({ category: 'ANOMALOUS' })
  })

  it('generates a fresh case number instead of restoring one', () => {
    const parsed = parseSharedConsultation('?sa=elf&aa=300&sb=human&ab=34')
    if (parsed.status !== 'valid') throw new Error('Expected valid shared consultation')
    const applicants = resolveSharedApplicants(parsed.consultation)
    expect(createApprovedConsultation(applicants, { caseRandom: () => 0.1 }).caseNumber)
      .not.toBe(createApprovedConsultation(applicants, { caseRandom: () => 0.2 }).caseNumber)
  })

  it('excludes quips, case numbers, and derived values from the URL', () => {
    const result = consultation()
    const url = createShareUrl(result.applicants, { origin: 'https://example.test', pathname: '/tools/age' })!
    expect(url).not.toContain(result.caseNumber)
    expect(url).not.toContain(result.quips.maturity.id)
    expect(url).not.toContain('maturity')
    expect(url).not.toContain('experience')
    expect(url).not.toContain('longevity')
  })

  it('uses the supplied current origin and path rather than a production domain', () => {
    expect(createShareUrl(consultation().applicants, {
      origin: 'https://preview.example.test:8443',
      pathname: '/fantasy/checker/',
    })).toBe('https://preview.example.test:8443/fantasy/checker/?sa=elf&aa=300&sb=human&ab=34#checker')
  })

  it('keeps hash navigation independent from preserved share parameters', () => {
    const url = new URL('https://example.test/?sa=elf&aa=300&sb=human&ab=34#about')
    expect(getNavigationSection(url.hash)).toBe('about')
    url.hash = 'checker'
    expect(url.searchParams.get('sa')).toBe('elf')
    expect(getNavigationSection(url.hash)).toBe('checker')
  })
})

describe('shareable result text and custom species', () => {
  const highElf: CustomSpecies = {
    id: 'custom-1', name: 'High Elf', adulthoodAge: 120, typicalLifespan: 1000, source: 'custom',
  }

  it('does not create a permanent permalink for temporary species', () => {
    expect(createShareParams([facts('A', highElf, 400), facts('B', human, 34)])).toBeUndefined()
    expect(createShareUrl([facts('A', highElf, 400), facts('B', human, 34)], {
      origin: 'https://example.test', pathname: '/',
    })).toBeUndefined()
  })

  it('creates readable custom-species result text without internal IDs', () => {
    const text = createShareResultText(consultation(facts('A', highElf, 400), facts('B', human, 34)))
    expect(text).toContain('High Elf (Temporary Species), age 400')
    expect(text).not.toContain('custom-1')
  })

  it('includes current maturity and experience verdict labels', () => {
    const text = createShareResultText(consultation())
    expect(text).toContain('Maturity: Remarkably Well Matched')
    expect(text).toContain('Experience: Historical Documentary Territory')
  })

  it('includes non-normal longevity in copied text', () => {
    const text = createShareResultText(consultation(facts('A', human, 10000), facts('B', elf, 300)))
    expect(text).toContain('Longevity: Chronological Anomaly')
  })

  it('does not clutter copied text with NORMAL longevity', () => {
    expect(createShareResultText(consultation())).not.toContain('Within Typical Lifespan')
    expect(createShareResultText(consultation())).not.toContain('Longevity:')
  })
})

describe('browser capability fallbacks', () => {
  it('detects native Share availability without assuming it exists', () => {
    expect(hasNativeShare(undefined)).toBe(false)
    expect(hasNativeShare(async () => undefined)).toBe(true)
  })

  it('handles native Share success, cancellation, failure, and absence', async () => {
    await expect(shareNatively({ title: 'Test', text: 'Text' })).resolves.toBe('unavailable')
    await expect(shareNatively({ title: 'Test', text: 'Text' }, async () => undefined)).resolves.toBe('shared')
    await expect(shareNatively(
      { title: 'Test', text: 'Text' },
      async () => { throw new DOMException('Cancelled', 'AbortError') },
    )).resolves.toBe('cancelled')
    await expect(shareNatively(
      { title: 'Test', text: 'Text' },
      async () => { throw new Error('Failed') },
    )).resolves.toBe('failed')
  })

  it('handles clipboard success, failure, and absence without throwing', async () => {
    const successfulClipboard = { writeText: vi.fn(async () => undefined) }
    expect(await copyText('result', successfulClipboard)).toBe(true)
    expect(successfulClipboard.writeText).toHaveBeenCalledWith('result')
    expect(await copyText('result', { writeText: async () => { throw new Error('blocked') } })).toBe(false)
    expect(await copyText('result')).toBe(false)
  })

  it('allows under-adulthood shared inputs through parsing for the normal safeguard', () => {
    const parsed = parseSharedConsultation('?sa=human&aa=17&sb=elf&ab=300')
    expect(parsed.status).toBe('valid')
    if (parsed.status !== 'valid') return
    const applicants = resolveSharedApplicants(parsed.consultation)
    expect(isAdult(applicants[0].species, applicants[0].age)).toBe(false)
  })
})
