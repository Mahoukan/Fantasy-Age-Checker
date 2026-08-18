import type { ApplicantLifecycleFacts } from '../types/applicant'
import type { ConsultationQuips, Quip } from '../types/quip'
import { normalizeApplicantName } from './applicantName'
import { generateCaseNumber } from './caseNumber'
import { getExperienceGap, type ExperienceGapResult } from './experience'
import { getMaturityCompatibility, type MaturityCompatibilityResult } from './maturity'
import { getLongevity, type ApplicantLongevityResult } from './longevity'
import {
  createQuipContext,
  getBrowserStorage,
  selectConsultationQuips,
  selectLoadingQuip,
  type StorageLike,
} from './quipSelector'

export const CONSULTATION_DELAY_MS = 900

export interface ApprovedConsultation {
  status: 'approved'
  applicants: ApplicantLifecycleFacts[]
  maturity: MaturityCompatibilityResult
  experience: ExperienceGapResult
  longevity: ApplicantLongevityResult[]
  quips: ConsultationQuips
  loadingMessage: Quip
  caseNumber: string
}

interface ConsultationOptions {
  random?: () => number
  caseRandom?: () => number
  storage?: StorageLike
}

export function createApprovedConsultation(
  applicants: readonly [ApplicantLifecycleFacts, ApplicantLifecycleFacts],
  options: ConsultationOptions = {},
): ApprovedConsultation {
  const submittedApplicants = applicants.map((applicant) => {
    const name = normalizeApplicantName(applicant.name)
    const submittedApplicant = { ...applicant }
    if (name) submittedApplicant.name = name
    else delete submittedApplicant.name
    return submittedApplicant
  }) as [ApplicantLifecycleFacts, ApplicantLifecycleFacts]
  const [applicantA, applicantB] = submittedApplicants
  const maturity = getMaturityCompatibility(
    applicantA.age,
    applicantA.species,
    applicantB.age,
    applicantB.species,
  )
  const experience = getExperienceGap(
    applicantA.age,
    applicantA.species,
    applicantB.age,
    applicantB.species,
  )
  const longevity = submittedApplicants.map((applicant): ApplicantLongevityResult => ({
    applicant: applicant.label,
    ...getLongevity(applicant.age, applicant.species.typicalLifespan),
  }))
  const context = createQuipContext(submittedApplicants, maturity, experience, longevity)
  const storage = options.storage ?? getBrowserStorage()
  const selectionOptions = { random: options.random, storage }

  return {
    status: 'approved',
    applicants: submittedApplicants,
    maturity,
    experience,
    longevity,
    quips: selectConsultationQuips(context, selectionOptions),
    loadingMessage: selectLoadingQuip(context, selectionOptions),
    caseNumber: generateCaseNumber(applicantA.species, applicantB.species, options.caseRandom),
  }
}

type TimerHandle = ReturnType<typeof setTimeout>
type SetTimer = (callback: () => void, delay: number) => TimerHandle
type ClearTimer = (handle: TimerHandle) => void

export interface ConsultationScheduler<T> {
  schedule(value: T, onComplete: (value: T) => void, delay?: number): void
  cancel(): void
}

export function createConsultationScheduler<T>(
  setTimer: SetTimer = setTimeout,
  clearTimer: ClearTimer = clearTimeout,
): ConsultationScheduler<T> {
  let generation = 0
  let timer: TimerHandle | undefined

  return {
    schedule(value, onComplete, delay = CONSULTATION_DELAY_MS) {
      generation += 1
      const scheduledGeneration = generation
      if (timer !== undefined) clearTimer(timer)
      timer = setTimer(() => {
        if (scheduledGeneration === generation) onComplete(value)
        timer = undefined
      }, delay)
    },
    cancel() {
      generation += 1
      if (timer !== undefined) clearTimer(timer)
      timer = undefined
    },
  }
}
