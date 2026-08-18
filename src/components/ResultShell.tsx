import type { ApplicantLifecycleFacts } from '../types/applicant'
import type { ConsultationQuips } from '../types/quip'
import type { ExperienceGapResult } from '../utils/experience'
import { formatEquivalentYears, formatPercentage, formatYears } from '../utils/format'
import type { MaturityCompatibilityResult } from '../utils/maturity'
import type { ApplicantLongevityResult } from '../utils/longevity'
import { LongevityNotice } from './LongevityNotice'
import { experienceVerdicts, maturityVerdicts } from '../data/verdicts'
import { ShareControls } from './ShareControls'
import type { ShareResultModel } from '../utils/share'
import { applicantDisplayName } from '../utils/applicantName'
import type { ResultImageThemeId } from '../data/resultImageThemes'

interface ResultShellProps extends ShareResultModel {
  applicants: ApplicantLifecycleFacts[]
  maturity: MaturityCompatibilityResult
  experience: ExperienceGapResult
  longevity: ApplicantLongevityResult[]
  quips: ConsultationQuips
  caseNumber: string
  initialImageThemeId?: ResultImageThemeId
}

export function ResultShell({ applicants, maturity, experience, longevity, quips, caseNumber, initialImageThemeId }: ResultShellProps) {
  const maturityVerdict = maturityVerdicts[maturity.category]
  const experienceVerdict = experienceVerdicts[experience.category]
  const [applicantA, applicantB] = applicants
  const applicantADisplayName = applicantDisplayName(applicantA)
  const applicantBDisplayName = applicantDisplayName(applicantB)

  return (
    <section className="ruling-card ruling-card-enter" aria-labelledby="ruling-title" aria-live="polite">
      <div className="ruling-header">
        <div>
          <p className="eyebrow dark">Official verdict</p>
          <h2 id="ruling-title">Bureau Assessment</h2>
          <p className="ruling-case-number">Case No. {caseNumber}</p>
        </div>
        <div className="bureau-seal" aria-hidden="true">
          <span>ARB</span>
          <strong>Bureau Reviewed</strong>
        </div>
      </div>

      <p className="not-implemented">Lifecycle records verified. Two independent assessments have been entered into the official record.</p>

      <div className="assessment-grid">
        <article className={`maturity-verdict maturity-${maturity.category.toLowerCase()}`}>
          <span className="assessment-number">Assessment I</span>
          <h3>Maturity Compatibility</h3>
          <strong className="verdict-label">{maturityVerdict.label}</strong>
          <p>{maturityVerdict.description}</p>
          <blockquote className="verdict-quip">{quips.maturity.text}</blockquote>
        </article>
        <article className={`experience-verdict experience-${experience.category.toLowerCase()}`}>
          <span className="assessment-number">Assessment II</span>
          <h3>Experience Gap</h3>
          <strong className="verdict-label">{experienceVerdict.label}</strong>
          <p>{experienceVerdict.description}</p>
          <blockquote className="verdict-quip">{quips.experience.text}</blockquote>
          <dl className="assessment-facts">
            <div><dt>{applicantA.name ? `${applicantA.name} (${applicantA.species.name})` : applicantA.species.name} adult experience</dt><dd>{formatYears(experience.applicantAAdultExperience)} years</dd></div>
            <div><dt>{applicantB.name ? `${applicantB.name} (${applicantB.species.name})` : applicantB.species.name} adult experience</dt><dd>{formatYears(experience.applicantBAdultExperience)} years</dd></div>
            <div><dt>Experience difference</dt><dd>{formatYears(experience.adultExperienceGap)} years</dd></div>
          </dl>
        </article>
      </div>

      <div className="bureau-calculations">
        <h3>Bureau Calculations</h3>
        <div className="maturity-math" aria-label="Maturity compatibility calculations">
          <div>
            <strong>{applicantADisplayName} maturity equivalent</strong>
            <span>{formatEquivalentYears(maturity.applicantAEquivalentAge)} human years</span>
            <small>
              Accepted range: {formatEquivalentYears(maturity.applicantAMinimumEquivalentAge)}–{formatEquivalentYears(maturity.applicantAMaximumEquivalentAge)} equivalent years
            </small>
          </div>
          <div>
            <strong>{applicantBDisplayName} maturity equivalent</strong>
            <span>{formatEquivalentYears(maturity.applicantBEquivalentAge)} human years</span>
            <small>
              Accepted range: {formatEquivalentYears(maturity.applicantBMinimumEquivalentAge)}–{formatEquivalentYears(maturity.applicantBMaximumEquivalentAge)} equivalent years
            </small>
          </div>
        </div>
        <div className="comparison-facts" aria-label="Comparison calculations">
          <div><span>Maturity relative difference</span><strong>{formatPercentage(maturity.relativeDifference)}</strong></div>
          <div><span>Chronological age difference</span><strong>{formatYears(experience.chronologicalAgeGap)} years</strong></div>
          <div><span>Adult experience difference</span><strong>{formatYears(experience.adultExperienceGap)} years</strong></div>
        </div>
        <div className="lifecycle-facts-grid">
          {applicants.map((applicant) => {
            const applicantLongevity = longevity.find((result) => result.applicant === applicant.label)
            return (
              <article key={applicant.label}>
                <span className="assessment-number">Applicant {applicant.label}</span>
                <h4>{applicant.name ?? applicant.species.name}</h4>
                {applicant.name && <p className="applicant-species-name">{applicant.species.name}</p>}
                {applicant.species.source === 'custom' && <span className="temporary-species-badge">Temporary Species</span>}
                <dl>
                  <div><dt>Age</dt><dd>{formatYears(applicant.age)} years</dd></div>
                  <div><dt>Adult at</dt><dd>{formatYears(applicant.species.adulthoodAge)} years</dd></div>
                  <div><dt>Typical lifespan</dt><dd>{formatYears(applicant.species.typicalLifespan)} years</dd></div>
                  <div>
                    <dt>Human-equivalent maturity</dt>
                    <dd>
                      {formatEquivalentYears(applicant.label === 'A'
                        ? maturity.applicantAEquivalentAge
                        : maturity.applicantBEquivalentAge)} years
                    </dd>
                  </div>
                  <div><dt>Adult experience</dt><dd>{formatYears(applicant.adultExperience)} years</dd></div>
                  <div><dt>Relative lifespan position</dt><dd>{formatPercentage(applicant.relativeAge)}</dd></div>
                </dl>
                {applicantLongevity && (
                  <LongevityNotice applicant={applicant} longevity={applicantLongevity} />
                )}
              </article>
            )
          })}
        </div>
      </div>

      <aside className="bureau-note" aria-label="Bureau administrative note">
        <span>Bureau Note</span>
        <p>{quips.administrative.text}</p>
      </aside>

      <ShareControls
        result={{ applicants, maturity, experience, longevity, quips, caseNumber }}
        initialThemeId={initialImageThemeId}
      />

      <footer className="ruling-footer">
        <strong>Issued by the Office of Chronological Compatibility</strong>
        <span>These assessments are independent and have not been combined into an overall score.</span>
      </footer>
    </section>
  )
}
