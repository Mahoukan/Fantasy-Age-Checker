import { useMemo, useRef, useState } from 'react'
import {
  bureauCaseProfileNames,
  curatedBureauCases,
  type BureauCaseInput,
} from '../data/bureauCases'
import { species } from '../data/species'
import {
  generateRandomBureauCase,
  getDailyBureauCases,
  getLocalDateKey,
} from '../utils/bureauCases'
import { formatYears } from '../utils/format'
import { ThemeOrnament } from './ThemeOrnament'

interface BureauCasesProps {
  onLoadCase: (caseData: BureauCaseInput, announcement: string) => void
  today?: Date
}

function applicantText(applicant: BureauCaseInput['applicantA']): string {
  const entry = species.find((candidate) => candidate.id === applicant.speciesId)
  return `${entry?.name ?? applicant.speciesId}, ${formatYears(applicant.age)}`
}

function caseSignature(caseData: BureauCaseInput): string {
  return `${caseData.applicantA.speciesId}:${caseData.applicantA.age}|${caseData.applicantB.speciesId}:${caseData.applicantB.age}`
}

function ApplicantPair({ caseData }: { caseData: BureauCaseInput }) {
  return (
    <dl className="bureau-case-applicants">
      <div><dt>Applicant A</dt><dd>{applicantText(caseData.applicantA)}</dd></div>
      <div><dt>Applicant B</dt><dd>{applicantText(caseData.applicantB)}</dd></div>
    </dl>
  )
}

export function BureauCases({ onLoadCase, today = new Date() }: BureauCasesProps) {
  const dailyCases = useMemo(() => getDailyBureauCases(today), [today])
  const [assignmentStatus, setAssignmentStatus] = useState('')
  const previousRandomSignature = useRef<string | null>(null)

  function loadCase(caseData: BureauCaseInput, announcement: string) {
    setAssignmentStatus(announcement)
    onLoadCase(caseData, announcement)
  }

  function assignRandomCase() {
    let assigned = generateRandomBureauCase()
    for (let attempt = 0; attempt < 3 && caseSignature(assigned) === previousRandomSignature.current; attempt += 1) {
      assigned = generateRandomBureauCase()
    }
    previousRandomSignature.current = caseSignature(assigned)
    const classification = bureauCaseProfileNames[assigned.profile]
    loadCase(assigned, `Bureau classification: ${classification}. Applicant records loaded; consultation not yet submitted.`)
  }

  return (
    <section className="information-section bureau-cases-section" id="bureau-cases" aria-labelledby="bureau-cases-title">
      <ThemeOrnament location="information" />
      <header className="information-header">
        <p className="eyebrow dark">Case Assignment and Archive Desk</p>
        <h2 id="bureau-cases-title">Bureau Cases</h2>
        <p>Browse current files or request an assignment. Every selection populates the existing Checker for review and editing before consultation.</p>
      </header>

      <section className="bureau-case-subsection random-case-panel" aria-labelledby="assign-case-title">
        <div>
          <p className="record-reference">Unallocated docket</p>
          <h3 id="assign-case-title">Assign Me a Case</h3>
          <p>The Bureau will select two applicants requiring immediate chronological review.</p>
        </div>
        <button type="button" className="bureau-case-primary-action" onClick={assignRandomCase}>Assign Me a Case</button>
      </section>
      <p className="bureau-case-status" role="status" aria-live="polite">{assignmentStatus}</p>

      <section className="bureau-case-subsection" aria-labelledby="daily-cases-title">
        <div className="bureau-case-heading-row">
          <div>
            <p className="record-reference">Local docket {getLocalDateKey(today)}</p>
            <h3 id="daily-cases-title">Today&apos;s Bureau Files</h3>
          </div>
          <p>Three files issued deterministically for today&apos;s local calendar date.</p>
        </div>
        <div className="daily-case-grid">
          {dailyCases.map((caseData) => (
            <article className="bureau-case-card daily-case-card" key={caseData.slot}>
              <p className="bureau-case-category">{caseData.caseLabel}</p>
              <ApplicantPair caseData={caseData} />
              <p className="bureau-case-teaser">{caseData.teaser}</p>
              <button
                type="button"
                className="secondary-action bureau-case-action"
                onClick={() => loadCase(caseData, `${caseData.caseLabel} loaded. Consultation not yet submitted.`)}
              >
                Review Case
              </button>
            </article>
          ))}
        </div>
      </section>

      <section className="bureau-case-subsection" aria-labelledby="archive-cases-title">
        <div className="bureau-case-heading-row">
          <div>
            <p className="record-reference">Permanent reference collection</p>
            <h3 id="archive-cases-title">Notable Cases from the Archive</h3>
          </div>
          <p>Selected filings demonstrating why chronological age alone remains an inadequate form field.</p>
        </div>
        <div className="curated-case-grid">
          {curatedBureauCases.map((caseData) => (
            <article className="bureau-case-card curated-case-card" key={caseData.id}>
              <p className="bureau-case-category">{caseData.category}</p>
              <h4>{caseData.title}</h4>
              <p className="bureau-case-description">{caseData.description}</p>
              <ApplicantPair caseData={caseData} />
              <button
                type="button"
                className="secondary-action bureau-case-action"
                onClick={() => loadCase(caseData, `${caseData.title} loaded from the Bureau archive. Consultation not yet submitted.`)}
              >
                Open File
              </button>
            </article>
          ))}
        </div>
      </section>
    </section>
  )
}
