import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { FbiApplicantIntakeCard } from './components/ImmortalAffairs'
import { species } from './data/species'
import { createDefaultFbiApplicantDraft } from './utils/fbiApplicant'

describe('Stage 24 FBI applicant intake', () => {
  it('shows only the fields belonging to representative acquired and natural presets', () => {
    const base = createDefaultFbiApplicantDraft('B')
    const vampire = renderToStaticMarkup(
      <FbiApplicantIntakeCard
        label="A"
        draft={{ ...base, presetId: 'vampire' }}
        availableSpecies={species}
        onChange={() => undefined}
      />,
    )
    const angel = renderToStaticMarkup(
      <FbiApplicantIntakeCard
        label="B"
        draft={{ ...base, presetId: 'angel' }}
        availableSpecies={species}
        onChange={() => undefined}
      />,
    )

    expect(vampire).toContain('Origin Species')
    expect(vampire).toContain('Age at Transformation')
    expect(vampire).toContain('Years Since Transformation')
    expect(vampire).not.toContain('Recognised Adulthood')
    expect(vampire).not.toContain('Maturation Half-Life')

    expect(angel).toContain('Current Age')
    expect(angel).toContain('Bureau defaults: adult at 100; 500-year half-life.')
    expect(angel).not.toContain('Origin Species')
    expect(angel).not.toContain('Age at Transformation')
  })
})

