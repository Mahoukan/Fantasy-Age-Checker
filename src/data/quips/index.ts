import type { Quip, QuipSlot } from '../../types/quip'
import { administrativeQuips } from './administrativeQuips'
import { experienceQuips } from './experienceQuips'
import { maturityQuips } from './maturityQuips'
import { loadingQuips } from './loadingQuips'
import { longevityQuips } from './longevityQuips'
import { expandedSpeciesQuips } from './expandedSpeciesQuips'

export {
  administrativeQuips,
  expandedSpeciesQuips,
  experienceQuips,
  loadingQuips,
  longevityQuips,
  maturityQuips,
}

export const allQuips: readonly Quip[] = [
  ...maturityQuips,
  ...experienceQuips,
  ...administrativeQuips,
  ...loadingQuips,
  ...longevityQuips,
  ...expandedSpeciesQuips,
]

export const fallbackQuips: Record<QuipSlot, Quip> = {
  MATURITY: maturityQuips[0],
  EXPERIENCE: experienceQuips[0],
  ADMINISTRATIVE: administrativeQuips[0],
  LOADING: loadingQuips[0],
}
