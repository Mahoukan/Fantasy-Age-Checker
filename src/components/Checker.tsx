import { useEffect, useMemo, useRef, useState, type FormEvent } from 'react'
import {
  species as builtInSpecies,
  type CustomSpecies,
  type Species,
} from '../data/species'
import type { Applicant, ApplicantLabel, ApplicantLifecycleFacts } from '../types/applicant'
import {
  calculateAdultExperience,
  calculateRelativeAge,
  findSpeciesById,
  isAdult,
  validateAge,
} from '../utils/lifecycle'
import {
  createApprovedConsultation,
  createConsultationScheduler,
  type ApprovedConsultation,
  type ConsultationScheduler,
} from '../utils/consultation'
import { removeCustomSpecies } from '../utils/customSpecies'
import { normalizeApplicantName } from '../utils/applicantName'
import {
  parseSharedConsultation,
  resolveSharedApplicants,
  type SharedConsultationParseResult,
} from '../utils/share'
import { ApplicantCard } from './ApplicantCard'
import { CustomSpeciesDialog } from './CustomSpeciesDialog'
import { ConsultationStatus } from './ConsultationStatus'
import { RejectionResult } from './RejectionResult'
import { ResultShell } from './ResultShell'
import { TemporarySpeciesManager } from './TemporarySpeciesManager'
import { DEFAULT_RESULT_IMAGE_THEME_ID, type ResultImageThemeId } from '../data/resultImageThemes'
import { ThemeOrnament } from './ThemeOrnament'
import type { BureauCaseLoadRequest } from '../data/bureauCases'
import { createBureauCaseLoadUpdate } from '../utils/bureauCases'
import { ReverseLookup } from './ReverseLookup'

const initialApplicantA: Applicant = { speciesId: 'elf', age: 300 }
const initialApplicantB: Applicant = { speciesId: 'human', age: 34 }

type AgeErrors = Partial<Record<ApplicantLabel, string>>
type ConsultationResult =
  | ApprovedConsultation
  | { status: 'rejected'; applicants: ApplicantLifecycleFacts[] }

function resolveApplicant(
  applicant: Applicant,
  label: ApplicantLabel,
  availableSpecies: readonly Species[],
): ApplicantLifecycleFacts | undefined {
  const speciesEntry = findSpeciesById(applicant.speciesId, availableSpecies)
  const ageResult = validateAge(applicant.age)
  const name = normalizeApplicantName(applicant.name)

  if (!speciesEntry || !ageResult.valid) return undefined

  return {
    label,
    ...(name ? { name } : {}),
    species: speciesEntry,
    age: ageResult.value,
    adultExperience: calculateAdultExperience(speciesEntry, ageResult.value),
    relativeAge: calculateRelativeAge(speciesEntry, ageResult.value),
  }
}

interface CheckerProps {
  siteThemeId?: ResultImageThemeId
  bureauCaseRequest?: BureauCaseLoadRequest
}

