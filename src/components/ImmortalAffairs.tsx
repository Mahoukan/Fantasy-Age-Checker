import { immortalLifecycleFamilies } from '../data/immortalLifecycles'
import { ThemeOrnament } from './ThemeOrnament'

export function ImmortalAffairs() {
  return (
    <section className="information-section immortal-affairs-section" id="immortal-affairs" aria-labelledby="immortal-affairs-title">
      <ThemeOrnament location="information" />
      <header className="information-header">
        <p className="agency-identity"><strong>FBI</strong><span>Fantasy Bureau of Immortality</span></p>
        <p className="eyebrow dark">Immortal lifecycle jurisdiction</p>
        <h1 id="immortal-affairs-title">Immortal Affairs</h1>
        <p className="immortal-affairs-motto">When mortality stops applying, jurisdiction begins.</p>
      </header>

      <aside className="immortal-jurisdiction-notice">
        <strong>FBI jurisdiction</strong>
        <p>
          The ordinary Bureau assumes a finite species lifecycle. The FBI handles acquired immortality, naturally
          immortal beings, manifested entities, and continuing consciousnesses under separate lifecycle statutes.
        </p>
      </aside>

      <div className="immortal-family-grid" aria-label="Immortal lifecycle families">
        {immortalLifecycleFamilies.map((family) => (
          <article className="immortal-family-card" key={family.id}>
            <p className="record-reference">Immortal lifecycle file / {family.filingCode}</p>
            <h2>{family.name}</h2>
            <p>{family.description}</p>
          </article>
        ))}
      </div>

      <aside className="information-note">
        <strong>Filing availability</strong>
        <p>Immortal filing services are being opened in stages. Mortal statutes remain with the DMV.</p>
      </aside>
    </section>
  )
}

