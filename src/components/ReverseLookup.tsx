import { useState, type FormEvent, type ReactNode } from 'react'
import type { Species, SpeciesReferenceId } from '../data/species'
import { speciesDisplayGroups } from '../data/speciesGroups'
import type { Applicant } from '../types/applicant'
import { formatLookupYears, formatYears } from '../utils/format'
import { findSpeciesById, validateAge } from '../utils/lifecycle'
import { reverseLookup } from '../utils/reverseLookup'
import { ThemeOrnament } from './ThemeOrnament'

interface ReverseLookupProps {
  availableSpecies: readonly Species[]
  onUsePair: (applicantA: Applicant, applicantB: Applicant) => void
}

interface SubmittedLookup {
  sourceSpecies: Species
  sourceAge: number
  targetSpecies: Species
  result: ReturnType<typeof reverseLookup>
}

function SpeciesOptions({ availableSpecies }: { availableSpecies: readonly Species[] }) {
  const builtInSpecies = availableSpecies.filter((entry) => entry.source === 'builtin')
  const customSpecies = availableSpecies.filter((entry) => entry.source === 'custom')
  return (
    <>
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
    </>
  )
}

function Fact({ label, children }: { label: string; children: ReactNode }) {
  return <div><dt>{label}</dt><dd>{children}</dd></div>
}

function LookupResult({
  lookup,
  onUsePair,
}: {
  lookup: SubmittedLookup
  onUsePair: ReverseLookupProps['onUsePair']
}) {
  const { sourceSpecies, sourceAge, targetSpecies, result } = lookup
  if (result.status === 'source-underage') {
    return (
      <aside className="reverse-lookup-unavailable" role="status" aria-labelledby="lookup-unavailable-title">
        <h3 id="lookup-unavailable-title">Lookup Unavailable</h3>
        <p>
          Reverse Lookup is available only for applicants who have reached their species&apos; recognised adulthood
          age. {sourceSpecies.name} adulthood is recorded at {formatYears(result.sourceAdulthoodAge)} years.
        </p>
      </aside>
    )
  }

  return (
    <div className="reverse-lookup-result" aria-live="polite">
      <header>
        <p className="record-reference">One-directional lifecycle reference</p>
        <h3>Lifecycle Equivalence Record</h3>
      </header>

      <div className="reverse-lookup-result-grid">
        <article>
          <span className="assessment-number">Source Record</span>
          <h4>{sourceSpecies.name}, age {formatLookupYears(sourceAge)}</h4>
          <dl>
            <Fact label="Recognised adulthood">{formatYears(sourceSpecies.adulthoodAge)} years</Fact>
            <Fact label="Typical lifespan">{formatYears(sourceSpecies.typicalLifespan)} years</Fact>
          </dl>
        </article>

        <article>
          <span className="assessment-number">Lifecycle Position</span>
          <h4>Human-equivalent maturity</h4>
          <strong className="reverse-lookup-primary-value">
            {formatLookupYears(result.sourceEquivalentAge)} years
          </strong>
        </article>

        <article>
          <span className="assessment-number">
            {result.closestTargetIsAdult ? `Closest ${targetSpecies.name} Equivalent` : 'Mathematical Lifecycle Equivalent'}
          </span>
          <h4>{targetSpecies.name}</h4>
          <strong className="reverse-lookup-primary-value">
            Approximately {formatLookupYears(result.targetEquivalentAge)} years
          </strong>
          {!result.closestTargetIsAdult && (
            <p className="restrained-context">
              This value is below recognised adulthood for {targetSpecies.name} and is not presented as an adult
              compatibility recommendation.
            </p>
          )}
        </article>

        <article>
          <span className="assessment-number">Adult Maturity Range</span>
          <h4>One-directional {targetSpecies.name} range</h4>
          {result.hasAdultTargetRange ? (
            <>
              <strong className="reverse-lookup-primary-value">
                Approximately {formatLookupYears(result.adultTargetMinimumAge!)} to {formatLookupYears(result.adultTargetMaximumAge!)} years
              </strong>
              {result.targetRangeStartsBelowAdulthood && (
                <p className="restrained-context">
                  The mathematical range begins below recognised adulthood; the Bureau displays only the adult portion.
                </p>
              )}
            </>
          ) : (
            <p className="restrained-context">
              No adult age in the selected target species falls within this one-directional maturity range.
            </p>
          )}
        </article>
      </div>

      <section className="reverse-lookup-explanation" aria-labelledby="reverse-lookup-explanation-title">
        <h4 id="reverse-lookup-explanation-title">Bureau Explanation</h4>
        <p>
          A {sourceSpecies.name} aged {formatLookupYears(sourceAge)} occupies roughly the same proportion of its
          typical lifespan as a {targetSpecies.name} aged {formatLookupYears(result.targetEquivalentAge)}.
        </p>
        <p>
          This lookup shows the target-species range corresponding to the source character&apos;s maturity criteria.
          A normal Bureau consultation checks compatibility in both directions.
        </p>
        <p>This does not compare adult experience; lived experience may differ substantially.</p>
      </section>

      {(result.sourceExceedsTypicalLifespan || result.targetEquivalentExceedsTypicalLifespan) && (
        <aside className="reverse-lookup-lifecycle-note">
          <strong>Lifecycle context</strong>
          {result.sourceExceedsTypicalLifespan && result.targetEquivalentExceedsTypicalLifespan ? (
            <p>Source record and equivalent target age exceed their species&apos; typical lifespan references.</p>
          ) : (
            <>
              {result.sourceExceedsTypicalLifespan && <p>Source record exceeds the species&apos; typical lifespan reference.</p>}
              {result.targetEquivalentExceedsTypicalLifespan && <p>Equivalent target age exceeds the target species&apos; typical lifespan reference.</p>}
            </>
          )}
        </aside>
      )}

      {result.closestTargetIsAdult && (
        <div className="reverse-lookup-action">
          <button
            type="button"
            className="secondary-action"
            onClick={() => onUsePair(
              { speciesId: sourceSpecies.id as SpeciesReferenceId, age: sourceAge },
              { speciesId: targetSpecies.id as SpeciesReferenceId, age: result.targetEquivalentAge },
            )}
          >
            Use This Pair in Checker
          </button>
          <small>Populates both applicant records without submitting a consultation.</small>
        </div>
      )}
    </div>
  )
}