export function Checker({ siteThemeId = DEFAULT_RESULT_IMAGE_THEME_ID, bureauCaseRequest }: CheckerProps) {
  const [sharedRestore] = useState<SharedConsultationParseResult>(() => (
    typeof window === 'undefined'
      ? { status: 'none' }
      : parseSharedConsultation(window.location.search)
  ))
  const restoredInput = sharedRestore.status === 'valid'
    ? sharedRestore.consultation
    : undefined
  const [applicantA, setApplicantA] = useState<Applicant>(restoredInput?.applicantA ?? initialApplicantA)
  const [applicantB, setApplicantB] = useState<Applicant>(restoredInput?.applicantB ?? initialApplicantB)
  const [ageErrors, setAgeErrors] = useState<AgeErrors>({})
  const [result, setResult] = useState<ConsultationResult | null>(null)
  const [pendingConsultation, setPendingConsultation] = useState<ApprovedConsultation | null>(null)
  const [shareRestoreMessage, setShareRestoreMessage] = useState<string | null>(null)
  const [bureauCaseMessage, setBureauCaseMessage] = useState<string | null>(null)
  const [customSpecies, setCustomSpecies] = useState<CustomSpecies[]>([])
  const [isCustomSpeciesDialogOpen, setIsCustomSpeciesDialogOpen] = useState(false)
  const addCustomSpeciesButtonRef = useRef<HTMLButtonElement>(null)
  const hasRestoredSharedConsultationRef = useRef(false)
  const loadedBureauCaseRequestRef = useRef(0)
  const consultationSchedulerRef = useRef<ConsultationScheduler<ApprovedConsultation> | null>(null)
  if (consultationSchedulerRef.current === null) {
    consultationSchedulerRef.current = createConsultationScheduler<ApprovedConsultation>()
  }
  const isConsulting = pendingConsultation !== null
  const availableSpecies = useMemo(
    () => [...builtInSpecies, ...customSpecies],
    [customSpecies],
  )

  useEffect(() => () => consultationSchedulerRef.current?.cancel(), [])

  useEffect(() => {
    if (!bureauCaseRequest || bureauCaseRequest.id === loadedBureauCaseRequestRef.current) return
    loadedBureauCaseRequestRef.current = bureauCaseRequest.id
    const update = createBureauCaseLoadUpdate(bureauCaseRequest.caseData)
    consultationSchedulerRef.current?.cancel()
    setApplicantA(update.applicantA)
    setApplicantB(update.applicantB)
    setAgeErrors(update.ageErrors)
    setResult(update.result)
    setPendingConsultation(update.pendingConsultation)
    setShareRestoreMessage(null)
    setBureauCaseMessage(bureauCaseRequest.announcement)

    window.location.hash = 'checker'
    setTimeout(() => {
      document.getElementById('checker')?.scrollIntoView({ block: 'start' })
      document.getElementById('applicant-a-species')?.focus({ preventScroll: true })
    }, 0)
  }, [bureauCaseRequest])

  useEffect(() => {
    if (hasRestoredSharedConsultationRef.current) return
    let cancelled = false
    queueMicrotask(() => {
      if (cancelled || hasRestoredSharedConsultationRef.current) return
      hasRestoredSharedConsultationRef.current = true
      const restoration = sharedRestore
      if (restoration.status === 'invalid') {
        setShareRestoreMessage(restoration.message)
        return
      }
      if (restoration.status !== 'valid') return

      if (window.location.hash !== '#checker') {
        window.history.replaceState(null, '', `${window.location.pathname}${window.location.search}#checker`)
        window.dispatchEvent(new Event('hashchange'))
        document.getElementById('checker')?.scrollIntoView({ block: 'start' })
      }

      const resolvedApplicants = resolveSharedApplicants(restoration.consultation)
      const underageApplicants = resolvedApplicants.filter(
        (applicant) => !isAdult(applicant.species, applicant.age),
      )
      if (underageApplicants.length > 0) {
        setResult({ status: 'rejected', applicants: underageApplicants })
      } else {
        setResult(createApprovedConsultation(resolvedApplicants))
      }
      setShareRestoreMessage('Shared consultation restored using the Bureau\'s current records.')
    })
    return () => { cancelled = true }
  }, [sharedRestore])

  function updateApplicant(label: ApplicantLabel, applicant: Applicant) {
    if (isConsulting) return
    if (label === 'A') setApplicantA(applicant)
    else setApplicantB(applicant)

    setAgeErrors((current) => ({ ...current, [label]: undefined }))
    setResult(null)
    setShareRestoreMessage(null)
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setShareRestoreMessage(null)
    setBureauCaseMessage(null)

    const applicants = [
      { label: 'A' as const, applicant: applicantA },
      { label: 'B' as const, applicant: applicantB },
    ]
    const nextErrors: AgeErrors = {}

    applicants.forEach(({ label, applicant }) => {
      const validation = validateAge(applicant.age)
      if (!validation.valid) nextErrors[label] = validation.message
      if (!findSpeciesById(applicant.speciesId, availableSpecies)) {
        nextErrors[label] = 'Select a recognised species.'
      }
    })

    setAgeErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0) {
      consultationSchedulerRef.current?.cancel()
      setPendingConsultation(null)
      setResult(null)
      return
    }

    const resolvedApplicants = applicants
      .map(({ label, applicant }) => resolveApplicant(applicant, label, availableSpecies))
      .filter((applicant): applicant is ApplicantLifecycleFacts => applicant !== undefined)

    if (resolvedApplicants.length !== 2) {
      setResult(null)
      return
    }

    const underageApplicants = resolvedApplicants.filter(
      (applicant) => !isAdult(applicant.species, applicant.age),
    )

    if (underageApplicants.length > 0) {
      consultationSchedulerRef.current?.cancel()
      setPendingConsultation(null)
      setResult({ status: 'rejected', applicants: underageApplicants })
      return
    }

    const consultation = createApprovedConsultation(
      resolvedApplicants as [ApplicantLifecycleFacts, ApplicantLifecycleFacts],
    )
    setResult(null)
    setPendingConsultation(consultation)
    consultationSchedulerRef.current?.schedule(consultation, (completedConsultation) => {
      setPendingConsultation(null)
      setResult(completedConsultation)
    })
  }

  function handleRegisterCustomSpecies(speciesEntry: CustomSpecies) {
    if (isConsulting) return
    setCustomSpecies((current) => [...current, speciesEntry])
    setIsCustomSpeciesDialogOpen(false)
  }

  function handleCloseCustomSpeciesDialog() {
    setIsCustomSpeciesDialogOpen(false)
    setTimeout(() => addCustomSpeciesButtonRef.current?.focus(), 0)
  }

  function handleRemoveCustomSpecies(speciesEntry: CustomSpecies) {
    if (isConsulting) return
    const removal = removeCustomSpecies(
      customSpecies,
      speciesEntry.id,
      [applicantA.speciesId, applicantB.speciesId],
    )
    if (removal.removed) {
      setCustomSpecies(removal.species)
      setResult(null)
    }
  }

  function handleUseReverseLookupPair(nextApplicantA: Applicant, nextApplicantB: Applicant) {
    consultationSchedulerRef.current?.cancel()
    setApplicantA(nextApplicantA)
    setApplicantB(nextApplicantB)
    setAgeErrors({})
    setResult(null)
    setPendingConsultation(null)
    setShareRestoreMessage(null)
    setBureauCaseMessage('Equivalence pair loaded. Review both applicant records before consulting the Oracle.')

    window.location.hash = 'checker'
    setTimeout(() => {
      document.getElementById('checker')?.scrollIntoView({ block: 'start' })
      document.getElementById('applicant-a-species')?.focus({ preventScroll: true })
    }, 0)
  }

  return (
    <>
      <section className="checker-section" id="checker" aria-labelledby="checker-title">
      <ThemeOrnament location="checker" />
      <div className="checker-heading">
        <p className="eyebrow dark">Departmental form ARB-01</p>
        <h2 id="checker-title">Fantasy Age Compatibility Assessment</h2>
        <p>Submit two applicants for review by the Office of Chronological Compatibility.</p>
      </div>

      {shareRestoreMessage && (
        <p className="share-restore-notice" role="status">{shareRestoreMessage}</p>
      )}
      {bureauCaseMessage && (
        <p className="share-restore-notice">{bureauCaseMessage}</p>
      )}

      <div className="species-tools">
        <button
          className="secondary-action add-custom-species"
          type="button"
          ref={addCustomSpeciesButtonRef}
          disabled={isConsulting}
          onClick={() => setIsCustomSpeciesDialogOpen(true)}
        >
          + Add Custom Species
        </button>
        <small>Temporary registrations last only until this page is refreshed.</small>
      </div>

      <TemporarySpeciesManager
        customSpecies={customSpecies}
        inUseSpeciesIds={[applicantA.speciesId, applicantB.speciesId]}
        disabled={isConsulting}
        onRemove={handleRemoveCustomSpecies}
      />

      <form onSubmit={handleSubmit} noValidate aria-busy={isConsulting}>
        <div className="applicants-layout">
          <ApplicantCard
            applicant={applicantA}
            label="A"
            ageError={ageErrors.A}
            availableSpecies={availableSpecies}
            disabled={isConsulting}
            onChange={(applicant) => updateApplicant('A', applicant)}
          />

          <div className="applicant-separator" aria-hidden="true">
            <span>✦</span>
          </div>

          <ApplicantCard
            applicant={applicantB}
            label="B"
            ageError={ageErrors.B}
            availableSpecies={availableSpecies}
            disabled={isConsulting}
            onChange={(applicant) => updateApplicant('B', applicant)}
          />
        </div>

        <div className="submission-area">
          <button type="submit" disabled={isConsulting}>
            {isConsulting ? 'Consulting the Oracle...' : 'Consult the Oracle'}
          </button>
          <small id="consultation-lock-note">
            {isConsulting
              ? 'Applicant records are locked while the Bureau completes its review.'
              : 'No prophecy is legally binding without the appropriate countersignature.'}
          </small>
        </div>
      </form>

      {pendingConsultation && <ConsultationStatus message={pendingConsultation.loadingMessage} />}

      {result?.status === 'approved' && (
        <ResultShell
          key={result.caseNumber}
          applicants={result.applicants}
          maturity={result.maturity}
          experience={result.experience}
          longevity={result.longevity}
          presentation={result.presentation}
          quips={result.quips}
          caseNumber={result.caseNumber}
          initialImageThemeId={siteThemeId}
        />
      )}
      {result?.status === 'rejected' && <RejectionResult applicants={result.applicants} />}

        <CustomSpeciesDialog
          isOpen={isCustomSpeciesDialogOpen}
          availableSpecies={availableSpecies}
          onRegister={handleRegisterCustomSpecies}
          onClose={handleCloseCustomSpeciesDialog}
        />
      </section>
      <ReverseLookup
        availableSpecies={availableSpecies}
        onUsePair={handleUseReverseLookupPair}
      />
    </>
  )
}
