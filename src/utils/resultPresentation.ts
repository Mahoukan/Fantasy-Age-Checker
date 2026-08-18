import type { ApplicantLifecycleFacts, ApplicantLabel } from '../types/applicant'
import type { ExperienceGapResult } from './experience'
import type { ApplicantLongevityResult, LongevityCategory } from './longevity'
import type { MaturityCompatibilityResult } from './maturity'

export interface LongevityTheatre {
  applicant: ApplicantLabel
  level: Exclude<LongevityCategory, 'NORMAL'>
  headline: string
  proceduralLabel: string
  note: string
  stamp?: string
}

export interface RareBureauFinding {
  id: string
  priority: number
  title: string
  text: string
}

export interface ConsultationPresentation {
  longevityTheatre: readonly LongevityTheatre[]
  dualLongevityBanner?: string
  rareFindings: readonly RareBureauFinding[]
}

export interface ResultPresentationContext {
  applicants: readonly [ApplicantLifecycleFacts, ApplicantLifecycleFacts]
  maturity: MaturityCompatibilityResult
  experience: ExperienceGapResult
  longevity: readonly ApplicantLongevityResult[]
}

interface RareBureauFindingDefinition extends RareBureauFinding {
  conflictGroup?: string
  matches: (context: ResultPresentationContext) => boolean
}

export const EMPTY_CONSULTATION_PRESENTATION: ConsultationPresentation = {
  longevityTheatre: [],
  rareFindings: [],
}

export const longevityProceduralLabels = [
  'Birth Record Requires Secondary Verification',
  'Actuarial Tables No Longer Applicable',
  'Standard Lifecycle Form Insufficient',
  'Senior Archivist Requested',
  'Calendar Conversion Required',
  'Chronological Irregularity Logged',
  'Census Record Requires Review',
  'Additional Century Field Added',
  'Extended Lifespan Annex Attached',
  'Archive Shelf Reclassification Pending',
  'Standard Age Box Exceeded',
  'Historical Witnesses Unavailable',
  'Reference Lifespan Surpassed',
  'Long-Term Filing Cabinet Required',
  'Temporal Records Department Consulted',
  'Senior Census Ledger Requested',
  'Extended Calendar Schedule Opened',
  'Actuarial Exception Entered',
  'Long-Range Archive Index Consulted',
  'Lifecycle Reference Review Pending',
] as const

const longevityHeadlines: Record<Exclude<LongevityCategory, 'NORMAL'>, readonly string[]> = {
  EXCEPTIONAL: [
    'ACTUARIAL EXPECTATIONS EXCEEDED',
    'LONGEVITY IRREGULARITY NOTED',
    'STATISTICAL RANGE SURPASSED',
    'LIFESPAN REFERENCE EXCEEDED',
  ],
  ANCIENT: [
    'ARCHIVAL VERIFICATION ADVISED',
    'SENIOR RECORDS REVIEW REQUESTED',
    'CHRONOLOGICAL RECORD REQUIRES SECONDARY CHECK',
    'EXTENDED LIFESPAN FILING',
  ],
  LEGENDARY: [
    'SUSPECTED OF OVERLIVING',
    'OFFICE OF CHRONOLOGICAL IRREGULARITIES NOTIFIED',
    'STANDARD LIFESPAN TABLES NO LONGER APPLICABLE',
    'ARCHIVE STAFF HAVE QUESTIONS',
  ],
  ANOMALOUS: [
    'CHRONOLOGICAL ANOMALY CONFIRMED',
    'REFERRED TO THE OFFICE OF TEMPORAL IRREGULARITIES',
    'ACTUARIAL MODEL HAS LEFT THE BUILDING',
    'STANDARD CALENDAR PROCEDURES SUSPENDED',
    'ARCHIVIST SUPERVISION REQUIRED',
  ],
}

const longevityNotes: Record<Exclude<LongevityCategory, 'NORMAL'>, string> = {
  EXCEPTIONAL: 'The species’ typical lifespan has been exceeded. It remains a reference value, not a statutory limit.',
  ANCIENT: 'Standard actuarial tables are becoming increasingly unhelpful. Secondary archival review is advised.',
  LEGENDARY: 'No offence has been recorded. The Bureau merely wishes to understand how this happened.',
  ANOMALOUS: 'Ordinary lifecycle expectations have been exceeded by a degree not anticipated by the standard forms.',
}

const dualLongevityBanners = [
  'MULTIPLE LONGEVITY IRREGULARITIES DETECTED',
  'DOUBLE ARCHIVAL REVIEW',
  'TWO SENIOR FILES, ONE FORM',
  'STANDARD CASEWORK CAPACITY EXCEEDED',
] as const

function stableIndex(value: string, length: number): number {
  let hash = 2166136261
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index)
    hash = Math.imul(hash, 16777619)
  }
  return (hash >>> 0) % length
}

function nearlyEqual(first: number, second: number, epsilon = 1e-9): boolean {
  const scale = Math.max(1, Math.abs(first), Math.abs(second))
  return Math.abs(first - second) <= epsilon * scale
}

