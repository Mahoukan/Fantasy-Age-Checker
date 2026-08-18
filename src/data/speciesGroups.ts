import type { SpeciesId } from './species'

export interface SpeciesDisplayGroup {
  id: string
  label: string
  speciesIds: readonly SpeciesId[]
}

/** Presentation-only groupings; lifecycle calculations continue to use the canonical registry. */
export const speciesDisplayGroups = [
  {
    id: 'common',
    label: 'Common Peoples',
    speciesIds: ['human', 'elf', 'half-elf', 'dwarf', 'halfling', 'orc', 'half-orc', 'gnome', 'goblin', 'dragonborn'],
  },
  {
    id: 'fey',
    label: 'Fey & Enchanted',
    speciesIds: ['fae', 'fairy', 'pixie', 'dryad', 'nymph'],
  },
  {
    id: 'mythic',
    label: 'Beastfolk & Mythic Peoples',
    speciesIds: ['centaur', 'satyr', 'minotaur', 'merfolk', 'harpy', 'kitsune'],
  },
  {
    id: 'monstrous',
    label: 'Giants & Monstrous Peoples',
    speciesIds: ['giant', 'troll', 'ogre', 'kobold', 'oni', 'gargoyle'],
  },
  {
    id: 'ancient',
    label: 'Ancient Peoples',
    speciesIds: ['dragon', 'djinn', 'sphinx'],
  },
] as const satisfies readonly SpeciesDisplayGroup[]
