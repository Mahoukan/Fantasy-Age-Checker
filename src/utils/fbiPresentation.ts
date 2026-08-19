import { fbiFilingNotes } from '../data/fbiFilingNotes'
import { getSpeciesCaseCode } from './caseNumber'
import { formatYears } from './format'
import type { FbiApplicantRecord } from '../types/fbiApplicant'
import type {
  ApprovedFbiComparison,
  FbiApprovedPresentation,
  FbiApplicantPair,
  FbiChronologyCategory,
  FbiChronologyPresentation,
  FbiSpecialFinding,
  FbiSubmittedReview,
} from '../types/fbiPresentation'
import type { FbiComparisonResult } from '../types/fbiComparison'

const IMMORTAL_CASE_CODES: Readonly<Record<string, string>> = {
  vampire: 'VAM',
  lich: 'LIC',
  'ageless-cursed-immortal': 'AGE',
  'ascended-immortal': 'ASC',
  angel: 'ANG',
  demon: 'DEM',
  'god-divine-being': 'GOD',
  primordial: 'PRI',
  'manifested-being': 'MAN',
  'reincarnating-being': 'REI',
  'possessing-spirit': 'POS',
  'custom-immortal': 'CUS',
}

const CHRONOLOGY_LABELS: Readonly<Record<FbiChronologyCategory, string>> = {
  RECENT_RECORD: 'Recent record',
  CENTURY_SCALE: 'Century-scale record',
  DEEP_CENTURY: 'Deep-century record',
  MILLENNIAL: 'Millennial record',
  DEEP_HISTORICAL: 'Deep historical record',
  PRIMORDIAL: 'Primordial record',
}

export function classifyFbiChronology(years: number): FbiChronologyCategory {
  if (years < 100) return 'RECENT_RECORD'
  if (years < 500) return 'CENTURY_SCALE'
  if (years < 1_000) return 'DEEP_CENTURY'
  if (years < 10_000) return 'MILLENNIAL'
  if (years < 100_000) return 'DEEP_HISTORICAL'
  return 'PRIMORDIAL'
}

function stableHash(value: string): number {
  let hash = 2166136261
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index)
    hash = Math.imul(hash, 16777619)
  }
  return hash >>> 0
}

function caseCode(applicant: FbiApplicantRecord): string {
  if (applicant.mode === 'MORTAL') return getSpeciesCaseCode(applicant.record.species)
  return IMMORTAL_CASE_CODES[applicant.record.presetId] ?? 'CUS'
}

function stableFacts(comparison: ApprovedFbiComparison, applicants: FbiApplicantPair): string {
  return JSON.stringify({
    applicants: applicants.map((applicant) => ({ mode: applicant.mode, classification: applicant.classification, record: applicant.record })),
    maturity: comparison.maturity,
    experience: comparison.experience,
    chronology: comparison.chronology,
  })
}

function chronology(record: FbiApplicantRecord): FbiChronologyPresentation {
  const facts = record.record
  let basisLabel: string
  let basisYears: number
  let context: readonly string[]

  switch (facts.family) {
    case 'MORTAL':
      basisLabel = 'Current chronological age'
      basisYears = facts.age
      context = [`Current age: ${formatYears(facts.age)} years`, `Species record: ${facts.species.name}`]
      break
    case 'ACQUIRED':
      basisLabel = 'Current chronological age'
      basisYears = facts.currentAge
      context = [
        `Current age: ${formatYears(facts.currentAge)} years`,
        `Origin species: ${facts.originSpecies.name}`,
        `Transformed ${formatYears(facts.yearsSinceTransformation)} years ago at age ${formatYears(facts.ageAtTransformation)}`,
        facts.maturationMode === 'FROZEN' ? 'Maturity frozen at transformation' : 'Continuing immortal maturation',
      ]
      break
    case 'NATURALLY_IMMORTAL':
      basisLabel = 'Current chronological age'
      basisYears = facts.currentAge
      context = [
        `Current age: ${formatYears(facts.currentAge)} years`,
        `Natural immortal lifecycle; recognised adulthood at ${formatYears(facts.recognisedAdulthoodAge)} years`,
        `Maturation half-life: ${formatYears(facts.maturationHalfLife)} years`,
      ]
      break
    case 'MANIFESTED':
      basisLabel = 'Years since manifestation'
      basisYears = facts.yearsSinceManifestation
      context = [`Manifested existence: ${formatYears(facts.yearsSinceManifestation)} years`, 'Created mature at initial human-equivalent maturity 25']
      break
    case 'TRANSFERRED_CYCLICAL':
      if (facts.subtype === 'REINCARNATING') {
        basisLabel = facts.memoriesRetained ? 'Remembered adult experience' : 'Current-form age'
        basisYears = facts.memoriesRetained ? facts.adultExperience : facts.currentFormAge
        context = [
          `Current form: ${facts.currentFormSpecies.name}, ${formatYears(facts.currentFormAge)} years`,
          facts.memoriesRetained
            ? `Remembered adult experience: ${formatYears(facts.adultExperience)} years; not represented as total existence`
            : 'No remembered previous-life experience included',
          'Current-form maturity independently governs adult eligibility',
        ]
      } else {
        basisLabel = 'Remembered consciousness experience'
        basisYears = facts.rememberedConsciousExperience
        context = [
          `Current host: ${facts.currentFormSpecies.name}, ${formatYears(facts.currentFormAge)} years`,
          `Remembered consciousness experience: ${formatYears(facts.rememberedConsciousExperience)} years; host age remains separate`,
          'Current-host maturity independently governs adult eligibility',
        ]
      }
      break
  }

  const category = classifyFbiChronology(basisYears)
  return { category, categoryLabel: CHRONOLOGY_LABELS[category], basisLabel, basisYears, context }
}

