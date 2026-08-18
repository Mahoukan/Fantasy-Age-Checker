import type { ExperienceCategory } from '../utils/experience'
import type { MaturityCategory } from '../utils/maturity'
import type { LongevityCategory } from '../utils/longevity'

export const maturityVerdicts: Record<MaturityCategory, { label: string; description: string }> = {
  EXCELLENT: {
    label: 'Remarkably Well Matched',
    description: 'Both applicants occupy very similar stages of their respective lifecycles.',
  },
  GOOD: {
    label: 'Well Matched',
    description: 'The applicants fall comfortably within recognised maturity bounds.',
  },
  BORDERLINE: {
    label: 'Within Accepted Bounds',
    description: 'The Bureau finds this pairing acceptable, though the maturity gap is noticeable.',
  },
  INCOMPATIBLE: {
    label: 'Maturity Mismatch',
    description: "The applicants fall outside the Bureau's recognised maturity compatibility range.",
  },
}

export const experienceVerdicts: Record<ExperienceCategory, { label: string; description: string }> = {
  BASICALLY_PEERS: {
    label: 'Basically Peers',
    description: 'The applicants have accumulated broadly similar amounts of adult life experience.',
  },
  NOTICEABLE: {
    label: 'Noticeable',
    description: 'There is a noticeable difference in adult experience, but both applicants remain relatively close.',
  },
  CONSIDERABLE: {
    label: 'Considerable',
    description: 'One applicant has accumulated substantially more adult life experience than the other.',
  },
  FORMIDABLE: {
    label: 'Formidable',
    description: 'The difference in adult life experience is substantial and likely represents very different amounts of lived history.',
  },
  HISTORICAL: {
    label: 'Historical Documentary Territory',
    description: 'One applicant has accumulated centuries or generations more adult experience than the other.',
  },
  CIVILIZATIONS: {
    label: 'Civilisations Have Risen and Fallen',
    description: 'The experience gap spans enough time for entire eras to have come and gone.',
  },
}

export const longevityLabels: Record<LongevityCategory, string> = {
  NORMAL: 'Within Typical Lifespan',
  EXCEPTIONAL: 'Exceptionally Old',
  ANCIENT: 'Ancient',
  LEGENDARY: 'Legendary Longevity',
  ANOMALOUS: 'Chronological Anomaly',
}