function longevityRank(category: LongevityCategory): number {
  return ['NORMAL', 'EXCEPTIONAL', 'ANCIENT', 'LEGENDARY', 'ANOMALOUS'].indexOf(category)
}

function hasLongevityAtLeast(context: ResultPresentationContext, category: LongevityCategory): boolean {
  const minimum = longevityRank(category)
  return context.longevity.every((entry) => longevityRank(entry.category) >= minimum)
}

function sameSpecies(context: ResultPresentationContext): boolean {
  return context.applicants[0].species.id === context.applicants[1].species.id
}

export function createLongevityTheatre(
  longevity: ApplicantLongevityResult,
  stableKey: string,
): LongevityTheatre | undefined {
  if (longevity.category === 'NORMAL') return undefined
  const level = longevity.category
  const headlines = longevityHeadlines[level]
  return {
    applicant: longevity.applicant,
    level,
    headline: headlines[stableIndex(`${stableKey}|headline|${longevity.applicant}|${level}`, headlines.length)],
    proceduralLabel: longevityProceduralLabels[
      stableIndex(`${stableKey}|procedure|${longevity.applicant}|${level}`, longevityProceduralLabels.length)
    ],
    note: longevityNotes[level],
    ...(level === 'LEGENDARY' ? { stamp: 'Chronological irregularity' } : {}),
    ...(level === 'ANOMALOUS' ? { stamp: 'Archivist supervision' } : {}),
  }
}

