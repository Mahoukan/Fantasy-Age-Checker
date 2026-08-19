import { useState } from 'react'
import { immortalLifecycleFamilies } from '../data/immortalLifecycles'
import { customImmortalPreset, findImmortalPreset, immortalPresets } from '../data/immortalPresets'
import { species as builtInSpecies, type Species } from '../data/species'
import { speciesDisplayGroups } from '../data/speciesGroups'
import { experienceVerdicts, maturityVerdicts } from '../data/verdicts'
import type { DraftNumber, FbiApplicantDraft, FbiApplicantDraftField, FbiApplicantErrors, FbiApplicantRecord } from '../types/fbiApplicant'
import type { FbiComparisonResult } from '../types/fbiComparison'
import type { ImmortalPreset } from '../types/immortalPresets'
import { APPLICANT_NAME_MAX_LENGTH, limitApplicantName } from '../utils/applicantName'
import { createDefaultFbiApplicantDraft, resolveFbiApplicantDraft } from '../utils/fbiApplicant'
import { compareFbiApplicants } from '../utils/fbiComparison'
import { formatEquivalentYears, formatYears } from '../utils/format'
import { ThemeOrnament } from './ThemeOrnament'

function presetParameters(preset: ImmortalPreset): string {
  switch (preset.family) {
    case 'ACQUIRED': return preset.maturationMode === 'FROZEN'
      ? 'Mortal origin required · maturity frozen at transformation'
      : `Mortal origin required · continuing maturation · ${preset.maturationHalfLife}-year half-life`
    case 'NATURALLY_IMMORTAL': return `Bureau defaults · adulthood ${preset.recognisedAdulthoodAge} · ${preset.maturationHalfLife}-year half-life`
    case 'MANIFESTED': return `Created mature at 25 · ${preset.maturationHalfLife}-year half-life`
    case 'TRANSFERRED_CYCLICAL': return preset.subtype === 'REINCARNATING'
      ? 'Current form maturity · declared memory continuity'
      : 'Current host maturity · remembered conscious experience'
  }
}

function SpeciesOptions({ availableSpecies }: { availableSpecies: readonly Species[] }) {
  const builtIns = availableSpecies.filter((entry) => entry.source === 'builtin')
  const custom = availableSpecies.filter((entry) => entry.source === 'custom')
  return <>{speciesDisplayGroups.map((group) => (
    <optgroup label={group.label} key={group.id}>
      {group.speciesIds.map((id) => {
        const entry = builtIns.find((candidate) => candidate.id === id)
        return entry ? <option value={entry.id} key={entry.id}>{entry.name}</option> : null
      })}
    </optgroup>
  ))}{custom.length > 0 && <optgroup label="Temporary Custom Species">
    {custom.map((entry) => <option value={entry.id} key={entry.id}>{entry.name} (Custom)</option>)}
  </optgroup>}</>
}

interface NumberFieldProps {
  id: string
  label: string
  value: DraftNumber
  error?: string
  hint?: string
  onChange: (value: DraftNumber) => void
}

function NumberField({ id, label, value, error, hint, onChange }: NumberFieldProps) {
  const errorId = `${id}-error`
  const hintId = `${id}-hint`
  return <div className="field-group">
    <label htmlFor={id}>{label}</label>
    <input
      id={id} type="number" inputMode="decimal" step="any" value={value}
      aria-invalid={Boolean(error)}
      aria-describedby={[hint ? hintId : '', error ? errorId : ''].filter(Boolean).join(' ') || undefined}
      onChange={(event) => {
        const number = event.currentTarget.valueAsNumber
        onChange(Number.isNaN(number) ? '' : number)
      }}
    />
    {hint && <small className="field-hint" id={hintId}>{hint}</small>}
    {error && <p className="field-error" id={errorId} role="alert">{error}</p>}
  </div>
}

interface SpeciesFieldProps {
  id: string
  label: string
  value: string
  error?: string
  availableSpecies: readonly Species[]
  onChange: (value: string) => void
}

