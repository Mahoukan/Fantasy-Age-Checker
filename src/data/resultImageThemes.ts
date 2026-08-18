export const resultImageThemeIds = [
  'bureau-classic',
  'royal-decree',
  'elven-archive',
  'dwarven-registry',
  'goblin-administration',
  'arcane-terminal',
  'fae-court',
  'dragon-archive',
  'celestial-tribunal',
  'obsidian-records',
] as const

export type ResultImageThemeId = (typeof resultImageThemeIds)[number]

export interface ResultImageThemePalette {
  background: string
  frame: string
  paper: string
  panel: string
  panelAlt: string
  ink: string
  muted: string
  accent: string
  accentAlt: string
  annotation: string
  annotationInk: string
}

export interface ResultImageTheme {
  id: ResultImageThemeId
  name: string
  description: string
  palette: ResultImageThemePalette
  displayFont: string
  bodyFont: string
  cornerRadius: number
  annotationLabel: string
}

const serif = 'Georgia, Times New Roman, serif'
const sans = 'Arial, Helvetica, sans-serif'

export const resultImageThemes: readonly ResultImageTheme[] = [
  {
    id: 'bureau-classic',
    name: 'Bureau Classic',
    description: 'The standard issue of the Arcane Relationship Bureau.',
    palette: {
      background: '#241f1a', frame: '#d8c496', paper: '#efe2bf', panel: '#f8efd9',
      panelAlt: '#f4ead1', ink: '#30271f', muted: '#55483a', accent: '#7a2730',
      accentAlt: '#bda874', annotation: '#ead9c3', annotationInk: '#493930',
    },
    displayFont: serif, bodyFont: sans, cornerRadius: 13, annotationLabel: 'OFFICIAL ANNOTATION',
  },
  {
    id: 'royal-decree',
    name: 'Royal Decree',
    description: 'For rulings requiring unnecessary levels of ceremony.',
    palette: {
      background: '#24152f', frame: '#d4aa45', paper: '#fff2cf', panel: '#f7e4b5',
      panelAlt: '#f1d99a', ink: '#321d35', muted: '#684866', accent: '#6e2148',
      accentAlt: '#bd8c25', annotation: '#ead19b', annotationInk: '#4b2340',
    },
    displayFont: serif, bodyFont: sans, cornerRadius: 5, annotationLabel: 'COURT ANNOTATION',
  },
  {
    id: 'elven-archive',
    name: 'Elven Archive',
    description: 'Filed with elegance, precision, and several centuries of patience.',
    palette: {
      background: '#132923', frame: '#8fae78', paper: '#edf0d8', panel: '#e2e9ce',
      panelAlt: '#d7e2c4', ink: '#20342c', muted: '#50685a', accent: '#38634e',
      accentAlt: '#b29a52', annotation: '#d3dfc1', annotationInk: '#294737',
    },
    displayFont: serif, bodyFont: sans, cornerRadius: 18, annotationLabel: 'ARCHIVAL MARGINALIA',
  },
  {
    id: 'dwarven-registry',
    name: 'Dwarven Registry',
    description: 'Hammered into the permanent register with procedural certainty.',
    palette: {
      background: '#211d1a', frame: '#9a6d3d', paper: '#d9c4a2', panel: '#ccb18b',
      panelAlt: '#c2a57c', ink: '#2b2520', muted: '#5f4d3d', accent: '#713b2d',
      accentAlt: '#8d6335', annotation: '#b99a70', annotationInk: '#382b23',
    },
    displayFont: serif, bodyFont: sans, cornerRadius: 0, annotationLabel: 'REGISTRY COMMENT',
  },
  {
    id: 'goblin-administration',
    name: 'Goblin Administration',
    description: 'Filed, checked, misplaced, and enthusiastically re-filed.',
    palette: {
      background: '#252719', frame: '#b6a32e', paper: '#e8e3b8', panel: '#d8d49e',
      panelAlt: '#c9cb91', ink: '#2d301f', muted: '#5b623d', accent: '#6c6d20',
      accentAlt: '#9b6d2c', annotation: '#c8c88d', annotationInk: '#34391f',
    },
    displayFont: serif, bodyFont: sans, cornerRadius: 7, annotationLabel: 'RE-FILED NOTE',
  },
  {
    id: 'arcane-terminal',
    name: 'Arcane Terminal',
    description: 'A luminous systems record from the Bureau thaumaturgical mainframe.',
    palette: {
      background: '#07131a', frame: '#1d9aa3', paper: '#0b2028', panel: '#102d35',
      panelAlt: '#0d2730', ink: '#d5fff2', muted: '#84cfc2', accent: '#50e3c2',
      accentAlt: '#287d87', annotation: '#123a40', annotationInk: '#c4fff0',
    },
    displayFont: 'Consolas, Courier New, monospace', bodyFont: 'Consolas, Courier New, monospace',
    cornerRadius: 2, annotationLabel: 'COMMENTARY >',
  },
  {
    id: 'fae-court',
    name: 'Fae Court',
    description: 'A formal court filing with an entirely reasonable amount of enchantment.',
    palette: {
      background: '#25162d', frame: '#c8a65b', paper: '#f0e3ed', panel: '#e8d3e5',
      panelAlt: '#dfc7df', ink: '#35223b', muted: '#6e526f', accent: '#74436f',
      accentAlt: '#b68b43', annotation: '#dcc3da', annotationInk: '#4d3151',
    },
    displayFont: serif, bodyFont: sans, cornerRadius: 22, annotationLabel: 'COURT MARGINALIA',
  },
  {
    id: 'dragon-archive',
    name: 'Dragon Archive',
    description: 'A treasury-grade record intended to survive several historical eras.',
    palette: {
      background: '#1d1512', frame: '#b78a39', paper: '#d8c49b', panel: '#cdb484',
      panelAlt: '#bea372', ink: '#2a1c18', muted: '#62473a', accent: '#762d25',
      accentAlt: '#9e7132', annotation: '#bca06f', annotationInk: '#3d241f',
    },
    displayFont: serif, bodyFont: sans, cornerRadius: 4, annotationLabel: 'ARCHIVE INSCRIPTION',
  },
  {
    id: 'celestial-tribunal',
    name: 'Celestial Tribunal',
    description: 'An astral judgment entered beneath the impartial gaze of the heavens.',
    palette: {
      background: '#11162d', frame: '#d3bd72', paper: '#e8e8f2', panel: '#dcddeb',
      panelAlt: '#d1d4e6', ink: '#252944', muted: '#596080', accent: '#4a568f',
      accentAlt: '#b69a45', annotation: '#cfd2e6', annotationInk: '#303759',
    },
    displayFont: serif, bodyFont: sans, cornerRadius: 16, annotationLabel: 'TRIBUNAL NOTATION',
  },
  {
    id: 'obsidian-records',
    name: 'Obsidian Records',
    description: 'A severe high-contrast filing for rulings with nothing left to prove.',
    palette: {
      background: '#050607', frame: '#787d82', paper: '#16191c', panel: '#202428',
      panelAlt: '#1b1f22', ink: '#f2f0e8', muted: '#b8b8b1', accent: '#d6b76f',
      accentAlt: '#555d64', annotation: '#292e32', annotationInk: '#f3ead6',
    },
    displayFont: serif, bodyFont: sans, cornerRadius: 0, annotationLabel: 'RECORD NOTE',
  },
]

export const DEFAULT_RESULT_IMAGE_THEME_ID: ResultImageThemeId = 'bureau-classic'

export function getResultImageTheme(id: ResultImageThemeId): ResultImageTheme {
  return resultImageThemes.find((theme) => theme.id === id) ?? resultImageThemes[0]
}
