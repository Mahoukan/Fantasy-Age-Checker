import type { FbiApplicantRecord } from './fbiApplicant'
import type { FbiComparisonResult } from './fbiComparison'

export type FbiChronologyCategory =
  | 'RECENT_RECORD'
  | 'CENTURY_SCALE'
  | 'DEEP_CENTURY'
  | 'MILLENNIAL'
  | 'DEEP_HISTORICAL'
  | 'PRIMORDIAL'

export interface FbiChronologyPresentation {
  category: FbiChronologyCategory
  categoryLabel: string
  basisLabel: string
  basisYears: number
  context: readonly string[]
}

export interface FbiFilingNote {
  id: string
  text: string
}

export interface FbiSpecialFinding {
  id: string
  label: string
  description: string
  priority: number
}

export interface FbiApprovedPresentation {
  caseNumber: string
  chronology: readonly [FbiChronologyPresentation, FbiChronologyPresentation]
  filingNote: FbiFilingNote
  specialFindings: readonly FbiSpecialFinding[]
  contradictionNote: string | null
}

export type FbiSubmittedReview =
  | { comparison: Extract<FbiComparisonResult, { status: 'INELIGIBLE' }>; presentation: null }
  | {
      comparison: Extract<FbiComparisonResult, { status: 'APPROVED_FOR_COMPARISON' }>
      presentation: FbiApprovedPresentation
    }

export type ApprovedFbiComparison = Extract<FbiComparisonResult, { status: 'APPROVED_FOR_COMPARISON' }>
export type FbiApplicantPair = readonly [FbiApplicantRecord, FbiApplicantRecord]