export const rareBureauFindingDefinitions: readonly RareBureauFindingDefinition[] = [
  {
    id: 'identical-adult-experience', priority: 70, conflictGroup: 'experience-equality',
    title: 'EXPERIENCE RECORDS IDENTICAL',
    text: 'The auditors requested that someone check the arithmetic. It is correct.',
    matches: ({ experience }) => experience.applicantAAdultExperience === experience.applicantBAdultExperience,
  },
  {
    id: 'same-species-same-age', priority: 85, conflictGroup: 'same-age',
    title: 'BUREAU WORKLOAD MINIMAL',
    text: 'The Bureau has found remarkably little to argue about.',
    matches: (context) => sameSpecies(context) && context.applicants[0].age === context.applicants[1].age,
  },
  {
    id: 'both-at-adulthood', priority: 95, conflictGroup: 'adult-milestone',
    title: 'NEWLY FILED ADULTS',
    text: 'Both applicants have arrived at recognised adulthood with impressive administrative timing.',
    matches: ({ applicants }) => applicants.every((entry) => entry.age === entry.species.adulthoodAge),
  },
  {
    id: 'both-at-typical-lifespan', priority: 115, conflictGroup: 'lifespan-target',
    title: 'ACTUARIAL PERFECTION',
    text: 'Both applicants arrived precisely where the statistical tables expected them. The Bureau distrusts this neatness.',
    matches: ({ applicants }) => applicants.every((entry) => entry.age === entry.species.typicalLifespan),
  },
  {
    id: 'same-age-different-maturity', priority: 110, conflictGroup: 'same-age',
    title: 'IDENTICAL NUMBERS, DIFFERENT PAPERWORK',
    text: 'Chronological equality has once again failed to simplify an inter-species filing.',
    matches: ({ applicants, maturity }) => applicants[0].age === applicants[1].age
      && maturity.relativeDifference >= 0.25,
  },
  {
    id: 'classic-inter-species-problem', priority: 105, conflictGroup: 'maturity-experience',
    title: 'THE CLASSIC INTER-SPECIES PROBLEM',
    text: 'Relative maturity is remarkably close. Lived experience has other ideas.',
    matches: ({ maturity, experience }) => maturity.category === 'EXCELLENT'
      && (experience.category === 'HISTORICAL' || experience.category === 'CIVILIZATIONS'),
  },
  {
    id: 'double-archival-incident', priority: 140, conflictGroup: 'dual-longevity',
    title: 'DOUBLE ARCHIVAL INCIDENT',
    text: 'Two applicants have independently exceeded the useful range of the Bureau’s actuarial tables.',
    matches: (context) => context.longevity.every((entry) => entry.category === 'ANOMALOUS'),
  },
  {
    id: 'both-legendary-or-worse', priority: 125, conflictGroup: 'dual-longevity',
    title: 'STANDARD ARCHIVE CAPACITY EXCEEDED',
    text: 'The filing cabinet was not designed for this much chronology.',
    matches: (context) => hasLongevityAtLeast(context, 'LEGENDARY'),
  },
  {
    id: 'four-digit-age', priority: 60, conflictGroup: 'age-digits',
    title: 'FOUR-DIGIT AGE DECLARATION',
    text: 'Additional space has been authorised on Form ARB-17.',
    matches: ({ applicants }) => applicants.some((entry) => entry.age >= 1000),
  },
  {
    id: 'five-digit-age', priority: 135, conflictGroup: 'age-digits',
    title: 'AGE FIELD EXTENSION AUTHORISED',
    text: 'The Bureau has reluctantly accepted that four digits were insufficient.',
    matches: ({ applicants }) => applicants.some((entry) => entry.age >= 10000),
  },
  {
    id: 'experience-predates-partner', priority: 75, conflictGroup: 'experience-context',
    title: 'EXPERIENCE PRE-DATES PARTNER',
    text: 'One applicant had already reached adulthood before the other applicant was born.',
    matches: ({ experience }) => experience.oneApplicantHasBeenAdultLongerThanTheOtherHasBeenAlive,
  },
  {
    id: 'experience-exceeds-lifecycle-reference', priority: 74, conflictGroup: 'experience-context',
    title: 'EXPERIENCE EXCEEDS LIFECYCLE REFERENCE',
    text: 'One applicant’s adult experience exceeds the other species’ entire typical lifespan.',
    matches: ({ experience }) => experience.oneApplicantAdultExperienceExceedsPartnerTypicalLifespan,
  },
  {
    id: 'chronological-draw', priority: 50, conflictGroup: 'same-age',
    title: 'CHRONOLOGICAL DRAW',
    text: 'At least one column of the form was easy to complete.',
    matches: ({ applicants }) => applicants[0].age === applicants[1].age,
  },
  {
    id: 'mathematical-alignment', priority: 68, conflictGroup: 'maturity-exact',
    title: 'MATHEMATICAL ALIGNMENT',
    text: 'The lifecycle calculations have produced an annoyingly perfect match.',
    matches: ({ maturity }) => nearlyEqual(maturity.applicantAEquivalentAge, maturity.applicantBEquivalentAge),
  },
  {
    id: 'century-gap', priority: 65, conflictGroup: 'exact-gap',
    title: 'CENTURY GAP RECORDED',
    text: 'The Bureau has added a second date column purely for emphasis.',
    matches: ({ experience }) => experience.chronologicalAgeGap === 100,
  },
  {
    id: 'millennial-difference', priority: 90, conflictGroup: 'exact-gap',
    title: 'MILLENNIAL DIFFERENCE',
    text: 'Several historical periods fit comfortably between the declared birth dates.',
    matches: ({ experience }) => experience.chronologicalAgeGap === 1000,
  },
  {
    id: 'second-lifespan-completed', priority: 93, conflictGroup: 'longevity-milestone',
    title: 'SECOND LIFESPAN COMPLETED',
    text: 'An applicant has consumed approximately two standard actuarial allocations.',
    matches: ({ longevity }) => longevity.some((entry) => nearlyEqual(entry.ratio, 2)),
  },
  {
    id: 'chronology-proves-unhelpful', priority: 100, conflictGroup: 'maturity-experience',
    title: 'CHRONOLOGY PROVES UNHELPFUL',
    text: 'The raw age difference is enormous. The lifecycle comparison is considerably less dramatic.',
    matches: ({ maturity, experience }) => experience.chronologicalAgeGap >= 500
      && (maturity.category === 'EXCELLENT' || maturity.category === 'GOOD'),
  },
  {
    id: 'same-species-different-centuries', priority: 80, conflictGroup: 'same-species-experience',
    title: 'SAME SPECIES, DIFFERENT CENTURIES',
    text: 'Shared lifecycle assumptions have done little to reduce the experience gap.',
    matches: (context) => sameSpecies(context)
      && ['FORMIDABLE', 'HISTORICAL', 'CIVILIZATIONS'].includes(context.experience.category),
  },
  {
    id: 'actuarial-tables-pleased', priority: 55, conflictGroup: 'lifespan-target',
    title: 'ACTUARIAL TABLES PLEASED',
    text: 'Both applicants have arrived unusually close to statistical expectations.',
    matches: ({ applicants }) => applicants.every((entry) => {
      const ratio = entry.age / entry.species.typicalLifespan
      return ratio >= 0.95 && ratio <= 1.05
    }),
  },
] as const

export function selectRareBureauFindings(
  context: ResultPresentationContext,
  maximum = 2,
): readonly RareBureauFinding[] {
  const selected: RareBureauFindingDefinition[] = []
  const usedGroups = new Set<string>()
  const matches = rareBureauFindingDefinitions
    .filter((definition) => definition.matches(context))
    .sort((first, second) => second.priority - first.priority)

  for (const definition of matches) {
    if (selected.length >= Math.max(0, maximum)) break
    if (definition.conflictGroup && usedGroups.has(definition.conflictGroup)) continue
    selected.push(definition)
    if (definition.conflictGroup) usedGroups.add(definition.conflictGroup)
  }

  return selected.map(({ id, priority, title, text }) => ({ id, priority, title, text }))
}

export function createConsultationPresentation(
  context: ResultPresentationContext,
  stableKey: string,
): ConsultationPresentation {
  const longevityTheatre = context.longevity
    .map((entry) => createLongevityTheatre(entry, stableKey))
    .filter((entry): entry is LongevityTheatre => entry !== undefined)
  return {
    longevityTheatre,
    ...(longevityTheatre.length > 1
      ? { dualLongevityBanner: dualLongevityBanners[stableIndex(`${stableKey}|dual-longevity`, dualLongevityBanners.length)] }
      : {}),
    rareFindings: selectRareBureauFindings(context),
  }
}