export function ReverseLookup({ availableSpecies, onUsePair }: ReverseLookupProps) {
  const [sourceSpeciesId, setSourceSpeciesId] = useState<SpeciesReferenceId>('elf')
  const [sourceAge, setSourceAge] = useState<number | ''>(300)
  const [targetSpeciesId, setTargetSpeciesId] = useState<SpeciesReferenceId>('human')
  const [ageError, setAgeError] = useState<string>()
  const [submittedLookup, setSubmittedLookup] = useState<SubmittedLookup>()

  function clearResult() {
    setAgeError(undefined)
    setSubmittedLookup(undefined)
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const validation = validateAge(sourceAge)
    if (!validation.valid) {
      setAgeError(validation.message)
      setSubmittedLookup(undefined)
      return
    }
    const sourceSpecies = findSpeciesById(sourceSpeciesId, availableSpecies)
    const targetSpecies = findSpeciesById(targetSpeciesId, availableSpecies)
    if (!sourceSpecies || !targetSpecies) {
      setAgeError('Select recognised source and target species.')
      setSubmittedLookup(undefined)
      return
    }

    setAgeError(undefined)
    setSubmittedLookup({
      sourceSpecies,
      sourceAge: validation.value,
      targetSpecies,
      result: reverseLookup({ sourceSpecies, sourceAge: validation.value, targetSpecies }),
    })
  }

  return (
    <section className="information-section reverse-lookup-section" id="reverse-lookup" aria-labelledby="reverse-lookup-title">
      <ThemeOrnament location="information" />
      <header className="information-header">
        <p className="agency-identity"><strong>CIA</strong><span>Chronological Intelligence Agency</span></p>
        <p className="eyebrow dark">Specialist lifecycle reference desk</p>
        <h1 id="reverse-lookup-title">Chronological Equivalence Office</h1>
        <p>For applicants who would prefer to receive the numbers before creating additional paperwork.</p>
      </header>

      <form className="reverse-lookup-form" onSubmit={handleSubmit} noValidate>
        <fieldset>
          <legend>Source Record</legend>
          <div className="field-group">
            <label htmlFor="reverse-source-species">Source Species</label>
            <select
              id="reverse-source-species"
              value={sourceSpeciesId}
              onChange={(event) => {
                setSourceSpeciesId(event.target.value as SpeciesReferenceId)
                clearResult()
              }}
            >
              <SpeciesOptions availableSpecies={availableSpecies} />
            </select>
          </div>
          <div className="field-group">
            <label htmlFor="reverse-source-age">Source Age</label>
            <input
              id="reverse-source-age"
              type="number"
              inputMode="decimal"
              step="any"
              value={sourceAge}
              aria-invalid={Boolean(ageError)}
              aria-describedby={`reverse-source-age-hint${ageError ? ' reverse-source-age-error' : ''}`}
              onChange={(event) => {
                const age = event.currentTarget.valueAsNumber
                setSourceAge(Number.isNaN(age) ? '' : age)
                clearResult()
              }}
            />
            <small className="field-hint" id="reverse-source-age-hint">Whole or fractional years are accepted.</small>
            {ageError && <p className="field-error" id="reverse-source-age-error" role="alert">{ageError}</p>}
          </div>
        </fieldset>

        <fieldset>
          <legend>Compare With</legend>
          <div className="field-group">
            <label htmlFor="reverse-target-species">Target Species</label>
            <select
              id="reverse-target-species"
              value={targetSpeciesId}
              onChange={(event) => {
                setTargetSpeciesId(event.target.value as SpeciesReferenceId)
                clearResult()
              }}
            >
              <SpeciesOptions availableSpecies={availableSpecies} />
            </select>
          </div>
          <p className="reverse-lookup-form-note">
            The target range is calculated from the source record only. No relationship consultation is created.
          </p>
        </fieldset>

        <div className="reverse-lookup-submit">
          <button type="submit">Calculate Equivalence</button>
        </div>
      </form>

      {submittedLookup && <LookupResult lookup={submittedLookup} onUsePair={onUsePair} />}
    </section>
  )
}
