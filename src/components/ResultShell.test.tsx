import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { species, type CustomSpecies, type Species } from '../data/species'
import type { ApplicantLabel, ApplicantLifecycleFacts } from '../types/applicant'
import { createApprovedConsultation } from '../utils/consultation'
import { calculateAdultExperience, calculateRelativeAge } from '../utils/lifecycle'
import { ResultShell } from './ResultShell'

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

function renderResult(applicantA: ApplicantLifecycleFacts, applicantB: ApplicantLifecycleFacts) {
  const record = createApprovedConsultation([applicantA, applicantB], {
    random: () => 0,
    caseRandom: () => 0,
  })
  return renderToStaticMarkup(<ResultShell {...record} />)
}

describe('longevity result presentation', () => {
  it('keeps normal longevity visually quiet without adding a notice', () => {
    const markup = renderResult(facts('A', elf, 300), facts('B', human, 34))
    expect(markup).not.toContain('longevity-notice')
    expect(markup).toContain('Maturity Compatibility')
    expect(markup).toContain('Experience Gap')
    expect(markup).toContain('Share This Ruling')
    expect(markup).toContain('Copy Result')
    expect(markup).toContain('Copy Link')
    expect(markup).not.toContain('Temporary species cannot be included in permanent share links')
  })

  it('renders factual exceptional longevity context for Elf 900', () => {
    const markup = renderResult(facts('A', elf, 900), facts('B', human, 34))
    expect(markup).toContain('Exceptionally Old')
    expect(markup).toContain('Applicant A has exceeded the typical lifespan')
    expect(markup).toContain('900 years')
    expect(markup).toContain('750 years')
    expect(markup).toContain('120.0%')
  })

  it('presents a chronological anomaly as context rather than an error', () => {
    const markup = renderResult(facts('A', human, 10000), facts('B', elf, 300))
    expect(markup).toContain('Chronological Anomaly')
    expect(markup).toContain('11,904.8%')
    expect(markup).not.toContain('APPLICATION REJECTED')
    expect(markup).toContain('Official verdict')
  })

  it('renders custom species longevity with the registered display name', () => {
    const starborn: CustomSpecies = {
      id: 'custom-1', name: 'Starborn', adulthoodAge: 30, typicalLifespan: 200, source: 'custom',
    }
    const markup = renderResult(facts('A', starborn, 450), facts('B', human, 34))
    expect(markup).toContain('Starborn')
    expect(markup).toContain('Temporary Species')
    expect(markup).toContain('Legendary Longevity')
    expect(markup).toContain('225.0%')
    expect(markup).toContain('Temporary species cannot be included in permanent share links')
    expect(markup).toMatch(/<button type="button" disabled=""[^>]*>Copy Link<\/button>/)
  })
})
