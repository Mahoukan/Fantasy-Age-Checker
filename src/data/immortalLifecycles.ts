import type { ImmortalLifecycleFamily } from '../types/immortal'

export interface ImmortalLifecycleFamilyRecord {
  id: ImmortalLifecycleFamily
  name: string
  description: string
  filingCode: string
}

export const immortalLifecycleFamilies = [
  {
    id: 'ACQUIRED',
    name: 'Acquired Immortality',
    description: 'An existing mortal lifecycle altered by transformation.',
    filingCode: 'ORIGIN RECORD REQUIRED',
  },
  {
    id: 'NATURALLY_IMMORTAL',
    name: 'Naturally Immortal',
    description: 'A being born into an indefinite lifecycle.',
    filingCode: 'INDEFINITE LIFECYCLE',
  },
  {
    id: 'MANIFESTED',
    name: 'Created / Manifested',
    description: 'A being that enters existence already mature or partially mature.',
    filingCode: 'MANIFESTATION RECORD',
  },
  {
    id: 'TRANSFERRED_CYCLICAL',
    name: 'Transferred / Cyclical Existence',
    description: 'A continuing consciousness whose current body and accumulated experience may differ.',
    filingCode: 'DUAL RECORD REVIEW',
  },
] as const satisfies readonly ImmortalLifecycleFamilyRecord[]

