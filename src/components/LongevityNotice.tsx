import type { ApplicantLifecycleFacts } from '../types/applicant'
import { formatPercentage, formatYears } from '../utils/format'
import type { ApplicantLongevityResult } from '../utils/longevity'
import { longevityLabels } from '../data/verdicts'
import { applicantDisplayName } from '../utils/applicantName'
import type { LongevityTheatre } from '../utils/resultPresentation'

interface LongevityNoticeProps {
  applicant: ApplicantLifecycleFacts
  longevity: ApplicantLongevityResult
  theatre?: LongevityTheatre
}

export function LongevityNotice({ applicant, longevity, theatre }: LongevityNoticeProps) {
  if (!longevity.exceedsTypicalLifespan) return null

  const label = longevityLabels[longevity.category]
  const noticeHeading = longevity.category === 'ANOMALOUS'
    ? 'Chronological anomaly'
    : 'Longevity notice'
  const displayName = applicantDisplayName(applicant)

  return (
    <aside
      className={`longevity-notice longevity-${longevity.category.toLowerCase()}`}
      aria-label={`${noticeHeading} for ${displayName}: ${label}`}
    >
      <span className="longevity-notice-heading">{theatre?.proceduralLabel ?? noticeHeading}</span>
      <strong>{theatre?.headline ?? label}</strong>
      {theatre?.stamp && <span className="longevity-stamp" aria-hidden="true">{theatre.stamp}</span>}
      <p>
        {displayName} has exceeded the typical lifespan recorded for their species.
        {theatre ? ` ${theatre.note}` : ''}
      </p>
      {theatre && <span className="longevity-factual-label">Bureau classification: {label}</span>}
      <dl>
        <div><dt>Recorded age</dt><dd>{formatYears(applicant.age)} years</dd></div>
        <div><dt>Typical lifespan</dt><dd>{formatYears(applicant.species.typicalLifespan)} years</dd></div>
        <div><dt>Beyond typical lifespan</dt><dd>{formatYears(longevity.excessYears)} years</dd></div>
        <div><dt>Age relative to lifespan</dt><dd>{formatPercentage(longevity.ratio)}</dd></div>
      </dl>
    </aside>
  )
}
