import type { SpeciesId } from './species'

export interface BureauCaseApplicant {
  speciesId: SpeciesId
  age: number
}

export interface BureauCaseInput {
  applicantA: BureauCaseApplicant
  applicantB: BureauCaseApplicant
}

export type BureauCaseProfile =
  | 'routine'
  | 'cross-species'
  | 'experience-gap'
  | 'borderline'
  | 'longevity'
  | 'extraordinary'

export interface GeneratedBureauCase extends BureauCaseInput {
  profile: BureauCaseProfile
}

export interface BureauCaseLoadRequest {
  id: number
  caseData: BureauCaseInput
  announcement: string
}

export interface CuratedBureauCase extends BureauCaseInput {
  id: string
  title: string
  description: string
  category: string
}

export const bureauCaseProfileNames: Record<BureauCaseProfile, string> = {
  routine: 'Routine Filing',
  'cross-species': 'Cross-Species Comparison',
  'experience-gap': 'Experience Gap',
  borderline: 'Borderline Review',
  longevity: 'Longevity Review',
  extraordinary: 'Extraordinary Filing',
}

export const curatedBureauCases = [
  {
    id: 'classic-elf-problem',
    title: 'The Classic Elf Problem',
    description: 'Almost identical lifecycle positions. Almost two centuries of difference in adult experience.',
    category: 'Maturity vs Experience',
    applicantA: { speciesId: 'elf', age: 300 },
    applicantB: { speciesId: 'human', age: 34 },
  },
  {
    id: 'identical-number-different-meaning',
    title: 'Identical Number, Different Meaning',
    description: 'The same chronological age occupies radically different places in two species records.',
    category: 'Cross-Species Comparison',
    applicantA: { speciesId: 'elf', age: 100 },
    applicantB: { speciesId: 'goblin', age: 100 },
  },
  {
    id: 'dwarven-misunderstanding',
    title: 'The Dwarven Misunderstanding',
    description: 'Matching lifecycle maturity does not make eighty years of Dwarven adulthood disappear.',
    category: 'Maturity vs Experience',
    applicantA: { speciesId: 'dwarf', age: 120 },
    applicantB: { speciesId: 'human', age: 34 },
  },
  {
    id: 'short-lived-filing',
    title: 'The Short-Lived Filing',
    description: 'Comparable lifecycle positions, filed on profoundly different calendar schedules.',
    category: 'Cross-Species Comparison',
    applicantA: { speciesId: 'goblin', age: 42 },
    applicantB: { speciesId: 'elf', age: 525 },
  },
  {
    id: 'archive-has-questions',
    title: 'The Archive Has Questions',
    description: 'Both dates exceed ordinary archival capacity. The calculation remains regrettably finite.',
    category: 'Longevity',
    applicantA: { speciesId: 'human', age: 10000 },
    applicantB: { speciesId: 'sphinx', age: 4000 },
  },
  {
    id: 'bureaucratically-unremarkable',
    title: 'Bureaucratically Unremarkable',
    description: 'Two Humans of similar age. The Bureau briefly locates the easy-paperwork tray.',
    category: 'Same-Species',
    applicantA: { speciesId: 'human', age: 32 },
    applicantB: { speciesId: 'human', age: 35 },
  },
  {
    id: 'borderline-filing',
    title: 'Borderline Filing',
    description: 'Mutually accepted by the current maturity ranges, though only just comfortably enough.',
    category: 'Borderline',
    applicantA: { speciesId: 'human', age: 30 },
    applicantB: { speciesId: 'human', age: 42 },
  },
  {
    id: 'documentary-territory',
    title: 'Documentary Territory',
    description: 'Similar relative maturity accompanied by several human careers of adult-experience difference.',
    category: 'Maturity vs Experience',
    applicantA: { speciesId: 'dragon', age: 600 },
    applicantB: { speciesId: 'human', age: 34 },
  },
  {
    id: 'long-lived-peers',
    title: 'Long-Lived Peers',
    description: 'Large raw ages, closely aligned lifecycle positions, and a substantial filing history.',
    category: 'Chronological Oddity',
    applicantA: { speciesId: 'dragon', age: 600 },
    applicantB: { speciesId: 'djinn', age: 400 },
  },
  {
    id: 'unexpectedly-compatible',
    title: 'Unexpectedly Compatible',
    description: 'A century and several inches of filing cabinet separate two equivalent lifecycle positions.',
    category: 'Cross-Species Comparison',
    applicantA: { speciesId: 'dwarf', age: 120 },
    applicantB: { speciesId: 'kobold', age: 24 },
  },
] as const satisfies readonly CuratedBureauCase[]

export type CuratedBureauCaseId = (typeof curatedBureauCases)[number]['id']
