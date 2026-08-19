import { getResultCardFormat, type ResultCardFormatId } from '../data/resultCardFormats'
import { getResultImageTheme, type ResultImageTheme, type ResultImageThemeId } from '../data/resultImageThemes'
import { experienceVerdicts, maturityVerdicts } from '../data/verdicts'
import type { FbiApplicantRecord } from '../types/fbiApplicant'
import type { FbiSpecialFinding, FbiSubmittedReview } from '../types/fbiPresentation'
import { formatEquivalentYears, formatYears } from './format'
import {
  approximateTextMeasure,
  createCanvasTextMeasurer,
  escapeXmlText,
  fitMeasuredText,
  renderResultSvgToPng,
  type ResultImageEnvironment,
  type TextMeasurer,
} from './resultImage'

type ApprovedReview = Extract<FbiSubmittedReview, { presentation: object }>

export interface FbiResultImageSubject {
  label: 'A' | 'B'
  name: string
  classification: string
  lifecycleFamily: string
  effectiveMaturity: string
  adultExperience: string
  chronologyLabel: string
  chronologyBasis: string
  details: readonly string[]
}

export interface FbiResultImageModel {
  caseNumber: string
  subjects: readonly [FbiResultImageSubject, FbiResultImageSubject]
  maturity: { category: string; label: string; values: string; ranges: string }
  experience: { category: string; label: string; gap: string; ratio: string }
  chronologicalGap: string
  filingNote: string
  specialFindings: readonly FbiSpecialFinding[]
}

function familyDetails(applicant: FbiApplicantRecord): readonly string[] {
  const record = applicant.record
  if (record.family === 'MORTAL') return [`Species: ${record.species.name}`, `Current age: ${formatYears(record.age)} years`]
  if (record.family === 'ACQUIRED') return [
    `Origin Species: ${record.originSpecies.name}`,
    `Age at Transformation: ${formatYears(record.ageAtTransformation)}`,
    `Years Since Transformation: ${formatYears(record.yearsSinceTransformation)}`,
    `Maturation: ${record.maturationMode === 'FROZEN' ? 'Frozen' : 'Continuing'}`,
  ]
  if (record.family === 'NATURALLY_IMMORTAL') return [
    `Current Age: ${formatYears(record.currentAge)}`,
    `Recognised Adulthood: ${formatYears(record.recognisedAdulthoodAge)}`,
    `Maturation Half-Life: ${formatYears(record.maturationHalfLife)}`,
  ]
  if (record.family === 'MANIFESTED') return [
    `Years Since Manifestation: ${formatYears(record.yearsSinceManifestation)}`,
    'Created Mature at Equivalent 25',
  ]
  if (record.subtype === 'REINCARNATING') return [
    `Current Form: ${record.currentFormSpecies.name}`,
    `Current Form Age: ${formatYears(record.currentFormAge)}`,
    `Memory Continuity: ${record.memoriesRetained ? 'Retained' : 'Not retained'}`,
    `Remembered Experience: ${formatYears(record.rememberedPreviousAdultExperience)} years`,
  ]
  return [
    `Current Host: ${record.currentFormSpecies.name}`,
    `Current Host Age: ${formatYears(record.currentFormAge)}`,
    `Conscious Experience: ${formatYears(record.rememberedConsciousExperience)} years`,
  ]
}

