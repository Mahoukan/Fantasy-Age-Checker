import { useEffect, useRef, useState, type FormEvent } from 'react'
import type { CustomSpecies, Species } from '../data/species'
import {
  createCustomSpecies,
  type CustomSpeciesDraft,
  type CustomSpeciesErrors,
} from '../utils/customSpecies'

interface CustomSpeciesDialogProps {
  isOpen: boolean
  availableSpecies: readonly Species[]
  onRegister: (species: CustomSpecies) => void
  onClose: () => void
}

const emptyDraft: CustomSpeciesDraft = {
  name: '',
  adulthoodAge: '',
  typicalLifespan: '',
}

export function CustomSpeciesDialog({
  isOpen,
  availableSpecies,
  onRegister,
  onClose,
}: CustomSpeciesDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const [draft, setDraft] = useState<CustomSpeciesDraft>(emptyDraft)
  const [errors, setErrors] = useState<CustomSpeciesErrors>({})

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return
    if (isOpen && !dialog.open) dialog.showModal()
    if (!isOpen && dialog.open) dialog.close()
  }, [isOpen])

  function handleClosed() {
    setDraft(emptyDraft)
    setErrors({})
    onClose()
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const result = createCustomSpecies(draft, availableSpecies)
    if (!result.success) {
      setErrors(result.errors)
      return
    }
    onRegister(result.species)
  }

  function updateNumber(field: 'adulthoodAge' | 'typicalLifespan', value: string, valueAsNumber: number) {
    setDraft((current) => ({
      ...current,
      [field]: value === '' || Number.isNaN(valueAsNumber) ? '' : valueAsNumber,
    }))
    setErrors((current) => ({ ...current, [field]: undefined }))
  }

  return (
    <dialog
      className="custom-species-dialog"
      ref={dialogRef}
      aria-labelledby="custom-species-title"
      aria-describedby="custom-species-description"
      onCancel={(event) => {
        event.preventDefault()
        dialogRef.current?.close()
      }}
      onClose={handleClosed}
    >
      <form onSubmit={handleSubmit} noValidate>
        <p className="eyebrow dark">Temporary registry form</p>
        <h2 id="custom-species-title">Register Temporary Species</h2>
        <p id="custom-species-description" className="dialog-description">
          Provide the lifecycle figures required for this consultation. Temporary registrations are forgotten when the Bureau closes.
        </p>

        <div className="field-group">
          <label htmlFor="custom-species-name">Species name</label>
          <input
            id="custom-species-name"
            type="text"
            value={draft.name}
            maxLength={40}
            autoFocus
            aria-invalid={Boolean(errors.name)}
            aria-describedby={errors.name ? 'custom-species-name-error' : undefined}
            onChange={(event) => {
              setDraft((current) => ({ ...current, name: event.target.value }))
              setErrors((current) => ({ ...current, name: undefined }))
            }}
          />
          {errors.name && <p className="field-error" id="custom-species-name-error" role="alert">{errors.name}</p>}
        </div>

        <div className="dialog-number-grid">
          <div className="field-group">
            <label htmlFor="custom-species-adulthood">Recognised adulthood</label>
            <div className="input-with-unit">
              <input
                id="custom-species-adulthood"
                type="number"
                inputMode="decimal"
                step="any"
                value={draft.adulthoodAge}
                aria-invalid={Boolean(errors.adulthoodAge)}
                aria-describedby={errors.adulthoodAge ? 'custom-species-adulthood-error' : undefined}
                onChange={(event) => updateNumber(
                  'adulthoodAge',
                  event.currentTarget.value,
                  event.currentTarget.valueAsNumber,
                )}
              />
              <span>years</span>
            </div>
            {errors.adulthoodAge && (
              <p className="field-error" id="custom-species-adulthood-error" role="alert">{errors.adulthoodAge}</p>
            )}
          </div>

          <div className="field-group">
            <label htmlFor="custom-species-lifespan">Typical lifespan</label>
            <div className="input-with-unit">
              <input
                id="custom-species-lifespan"
                type="number"
                inputMode="decimal"
                step="any"
                value={draft.typicalLifespan}
                aria-invalid={Boolean(errors.typicalLifespan)}
                aria-describedby={errors.typicalLifespan ? 'custom-species-lifespan-error' : undefined}
                onChange={(event) => updateNumber(
                  'typicalLifespan',
                  event.currentTarget.value,
                  event.currentTarget.valueAsNumber,
                )}
              />
              <span>years</span>
            </div>
            {errors.typicalLifespan && (
              <p className="field-error" id="custom-species-lifespan-error" role="alert">{errors.typicalLifespan}</p>
            )}
          </div>
        </div>

        <div className="dialog-actions">
          <button className="primary-dialog-action" type="submit">Register Species</button>
          <button className="secondary-action" type="button" onClick={() => dialogRef.current?.close()}>
            Cancel
          </button>
        </div>
      </form>
    </dialog>
  )
}
