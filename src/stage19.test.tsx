import { describe, expect, it } from 'vitest'
import { species, type Species } from './data/species'
import type { ApplicantLabel, ApplicantLifecycleFacts } from './types/applicant'
import { generateCaseNumber } from './utils/caseNumber'
import { createApprovedConsultation } from './utils/consultation'
import { getExperienceGap } from './utils/experience'
import { calculateAdultExperience, calculateRelativeAge } from './utils/lifecycle'
import { getLongevity, type ApplicantLongevityResult } from './utils/longevity'
import { getMaturityCompatibility } from './utils/maturity'
import {
  buildResultImageModel,
  createResultCardSvg,
} from './utils/resultImage'
import {
  createLongevityTheatre,
  longevityProceduralLabels,
  rareBureauFindingDefinitions,
} from './utils/resultPresentation'
import { createShareResultText } from './utils/share'

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

function consultation(first: ApplicantLifecycleFacts, second: ApplicantLifecycleFacts) {
  return createApprovedConsultation([first, second], {
    random: () => 0,
    caseRandom: () => 0.123456,
  })
}

describe('Stage 19 longevity theatre and rare Bureau findings', () => {
  it('maps every longevity level deterministically across the fixed presentation pools', () => {
    expect(longevityProceduralLabels).toHaveLength(20)
    expect(new Set(longevityProceduralLabels)).toHaveLength(20)
    expect(rareBureauFindingDefinitions).toHaveLength(20)

    const categories = [1, 1.1, 1.5, 3, 6].map((ratio) => {
      const result: ApplicantLongevityResult = {
        applicant: 'A',
        ...getLongevity(human.typicalLifespan * ratio, human.typicalLifespan),
      }
      const first = createLongevityTheatre(result, 'ARB-HUM-ELF-123456')
      const second = createLongevityTheatre(result, 'ARB-HUM-ELF-123456')
      expect(second).toEqual(first)
      return [result.category, first?.level]
    })

    expect(categories).toEqual([
      ['NORMAL', undefined],
      ['EXCEPTIONAL', 'EXCEPTIONAL'],
      ['ANCIENT', 'ANCIENT'],
      ['LEGENDARY', 'LEGENDARY'],
      ['ANOMALOUS', 'ANOMALOUS'],
    ])
  })

  it('applies finding priority, suppression, determinism, and the two-finding maximum', () => {
    const extreme = consultation(facts('A', human, 10_000), facts('B', sphinx, 4_000))
    const repeated = consultation(facts('A', human, 10_000), facts('B', sphinx, 4_000))
    const extremeIds = extreme.presentation.rareFindings.map(({ id }) => id)

    expect(extremeIds).toEqual(['double-archival-incident', 'five-digit-age'])
    expect(extremeIds).not.toContain('four-digit-age')
    expect(extreme.presentation).toEqual(repeated.presentation)
    expect(extreme.presentation.rareFindings).toHaveLength(2)

    const exactLifespans = consultation(
      facts('A', human, human.typicalLifespan),
      facts('B', elf, elf.typicalLifespan),
    )
    const exactIds = exactLifespans.presentation.rareFindings.map(({ id }) => id)
    expect(exactIds).toContain('both-at-typical-lifespan')
    expect(exactIds).not.toContain('actuarial-tables-pleased')
  })

  it('uses the submitted presentation in each image format while copy-result text stays unchanged', () => {
    const first = facts('A', human, 10_000)
    const second = facts('B', sphinx, 4_000)
    const submitted = consultation(first, second)
    const legacyResult = {
      applicants: submitted.applicants,
      maturity: submitted.maturity,
      experience: submitted.experience,
      longevity: submitted.longevity,
      quips: submitted.quips,
      caseNumber: submitted.caseNumber,
    }
    const model = buildResultImageModel(submitted)
    const compact = createResultCardSvg(model, { formatId: 'compact' })
    const standard = createResultCardSvg(model, { formatId: 'standard' })
    const full = createResultCardSvg(model, { formatId: 'full-dossier' })

    expect(submitted.applicants).toEqual([first, second])
    expect(submitted.maturity).toEqual(getMaturityCompatibility(first.age, human, second.age, sphinx))
    expect(submitted.experience).toEqual(getExperienceGap(first.age, human, second.age, sphinx))
    expect(submitted.longevity).toEqual([
      { applicant: 'A', ...getLongevity(first.age, human.typicalLifespan) },
      { applicant: 'B', ...getLongevity(second.age, sphinx.typicalLifespan) },
    ])
    expect(submitted.caseNumber).toBe(generateCaseNumber(human, sphinx, () => 0.123456))
    expect(createShareResultText(submitted)).toBe(createShareResultText(legacyResult))
    expect(compact).toContain('width="1080" height="1080"')
    expect(compact).not.toContain('Special Bureau Finding')
    expect(compact).toContain(model.longevity[0].theatreHeadline)
    expect(standard).toContain('width="1080" height="1350"')
    expect(standard).toContain(model.rareFindings[0].title)
    expect(standard).not.toContain(model.rareFindings[1].title)
    expect(full).toContain('width="1080" height="1920"')
    expect(full).toContain(model.rareFindings[0].title)
    expect(full).toContain(model.rareFindings[1].title)
  })
})
