export interface Species {
  id: string
  name: string
  adulthoodAge: number
  typicalLifespan: number
  source: 'builtin' | 'custom'
  description?: string
}

export const species = [
  { id: 'human', name: 'Human', adulthoodAge: 18, typicalLifespan: 84, source: 'builtin' },
  { id: 'elf', name: 'Elf', adulthoodAge: 100, typicalLifespan: 750, source: 'builtin' },
  { id: 'dwarf', name: 'Dwarf', adulthoodAge: 40, typicalLifespan: 300, source: 'builtin' },
  { id: 'halfling', name: 'Halfling', adulthoodAge: 33, typicalLifespan: 110, source: 'builtin' },
  { id: 'orc', name: 'Orc', adulthoodAge: 16, typicalLifespan: 70, source: 'builtin' },
  { id: 'gnome', name: 'Gnome', adulthoodAge: 40, typicalLifespan: 350, source: 'builtin' },
  { id: 'dragonborn', name: 'Dragonborn', adulthoodAge: 15, typicalLifespan: 80, source: 'builtin' },
  { id: 'goblin', name: 'Goblin', adulthoodAge: 12, typicalLifespan: 60, source: 'builtin' },
  { id: 'dragon', name: 'Dragon', adulthoodAge: 100, typicalLifespan: 1500, source: 'builtin' },
  {
    id: 'half-elf', name: 'Half-Elf', adulthoodAge: 20, typicalLifespan: 180, source: 'builtin',
    description: 'Mixed-heritage lifecycle records whose human and elven expectations rarely share a filing schedule.',
  },
  {
    id: 'half-orc', name: 'Half-Orc', adulthoodAge: 16, typicalLifespan: 75, source: 'builtin',
    description: 'Mixed-heritage applicants whose lifecycle declarations are reviewed on their own stated terms.',
  },
  {
    id: 'fae', name: 'Fae', adulthoodAge: 50, typicalLifespan: 500, source: 'builtin',
    description: 'Long-lived enchanted people whose calendar records often include clauses about seasonal timekeeping.',
  },
  {
    id: 'fairy', name: 'Fairy', adulthoodAge: 18, typicalLifespan: 250, source: 'builtin',
    description: 'Enchanted people with compact records, long timelines, and unusually decorative official seals.',
  },
  {
    id: 'pixie', name: 'Pixie', adulthoodAge: 12, typicalLifespan: 120, source: 'builtin',
    description: 'Small enchanted people whose registry forms are frequently returned with additional sparkles.',
  },
  {
    id: 'giant', name: 'Giant', adulthoodAge: 40, typicalLifespan: 350, source: 'builtin',
    description: 'The Bureau maintains reinforced shelving for Giant lifecycle documentation.',
  },
  {
    id: 'troll', name: 'Troll', adulthoodAge: 18, typicalLifespan: 140, source: 'builtin',
    description: 'Resilient people whose lifecycle records tend to survive conditions that do not favour paperwork.',
  },
  {
    id: 'ogre', name: 'Ogre', adulthoodAge: 16, typicalLifespan: 95, source: 'builtin',
    description: 'Robust applicants for whom the Bureau provides forms with generous writing space.',
  },
  {
    id: 'kobold', name: 'Kobold', adulthoodAge: 10, typicalLifespan: 60, source: 'builtin',
    description: 'Quick-maturing people whose records office excels at fitting archives into improbable spaces.',
  },
  {
    id: 'centaur', name: 'Centaur', adulthoodAge: 18, typicalLifespan: 100, source: 'builtin',
    description: 'Centaur lifecycle filings require ordinary arithmetic and above-average desk clearance.',
  },
  {
    id: 'satyr', name: 'Satyr', adulthoodAge: 18, typicalLifespan: 120, source: 'builtin',
    description: 'Longer-lived pastoral people whose registry appointments rarely conclude without refreshments.',
  },
  {
    id: 'minotaur', name: 'Minotaur', adulthoodAge: 18, typicalLifespan: 120, source: 'builtin',
    description: 'Methodical people whose records are impeccably indexed despite the archive layout.',
  },
  {
    id: 'merfolk', name: 'Merfolk', adulthoodAge: 20, typicalLifespan: 160, source: 'builtin',
    description: 'Aquatic people whose lifecycle records arrive through the Bureau’s waterproof correspondence office.',
  },
  {
    id: 'harpy', name: 'Harpy', adulthoodAge: 16, typicalLifespan: 90, source: 'builtin',
    description: 'Aerial people whose filings routinely reach the upper shelves without clerical assistance.',
  },
  {
    id: 'dryad', name: 'Dryad', adulthoodAge: 40, typicalLifespan: 500, source: 'builtin',
    description: 'Long-lived woodland people whose age declarations may reference both birthdays and growing seasons.',
  },
  {
    id: 'nymph', name: 'Nymph', adulthoodAge: 30, typicalLifespan: 400, source: 'builtin',
    description: 'Long-lived enchanted people whose records are organised by spring, grove, and administrative district.',
  },
  {
    id: 'kitsune', name: 'Kitsune', adulthoodAge: 20, typicalLifespan: 500, source: 'builtin',
    description: 'Long-lived shapeshifters whose lifecycle records are frequently complicated by aliases.',
  },
  {
    id: 'oni', name: 'Oni', adulthoodAge: 25, typicalLifespan: 300, source: 'builtin',
    description: 'Long-lived people whose formal age declarations receive appropriately substantial seals.',
  },
  {
    id: 'djinn', name: 'Djinn', adulthoodAge: 80, typicalLifespan: 1000, source: 'builtin',
    description: 'Exceptionally long-lived beings for whom several human generations may constitute a modest interval.',
  },
  {
    id: 'gargoyle', name: 'Gargoyle', adulthoodAge: 30, typicalLifespan: 450, source: 'builtin',
    description: 'Long-lived stone people whose patient approach to queues is admired throughout the Bureau.',
  },
  {
    id: 'sphinx', name: 'Sphinx', adulthoodAge: 40, typicalLifespan: 600, source: 'builtin',
    description: 'Ancient-minded people whose application questions are often answered with additional questions.',
  },
] as const satisfies readonly Species[]

export type SpeciesId = (typeof species)[number]['id']
export type CustomSpeciesId = `custom-${number}`
export type SpeciesReferenceId = SpeciesId | CustomSpeciesId

export interface CustomSpecies extends Species {
  id: CustomSpeciesId
  source: 'custom'
}
