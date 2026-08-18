import type { ApplicantLifecycleFacts } from '../types/applicant'
import { formatYears } from '../utils/format'
import { ThemeOrnament } from './ThemeOrnament'

interface RejectionResultProps {
  applicants: ApplicantLifecycleFacts[]
}

export function RejectionResult({ applicants }: RejectionResultProps) {
  return (
    <section className="ruling-card rejection-card" aria-labelledby="rejection-title" aria-live="polite">
      <ThemeOrnament location="result" />
      <div className="ruling-header">
        <div>
          <p className="eyebrow dark">Adulthood safeguard</p>
          <h2 id="rejection-title">Application Rejected</h2>
        </div>
        <div className="provisional-seal rejection-seal" aria-hidden="true">REJECTED</div>
      </div>

      <p className="rejection-summary">
        One or more applicants have not reached the recognised age of adulthood for their people.
      </p>

      <div className="rejection-details">
        {applicants.map((applicant) => (
          <article key={applicant.label}>
            <span className="assessment-number">Applicant {applicant.label}</span>
            <h3>{applicant.name ?? applicant.species.name}</h3>
            {applicant.name && <p className="applicant-species-name">{applicant.species.name}</p>}
            {applicant.species.source === 'custom' && <span className="temporary-species-badge">Temporary Species</span>}
            <dl>
              <div><dt>Age</dt><dd>{formatYears(applicant.age)} years</dd></div>
              <div><dt>Recognised adulthood</dt><dd>{formatYears(applicant.species.adulthoodAge)} years</dd></div>
            </dl>
          </article>
        ))}
      </div>

      <p className="rejection-closing">The Bureau cannot issue a compatibility ruling for this application.</p>
    </section>
  )
}