interface FindingCandidate extends FbiSpecialFinding {
  applies: boolean
}

function selectFindings(comparison: ApprovedFbiComparison, applicants: FbiApplicantPair, chronologyRecords: readonly FbiChronologyPresentation[]): readonly FbiSpecialFinding[] {
  const records = applicants.map((applicant) => applicant.record)
  const candidates: readonly FindingCandidate[] = [
    { id: 'near-ceiling', label: 'Near-asymptotic maturity', description: 'At least one effective maturity is recorded at 99 or above on the fixed Bureau scale.', priority: 100, applies: comparison.applicants.some((applicant) => applicant.effectiveMaturity >= 99) },
    { id: 'civilisations', label: 'Experience spans civilisations', description: 'The adult-experience gap exceeds the existing five-century threshold.', priority: 90, applies: comparison.experience.category === 'CIVILIZATIONS' },
    { id: 'ancient-memory-current-body', label: 'Ancient memory, current body', description: 'A transferred record carries at least a millennium of remembered experience while retaining separate current-body facts.', priority: 85, applies: records.some((record) => record.family === 'TRANSFERRED_CYCLICAL' && record.adultExperience >= 1_000) },
    { id: 'frozen-centuries', label: 'Frozen maturity across centuries', description: 'An acquired immortal has retained transformation maturity for at least one hundred years.', priority: 80, applies: records.some((record) => record.family === 'ACQUIRED' && record.maturationMode === 'FROZEN' && record.yearsSinceTransformation >= 100) },
    { id: 'mortal-immortal', label: 'Cross-jurisdiction lifecycle record', description: 'The filing compares one finite mortal record with one immortal lifecycle record.', priority: 75, applies: applicants[0].mode !== applicants[1].mode },
    { id: 'dual-immortal', label: 'Dual immortal jurisdiction', description: 'Both applicants are filed under recognised immortal lifecycle families.', priority: 70, applies: applicants.every((applicant) => applicant.mode === 'IMMORTAL') },
    { id: 'equal-maturity', label: 'Identical effective maturity', description: 'The submitted records resolve to effectively equal maturity on the shared scale.', priority: 65, applies: Math.abs(comparison.applicants[0].effectiveMaturity - comparison.applicants[1].effectiveMaturity) <= 1e-9 },
    { id: 'new-manifestation', label: 'Recent manifestation', description: 'A created-mature manifestation is within its first five elapsed years.', priority: 60, applies: records.some((record) => record.family === 'MANIFESTED' && record.yearsSinceManifestation <= 5) },
    { id: 'continuing-ascension', label: 'Continuing ascension record', description: 'An ascended immortal remains below the asymptotic maturity ceiling.', priority: 55, applies: records.some((record) => record.family === 'ACQUIRED' && record.presetId === 'ascended-immortal' && record.effectiveMaturity !== null && record.effectiveMaturity < 99) },
    { id: 'millennial-scale', label: 'Millennial file scale', description: 'At least one chronology context is classified at millennial scale or beyond.', priority: 50, applies: chronologyRecords.some((entry) => ['MILLENNIAL', 'DEEP_HISTORICAL', 'PRIMORDIAL'].includes(entry.category)) },
  ]

  return candidates.filter((candidate) => candidate.applies).sort((a, b) => b.priority - a.priority).slice(0, 2)
    .map((candidate) => ({
      id: candidate.id,
      label: candidate.label,
      description: candidate.description,
      priority: candidate.priority,
    }))
}

export function createFbiApprovedPresentation(comparison: ApprovedFbiComparison, applicants: FbiApplicantPair): FbiApprovedPresentation {
  const facts = stableFacts(comparison, applicants)
  const hash = stableHash(facts)
  const chronologyRecords = applicants.map(chronology) as [FbiChronologyPresentation, FbiChronologyPresentation]
  const serial = (hash % 1_000_000).toString().padStart(6, '0')
  const contradictionNote = ['EXCELLENT', 'GOOD'].includes(comparison.maturity.category)
    && ['HISTORICAL', 'CIVILIZATIONS'].includes(comparison.experience.category)
    ? 'Maturity alignment is close while lived adult experience differs substantially; both findings remain independently valid.'
    : null

  return {
    caseNumber: `FBI-${caseCode(applicants[0])}-${caseCode(applicants[1])}-${serial}`,
    chronology: chronologyRecords,
    filingNote: fbiFilingNotes[hash % fbiFilingNotes.length],
    specialFindings: selectFindings(comparison, applicants, chronologyRecords),
    contradictionNote,
  }
}

export function createFbiSubmittedReview(comparison: FbiComparisonResult, applicants: FbiApplicantPair): FbiSubmittedReview {
  if (comparison.status === 'INELIGIBLE') return { comparison, presentation: null }
  return { comparison, presentation: createFbiApprovedPresentation(comparison, applicants) }
}