function SpeciesField({ id, label, value, error, availableSpecies, onChange }: SpeciesFieldProps) {
  const errorId = `${id}-error`
  return <div className="field-group">
    <label htmlFor={id}>{label}</label>
    <select id={id} value={value} aria-invalid={Boolean(error)} aria-describedby={error ? errorId : undefined} onChange={(event) => onChange(event.currentTarget.value)}>
      <SpeciesOptions availableSpecies={availableSpecies} />
    </select>
    {error && <p className="field-error" id={errorId} role="alert">{error}</p>}
  </div>
}

function FieldError({ id, error }: { id: string; error?: string }) {
  return error ? <p className="field-error" id={id} role="alert">{error}</p> : null
}

function RecordPreview({ label, applicant }: { label: 'A' | 'B'; applicant: FbiApplicantRecord }) {
  const { record } = applicant
  const currentAge = record.family === 'MORTAL' ? record.age
    : record.family === 'ACQUIRED' || record.family === 'NATURALLY_IMMORTAL' ? record.currentAge : null
  return <section className="fbi-record-preview" aria-labelledby={`fbi-applicant-${label.toLowerCase()}-preview-title`}>
    <header><p className="record-reference">Validated immortal-affairs intake</p>
      <h3 id={`fbi-applicant-${label.toLowerCase()}-preview-title`}>Applicant {label} Record Preview</h3></header>
    <dl>
      <div><dt>Classification</dt><dd>{applicant.classification}</dd></div>
      {applicant.name && <div><dt>Declared name</dt><dd>{applicant.name}</dd></div>}
      {currentAge !== null && <div><dt>Current chronological age</dt><dd>{formatYears(currentAge)}</dd></div>}
      <div><dt>Effective human-equivalent maturity</dt><dd>{record.effectiveMaturity === null ? 'Not issued' : formatEquivalentYears(record.effectiveMaturity)}</dd></div>
      <div><dt>Adult experience</dt><dd>{record.adultExperience === null ? 'Not issued' : `${formatYears(record.adultExperience)} years`}</dd></div>
      <div><dt>Adult FBI comparison</dt><dd>{record.adultComparisonEligible ? 'Eligible' : 'Ineligible'}</dd></div>
      {record.family === 'ACQUIRED' && <><div><dt>Origin species</dt><dd>{record.originSpecies.name}</dd></div>
        <div><dt>Transformation record</dt><dd>Age {formatYears(record.ageAtTransformation)} · {record.maturationMode}</dd></div></>}
      {record.family === 'NATURALLY_IMMORTAL' && <div><dt>Bureau defaults</dt><dd>Adult at {formatYears(record.recognisedAdulthoodAge)} · half-life {formatYears(record.maturationHalfLife)}</dd></div>}
      {record.family === 'MANIFESTED' && <div><dt>Manifestation record</dt><dd>{formatYears(record.yearsSinceManifestation)} years · created mature at 25</dd></div>}
      {record.family === 'TRANSFERRED_CYCLICAL' && <div><dt>{record.subtype === 'POSSESSING' ? 'Current host' : 'Current form'}</dt><dd>{record.currentFormSpecies.name}, {formatYears(record.currentFormAge)}</dd></div>}
    </dl>
    {!record.adultComparisonEligible && <p className="fbi-eligibility-notice" role="status">
      <strong>Adult FBI comparison: Ineligible.</strong> {record.ineligibilityReason}
    </p>}
  </section>
}

