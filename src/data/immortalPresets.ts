import type { ImmortalPreset } from '../types/immortalPresets'

export const immortalPresets = [
  { id: 'vampire', name: 'Vampire', family: 'ACQUIRED', requiresOriginSpecies: true, maturationMode: 'FROZEN' },
  { id: 'lich', name: 'Lich', family: 'ACQUIRED', requiresOriginSpecies: true, maturationMode: 'FROZEN' },
  { id: 'ageless-cursed-immortal', name: 'Ageless / Cursed Immortal', family: 'ACQUIRED', requiresOriginSpecies: true, maturationMode: 'FROZEN' },
  { id: 'ascended-immortal', name: 'Ascended Immortal', family: 'ACQUIRED', requiresOriginSpecies: true, maturationMode: 'CONTINUING', maturationHalfLife: 1000 },
  { id: 'angel', name: 'Angel', family: 'NATURALLY_IMMORTAL', recognisedAdulthoodAge: 100, maturationHalfLife: 500 },
  { id: 'demon', name: 'Demon', family: 'NATURALLY_IMMORTAL', recognisedAdulthoodAge: 100, maturationHalfLife: 750 },
  { id: 'god-divine-being', name: 'God / Divine Being', family: 'NATURALLY_IMMORTAL', recognisedAdulthoodAge: 250, maturationHalfLife: 2000 },
  { id: 'primordial', name: 'Primordial', family: 'NATURALLY_IMMORTAL', recognisedAdulthoodAge: 1000, maturationHalfLife: 10000 },
  { id: 'manifested-being', name: 'Manifested Being', family: 'MANIFESTED', createdMature: true, maturationHalfLife: 1000 },
  { id: 'reincarnating-being', name: 'Reincarnating Being', family: 'TRANSFERRED_CYCLICAL', subtype: 'REINCARNATING' },
  { id: 'possessing-spirit', name: 'Possessing Spirit', family: 'TRANSFERRED_CYCLICAL', subtype: 'POSSESSING' },
] as const satisfies readonly ImmortalPreset[]

export const customImmortalPreset = {
  id: 'custom-immortal',
  name: 'Custom Immortal',
  supportedFamilies: ['ACQUIRED', 'NATURALLY_IMMORTAL', 'MANIFESTED', 'TRANSFERRED_CYCLICAL'],
} as const

export function findImmortalPreset(id: string): ImmortalPreset | undefined {
  return immortalPresets.find((preset) => preset.id === id)
}

