import { species, type Species } from '../data/species'
import { experienceVerdicts, maturityVerdicts } from '../data/verdicts'
import { getExperienceGap } from './experience'
import { getMaturityCompatibility } from './maturity'

export interface SpeciesGuideRecord {
  species: Species
  speciesSeven: number
  speciesFourteen: number
}

export function getSpeciesMaturityConstants(typicalLifespan: number) {
  return {
    speciesSeven: typicalLifespan / 12,
    speciesFourteen: typicalLifespan / 6,
  }
}

export function getBuiltInSpeciesGuideRecords(): SpeciesGuideRecord[] {
  return species
    .filter((entry) => entry.source === 'builtin')
    .map((entry) => ({
      species: entry,
      ...getSpeciesMaturityConstants(entry.typicalLifespan),
    }))
}

export function getWorkedExample() {
  const elf = species.find((entry) => entry.id === 'elf')!
  const human = species.find((entry) => entry.id === 'human')!
  const maturity = getMaturityCompatibility(300, elf, 34, human)
  const experience = getExperienceGap(300, elf, 34, human)

  return {
    elf,
    human,
    maturity,
    experience,
    maturityLabel: maturityVerdicts[maturity.category].label,
    experienceLabel: experienceVerdicts[experience.category].label,
  }
}