function FbiReview({ result }: { result: FbiComparisonResult }) {
  if (result.status === 'INELIGIBLE') {
    return <section className="fbi-review fbi-review-ineligible" aria-labelledby="fbi-review-title">
      <p className="record-reference">FBI review unavailable</p>
      <h2 id="fbi-review-title">Adult Comparison Ineligible</h2>
      <p>The submitted records remain factual, but the Bureau cannot issue adult maturity or experience categories.</p>
      <ul>{result.reasons.map((entry) => <li key={entry.applicant}>
        <strong>Applicant {entry.applicant}:</strong> {entry.reason}
      </li>)}</ul>
    </section>
  }

  return <section className="fbi-review" aria-labelledby="fbi-review-title">
    <p className="record-reference">FBI review / factual comparison</p>
    <h2 id="fbi-review-title">Immortal Affairs Review</h2>
    <div className="fbi-review-applicants">
      {result.applicants.map((applicant) => <article key={applicant.label}>
        <h3>{applicant.displayName}</h3><p>{applicant.classification}</p><dl>
          <div><dt>Effective maturity</dt><dd>{formatEquivalentYears(applicant.effectiveMaturity)}</dd></div>
          <div><dt>Adult experience</dt><dd>{formatYears(applicant.adultExperience)} years</dd></div>
        </dl>
      </article>)}
    </div>
    <div className="fbi-review-findings">
      <article><p className="eyebrow dark">Maturity Compatibility</p>
        <h3>{maturityVerdicts[result.maturity.category].label}</h3>
        <p>Category: {result.maturity.category}</p></article>
      <article><p className="eyebrow dark">Experience Gap</p>
        <h3>{experienceVerdicts[result.experience.category].label}</h3>
        <p>{formatYears(result.experience.adultExperienceGap)} years · Category: {result.experience.category}</p></article>
    </div>
    <dl className="fbi-review-context">
      <div><dt>Chronological age gap</dt><dd>{result.chronology.chronologicalAgeGap === null
        ? 'Not comparable for these records'
        : `${formatYears(result.chronology.chronologicalAgeGap)} years`}</dd></div>
      <div><dt>More adult experience</dt><dd>{result.experience.moreExperiencedApplicant === 'EQUAL'
        ? 'Equal'
        : `Applicant ${result.experience.moreExperiencedApplicant}`}</dd></div>
    </dl>
    <p className="fbi-review-disclaimer">Maturity and experience are independent factual findings. No combined score is issued.</p>
  </section>
}

interface FbiApplicantIntakeCardProps {
  label: 'A' | 'B'
  draft: FbiApplicantDraft
  availableSpecies: readonly Species[]
  onChange: (draft: FbiApplicantDraft) => void
}

