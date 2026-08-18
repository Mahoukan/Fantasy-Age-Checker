import {
  resultImageThemes,
  type ResultImageTheme,
  type ResultImageThemeId,
} from './resultImageThemes'

export interface SiteThemePalette {
  background: string
  backgroundAlt: string
  headerBackground: string
  surface: string
  surfaceRaised: string
  surfaceInset: string
  textPrimary: string
  textSecondary: string
  heading: string
  accent: string
  secondaryAccent: string
  border: string
  borderStrong: string
  focus: string
  positive: string
  warning: string
  danger: string
  inputBackground: string
  inputText: string
  buttonBackground: string
  buttonText: string
  shadow: string
}

export type SiteDecorativeStyle =
  | 'bureau'
  | 'heraldic'
  | 'archival'
  | 'angular'
  | 'stamped'
  | 'terminal'
  | 'flourish'
  | 'scaled'
  | 'celestial'
  | 'minimal'

export type SitePresentationStyle =
  | 'document'
  | 'ceremonial'
  | 'folio'
  | 'engineered'
  | 'filing'
  | 'system'
  | 'court'
  | 'vault'
  | 'tribunal'
  | 'editorial'

export interface SiteThemePresentation {
  strategy: SitePresentationStyle
  shellStyle: string
  panelStyle: string
  headingStyle: string
  dividerStyle: string
  labelStyle: string
  controlStyle: string
  sealStyle: string
  consultationStyle: string
  resultStyle: string
  footerStyle: string
  density: 'restrained' | 'standard' | 'decorative'
  panelRadius: string
  panelBorderWidth: string
  panelShadow: string
  headingLetterSpacing: string
  labels: {
    header: string
    hero: string
    checker: string
    applicant: string
    consultation: string
    result: string
    assessment: string
    calculations: string
    information: string
    footer: string
  }
}

export interface SiteThemeConfiguration {
  palette: SiteThemePalette
  headingFont: string
  bodyFont: string
  decorativeStyle: SiteDecorativeStyle
  presentation: SiteThemePresentation
}

export interface WebsiteTheme extends ResultImageTheme {
  site: SiteThemeConfiguration
}

const serif = 'Georgia, "Times New Roman", serif'
const sans = 'Inter, Arial, Helvetica, sans-serif'
const terminal = '"Courier New", Consolas, monospace'

const presentation = (
  strategy: SitePresentationStyle,
  options: Omit<SiteThemePresentation, 'strategy'>,
): SiteThemePresentation => ({ strategy, ...options })

