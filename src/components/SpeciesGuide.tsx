import { formatYears } from '../utils/format'
import { getBuiltInSpeciesGuideRecords } from '../utils/information'
import { speciesDisplayGroups } from '../data/speciesGroups'
import { ThemeOrnament } from './ThemeOrnament'

export function SpeciesGuide() {
  const records = getBuiltInSpeciesGuideRecords()
  const recordsById = new Map(records.map((record) => [record.species.id, record]))

  return (
    <section className="information-section" id="species-guide" aria-labelledby="species-guide-title">
      <ThemeOrnament location="information" />
      <header className="information-header">
        <p className="eyebrow dark">Bureau lifecycle register</p>
        <h2 id="species-guide-title">Species Guide</h2>
        <p>
          Canonical lifecycle assumptions used by this tool for generic fantasy peoples. These records are not
          claims about any particular setting.
        </p>
      </header>

      <div className="species-register-groups">
        {speciesDisplayGroups.map((group) => (
          <section className="species-register-group" aria-labelledby={`species-group-${group.id}`} key={group.id}>
            <h3 id={`species-group-${group.id}`}>{group.label}</h3>
            <div className="species-register-grid">
              {group.speciesIds.map((speciesId) => recordsById.get(speciesId)).map((record) => {
                if (!record) return null
                const { species: entry, speciesSeven, speciesFourteen } = record
                return (
                  <article className="species-register-card" key={entry.id} data-species-id={entry.id}>
                    <span className="record-reference">Permanent record / {entry.id.toUpperCase()}</span>
                    <h4>{entry.name}</h4>
                    <p className="record-description">
                      {entry.description ?? `A generic ${entry.name.toLowerCase()} lifecycle profile maintained for Bureau comparisons.`}
                    </p>
                    <dl>
                      <div><dt>Recognised adulthood</dt><dd>{formatYears(entry.adulthoodAge)} years</dd></div>
                      <div><dt>Typical lifespan</dt><dd>{formatYears(entry.typicalLifespan)} years</dd></div>
                    </dl>
                    <div className="maturity-constants" aria-label={`${entry.name} lifespan-derived maturity constants`}>
                      <span>Bureau maturity constants</span>
                      <strong>+{formatYears(speciesSeven)} / -{formatYears(speciesFourteen)}</strong>
                      <small>Lifespan divided by 12 and 6</small>
                    </div>
                  </article>
                )
              })}
            </div>
          </section>
        ))}
      </div>

      <aside className="information-note">
        <strong>Temporary records</strong>
        <p>
          Species registered during a consultation use the same calculations but are not added to the Bureau's
          permanent guide. They remain available in the Checker until the page is refreshed.
        </p>
      </aside>
    </section>
  )
}