export function FbiApplicantIntakeCard({ label, draft, availableSpecies, onChange }: FbiApplicantIntakeCardProps) {
  const prefix = `fbi-applicant-${label.toLowerCase()}`
  const resolution = resolveFbiApplicantDraft(draft, availableSpecies)
  const errors: FbiApplicantErrors = resolution.errors
  const update = <Field extends keyof FbiApplicantDraft>(field: Field, value: FbiApplicantDraft[Field]) => onChange({ ...draft, [field]: value })
  const selectedPreset = draft.presetId === customImmortalPreset.id ? undefined : findImmortalPreset(draft.presetId)
  const family = draft.presetId === customImmortalPreset.id ? draft.customFamily : selectedPreset?.family
  const subtype = draft.presetId === customImmortalPreset.id ? draft.customTransferredSubtype
    : selectedPreset?.family === 'TRANSFERRED_CYCLICAL' ? selectedPreset.subtype : undefined
  const error = (field: FbiApplicantDraftField) => errors[field]

  return <fieldset className="applicant-card fbi-applicant-card">
    <legend>Applicant {label}</legend><ThemeOrnament location="applicant" />
    <p className="applicant-reference">FBI intake record {label} / Lifecycle declaration</p>
    <div className="field-group"><label htmlFor={`${prefix}-mode`}>Record Classification</label>
      <select id={`${prefix}-mode`} value={draft.mode} onChange={(event) => update('mode', event.currentTarget.value as FbiApplicantDraft['mode'])}>
        <option value="MORTAL">Mortal</option><option value="IMMORTAL">Immortal</option>
      </select></div>
    <div className="field-group"><label htmlFor={`${prefix}-name`}>Name (optional)</label>
      <input id={`${prefix}-name`} type="text" value={draft.name} maxLength={APPLICANT_NAME_MAX_LENGTH} autoComplete="off" aria-describedby={`${prefix}-name-hint`} onChange={(event) => update('name', limitApplicantName(event.currentTarget.value))} />
      <small className="field-hint" id={`${prefix}-name-hint`}>Up to {APPLICANT_NAME_MAX_LENGTH} characters. Presentation only.</small></div>

    {draft.mode === 'MORTAL' ? <>
      <SpeciesField id={`${prefix}-mortal-species`} label="Species" value={draft.mortalSpeciesId} error={error('mortalSpeciesId')} availableSpecies={availableSpecies} onChange={(value) => update('mortalSpeciesId', value)} />
      <NumberField id={`${prefix}-mortal-age`} label="Age" value={draft.mortalAge} error={error('mortalAge')} onChange={(value) => update('mortalAge', value)} />
    </> : <>
      <div className="field-group"><label htmlFor={`${prefix}-preset`}>Immortal Classification</label>
        <select id={`${prefix}-preset`} value={draft.presetId} aria-invalid={Boolean(error('presetId'))} aria-describedby={error('presetId') ? `${prefix}-preset-error` : undefined} onChange={(event) => update('presetId', event.currentTarget.value as FbiApplicantDraft['presetId'])}>
          {immortalPresets.map((preset) => <option value={preset.id} key={preset.id}>{preset.name}</option>)}
          <option value={customImmortalPreset.id}>{customImmortalPreset.name}</option>
        </select><FieldError id={`${prefix}-preset-error`} error={error('presetId')} /></div>

      {draft.presetId === customImmortalPreset.id && <div className="field-group"><label htmlFor={`${prefix}-custom-family`}>Lifecycle Family</label>
        <select id={`${prefix}-custom-family`} value={draft.customFamily} onChange={(event) => update('customFamily', event.currentTarget.value as FbiApplicantDraft['customFamily'])}>
          {immortalLifecycleFamilies.map((entry) => <option value={entry.id} key={entry.id}>{entry.name}</option>)}
        </select></div>}

      {family === 'ACQUIRED' && <>
        {draft.presetId === customImmortalPreset.id && <div className="field-group"><label htmlFor={`${prefix}-maturation-mode`}>Maturation Mode</label>
          <select id={`${prefix}-maturation-mode`} value={draft.customMaturationMode} onChange={(event) => update('customMaturationMode', event.currentTarget.value as FbiApplicantDraft['customMaturationMode'])}>
            <option value="FROZEN">Frozen</option><option value="CONTINUING">Continuing</option>
          </select></div>}
        {draft.presetId === customImmortalPreset.id && draft.customMaturationMode === 'CONTINUING' &&
          <NumberField id={`${prefix}-custom-half-life`} label="Maturation Half-Life" value={draft.customMaturationHalfLife} error={error('customMaturationHalfLife')} onChange={(value) => update('customMaturationHalfLife', value)} />}
        <SpeciesField id={`${prefix}-origin-species`} label="Origin Species" value={draft.originSpeciesId} error={error('originSpeciesId')} availableSpecies={availableSpecies} onChange={(value) => update('originSpeciesId', value)} />
        <NumberField id={`${prefix}-transformation-age`} label="Age at Transformation" value={draft.ageAtTransformation} error={error('ageAtTransformation')} onChange={(value) => update('ageAtTransformation', value)} />
        <NumberField id={`${prefix}-transformation-years`} label="Years Since Transformation" value={draft.yearsSinceTransformation} error={error('yearsSinceTransformation')} onChange={(value) => update('yearsSinceTransformation', value)} />
      </>}

      {family === 'NATURALLY_IMMORTAL' && <>
        {draft.presetId === customImmortalPreset.id && <>
          <NumberField id={`${prefix}-custom-adulthood`} label="Recognised Adulthood" value={draft.customRecognisedAdulthoodAge} error={error('customRecognisedAdulthoodAge')} onChange={(value) => update('customRecognisedAdulthoodAge', value)} />
          <NumberField id={`${prefix}-custom-half-life`} label="Maturation Half-Life" value={draft.customMaturationHalfLife} error={error('customMaturationHalfLife')} onChange={(value) => update('customMaturationHalfLife', value)} />
        </>}
        <NumberField id={`${prefix}-natural-current-age`} label="Current Age" value={draft.naturalCurrentAge} error={error('naturalCurrentAge')}
          hint={selectedPreset?.family === 'NATURALLY_IMMORTAL' ? `Bureau defaults: adult at ${selectedPreset.recognisedAdulthoodAge}; ${selectedPreset.maturationHalfLife}-year half-life.` : undefined}
          onChange={(value) => update('naturalCurrentAge', value)} />
      </>}

      {family === 'MANIFESTED' && <>
        {draft.presetId === customImmortalPreset.id && <NumberField id={`${prefix}-custom-half-life`} label="Maturation Half-Life" value={draft.customMaturationHalfLife} error={error('customMaturationHalfLife')} onChange={(value) => update('customMaturationHalfLife', value)} />}
        <NumberField id={`${prefix}-manifestation-years`} label="Years Since Manifestation" value={draft.yearsSinceManifestation} error={error('yearsSinceManifestation')} hint="Created mature at a fixed human-equivalent maturity of 25." onChange={(value) => update('yearsSinceManifestation', value)} />
      </>}

      {family === 'TRANSFERRED_CYCLICAL' && <>
        {draft.presetId === customImmortalPreset.id && <div className="field-group"><label htmlFor={`${prefix}-transferred-subtype`}>Transferred Classification</label>
          <select id={`${prefix}-transferred-subtype`} value={draft.customTransferredSubtype} onChange={(event) => update('customTransferredSubtype', event.currentTarget.value as FbiApplicantDraft['customTransferredSubtype'])}>
            <option value="REINCARNATING">Reincarnating</option><option value="POSSESSING">Possessing</option>
          </select></div>}
        <SpeciesField id={`${prefix}-current-form-species`} label={subtype === 'POSSESSING' ? 'Current Host Species' : 'Current Form Species'} value={draft.currentFormSpeciesId} error={error('currentFormSpeciesId')} availableSpecies={availableSpecies} onChange={(value) => update('currentFormSpeciesId', value)} />
        <NumberField id={`${prefix}-current-form-age`} label={subtype === 'POSSESSING' ? 'Current Host Age' : 'Current Form Age'} value={draft.currentFormAge} error={error('currentFormAge')} onChange={(value) => update('currentFormAge', value)} />
        {subtype === 'REINCARNATING' ? <>
          <div className="field-group"><label htmlFor={`${prefix}-memories-retained`}>Memory Continuity</label>
            <select id={`${prefix}-memories-retained`} value={draft.memoriesRetained ? 'yes' : 'no'} onChange={(event) => update('memoriesRetained', event.currentTarget.value === 'yes')}>
              <option value="yes">Memories retained</option><option value="no">Memories not retained</option>
            </select></div>
          {draft.memoriesRetained && <NumberField id={`${prefix}-remembered-previous-experience`} label="Remembered Previous Adult Experience" value={draft.rememberedPreviousAdultExperience} error={error('rememberedPreviousAdultExperience')} onChange={(value) => update('rememberedPreviousAdultExperience', value)} />}
        </> : <NumberField id={`${prefix}-remembered-conscious-experience`} label="Remembered Conscious Experience" value={draft.rememberedConsciousExperience} error={error('rememberedConsciousExperience')} hint="Host years before possession are not added automatically." onChange={(value) => update('rememberedConsciousExperience', value)} />}
      </>}
    </>}
    <FieldError id={`${prefix}-form-error`} error={error('form')} />
    {resolution.valid && <RecordPreview label={label} applicant={resolution.applicant} />}
  </fieldset>
}