export function buildFbiResultImageModel(review: ApprovedReview, records: readonly [FbiApplicantRecord, FbiApplicantRecord]): FbiResultImageModel {
  const { comparison, presentation } = review
  const subjects = comparison.applicants.map((applicant, index) => ({
    label: applicant.label,
    name: applicant.name ?? `Subject ${applicant.label}`,
    classification: applicant.classification,
    lifecycleFamily: applicant.lifecycleFamily.replaceAll('_', ' '),
    effectiveMaturity: formatEquivalentYears(applicant.effectiveMaturity),
    adultExperience: formatYears(applicant.adultExperience),
    chronologyLabel: presentation.chronology[index].categoryLabel,
    chronologyBasis: `${presentation.chronology[index].basisLabel}: ${formatYears(presentation.chronology[index].basisYears)} years`,
    details: familyDetails(records[index]),
  })) as [FbiResultImageSubject, FbiResultImageSubject]
  return {
    caseNumber: presentation.caseNumber,
    subjects,
    maturity: {
      category: comparison.maturity.category,
      label: maturityVerdicts[comparison.maturity.category].label,
      values: `A ${formatEquivalentYears(comparison.maturity.applicantAEquivalentAge)} / B ${formatEquivalentYears(comparison.maturity.applicantBEquivalentAge)}`,
      ranges: `A ${formatEquivalentYears(comparison.maturity.applicantAMinimumEquivalentAge)}–${formatEquivalentYears(comparison.maturity.applicantAMaximumEquivalentAge)}; B ${formatEquivalentYears(comparison.maturity.applicantBMinimumEquivalentAge)}–${formatEquivalentYears(comparison.maturity.applicantBMaximumEquivalentAge)}`,
    },
    experience: {
      category: comparison.experience.category,
      label: experienceVerdicts[comparison.experience.category].label,
      gap: `${formatYears(comparison.experience.adultExperienceGap)} years`,
      ratio: comparison.experience.experienceRatio === null ? 'Not defined' : `${comparison.experience.experienceRatio.toLocaleString('en-US', { maximumFractionDigits: 2 })}:1`,
    },
    chronologicalGap: comparison.chronology.chronologicalAgeGap === null ? 'Not directly comparable' : `${formatYears(comparison.chronology.chronologicalAgeGap)} years`,
    filingNote: presentation.filingNote.text,
    specialFindings: presentation.specialFindings,
  }
}

function text(lines: readonly string[], x: number, y: number, options: { size: number; line: number; fill: string; family: string; weight?: number; anchor?: 'start' | 'middle' | 'end'; spacing?: number }): string {
  return `<text x="${x}" y="${y}" fill="${options.fill}" font-family="${options.family}" font-size="${options.size}" font-weight="${options.weight ?? 400}" text-anchor="${options.anchor ?? 'start'}" letter-spacing="${options.spacing ?? 0}">${lines.map((line, index) => `<tspan x="${x}" dy="${index ? options.line : 0}">${escapeXmlText(line)}</tspan>`).join('')}</text>`
}

function fitted(value: string, width: number, maxLines: number, theme: ResultImageTheme, measure: TextMeasurer, sizes = [24, 21, 18]): ReturnType<typeof fitMeasuredText> {
  return fitMeasuredText(value, { maxWidth: width, maxLines, fontSizes: sizes, fontFamily: theme.bodyFont, measureText: measure })
}

function subjectPanel(subject: FbiResultImageSubject, x: number, y: number, width: number, height: number, detailCount: number, theme: ResultImageTheme, measure: TextMeasurer): string {
  const name = fitted(subject.name, width - 48, 1, theme, measure, [27, 23, 19])
  const classification = fitted(subject.classification, width - 48, 2, theme, measure, [19, 17, 15])
  const details = subject.details.slice(0, detailCount)
  return `<g><rect x="${x}" y="${y}" width="${width}" height="${height}" rx="${theme.cornerRadius}" fill="${theme.palette.panel}" stroke="${theme.palette.accentAlt}" stroke-width="2"/>
    ${text([`SUBJECT ${subject.label}`], x + 24, y + 30, { size: 14, line: 18, fill: theme.palette.accent, family: theme.bodyFont, weight: 700, spacing: 1.8 })}
    ${text(name.lines, x + 24, y + 66, { size: name.fontSize, line: name.lineHeight, fill: theme.palette.ink, family: theme.displayFont, weight: 700 })}
    ${text(classification.lines, x + 24, y + 101, { size: classification.fontSize, line: classification.lineHeight, fill: theme.palette.muted, family: theme.bodyFont, weight: 700 })}
    ${text([subject.lifecycleFamily], x + 24, y + 145, { size: 14, line: 18, fill: theme.palette.accent, family: theme.bodyFont, weight: 700 })}
    ${detailCount > 0 ? text(details, x + 24, y + 178, { size: 15, line: 24, fill: theme.palette.muted, family: theme.bodyFont }) : ''}
    ${text([`Effective maturity: ${subject.effectiveMaturity}`, `Adult experience: ${subject.adultExperience} years`, subject.chronologyLabel], x + 24, y + height - 72, { size: 15, line: 23, fill: theme.palette.ink, family: theme.bodyFont, weight: 700 })}
  </g>`
}

