import type { Species } from '../data/species'

const BUILT_IN_SPECIES_CODES: Readonly<Record<string, string>> = {
  human: 'HUM',
  elf: 'ELF',
  dwarf: 'DWF',
  halfling: 'HLF',
  orc: 'ORC',
  gnome: 'GNM',
  dragonborn: 'DRB',
  goblin: 'GBL',
  dragon: 'DRG',
  'half-elf': 'HLE',
  'half-orc': 'HLO',
  fae: 'FAE',
  fairy: 'FRY',
  pixie: 'PIX',
  giant: 'GNT',
  troll: 'TRL',
  ogre: 'OGR',
  kobold: 'KOB',
  centaur: 'CEN',
  satyr: 'SAT',
  minotaur: 'MIN',
  merfolk: 'MER',
  harpy: 'HRP',
  dryad: 'DRY',
  nymph: 'NYM',
  kitsune: 'KIT',
  oni: 'ONI',
  djinn: 'DJI',
  gargoyle: 'GAR',
  sphinx: 'SPH',
}

export function getSpeciesCaseCode(species: Species): string {
  if (species.source === 'custom') return 'CUS'
  return BUILT_IN_SPECIES_CODES[species.id] ?? 'UNK'
}

export function generateCaseNumber(
  applicantA: Species,
  applicantB: Species,
  random: () => number = Math.random,
): string {
  const normalizedRandom = Math.min(Math.max(random(), 0), 0.9999999999999999)
  const serial = Math.floor(normalizedRandom * 1_000_000).toString().padStart(6, '0')
  return `ARB-${getSpeciesCaseCode(applicantA)}-${getSpeciesCaseCode(applicantB)}-${serial}`
}
