import type { Species, SpeciesReferenceId } from '../data/species'

export type ApplicantLabel = 'A' | 'B'

export interface Applicant {
  name?: string
  speciesId: SpeciesReferenceId
  age: number | ''
}

export interface ApplicantLifecycleFacts {
  label: ApplicantLabel
  name?: string
  species: Species
  age: number
  adultExperience: number
  relativeAge: number
}
