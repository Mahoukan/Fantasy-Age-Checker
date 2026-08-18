import {
  DEFAULT_RESULT_IMAGE_THEME_ID,
  getResultImageTheme,
  type ResultImageTheme,
  type ResultImageThemeId,
} from '../data/resultImageThemes'
import type {
  ResultImageModel,
  ResultImageApplicant,
  TextMeasurer,
  TextMeasureStyle,
} from './resultImage'

interface WrappedText {
  lines: string[]
  fontSize: number
  lineHeight: number
}

interface TextOptions {
  fontSize: number
  lineHeight: number
  fontFamily: string
  fontWeight?: number | string
  fontStyle?: 'normal' | 'italic'
  fill: string
  anchor?: 'start' | 'middle' | 'end'
  letterSpacing?: number
}

export interface ThemedResultCardSvgOptions {
  measureText?: TextMeasurer
  themeId?: ResultImageThemeId
}

const fallbackMeasure: TextMeasurer = (text, style) => {
  let units = 0
  for (const character of text) {
    if (/\s/.test(character)) units += 0.32
    else if (/[ilI1|.,'!:;]/.test(character)) units += 0.3
    else if (/[MW@%#]/.test(character)) units += 0.92
    else if (/[A-Z0-9]/.test(character)) units += 0.67
    else units += 0.55
  }
  return units * style.fontSize
}

function escapeXml(value: string): string {
  const entities: Record<string, string> = {
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&apos;',
  }
  return value.replace(/[&<>"']/g, (character) => entities[character] ?? character)
}

function splitLongWord(
  word: string,
  maxWidth: number,
  style: TextMeasureStyle,
  measureText: TextMeasurer,
): string[] {
  const parts: string[] = []
  let part = ''
  for (const character of word) {
    const candidate = `${part}${character}`
    if (part && measureText(candidate, style) > maxWidth) {
      parts.push(part)
      part = character
    } else part = candidate
  }
  if (part) parts.push(part)
  return parts
}

function wrap(
  text: string,
  maxWidth: number,
  style: TextMeasureStyle,
  measureText: TextMeasurer,
): string[] {
  const normalized = text.trim().replace(/\s+/g, ' ')
  if (!normalized) return ['']
  const tokens = normalized.split(' ').flatMap((word) => (
    measureText(word, style) > maxWidth ? splitLongWord(word, maxWidth, style, measureText) : [word]
  ))
  const lines: string[] = []
  let current = ''
  for (const token of tokens) {
    const candidate = current ? `${current} ${token}` : token
    if (current && measureText(candidate, style) > maxWidth) {
      lines.push(current)
      current = token
    } else current = candidate
  }
  if (current) lines.push(current)
  return lines
}

function fit(
  text: string,
  options: {
    maxWidth: number
    maxLines: number
    fontSizes: number[]
    fontFamily: string
    fontWeight?: number | string
    fontStyle?: 'normal' | 'italic'
    lineHeightRatio?: number
    measureText: TextMeasurer
  },
): WrappedText {
  const { maxWidth, maxLines, fontSizes, fontFamily, fontWeight = 400, fontStyle = 'normal' } = options
  const lineHeightRatio = options.lineHeightRatio ?? 1.18
  for (const fontSize of fontSizes) {
    const style = { fontSize, fontFamily, fontWeight, fontStyle }
    const lines = wrap(text, maxWidth, style, options.measureText)
    if (lines.length <= maxLines) {
      return { lines, fontSize, lineHeight: Math.round(fontSize * lineHeightRatio) }
    }
  }
  const fontSize = fontSizes.at(-1) ?? 12
  const style = { fontSize, fontFamily, fontWeight, fontStyle }
  const allLines = wrap(text, maxWidth, style, options.measureText)
  const lines = allLines.slice(0, maxLines)
  const remainder = allLines.slice(maxLines - 1).join(' ')
  let finalLine = remainder
  while (finalLine && options.measureText(`${finalLine}…`, style) > maxWidth) {
    finalLine = finalLine.slice(0, -1).trimEnd()
  }
  lines[maxLines - 1] = `${finalLine}…`
  return { lines, fontSize, lineHeight: Math.round(fontSize * lineHeightRatio) }
}

function text(lines: string[], x: number, y: number, options: TextOptions): string {
  const tspans = lines.map((line, index) => (
    `<tspan x="${x}" dy="${index === 0 ? 0 : options.lineHeight}">${escapeXml(line)}</tspan>`
  )).join('')
  return `<text x="${x}" y="${y}" fill="${options.fill}" font-family="${options.fontFamily}" font-size="${options.fontSize}" font-weight="${options.fontWeight ?? 400}" font-style="${options.fontStyle ?? 'normal'}" text-anchor="${options.anchor ?? 'start'}" letter-spacing="${options.letterSpacing ?? 0}">${tspans}</text>`
}

function label(
  value: string,
  x: number,
  y: number,
  theme: ResultImageTheme,
  anchor: 'start' | 'middle' = 'start',
): string {
  return text([value.toUpperCase()], x, y, {
    fontSize: 14, lineHeight: 17, fontFamily: theme.bodyFont, fontWeight: 700,
    fill: theme.palette.accent, anchor, letterSpacing: 2.1,
  })
}

function decoration(theme: ResultImageTheme): string {
  const { accent, accentAlt, muted } = theme.palette
  switch (theme.id) {
    case 'royal-decree':
      return `<g data-decoration="royal" fill="${accentAlt}"><path d="M76 76h20l10 10-10 10H76L66 86Z"/><path d="M1004 76h-20l-10 10 10 10h20l10-10Z"/></g>`
    case 'elven-archive':
      return `<g data-decoration="elven" fill="none" stroke="${accentAlt}" stroke-width="2"><path d="M75 170Q140 120 205 170M875 170Q940 120 1005 170"/><path d="M96 153q18-26 36 0-18 19-36 0Zm852 0q18-26 36 0-18 19-36 0Z"/></g>`
    case 'dwarven-registry':
      return `<path data-decoration="dwarven" d="M70 80h45l18 18h814l18-18h45M70 1270h45l18-18h814l18 18h45" fill="none" stroke="${accentAlt}" stroke-width="7"/>`
    case 'goblin-administration':
      return `${text(['FILED'], 940, 91, { fontSize: 13, lineHeight: 15, fontFamily: theme.bodyFont, fontWeight: 700, fill: accent, anchor: 'end', letterSpacing: 2 })}${text(['CHECKED • RE-FILED'], 940, 1268, { fontSize: 12, lineHeight: 14, fontFamily: theme.bodyFont, fontWeight: 700, fill: muted, anchor: 'end', letterSpacing: 1.5 })}`
    case 'arcane-terminal':
      return `<g data-decoration="terminal" stroke="${accentAlt}" stroke-width="1" opacity="0.32">${Array.from({ length: 12 }, (_, index) => `<path d="M70 ${110 + index * 95}H1010"/>`).join('')}</g>`
    case 'fae-court':
      return `<g data-decoration="fae" fill="none" stroke="${accentAlt}" opacity="0.7"><circle cx="90" cy="90" r="22"/><circle cx="990" cy="90" r="22"/><path d="M70 170q80-35 160 0M850 170q80-35 160 0"/></g>`
    case 'dragon-archive':
      return `<path data-decoration="dragon" d="M70 168l18-18 18 18 18-18 18 18 18-18 18 18M902 168l18-18 18 18 18-18 18 18 18-18 18 18" fill="none" stroke="${accentAlt}" stroke-width="3"/>`
    case 'celestial-tribunal':
      return `<g data-decoration="celestial" fill="none" stroke="${accentAlt}"><circle cx="105" cy="105" r="28"/><circle cx="975" cy="105" r="28"/><path d="M105 67V143M67 105H143M975 67V143M937 105H1013"/></g>`
    case 'obsidian-records':
      return `<g data-decoration="obsidian" stroke="${accent}" stroke-width="2"><path d="M70 170H260M820 170H1010M70 1188H1010"/></g>`
    default:
      return `<path data-decoration="classic" d="M80 170H1000" stroke="${accent}" stroke-width="3"/>`
  }
}

function applicantPanel(
  applicant: ResultImageApplicant,
  x: number,
  measureText: TextMeasurer,
  theme: ResultImageTheme,
): string {
  const primary = fit(applicant.displayName ?? applicant.speciesName, {
    maxWidth: 365, maxLines: 2, fontSizes: applicant.displayName ? [26, 23, 20] : [32, 28, 24],
    fontFamily: theme.displayFont, fontWeight: 700, lineHeightRatio: 1.12, measureText,
  })
  const species = applicant.displayName ? fit(applicant.speciesName, {
    maxWidth: 365, maxLines: 2, fontSizes: [19, 17, 15], fontFamily: theme.bodyFont,
    fontWeight: 700, lineHeightRatio: 1.12, measureText,
  }) : undefined
  const palette = theme.palette
  return `<g data-applicant="${escapeXml(applicant.label)}">
    <rect x="${x}" y="185" width="430" height="175" rx="${theme.cornerRadius}" fill="${palette.panelAlt}" stroke="${palette.accentAlt}" stroke-width="2"/>
    ${label(applicant.label, x + 24, 211, theme)}
    ${text(primary.lines, x + 24, applicant.displayName ? 242 : 266, { fontSize: primary.fontSize, lineHeight: primary.lineHeight, fontFamily: theme.displayFont, fontWeight: 700, fill: palette.ink })}
    ${species ? text(species.lines, x + 24, 301, { fontSize: species.fontSize, lineHeight: species.lineHeight, fontFamily: theme.bodyFont, fontWeight: 700, fill: palette.muted }) : ''}
    ${text([`${applicant.age} years old`], x + 24, 342, { fontSize: 19, lineHeight: 22, fontFamily: theme.bodyFont, fontWeight: 700, fill: palette.ink })}
    ${applicant.isTemporary ? text(['TEMPORARY'], x + 404, 342, { fontSize: 12, lineHeight: 14, fontFamily: theme.bodyFont, fontWeight: 700, fill: palette.accent, anchor: 'end', letterSpacing: 1.2 }) : ''}
  </g>`
}

function annotation(
  id: string,
  wrapped: WrappedText,
  x: number,
  y: number,
  width: number,
  height: number,
  annotationLabel: string,
  theme: ResultImageTheme,
): string {
  const palette = theme.palette
  return `<g id="${id}" data-annotation="${theme.id}">
    <rect x="${x}" y="${y}" width="${width}" height="${height}" rx="${Math.max(0, theme.cornerRadius - 4)}" fill="${palette.annotation}" stroke="${palette.accentAlt}" stroke-width="1.5"/>
    <path d="M${x + 16} ${y + 13}V${y + height - 13}" stroke="${palette.accent}" stroke-width="4"/>
    ${text([annotationLabel], x + 32, y + 21, { fontSize: 10, lineHeight: 12, fontFamily: theme.bodyFont, fontWeight: 700, fill: palette.accent, letterSpacing: 1.4 })}
    ${text(wrapped.lines, x + 32, y + 45, { fontSize: wrapped.fontSize, lineHeight: wrapped.lineHeight, fontFamily: theme.displayFont, fontWeight: 600, fontStyle: 'italic', fill: palette.annotationInk })}
  </g>`
}

function longevityStrip(
  model: ResultImageModel,
  measureText: TextMeasurer,
  theme: ResultImageTheme,
): string {
  if (!model.longevity.length) return ''
  const entries = model.longevity.slice(0, 2).map((entry, index) => {
    const x = index === 0 ? 120 : 560
    const wrapped = fit(`${entry.applicantLabel}: ${entry.label}`, {
      maxWidth: 395, maxLines: 2, fontSizes: [16, 14, 12], fontFamily: theme.bodyFont,
      fontWeight: 700, lineHeightRatio: 1.12, measureText,
    })
    return text(wrapped.lines, x, 1033, {
      fontSize: wrapped.fontSize, lineHeight: wrapped.lineHeight, fontFamily: theme.bodyFont,
      fontWeight: 700, fill: theme.palette.ink,
    })
  })
  return `<g id="longevity-advisory">
    <rect x="90" y="990" width="900" height="70" rx="${theme.cornerRadius}" fill="${theme.palette.panelAlt}" stroke="${theme.palette.accentAlt}" stroke-width="2"/>
    ${label('Longevity advisory', 120, 1015, theme)}
    ${entries.join('')}
  </g>`
}

export function createThemedResultCardSvg(
  model: ResultImageModel,
  options: ThemedResultCardSvgOptions = {},
): string {
  const measureText = options.measureText ?? fallbackMeasure
  const theme = getResultImageTheme(options.themeId ?? DEFAULT_RESULT_IMAGE_THEME_ID)
  const palette = theme.palette
  const maturityLabel = fit(model.maturity.label, {
    maxWidth: 820, maxLines: 1, fontSizes: [30, 27, 24], fontFamily: theme.displayFont,
    fontWeight: 700, measureText,
  })
  const maturityDescription = fit(model.maturity.description, {
    maxWidth: 820, maxLines: 2, fontSizes: [17, 15, 13], fontFamily: theme.bodyFont,
    lineHeightRatio: 1.18, measureText,
  })
  const maturityQuip = fit(model.maturity.quip, {
    maxWidth: 790, maxLines: 3, fontSizes: [17, 15, 13], fontFamily: theme.displayFont,
    fontStyle: 'italic', lineHeightRatio: 1.18, measureText,
  })
  const experienceLabel = fit(model.experience.label, {
    maxWidth: 820, maxLines: 1, fontSizes: [30, 27, 24], fontFamily: theme.displayFont,
    fontWeight: 700, measureText,
  })
  const experienceFacts = model.applicants.map((applicant) => fit(
    `${applicant.displayName ?? applicant.label}: ${applicant.adultExperience} years`, {
      maxWidth: 265, maxLines: 2, fontSizes: [16, 14, 12], fontFamily: theme.bodyFont,
      fontWeight: 700, lineHeightRatio: 1.14, measureText,
    },
  ))
  const experienceGap = fit(`Difference: ${model.experience.gap} years`, {
    maxWidth: 245, maxLines: 2, fontSizes: [17, 15, 13], fontFamily: theme.bodyFont,
    fontWeight: 700, lineHeightRatio: 1.14, measureText,
  })
  const experienceQuip = fit(model.experience.quip, {
    maxWidth: 790, maxLines: 3, fontSizes: [17, 15, 13], fontFamily: theme.displayFont,
    fontStyle: 'italic', lineHeightRatio: 1.18, measureText,
  })
  const hasLongevity = model.longevity.length > 0
  const noteY = hasLongevity ? 1068 : 990
  const noteHeight = hasLongevity ? 110 : 188
  const administrativeNote = fit(model.administrativeNote, {
    maxWidth: 790, maxLines: hasLongevity ? 3 : 5,
    fontSizes: hasLongevity ? [15, 13, 11] : [18, 16, 14],
    fontFamily: theme.displayFont, fontStyle: 'italic', lineHeightRatio: 1.15, measureText,
  })
  const commentaryLabel = theme.id === 'arcane-terminal' ? 'COMMENTARY >' : theme.annotationLabel
  const noteLabel = theme.id === 'arcane-terminal' ? 'BUREAU_NOTE >' : 'ADMINISTRATIVE MEMORANDUM'

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="1080" height="1350" viewBox="0 0 1080 1350" data-theme="${theme.id}">
  <rect width="1080" height="1350" fill="${palette.background}"/>
  <rect x="38" y="34" width="1004" height="1280" rx="${theme.cornerRadius + 6}" fill="${palette.frame}" stroke="${palette.accentAlt}" stroke-width="4"/>
  <rect x="58" y="54" width="964" height="1240" rx="${theme.cornerRadius}" fill="${palette.paper}" stroke="${palette.accentAlt}" stroke-width="2"/>
  ${decoration(theme)}
  <g id="header">
    <g transform="translate(82 72)"><circle cx="35" cy="35" r="33" fill="${palette.accent}"/><circle cx="35" cy="35" r="25" fill="none" stroke="${palette.paper}" stroke-width="2"/><path d="M35 15 41 29 57 30 45 40 49 56 35 47 21 56 25 40 13 30 29 29Z" fill="${palette.paper}"/></g>
    ${text(['ARCANE RELATIONSHIP BUREAU'], 165, 91, { fontSize: 19, lineHeight: 23, fontFamily: theme.bodyFont, fontWeight: 700, fill: palette.accent, letterSpacing: 2.4 })}
    ${text(['Department of Inter-Species Affairs'], 165, 119, { fontSize: 15, lineHeight: 18, fontFamily: theme.bodyFont, fontWeight: 600, fill: palette.muted, letterSpacing: 0.8 })}
    ${text(['OFFICIAL CHRONOLOGICAL ASSESSMENT'], 165, 151, { fontSize: 23, lineHeight: 27, fontFamily: theme.displayFont, fontWeight: 700, fill: palette.ink })}
    ${text([`CASE ${model.caseNumber}`], 970, 126, { fontSize: 17, lineHeight: 20, fontFamily: theme.bodyFont, fontWeight: 700, fill: palette.muted, anchor: 'end', letterSpacing: 1.2 })}
  </g>
  ${applicantPanel(model.applicants[0], 90, measureText, theme)}
  ${applicantPanel(model.applicants[1], 560, measureText, theme)}
  <g id="assessment-i">
    <rect x="90" y="375" width="900" height="280" rx="${theme.cornerRadius}" fill="${palette.panel}" stroke="${palette.accentAlt}" stroke-width="2"/>
    ${label('Assessment I', 115, 402, theme)}
    ${text(['MATURITY COMPATIBILITY'], 115, 426, { fontSize: 15, lineHeight: 18, fontFamily: theme.bodyFont, fontWeight: 700, fill: palette.muted, letterSpacing: 1.2 })}
    ${text(maturityLabel.lines, 115, 466, { fontSize: maturityLabel.fontSize, lineHeight: maturityLabel.lineHeight, fontFamily: theme.displayFont, fontWeight: 700, fill: palette.ink })}
    ${text(maturityDescription.lines, 115, 506, { fontSize: maturityDescription.fontSize, lineHeight: maturityDescription.lineHeight, fontFamily: theme.bodyFont, fill: palette.muted })}
    ${annotation('maturity-quip', maturityQuip, 105, 542, 870, 100, commentaryLabel, theme)}
  </g>
  <g id="assessment-ii">
    <rect x="90" y="670" width="900" height="305" rx="${theme.cornerRadius}" fill="${palette.panel}" stroke="${palette.accentAlt}" stroke-width="2"/>
    ${label('Assessment II', 115, 697, theme)}
    ${text(['EXPERIENCE GAP'], 115, 721, { fontSize: 15, lineHeight: 18, fontFamily: theme.bodyFont, fontWeight: 700, fill: palette.muted, letterSpacing: 1.2 })}
    ${text(experienceLabel.lines, 115, 760, { fontSize: experienceLabel.fontSize, lineHeight: experienceLabel.lineHeight, fontFamily: theme.displayFont, fontWeight: 700, fill: palette.ink })}
    ${text(experienceFacts[0].lines, 115, 812, { fontSize: experienceFacts[0].fontSize, lineHeight: experienceFacts[0].lineHeight, fontFamily: theme.bodyFont, fontWeight: 700, fill: palette.ink })}
    ${text(experienceGap.lines, 540, 812, { fontSize: experienceGap.fontSize, lineHeight: experienceGap.lineHeight, fontFamily: theme.bodyFont, fontWeight: 700, fill: palette.accent, anchor: 'middle' })}
    ${text(experienceFacts[1].lines, 965, 812, { fontSize: experienceFacts[1].fontSize, lineHeight: experienceFacts[1].lineHeight, fontFamily: theme.bodyFont, fontWeight: 700, fill: palette.ink, anchor: 'end' })}
    ${annotation('experience-quip', experienceQuip, 105, 852, 870, 110, commentaryLabel, theme)}
  </g>
  ${longevityStrip(model, measureText, theme)}
  <g id="bureau-note">
    <rect x="90" y="${noteY}" width="900" height="${noteHeight}" rx="${theme.cornerRadius}" fill="${palette.panelAlt}" stroke="${palette.accentAlt}" stroke-width="2"/>
    ${label('Bureau Note', 115, noteY + 27, theme)}
    ${annotation('administrative-note', administrativeNote, 105, noteY + 38, 870, noteHeight - 51, noteLabel, theme)}
  </g>
  <g id="footer">
    <g transform="translate(92 1200)"><circle cx="34" cy="34" r="31" fill="none" stroke="${palette.accent}" stroke-width="3"/><circle cx="34" cy="34" r="23" fill="none" stroke="${palette.accent}" stroke-width="1.5"/><path d="M34 16 39 28 52 29 42 37 45 50 34 43 23 50 26 37 16 29 29 28Z" fill="${palette.accent}"/></g>
    ${text(['BUREAU REVIEWED'], 175, 1228, { fontSize: 16, lineHeight: 19, fontFamily: theme.bodyFont, fontWeight: 700, fill: palette.accent, letterSpacing: 1.8 })}
    ${text(['FANTASY AGE CHECKER'], 970, 1218, { fontSize: 16, lineHeight: 19, fontFamily: theme.bodyFont, fontWeight: 700, fill: palette.ink, anchor: 'end', letterSpacing: 1.4 })}
    ${text(['ARCANE RELATIONSHIP BUREAU'], 970, 1244, { fontSize: 13, lineHeight: 16, fontFamily: theme.bodyFont, fontWeight: 700, fill: palette.muted, anchor: 'end', letterSpacing: 1.2 })}
  </g>
</svg>`
}