const siteConfigurations: Record<ResultImageThemeId, SiteThemeConfiguration> = {
  'bureau-classic': {
    palette: {
      background: '#171a21', backgroundAlt: '#20242d', headerBackground: '#171a21',
      surface: '#f2e8d5', surfaceRaised: '#fffaf0', surfaceInset: '#e5d7be',
      textPrimary: '#292820', textSecondary: '#5f5a4d', heading: '#713b45',
      accent: '#b9944a', secondaryAccent: '#713b45', border: '#c6b898', borderStrong: '#9f8248',
      focus: '#d19c35', positive: '#52705a', warning: '#9a5e24', danger: '#8b3440',
      inputBackground: '#fffdf8', inputText: '#292820', buttonBackground: '#713b45',
      buttonText: '#fff8e8', shadow: 'rgba(0, 0, 0, 0.28)',
    },
    headingFont: serif, bodyFont: sans, decorativeStyle: 'bureau',
    presentation: presentation('document', {
      shellStyle: 'registered-document', panelStyle: 'ruled-form', headingStyle: 'administrative',
      dividerStyle: 'document-rule', labelStyle: 'status-label', controlStyle: 'official-form',
      sealStyle: 'circular-office', consultationStyle: 'seal-review', resultStyle: 'numbered-record',
      footerStyle: 'filing-line', density: 'standard', panelRadius: '2px', panelBorderWidth: '1px',
      panelShadow: '0 18px 52px rgba(0, 0, 0, 0.28)', headingLetterSpacing: '0.035em',
      labels: { header: 'OFFICE OF TEMPORAL FORMS', hero: 'FORM ARB-17', checker: 'CHRONOLOGICAL REVIEW', applicant: 'OFFICE COPY', consultation: 'REVIEW QUEUE', result: 'FILED', assessment: 'NUMBERED ASSESSMENT', calculations: 'CALCULATION LEDGER', information: 'REFERENCE COPY', footer: 'DOCUMENT CONTROL' },
    }),
  },
  'royal-decree': {
    palette: {
      background: '#28162e', backgroundAlt: '#3a1d38', headerBackground: '#211226',
      surface: '#fff1d2', surfaceRaised: '#fff8e8', surfaceInset: '#ead39e',
      textPrimary: '#321d35', textSecondary: '#60455e', heading: '#6e2148',
      accent: '#b78724', secondaryAccent: '#6e2148', border: '#c9a557', borderStrong: '#9a7020',
      focus: '#e0a92f', positive: '#3f6b51', warning: '#8e541c', danger: '#922f45',
      inputBackground: '#fffaf0', inputText: '#321d35', buttonBackground: '#6e2148',
      buttonText: '#fff5dc', shadow: 'rgba(18, 7, 22, 0.42)',
    },
    headingFont: serif, bodyFont: sans, decorativeStyle: 'heraldic',
    presentation: presentation('ceremonial', {
      shellStyle: 'decree-frame', panelStyle: 'double-rule', headingStyle: 'centered-ceremonial', dividerStyle: 'gold-double-rule', labelStyle: 'ribbon', controlStyle: 'court-petition', sealStyle: 'royal-record', consultationStyle: 'court-clerk', resultStyle: 'decree-ruling', footerStyle: 'court-register', density: 'decorative', panelRadius: '4px', panelBorderWidth: '3px', panelShadow: '0 22px 60px rgba(18, 7, 22, 0.42)', headingLetterSpacing: '0.075em',
      labels: { header: 'CROWN RECORDS OFFICE', hero: 'ENTERED INTO THE ROYAL RECORD', checker: 'PETITION BEFORE THE CROWN', applicant: 'COURT COPY', consultation: 'CLERK REVIEW', result: 'ROYAL RECORD', assessment: 'CEREMONIAL ASSESSMENT', calculations: 'COURT EVIDENCE', information: 'DECREE REGISTER', footer: 'COURT REGISTRY' },
    }),
  },
  'elven-archive': {
    palette: {
      background: '#122820', backgroundAlt: '#1d3a30', headerBackground: '#0e211a',
      surface: '#edf0d8', surfaceRaised: '#f7f5e8', surfaceInset: '#d7e2c4',
      textPrimary: '#20342c', textSecondary: '#4d6658', heading: '#315d49',
      accent: '#a3893f', secondaryAccent: '#38634e', border: '#9cad82', borderStrong: '#768e60',
      focus: '#d0a73c', positive: '#326247', warning: '#8a5c24', danger: '#8f3b46',
      inputBackground: '#fbfbed', inputText: '#20342c', buttonBackground: '#38634e',
      buttonText: '#f5f3dc', shadow: 'rgba(4, 20, 14, 0.38)',
    },
    headingFont: serif, bodyFont: sans, decorativeStyle: 'archival',
    presentation: presentation('folio', {
      shellStyle: 'archive-folio', panelStyle: 'fine-line-entry', headingStyle: 'catalogued', dividerStyle: 'leaf-marker', labelStyle: 'folio-index', controlStyle: 'archive-entry', sealStyle: 'forest-marker', consultationStyle: 'archive-retrieval', resultStyle: 'lifecycle-record', footerStyle: 'folio-reference', density: 'standard', panelRadius: '14px 2px 14px 2px', panelBorderWidth: '1px', panelShadow: '0 20px 56px rgba(4, 20, 14, 0.38)', headingLetterSpacing: '0.045em',
      labels: { header: 'ANCIENT RECORDS CATALOGUE', hero: 'ARCHIVE FOLIO', checker: 'LIFECYCLE RECORD', applicant: 'ARCHIVE ENTRY', consultation: 'RETRIEVING FOLIO', result: 'REFERENCE COPY', assessment: 'CATALOGUED FINDING', calculations: 'ARCHIVE TABLE', information: 'PERMANENT CATALOGUE', footer: 'FOLIO INDEX' },
    }),
  },
  'dwarven-registry': {
    palette: {
      background: '#1d1a18', backgroundAlt: '#2c2722', headerBackground: '#171412',
      surface: '#d9c4a2', surfaceRaised: '#e4d2b3', surfaceInset: '#bda078',
      textPrimary: '#2b2520', textSecondary: '#55473b', heading: '#67392c',
      accent: '#9a6d3d', secondaryAccent: '#713b2d', border: '#99764e', borderStrong: '#69472e',
      focus: '#e1a94d', positive: '#3f674f', warning: '#87501f', danger: '#87323a',
      inputBackground: '#f0dfc1', inputText: '#2b2520', buttonBackground: '#713b2d',
      buttonText: '#f7e4c1', shadow: 'rgba(0, 0, 0, 0.5)',
    },
    headingFont: serif, bodyFont: sans, decorativeStyle: 'angular',
    presentation: presentation('engineered', {
      shellStyle: 'registry-block', panelStyle: 'inset-plate', headingStyle: 'plate-heading', dividerStyle: 'structural-bar', labelStyle: 'serial-plate', controlStyle: 'machined-control', sealStyle: 'stamped-metal', consultationStyle: 'registry-stamp', resultStyle: 'verified-block', footerStyle: 'archive-block', density: 'decorative', panelRadius: '0', panelBorderWidth: '3px', panelShadow: 'inset 0 0 0 2px rgba(255,255,255,.08), 0 22px 54px rgba(0,0,0,.5)', headingLetterSpacing: '0.065em',
      labels: { header: 'CENTRAL ENGINEERING REGISTRY', hero: 'REGISTRY PLATE', checker: 'STAMPED IN TRIPLICATE', applicant: 'SERIAL RECORD', consultation: 'VERIFYING PLATE', result: 'VERIFIED RECORD', assessment: 'INSPECTION BLOCK', calculations: 'MEASUREMENT LEDGER', information: 'ARCHIVE BLOCK', footer: 'PERMANENT REGISTER' },
    }),
  },
  'goblin-administration': {
    palette: {
      background: '#222518', backgroundAlt: '#343823', headerBackground: '#1b1d13',
      surface: '#e8e3b8', surfaceRaised: '#f0ebc9', surfaceInset: '#c9cb91',
      textPrimary: '#2d301f', textSecondary: '#555d39', heading: '#56601d',
      accent: '#9b6d2c', secondaryAccent: '#65701f', border: '#a7a05e', borderStrong: '#786f30',
      focus: '#d79731', positive: '#456429', warning: '#8a4d1f', danger: '#883744',
      inputBackground: '#f8f2cf', inputText: '#2d301f', buttonBackground: '#65701f',
      buttonText: '#fbf2c9', shadow: 'rgba(12, 15, 6, 0.42)',
    },
    headingFont: serif, bodyFont: sans, decorativeStyle: 'stamped',
    presentation: presentation('filing', {
      shellStyle: 'overfiled-folder', panelStyle: 'offset-file', headingStyle: 'clerk-marked', dividerStyle: 'ledger-dash', labelStyle: 'rubber-stamp', controlStyle: 'file-entry', sealStyle: 'checked-again', consultationStyle: 'rechecking-forms', resultStyle: 'refiled-record', footerStyle: 'final-stamp', density: 'decorative', panelRadius: '3px', panelBorderWidth: '2px', panelShadow: '6px 7px 0 rgba(12, 15, 6, .22), 0 18px 45px rgba(12,15,6,.36)', headingLetterSpacing: '0.025em',
      labels: { header: 'PROVISIONAL ADMINISTRATION', hero: 'FORM 8B MISSING', checker: 'FILED / RE-FILED', applicant: 'CLERK COPY', consultation: 'CHECKED AGAIN', result: 'GOOD ENOUGH', assessment: 'SECONDARY FILING MARK', calculations: 'LEDGER SCRATCHWORK', information: 'MAYBE PERMANENT', footer: 'FINAL STAMP' },
    }),
  },
  'arcane-terminal': {
    palette: {
      background: '#061218', backgroundAlt: '#0b2028', headerBackground: '#040e13',
      surface: '#0d2730', surfaceRaised: '#12333b', surfaceInset: '#10252c',
      textPrimary: '#d5fff2', textSecondary: '#9ad7ca', heading: '#63e3c7',
      accent: '#50e3c2', secondaryAccent: '#29aeb4', border: '#287d87', borderStrong: '#50e3c2',
      focus: '#f0cb68', positive: '#77e4ad', warning: '#f0b45f', danger: '#ff8190',
      inputBackground: '#071a20', inputText: '#e3fff7', buttonBackground: '#176f73',
      buttonText: '#e3fff7', shadow: 'rgba(0, 0, 0, 0.58)',
    },
    headingFont: terminal, bodyFont: terminal, decorativeStyle: 'terminal',
    presentation: presentation('system', {
      shellStyle: 'system-shell', panelStyle: 'data-panel', headingStyle: 'command-label', dividerStyle: 'status-bar', labelStyle: 'bracketed', controlStyle: 'query-field', sealStyle: 'status-node', consultationStyle: 'archive-query', resultStyle: 'system-output', footerStyle: 'system-status', density: 'standard', panelRadius: '0', panelBorderWidth: '1px', panelShadow: '0 0 0 1px rgba(80,227,194,.12), 0 20px 58px rgba(0,0,0,.58)', headingLetterSpacing: '0.08em',
      labels: { header: 'SYSTEM :: ARB_MAINFRAME', hero: '> CHRONOLOGICAL_QUERY', checker: '> APPLICANT_RECORDS', applicant: 'DATA_RECORD', consultation: 'QUERYING_ARCHIVES...', result: 'CASE_STATUS :: REVIEWED', assessment: 'ASSESSMENT_NODE', calculations: 'DATA_READOUT', information: 'REFERENCE_DATABASE', footer: 'SYSTEM_STATUS :: ONLINE' },
    }),
  },
  'fae-court': {
    palette: {
      background: '#25162d', backgroundAlt: '#38213f', headerBackground: '#1e1225',
      surface: '#f0e3ed', surfaceRaised: '#faf2f7', surfaceInset: '#dfc7df',
      textPrimary: '#35223b', textSecondary: '#684f69', heading: '#74436f',
      accent: '#b68b43', secondaryAccent: '#74436f', border: '#b99ab5', borderStrong: '#997041',
      focus: '#d99d38', positive: '#436a57', warning: '#8a5425', danger: '#913b56',
      inputBackground: '#fff8fc', inputText: '#35223b', buttonBackground: '#74436f',
      buttonText: '#fff4fb', shadow: 'rgba(18, 6, 23, 0.4)',
    },
    headingFont: serif, bodyFont: sans, decorativeStyle: 'flourish',
    presentation: presentation('court', {
      shellStyle: 'temporal-court', panelStyle: 'asymmetric-petition', headingStyle: 'court-docket', dividerStyle: 'star-flourish', labelStyle: 'side-annotation', controlStyle: 'petition-entry', sealStyle: 'court-marker', consultationStyle: 'docket-processing', resultStyle: 'technical-ruling', footerStyle: 'court-copy', density: 'decorative', panelRadius: '22px 5px 22px 5px', panelBorderWidth: '1px', panelShadow: '0 22px 58px rgba(18,6,23,.4)', headingLetterSpacing: '0.055em',
      labels: { header: 'COURT OF TEMPORAL MATTERS', hero: 'BOUND BY TECHNICALITY', checker: 'PETITION ENTERED', applicant: 'COURT PETITION', consultation: 'DOCKET IN MOTION', result: 'COURT COPY', assessment: 'FINDING OF THE COURT', calculations: 'DOCKET EVIDENCE', information: 'COURT REGISTER', footer: 'TECHNICALLY VALID' },
    }),
  },
  'dragon-archive': {
    palette: {
      background: '#1b1210', backgroundAlt: '#301c18', headerBackground: '#140d0b',
      surface: '#d8c49b', surfaceRaised: '#e5d2aa', surfaceInset: '#bea372',
      textPrimary: '#2a1c18', textSecondary: '#5e4438', heading: '#762d25',
      accent: '#a97831', secondaryAccent: '#762d25', border: '#a8844a', borderStrong: '#784b2d',
      focus: '#e0a640', positive: '#42644c', warning: '#8b4d20', danger: '#8d3038',
      inputBackground: '#eddbb6', inputText: '#2a1c18', buttonBackground: '#762d25',
      buttonText: '#f9e7c2', shadow: 'rgba(5, 1, 0, 0.52)',
    },
    headingFont: serif, bodyFont: sans, decorativeStyle: 'scaled',
    presentation: presentation('vault', {
      shellStyle: 'treasury-vault', panelStyle: 'fortified-record', headingStyle: 'ledger-emblem', dividerStyle: 'scale-band', labelStyle: 'inventory-tag', controlStyle: 'vault-entry', sealStyle: 'archive-medallion', consultationStyle: 'vault-retrieval', resultStyle: 'preserved-holding', footerStyle: 'treasury-ledger', density: 'decorative', panelRadius: '2px', panelBorderWidth: '4px', panelShadow: 'inset 0 0 0 2px rgba(118,45,37,.32), 0 24px 64px rgba(5,1,0,.52)', headingLetterSpacing: '0.06em',
      labels: { header: 'FORTIFIED TREASURY ARCHIVE', hero: 'VAULT RECORD', checker: 'ARCHIVAL HOLDING', applicant: 'INVENTORY RECORD', consultation: 'VAULT RETRIEVAL', result: 'RECORD PRESERVED', assessment: 'TREASURY FINDING', calculations: 'HOLDINGS LEDGER', information: 'VAULT CATALOGUE', footer: 'TREASURY COPY' },
    }),
  },
  'celestial-tribunal': {
    palette: {
      background: '#10162f', backgroundAlt: '#1b2445', headerBackground: '#0b1025',
      surface: '#e8e8f2', surfaceRaised: '#f5f3f8', surfaceInset: '#d1d4e6',
      textPrimary: '#252944', textSecondary: '#555d7b', heading: '#4a568f',
      accent: '#b69a45', secondaryAccent: '#4a568f', border: '#aeb3cf', borderStrong: '#82723e',
      focus: '#dba934', positive: '#3f6856', warning: '#8b5525', danger: '#8e3b50',
      inputBackground: '#fbfbff', inputText: '#252944', buttonBackground: '#4a568f',
      buttonText: '#f8f6ff', shadow: 'rgba(3, 7, 28, 0.42)',
    },
    headingFont: serif, bodyFont: sans, decorativeStyle: 'celestial',
    presentation: presentation('tribunal', {
      shellStyle: 'cosmic-docket', panelStyle: 'balanced-orbit', headingStyle: 'tribunal-heading', dividerStyle: 'star-point', labelStyle: 'coordinate-tag', controlStyle: 'docket-entry', sealStyle: 'orbital-ruling', consultationStyle: 'tribunal-review', resultStyle: 'formal-ruling', footerStyle: 'celestial-record', density: 'standard', panelRadius: '16px', panelBorderWidth: '2px', panelShadow: '0 22px 60px rgba(3,7,28,.42)', headingLetterSpacing: '0.07em',
      labels: { header: 'CELESTIAL TRIBUNAL', hero: 'CHRONOLOGICAL MATTER', checker: 'TRIBUNAL DOCKET', applicant: 'DOCKET SUBMISSION', consultation: 'TRIBUNAL REVIEW', result: 'RULING ENTERED', assessment: 'BALANCED FINDING', calculations: 'EVIDENCE COORDINATES', information: 'CELESTIAL RECORD', footer: 'DOCKET CLOSED' },
    }),
  },
  'obsidian-records': {
    palette: {
      background: '#050607', backgroundAlt: '#101215', headerBackground: '#030405',
      surface: '#171a1d', surfaceRaised: '#22262a', surfaceInset: '#111315',
      textPrimary: '#f2f0e8', textSecondary: '#c1c0b9', heading: '#e2c477',
      accent: '#aeb3b7', secondaryAccent: '#9d4855', border: '#555d64', borderStrong: '#8a9299',
      focus: '#e0bd61', positive: '#79b88d', warning: '#e2a25a', danger: '#ef7783',
      inputBackground: '#0c0e10', inputText: '#f6f3e9', buttonBackground: '#9d4855',
      buttonText: '#fff8ea', shadow: 'rgba(0, 0, 0, 0.68)',
    },
    headingFont: sans, bodyFont: sans, decorativeStyle: 'minimal',
    presentation: presentation('editorial', {
      shellStyle: 'indexed-record', panelStyle: 'editorial-surface', headingStyle: 'modern-index', dividerStyle: 'silver-line', labelStyle: 'section-tag', controlStyle: 'precision-field', sealStyle: 'minimal-marker', consultationStyle: 'indexed-progress', resultStyle: 'final-archive', footerStyle: 'document-index', density: 'restrained', panelRadius: '0', panelBorderWidth: '1px', panelShadow: '0 28px 76px rgba(0,0,0,.68)', headingLetterSpacing: '0.11em',
      labels: { header: 'OBSIDIAN / RECORDS', hero: 'RECORD / 01', checker: 'INDEX / INTAKE', applicant: 'DOSSIER', consultation: 'INDEXING / ACTIVE', result: 'ARCHIVE / FINAL', assessment: 'ASSESSMENT /', calculations: 'RECORD / DATA', information: 'INDEX / REFERENCE', footer: 'END / RECORD' },
    }),
  },
}

export const websiteThemes: readonly WebsiteTheme[] = resultImageThemes.map((theme) => ({
  ...theme,
  site: siteConfigurations[theme.id],
}))

export function getWebsiteTheme(id: string): WebsiteTheme {
  return websiteThemes.find((theme) => theme.id === id) ?? websiteThemes[0]
}