function assessmentPanel(title: string, label: string, detail: string, x: number, y: number, width: number, height: number, theme: ResultImageTheme, measure: TextMeasurer): string {
  const result = fitted(label, width - 48, 2, theme, measure, [27, 23, 19])
  return `<g><rect x="${x}" y="${y}" width="${width}" height="${height}" rx="${theme.cornerRadius}" fill="${theme.palette.panelAlt}" stroke="${theme.palette.accentAlt}" stroke-width="2"/>
    ${text([title.toUpperCase()], x + 24, y + 31, { size: 14, line: 18, fill: theme.palette.accent, family: theme.bodyFont, weight: 700, spacing: 1.4 })}
    ${text(result.lines, x + 24, y + 70, { size: result.fontSize, line: result.lineHeight, fill: theme.palette.ink, family: theme.displayFont, weight: 700 })}
    ${text([detail], x + 24, y + height - 25, { size: 15, line: 19, fill: theme.palette.muted, family: theme.bodyFont, weight: 700 })}</g>`
}

export function createFbiResultCardSvg(model: FbiResultImageModel, themeId: ResultImageThemeId, formatId: ResultCardFormatId, measure: TextMeasurer = approximateTextMeasure): string {
  const theme = getResultImageTheme(themeId)
  const format = getResultCardFormat(formatId)
  const { width, height } = format
  const compact = formatId === 'compact'
  const full = formatId === 'full-dossier'
  const subjectY = 185
  const subjectHeight = compact ? 210 : full ? 485 : 285
  const assessmentY = subjectY + subjectHeight + 28
  const assessmentHeight = compact ? 155 : 175
  const chronologyY = assessmentY + assessmentHeight + 28
  const note = fitted(model.filingNote, 850, full ? 4 : 3, theme, measure, full ? [19, 17, 15] : [17, 15, 13])
  const finding = model.specialFindings[0]
  const footerY = height - 70
  const fullDetail = full ? `Maturity ranges: ${model.maturity.ranges}` : `A ${model.subjects[0].chronologyLabel} / B ${model.subjects[1].chronologyLabel}`
  return `<?xml version="1.0" encoding="UTF-8"?><svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" data-theme="${theme.id}" data-format="${formatId}" data-agency="fbi">
    <rect width="${width}" height="${height}" fill="${theme.palette.background}"/><rect x="38" y="34" width="1004" height="${height - 68}" rx="${theme.cornerRadius + 5}" fill="${theme.palette.frame}"/><rect x="58" y="54" width="964" height="${height - 108}" rx="${theme.cornerRadius}" fill="${theme.palette.paper}"/>
    <circle cx="112" cy="108" r="35" fill="${theme.palette.accent}"/>${text(['FBI'], 112, 116, { size: 19, line: 22, fill: theme.palette.paper, family: theme.bodyFont, weight: 700, anchor: 'middle', spacing: 1.5 })}
    ${text(['FANTASY BUREAU OF IMMORTALITY'], 165, 93, { size: 19, line: 23, fill: theme.palette.accent, family: theme.bodyFont, weight: 700, spacing: 2 })}
    ${text(['IMMORTAL LIFECYCLE FILE'], 165, 128, { size: 25, line: 30, fill: theme.palette.ink, family: theme.displayFont, weight: 700 })}
    ${text([`CASE ${model.caseNumber}`], 970, 112, { size: 16, line: 20, fill: theme.palette.muted, family: theme.bodyFont, weight: 700, anchor: 'end' })}
    ${subjectPanel(model.subjects[0], 90, subjectY, 430, subjectHeight, full ? 4 : 0, theme, measure)}
    ${subjectPanel(model.subjects[1], 560, subjectY, 430, subjectHeight, full ? 4 : 0, theme, measure)}
    ${assessmentPanel('Maturity Compatibility', model.maturity.label, full ? `${model.maturity.values} · ${model.maturity.category}` : model.maturity.category, 90, assessmentY, 430, assessmentHeight, theme, measure)}
    ${assessmentPanel('Experience Gap', model.experience.label, full ? `Gap ${model.experience.gap} · Ratio ${model.experience.ratio}` : model.experience.category, 560, assessmentY, 430, assessmentHeight, theme, measure)}
    <g><rect x="90" y="${chronologyY}" width="900" height="${full ? 235 : compact ? 105 : 155}" rx="${theme.cornerRadius}" fill="${theme.palette.panel}" stroke="${theme.palette.accentAlt}" stroke-width="2"/>
      ${text(['CHRONOLOGICAL CONTEXT'], 115, chronologyY + 31, { size: 14, line: 18, fill: theme.palette.accent, family: theme.bodyFont, weight: 700, spacing: 1.5 })}
      ${text([model.subjects[0].chronologyBasis, model.subjects[1].chronologyBasis, fullDetail, ...(full ? [`Chronological gap: ${model.chronologicalGap}`] : [])], 115, chronologyY + 66, { size: full ? 17 : 15, line: full ? 31 : 24, fill: theme.palette.ink, family: theme.bodyFont, weight: 700 })}</g>
    ${!compact && finding ? `<g><rect x="90" y="${chronologyY + (full ? 260 : 180)}" width="900" height="${full ? 170 : 115}" rx="${theme.cornerRadius}" fill="${theme.palette.panelAlt}"/><text x="115" y="${chronologyY + (full ? 294 : 212)}" fill="${theme.palette.accent}" font-family="${theme.bodyFont}" font-size="14" font-weight="700">FBI SPECIAL FINDING</text>${text([finding.label, ...(full ? [finding.description] : [])], 115, chronologyY + (full ? 334 : 249), { size: full ? 19 : 17, line: 27, fill: theme.palette.ink, family: theme.displayFont, weight: 700 })}</g>` : ''}
    ${full && model.specialFindings[1] ? `<g>${text([model.specialFindings[1].label, model.specialFindings[1].description], 115, chronologyY + 455, { size: 17, line: 26, fill: theme.palette.ink, family: theme.bodyFont, weight: 700 })}</g>` : ''}
    ${!compact ? `<g><rect x="90" y="${full ? 1685 : 1055}" width="900" height="${full ? 145 : 170}" rx="${theme.cornerRadius}" fill="${theme.palette.annotation}"/><text x="115" y="${full ? 1720 : 1090}" fill="${theme.palette.accent}" font-family="${theme.bodyFont}" font-size="14" font-weight="700">FBI FILING NOTE</text>${text(note.lines, 115, full ? 1760 : 1130, { size: note.fontSize, line: note.lineHeight, fill: theme.palette.annotationInk, family: theme.displayFont })}</g>` : ''}
    ${compact ? text(['FBI FILING STATUS: REVIEWED'], 540, 954, { size: 17, line: 20, fill: theme.palette.accent, family: theme.bodyFont, weight: 700, anchor: 'middle', spacing: 1.5 }) : ''}
    ${text(['MATURITY AND EXPERIENCE FILED INDEPENDENTLY'], 90, footerY, { size: 14, line: 18, fill: theme.palette.muted, family: theme.bodyFont, weight: 700, spacing: 1 })}${text([format.name.toUpperCase()], 990, footerY, { size: 14, line: 18, fill: theme.palette.muted, family: theme.bodyFont, weight: 700, anchor: 'end' })}
  </svg>`
}

export async function createFbiResultPng(review: ApprovedReview, records: readonly [FbiApplicantRecord, FbiApplicantRecord], themeId: ResultImageThemeId, formatId: ResultCardFormatId, environment?: ResultImageEnvironment, measure: TextMeasurer = createCanvasTextMeasurer()): Promise<Blob> {
  const model = buildFbiResultImageModel(review, records)
  const format = getResultCardFormat(formatId)
  return renderResultSvgToPng(createFbiResultCardSvg(model, themeId, formatId, measure), environment, format)
}
