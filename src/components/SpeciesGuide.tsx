import { curatedBureauCases, type BureauCaseInput } from '../data/bureauCases'
import { speciesDisplayGroups } from '../data/speciesGroups'
import { getSpeciesProfile } from '../data/speciesProfiles'
import type { SpeciesId } from '../data/species'
import { formatYears } from '../utils/format'
import { getBuiltInSpeciesGuideRecords } from '../utils/information'
import { ThemeOrnament } from './ThemeOrnament'

interface SpeciesGuideProps {
  onLoadCase?: (caseData: BureauCaseInput, announcement: string) => void
}

export function SpeciesGuide({ onLoadCase = () => undefined }: SpeciesGuideProps) {
  const records = getBuiltInSpeciesGuideRecords()
  const recordsById = new Map(records.map((record) => [record.species.id, record]))
  const curatedCasesById = new Map(curatedBureauCases.map((caseData) => [caseData.id, caseData]))

  return (
    <section className="information-section species-register-section" id="species-guide" aria-labelledby="species-guide-title">
      <ThemeOrnament location="information" />
      <header className="information-header">
        <p className="eyebrow dark">Permanent lifecycle catalogue</p>
        <h1 id="species-guide-title">Bureau Species Register</h1>
        <p>
          Official lifecycle references used by the Arcane Relationship Bureau when processing inter-species
          chronological matters. The records are generic fictional assumptions, not claims about any setting.
        </p>
      </header>

      <aside className="species-register-notice">
        <strong>Register guidance</strong>
        <p>Typical lifespan is a reference value, not a maximum age. Expand any record for its Bureau observations and archival notes.</p>
      </aside>

      <div className="species-register-groups">
        {speciesDisplayGroups.map((group) => (
          <section className="species-register-group" aria-labelledby={`species-group-${group.id}`} key={group.id}>
            <h3 id={`species-group-${group.id}`}>{group.label}</h3>
            <div className="species-register-grid">
              {group.speciesIds.map((speciesId) => recordsById.get(speciesId)).map((record) => {
                if (!record) return null
                const { species: entry, speciesSeven, speciesFourteen } = record
                const profile = getSpeciesProfile(entry.id as SpeciesId)
                const relatedCases = profile.relatedCaseIds?.map((id) => curatedCasesById.get(id)).filter(Boolean) ?? []
                return (
                  <details className="species-register-card" key={entry.id} data-species-id={entry.id}>
                    <summary>
                      <span className="species-record-heading">
                        <span className="record-reference">Permanent record / {entry.id.toUpperCase()}</span>
                        <strong>{entry.name}</strong>
                        <span className="species-classification">{profile.classification}</span>
                      </span>
                      <span className="species-record-facts" aria-label={`${entry.name} lifecycle record`}>
                        <span><small>Recognised adulthood</small><b>{formatYears(entry.adulthoodAge)} years</b></span>
                        <span><small>Typical lifespan</small><b>{formatYears(entry.typicalLifespan)} years</b></span>
                      </span>
                    </summary>

                    <div className="species-record-body">
                      <section aria-labelledby={`${entry.id}-lifecycle-summary`}>
                        <h5 id={`${entry.id}-lifecycle-summary`}>Lifecycle Summary</h5>
                        <p>{profile.lifecycleSummary}</p>
                      </section>

                      <div className="species-record-observations">
                        <section aria-labelledby={`${entry.id}-bureau-observation`}>
                          <h5 id={`${entry.id}-bureau-observation`}>Bureau Observation</h5>
                          <p>{profile.bureauObservation}</p>
                        </section>
                        <section aria-labelledby={`${entry.id}-filing-issue`}>
                          <h5 id={`${entry.id}-filing-issue`}>Common Filing Issue</h5>
                          <p>{profile.commonFilingIssue}</p>
                        </section>
                        <section aria-labelledby={`${entry.id}-peculiarity`}>
                          <h5 id={`${entry.id}-peculiarity`}>Chronological Peculiarity</h5>
                          <p>{profile.chronologicalPeculiarity}</p>
                        </section>
                      </div>

                      <div className="species-record-annex">
                        <section aria-labelledby={`${entry.id}-archival-notes`}>
                          <h5 id={`${entry.id}-archival-notes`}>Archival Notes</h5>
                          <ul>{profile.archivalNotes.map((note) => <li key={note}>{note}</li>)}</ul>
                        </section>
                        <div className="maturity-constants" aria-label={`${entry.name} lifespan-derived maturity constants`}>
                          <span>Bureau maturity constants</span>
                          <strong>+{formatYears(speciesSeven)} / -{formatYears(speciesFourteen)}</strong>
                          <small>Lifespan divided by 12 and 6</small>
                        </div>
                      </div>

                      {relatedCases.length > 0 && (
                        <section className="related-bureau-files" aria-labelledby={`${entry.id}-related-files`}>
                          <h5 id={`${entry.id}-related-files`}>Related Bureau Files</h5>
                          <div>
                            {relatedCases.map((caseData) => caseData && (
                              <button
                                type="button"
                                className="secondary-action"
                                key={caseData.id}
                                onClick={() => onLoadCase(
                                  caseData,
                                  `${caseData.title} loaded from the ${entry.name} register. Consultation not yet submitted.`,
                                )}
                              >
                                {caseData.title}
                              </button>
                            ))}
                          </div>
                        </section>
                      )}
                    </div>
                  </details>
                )
              })}
            </div>
          </section>
        ))}
      </div>

      <aside className="information-note">
        <strong>Temporary records</strong>
        <p>
          Custom species remain factual, session-only registrations in the Checker. They use the same calculations
          but do not receive invented Bureau lore or enter this permanent register.
        </p>
      </aside>
    </section>
  )
}
