import type { Species, SpeciesReferenceId } from '../data/species'
import { speciesDisplayGroups } from '../data/speciesGroups'
import type { Applicant, ApplicantLabel } from '../types/applicant'
import { formatYears } from '../utils/format'
import { findSpeciesById } from '../utils/lifecycle'
import { APPLICANT_NAME_MAX_LENGTH, limitApplicantName } from '../utils/applicantName'

interface ApplicantCardProps {
  applicant: Applicant
  label: ApplicantLabel
  ageError?: string
  availableSpecies: readonly Species[]
  disabled?: boolean
  onChange: (applicant: Applicant) => void
}

export function ApplicantCard({ applicant, label, ageError, availableSpecies, disabled = false, onChange }: ApplicantCardProps) {
  const idPrefix = `applicant-${label.toLowerCase()}`
  const selectedSpecies = findSpeciesById(applicant.speciesId, availableSpecies)
  const builtInSpecies = availableSpecies.filter((entry) => entry.source === 'builtin')
  const customSpecies = availableSpecies.filter((entry) => entry.source === 'custom')
  const ageDescriptionId = `${idPrefix}-age-description`
  const ageErrorId = `${idPrefix}-age-error`
  const nameDescriptionId = `${idPrefix}-name-description`

  return (
    <fieldset className="applicant-card">
      <legend>Applicant {label}</legend>
      <p className="applicant-reference">Registry entry {label} / Identity declaration</p>

      <div className="field-group">
        <label htmlFor={`${idPrefix}-name`}>Name (optional)</label>
        <input
          id={`${idPrefix}-name`}
          type="text"
          value={applicant.name ?? ''}
          maxLength={APPLICANT_NAME_MAX_LENGTH}
          disabled={disabled}
          autoComplete="off"
          aria-describedby={nameDescriptionId}
          onChange={(event) => onChange({
            ...applicant,
            name: limitApplicantName(event.currentTarget.value),
          })}
        />
        <small className="field-hint" id={nameDescriptionId}>
          Up to {APPLICANT_NAME_MAX_LENGTH} characters. Used only for this consultation.
        </small>
      </div>

      <div className="field-group">
        <label htmlFor={`${idPrefix}-species`}>Species</label>
        <select
          id={`${idPrefix}-species`}
          value={applicant.speciesId}
          disabled={disabled}
          onChange={(event) => onChange({
            ...applicant,
            speciesId: event.target.value as SpeciesReferenceId,
          })}
        >
          {speciesDisplayGroups.map((group) => (
            <optgroup label={group.label} key={group.id}>
              {group.speciesIds.map((speciesId) => {
                const entry = builtInSpecies.find((candidate) => candidate.id === speciesId)
                return entry ? <option value={entry.id} key={entry.id}>{entry.name}</option> : null
              })}
            </optgroup>
          ))}
          {customSpecies.length > 0 && (
            <optgroup label="Temporary Custom Species">
              {customSpecies.map((entry) => (
                <option value={entry.id} key={entry.id}>{entry.name} (Custom)</option>
              ))}
            </optgroup>
          )}
        </select>
      </div>

      {selectedSpecies && (
        <dl className="lifecycle-context" aria-label={`${selectedSpecies.name} lifecycle information`}>
          {selectedSpecies.source === 'custom' && (
            <div className="lifecycle-context-status">
              <dt>Registration</dt>
              <dd>Temporary species</dd>
            </div>
          )}
          <div>
            <dt>Recognised adulthood</dt>
            <dd>{formatYears(selectedSpecies.adulthoodAge)} years</dd>
          </div>
          <div>
            <dt>Typical lifespan</dt>
            <dd>{formatYears(selectedSpecies.typicalLifespan)} years</dd>
          </div>
        </dl>
      )}

      <div className="field-group">
        <label htmlFor={`${idPrefix}-age`}>Age in years</label>
        <input
          id={`${idPrefix}-age`}
          type="number"
          inputMode="decimal"
          step="any"
          value={applicant.age}
          disabled={disabled}
          aria-invalid={Boolean(ageError)}
          aria-describedby={`${ageDescriptionId}${ageError ? ` ${ageErrorId}` : ''}`}
          onChange={(event) => {
            const age = event.currentTarget.valueAsNumber
            onChange({ ...applicant, age: Number.isNaN(age) ? '' : age })
          }}
        />
        <small className="field-hint" id={ageDescriptionId}>Whole or fractional years are accepted.</small>
        {ageError && <p className="field-error" id={ageErrorId} role="alert">{ageError}</p>}
      </div>
    </fieldset>
  )
}
