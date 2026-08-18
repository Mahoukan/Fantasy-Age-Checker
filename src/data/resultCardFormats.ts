export const resultCardFormatIds = ['compact', 'standard', 'full-dossier'] as const

export type ResultCardFormatId = (typeof resultCardFormatIds)[number]

export interface ResultCardFormat {
  id: ResultCardFormatId
  name: string
  description: string
  width: number
  height: number
  density: 'essential' | 'complete' | 'expanded'
}

export const resultCardFormats: readonly ResultCardFormat[] = [
  {
    id: 'compact',
    name: 'Compact',
    description: 'Essential ruling details for quick sharing.',
    width: 1080,
    height: 1080,
    density: 'essential',
  },
  {
    id: 'standard',
    name: 'Standard',
    description: 'The complete Bureau ruling.',
    width: 1080,
    height: 1350,
    density: 'complete',
  },
  {
    id: 'full-dossier',
    name: 'Full Dossier',
    description: 'Expanded calculations, lifecycle records, and filing details.',
    width: 1080,
    height: 1920,
    density: 'expanded',
  },
]

export const DEFAULT_RESULT_CARD_FORMAT_ID: ResultCardFormatId = 'standard'

export function getResultCardFormat(id: string): ResultCardFormat {
  return resultCardFormats.find((format) => format.id === id) ?? resultCardFormats[1]
}
