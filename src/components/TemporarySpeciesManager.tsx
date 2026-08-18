import type { CustomSpecies } from '../data/species'
import { formatYears } from '../utils/format'

interface TemporarySpeciesManagerProps {
  customSpecies: readonly CustomSpecies[]
  inUseSpeciesIds: readonly string[]
  disabled?: boolean
  onRemove: (species: CustomSpecies) => void
}

export function TemporarySpeciesManager({
  customSpecies,
  inUseSpeciesIds,
  disabled = false,
  onRemove,
}: TemporarySpeciesManagerProps) {
  if (customSpecies.length === 0) return null

  return (
    <section className="temporary-species-manager" aria-labelledby="temporary-species-title">
      <div>
        <p className="eyebrow dark">Current session only</p>
        <h3 id="temporary-species-title">Temporary Species: {customSpecies.length}</h3>
      </div>
      <ul>
        {customSpecies.map((entry) => {
          const isInUse = inUseSpeciesIds.includes(entry.id)
          return (
            <li key={entry.id}>
              <div>
                <strong>{entry.name}</strong>
                <small>
                  Adult at {formatYears(entry.adulthoodAge)} · Lifespan {formatYears(entry.typicalLifespan)} years
                </small>
              </div>
              <div className="temporary-species-action">
                <button
                  type="button"
                  disabled={isInUse || disabled}
                  aria-describedby={isInUse ? `${entry.id}-in-use` : disabled ? 'consultation-lock-note' : undefined}
                  onClick={() => onRemove(entry)}
                >
                  Remove
                </button>
                {isInUse && <small id={`${entry.id}-in-use`}>In use—select another species before removing.</small>}
              </div>
            </li>
          )
        })}
      </ul>
    </section>
  )
}
