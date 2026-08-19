import { immortalLifecycleFamilies } from '../data/immortalLifecycles'
import { customImmortalPreset, immortalPresets } from '../data/immortalPresets'
import type { ImmortalPreset } from '../types/immortalPresets'
import { ThemeOrnament } from './ThemeOrnament'

function presetParameters(preset: ImmortalPreset): string {
  switch (preset.family) {
    case 'ACQUIRED':
      return preset.maturationMode === 'FROZEN'
        ? 'Mortal origin required · maturity frozen at transformation'
        : `Mortal origin required · continuing maturation · ${preset.maturationHalfLife}-year half-life`
    case 'NATURALLY_IMMORTAL':
      return `Bureau defaults · adulthood ${preset.recognisedAdulthoodAge} · ${preset.maturationHalfLife}-year half-life`
    case 'MANIFESTED':
      return `Created mature at 25 · ${preset.maturationHalfLife}-year half-life`
    case 'TRANSFERRED_CYCLICAL':
      return preset.subtype === 'REINCARNATING'
        ? 'Current form maturity · declared memory continuity'
        : 'Current host maturity · remembered conscious experience'
  }
}

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

      <section className="immortal-preset-catalogue" aria-labelledby="immortal-classifications-title">
        <header>
          <p className="eyebrow dark">Immortal classification</p>
          <h2 id="immortal-classifications-title">Recognised Filing Presets</h2>
          <p>Lifecycle parameters are Bureau defaults for this tool, not claims about any particular setting.</p>
        </header>
        <div className="immortal-preset-grid">
          {immortalPresets.map((preset) => (
            <article key={preset.id} data-immortal-preset-id={preset.id}>
              <p className="record-reference">{preset.family.replaceAll('_', ' ')}</p>
              <h3>{preset.name}</h3>
              <p>{presetParameters(preset)}</p>
            </article>
          ))}
          <article className="custom-immortal-preset" data-immortal-preset-id={customImmortalPreset.id}>
            <p className="record-reference">Family-bound custom filing</p>
            <h3>{customImmortalPreset.name}</h3>
            <p>Choose one recognised lifecycle family; only that family&apos;s approved fields and fixed ceiling apply.</p>
          </article>
        </div>
      </section>

      <aside className="information-note">
        <strong>Filing availability</strong>
        <p>Immortal filing services are being opened in stages. Mortal statutes remain with the DMV.</p>
      </aside>
    </section>
  )
}