export function ImmortalAffairs({ availableSpecies = builtInSpecies }: { availableSpecies?: readonly Species[] }) {
  const [applicantA, setApplicantA] = useState(() => createDefaultFbiApplicantDraft('A'))
  const [applicantB, setApplicantB] = useState(() => createDefaultFbiApplicantDraft('B'))
  const [review, setReview] = useState<FbiComparisonResult | null>(null)
  const a = resolveFbiApplicantDraft(applicantA, availableSpecies)
  const b = resolveFbiApplicantDraft(applicantB, availableSpecies)
  const updateApplicantA = (draft: FbiApplicantDraft) => { setApplicantA(draft); setReview(null) }
  const updateApplicantB = (draft: FbiApplicantDraft) => { setApplicantB(draft); setReview(null) }
  const openReview = () => {
    if (a.valid && b.valid) setReview(compareFbiApplicants(a.applicant, b.applicant))
  }
  const status = (resolution: typeof a) => resolution.valid
    ? resolution.applicant.record.adultComparisonEligible ? 'Ready' : 'Recorded · adult comparison ineligible'
    : 'Requires attention'
  return <section className="information-section immortal-affairs-section" id="immortal-affairs" aria-labelledby="immortal-affairs-title">
    <ThemeOrnament location="information" />
    <header className="information-header"><p className="agency-identity"><strong>FBI</strong><span>Fantasy Bureau of Immortality</span></p>
      <p className="eyebrow dark">Immortal lifecycle jurisdiction</p><h1 id="immortal-affairs-title">Immortal Affairs</h1>
      <p className="immortal-affairs-motto">When mortality stops applying, jurisdiction begins.</p></header>
    <aside className="immortal-jurisdiction-notice"><strong>FBI jurisdiction</strong><p>
      Configure two mortal or immortal records for adult-lifecycle review. This intake establishes facts and eligibility only; no compatibility ruling is issued at this desk.
    </p></aside>
    <div className="fbi-intake-layout">
      <FbiApplicantIntakeCard label="A" draft={applicantA} availableSpecies={availableSpecies} onChange={updateApplicantA} />
      <FbiApplicantIntakeCard label="B" draft={applicantB} availableSpecies={availableSpecies} onChange={updateApplicantB} />
    </div>
    <section className="fbi-readiness" aria-labelledby="fbi-readiness-title" aria-live="polite">
      <p className="record-reference">Ready for FBI review</p><h2 id="fbi-readiness-title">Applicant Record Status</h2><dl>
        <div><dt>Applicant A</dt><dd>{status(a)}</dd></div>
        <div><dt>Applicant B</dt><dd>{status(b)}</dd></div>
      </dl>{a.valid && b.valid && <p>Both records are configured and ready for factual FBI comparison.</p>}
    </section>
    <div className="fbi-review-action"><button type="button" disabled={!a.valid || !b.valid} onClick={openReview}>Open FBI Review</button>
      <small>This review compares factual maturity and adult experience without issuing an overall score.</small></div>
    {review && <FbiReview result={review} />}
    <details className="immortal-preset-catalogue"><summary>View recognised FBI classification catalogue</summary>
      <header><p className="eyebrow dark">Immortal classification</p><h2>Recognised Filing Presets</h2>
        <p>Lifecycle parameters are Bureau defaults for this tool, not claims about any particular setting.</p></header>
      <div className="immortal-preset-grid">{immortalPresets.map((preset) => <article key={preset.id} data-immortal-preset-id={preset.id}>
        <p className="record-reference">{preset.family.replaceAll('_', ' ')}</p><h3>{preset.name}</h3><p>{presetParameters(preset)}</p>
      </article>)}<article className="custom-immortal-preset" data-immortal-preset-id={customImmortalPreset.id}>
        <p className="record-reference">Family-bound custom filing</p><h3>{customImmortalPreset.name}</h3>
        <p>Choose one recognised lifecycle family; only that family&apos;s approved fields and fixed ceiling apply.</p>
      </article></div>
    </details>
  </section>
}
