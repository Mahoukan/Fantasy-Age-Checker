import { experienceVerdicts, longevityLabels, maturityVerdicts } from '../data/verdicts';
import {
  DEFAULT_RESULT_IMAGE_THEME_ID,
  type ResultImageThemeId,
} from '../data/resultImageThemes';
import {
  DEFAULT_RESULT_CARD_FORMAT_ID,
  getResultCardFormat,
  type ResultCardFormatId,
} from '../data/resultCardFormats';
import type { ShareResultModel } from './share';
import { formatEquivalentYears, formatPercentage, formatYears } from './format';
import { applicantDisplayName } from './applicantName';
import {
  createCompactResultCardSvg,
  createFullDossierResultCardSvg,
  createThemedResultCardSvg,
} from './resultCardSvg';
import type { ConsultationPresentation } from './resultPresentation';

export const RESULT_IMAGE_WIDTH = 1080;
export const RESULT_IMAGE_HEIGHT = 1350;
export const RESULT_IMAGE_MIME_TYPE = 'image/png';

const DISPLAY_FONT = 'Georgia, Times New Roman, serif';
const BODY_FONT = 'Arial, Helvetica, sans-serif';

export interface ResultImageSource extends ShareResultModel {
  caseNumber: string;
  presentation?: ConsultationPresentation;
}

export interface ResultImageApplicant {
  label: string;
  displayName?: string;
  speciesName: string;
  age: string;
  adultExperience: string;
  adulthoodAge: string;
  typicalLifespan: string;
  relativeLifespan: string;
  equivalentMaturity: string;
  isTemporary: boolean;
}

export interface ResultImageLongevity {
  applicantLabel: string;
  speciesName: string;
  label: string;
  age: string;
  typicalLifespan: string;
  percentage: string;
  excessYears: string;
  theatreHeadline?: string;
  proceduralLabel?: string;
  theatreNote?: string;
}

export interface ResultImageModel {
  caseNumber: string;
  applicants: [ResultImageApplicant, ResultImageApplicant];
  maturity: {
    category: string;
    label: string;
    description: string;
    quip: string;
    applicantAEquivalentAge: string;
    applicantBEquivalentAge: string;
    applicantARange: string;
    applicantBRange: string;
    relativeDifference: string;
    mutuallyCompatible: boolean;
  };
  experience: {
    category: string;
    label: string;
    description: string;
    gap: string;
    chronologicalGap: string;
    ratio: string;
    quip: string;
  };
  compactQuip: string;
  findings: string[];
  rareFindings: Array<{ title: string; text: string }>;
  dualLongevityBanner?: string;
  longevity: ResultImageLongevity[];
  administrativeNote: string;
}

export interface TextMeasureStyle {
  fontSize: number;
  fontFamily: string;
  fontWeight?: number | string;
  fontStyle?: 'normal' | 'italic';
}

export type TextMeasurer = (text: string, style: TextMeasureStyle) => number;

export interface WrappedText {
  lines: string[];
  fontSize: number;
  lineHeight: number;
  truncated: boolean;
}

interface FitTextOptions {
  maxWidth: number;
  maxLines: number;
  fontSizes: number[];
  fontFamily?: string;
  fontWeight?: number | string;
  fontStyle?: 'normal' | 'italic';
  lineHeightRatio?: number;
  measureText?: TextMeasurer;
}

interface SvgTextOptions {
  fontSize: number;
  lineHeight: number;
  fontFamily?: string;
  fontWeight?: number | string;
  fontStyle?: 'normal' | 'italic';
  fill?: string;
  anchor?: 'start' | 'middle' | 'end';
  letterSpacing?: number;
}

export interface ResultImageRenderOptions {
  measureText?: TextMeasurer;
  themeId?: ResultImageThemeId;
  formatId?: ResultCardFormatId;
}

export interface ResultImageLike {
  onload: (() => void) | null;
  onerror: (() => void) | null;
  src: string;
}

export interface ResultCanvasContext {
  drawImage(image: ResultImageLike, x: number, y: number, width: number, height: number): void;
}

export interface ResultCanvasLike {
  width: number;
  height: number;
  getContext(type: '2d'): ResultCanvasContext | null;
  toBlob(callback: (blob: Blob | null) => void, type: string): void;
}

export interface ResultImageEnvironment {
  createObjectURL(blob: Blob): string;
  revokeObjectURL(url: string): void;
  createImage(): ResultImageLike;
  createCanvas(): ResultCanvasLike;
}

export interface ResultDownloadAnchor {
  href: string;
  download: string;
  click(): void;
}

export interface ResultDownloadEnvironment {
  createObjectURL(blob: Blob): string;
  revokeObjectURL(url: string): void;
  createAnchor(): ResultDownloadAnchor;
  schedule(callback: () => void): void;
}

export interface ImageShareNavigator {
  canShare?: (data: ShareData) => boolean;
  share?: (data: ShareData) => Promise<void>;
}

export type ResultFileFactory = (blob: Blob, name: string, type: string) => File;

export type ResultImageShareOutcome = 'shared' | 'cancelled' | 'failed' | 'unsupported';

function requireApplicant<T>(applicants: T[], index: number): T {
  const applicant = applicants[index];
  if (!applicant) {
    throw new Error('A result image requires exactly two submitted applicants.');
  }
  return applicant;
}

export function buildResultImageModel(source: ResultImageSource): ResultImageModel {
  const first = requireApplicant(source.applicants, 0);
  const second = requireApplicant(source.applicants, 1);

  const applicants = [first, second].map<ResultImageApplicant>((applicant) => ({
    label: `Applicant ${applicant.label}`,
    ...(applicant.name ? { displayName: applicant.name } : {}),
    speciesName: applicant.species.name,
    age: formatYears(applicant.age),
    adultExperience: formatYears(applicant.adultExperience),
    adulthoodAge: formatYears(applicant.species.adulthoodAge),
    typicalLifespan: formatYears(applicant.species.typicalLifespan),
    relativeLifespan: formatPercentage(applicant.relativeAge),
    equivalentMaturity: formatEquivalentYears(
      applicant.label === 'A'
        ? source.maturity.applicantAEquivalentAge
        : source.maturity.applicantBEquivalentAge,
    ),
    isTemporary: applicant.species.source === 'custom',
  })) as [ResultImageApplicant, ResultImageApplicant];

  const displayA = first.name ?? 'Applicant A';
  const displayB = second.name ?? 'Applicant B';
  const findings: string[] = [];
  if (source.experience.applicantAHasBeenAdultLongerThanBHasBeenAlive) {
    findings.push(`${displayA} has been an adult longer than ${displayB} has been alive.`);
  }
  if (source.experience.applicantBHasBeenAdultLongerThanAHasBeenAlive) {
    findings.push(`${displayB} has been an adult longer than ${displayA} has been alive.`);
  }
  if (source.experience.applicantAAdultExperienceExceedsBTypicalLifespan) {
    findings.push(`${displayA}'s adult experience exceeds the typical ${second.species.name} lifespan.`);
  }
  if (source.experience.applicantBAdultExperienceExceedsATypicalLifespan) {
    findings.push(`${displayB}'s adult experience exceeds the typical ${first.species.name} lifespan.`);
  }

  const compactQuip = (
    source.experience.category === 'HISTORICAL' || source.experience.category === 'CIVILIZATIONS'
      ? source.quips.experience.text
      : source.quips.maturity.text
  ) || source.quips.administrative.text;

  return {
    caseNumber: source.caseNumber,
    applicants,
    maturity: {
      category: source.maturity.category,
      label: maturityVerdicts[source.maturity.category].label,
      description: maturityVerdicts[source.maturity.category].description,
      quip: source.quips.maturity.text,
      applicantAEquivalentAge: formatEquivalentYears(source.maturity.applicantAEquivalentAge),
      applicantBEquivalentAge: formatEquivalentYears(source.maturity.applicantBEquivalentAge),
      applicantARange: `${formatEquivalentYears(source.maturity.applicantAMinimumEquivalentAge)}–${formatEquivalentYears(source.maturity.applicantAMaximumEquivalentAge)}`,
      applicantBRange: `${formatEquivalentYears(source.maturity.applicantBMinimumEquivalentAge)}–${formatEquivalentYears(source.maturity.applicantBMaximumEquivalentAge)}`,
      relativeDifference: formatPercentage(source.maturity.relativeDifference),
      mutuallyCompatible: source.maturity.mutuallyCompatible,
    },
    experience: {
      category: source.experience.category,
      label: experienceVerdicts[source.experience.category].label,
      description: experienceVerdicts[source.experience.category].description,
      gap: formatYears(source.experience.adultExperienceGap),
      chronologicalGap: formatYears(source.experience.chronologicalAgeGap),
      ratio: source.experience.experienceRatio === null
        ? 'Not defined'
        : `${source.experience.experienceRatio.toLocaleString('en-US', { maximumFractionDigits: 2 })}:1`,
      quip: source.quips.experience.text,
    },
    compactQuip,
    findings,
    rareFindings: (source.presentation?.rareFindings ?? []).map(({ title, text }) => ({ title, text })),
    ...(source.presentation?.dualLongevityBanner
      ? { dualLongevityBanner: source.presentation.dualLongevityBanner }
      : {}),
    longevity: source.longevity
      .filter((result) => result.category !== 'NORMAL')
      .map((result) => {
        const applicant = source.applicants.find((candidate) => candidate.label === result.applicant);
        const theatre = source.presentation?.longevityTheatre.find((entry) => entry.applicant === result.applicant);
        return {
          applicantLabel: applicant ? applicantDisplayName(applicant) : `Applicant ${result.applicant}`,
          speciesName: applicant?.species.name ?? 'Unknown species',
          label: longevityLabels[result.category],
          age: formatYears(applicant?.age ?? 0),
          typicalLifespan: formatYears(applicant?.species.typicalLifespan ?? 0),
          percentage: formatPercentage(result.ratio),
          excessYears: formatYears(result.excessYears),
          ...(theatre ? {
            theatreHeadline: theatre.headline,
            proceduralLabel: theatre.proceduralLabel,
            theatreNote: theatre.note,
          } : {}),
        };
      }),
    administrativeNote: source.quips.administrative.text,
  };
}

export function escapeXmlText(value: string): string {
  return value.replace(/[&<>"']/g, (character) => {
    const entities: Record<string, string> = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&apos;',
    };
    return entities[character];
  });
}

export const approximateTextMeasure: TextMeasurer = (text, style) => {
  let units = 0;
  for (const character of text) {
    if (/\s/.test(character)) units += 0.32;
    else if (/[ilI1|.,'!:;]/.test(character)) units += 0.3;
    else if (/[MW@%#]/.test(character)) units += 0.92;
    else if (/[A-Z0-9]/.test(character)) units += 0.67;
    else units += 0.55;
  }
  const weightFactor = Number(style.fontWeight) >= 700 || style.fontWeight === 'bold' ? 1.04 : 1;
  return units * style.fontSize * weightFactor;
};

function splitLongWord(
  word: string,
  maxWidth: number,
  style: TextMeasureStyle,
  measureText: TextMeasurer,
): string[] {
  const parts: string[] = [];
  let part = '';

  for (const character of word) {
    const candidate = `${part}${character}`;
    if (part && measureText(candidate, style) > maxWidth) {
      parts.push(part);
      part = character;
    } else {
      part = candidate;
    }
  }

  if (part) parts.push(part);
  return parts.length ? parts : [''];
}

export function wrapMeasuredText(
  text: string,
  maxWidth: number,
  style: TextMeasureStyle,
  measureText: TextMeasurer = approximateTextMeasure,
): string[] {
  const normalized = text.trim().replace(/\s+/g, ' ');
  if (!normalized) return [''];

  const tokens = normalized.split(' ').flatMap((word) =>
    measureText(word, style) > maxWidth ? splitLongWord(word, maxWidth, style, measureText) : [word],
  );
  const lines: string[] = [];
  let current = '';

  for (const token of tokens) {
    const candidate = current ? `${current} ${token}` : token;
    if (current && measureText(candidate, style) > maxWidth) {
      lines.push(current);
      current = token;
    } else {
      current = candidate;
    }
  }

  if (current) lines.push(current);
  return lines;
}

function truncateLine(
  line: string,
  maxWidth: number,
  style: TextMeasureStyle,
  measureText: TextMeasurer,
): string {
  const ellipsis = '…';
  let candidate = line.trimEnd();
  while (candidate && measureText(`${candidate}${ellipsis}`, style) > maxWidth) {
    candidate = candidate.slice(0, -1).trimEnd();
  }
  return `${candidate}${ellipsis}`;
}

export function fitMeasuredText(text: string, options: FitTextOptions): WrappedText {
  const {
    maxWidth,
    maxLines,
    fontSizes,
    fontFamily = BODY_FONT,
    fontWeight = 400,
    fontStyle = 'normal',
    lineHeightRatio = 1.22,
    measureText = approximateTextMeasure,
  } = options;

  for (const fontSize of fontSizes) {
    const style = { fontSize, fontFamily, fontWeight, fontStyle };
    const lines = wrapMeasuredText(text, maxWidth, style, measureText);
    if (lines.length <= maxLines) {
      return { lines, fontSize, lineHeight: Math.round(fontSize * lineHeightRatio), truncated: false };
    }
  }

  const fontSize = fontSizes.at(-1) ?? 16;
  const style = { fontSize, fontFamily, fontWeight, fontStyle };
  const allLines = wrapMeasuredText(text, maxWidth, style, measureText);
  const lines = allLines.slice(0, maxLines);
  const remaining = allLines.slice(maxLines - 1).join(' ');
  lines[maxLines - 1] = truncateLine(remaining, maxWidth, style, measureText);
  return { lines, fontSize, lineHeight: Math.round(fontSize * lineHeightRatio), truncated: true };
}

function svgText(lines: string[], x: number, y: number, options: SvgTextOptions): string {
  const {
    fontSize,
    lineHeight,
    fontFamily = BODY_FONT,
    fontWeight = 400,
    fontStyle = 'normal',
    fill = '#30271f',
    anchor = 'start',
    letterSpacing = 0,
  } = options;
  const tspans = lines
    .map((line, index) => `<tspan x="${x}" dy="${index === 0 ? 0 : lineHeight}">${escapeXmlText(line)}</tspan>`)
    .join('');
  return `<text x="${x}" y="${y}" fill="${fill}" font-family="${fontFamily}" font-size="${fontSize}" font-weight="${fontWeight}" font-style="${fontStyle}" text-anchor="${anchor}" letter-spacing="${letterSpacing}">${tspans}</text>`;
}

function labelText(text: string, x: number, y: number, anchor: 'start' | 'middle' = 'start'): string {
  return svgText([text.toUpperCase()], x, y, {
    fontSize: 17,
    lineHeight: 20,
    fontFamily: BODY_FONT,
    fontWeight: 700,
    fill: '#7a2730',
    anchor,
    letterSpacing: 2.4,
  });
}

function renderApplicant(
  applicant: ResultImageApplicant,
  x: number,
  measureText: TextMeasurer,
): string {
  const primaryText = applicant.displayName ?? applicant.speciesName;
  const primary = fitMeasuredText(primaryText, {
    maxWidth: 350,
    maxLines: 2,
    fontSizes: applicant.displayName ? [32, 29, 26, 23] : [38, 34, 30, 26],
    fontFamily: DISPLAY_FONT,
    fontWeight: 700,
    measureText,
  });
  const species = applicant.displayName ? fitMeasuredText(applicant.speciesName, {
    maxWidth: 350,
    maxLines: 2,
    fontSizes: [23, 21, 19, 17],
    fontFamily: BODY_FONT,
    fontWeight: 700,
    measureText,
  }) : undefined;
  return `<g>
    <rect x="${x}" y="225" width="430" height="240" rx="13" fill="#f4ead1" stroke="#bda874" stroke-width="2"/>
    ${labelText(applicant.label, x + 30, 260)}
    ${svgText(primary.lines, x + 30, applicant.displayName ? 298 : 310, { fontSize: primary.fontSize, lineHeight: primary.lineHeight, fontFamily: DISPLAY_FONT, fontWeight: 700 })}
    ${species ? svgText(species.lines, x + 30, 365, { fontSize: species.fontSize, lineHeight: species.lineHeight, fontWeight: 700, fill: '#55483a' }) : ''}
    ${applicant.isTemporary ? svgText(['Temporary species'], x + 30, 414, { fontSize: 17, lineHeight: 21, fontWeight: 700, fill: '#7a2730' }) : ''}
    ${svgText([`${applicant.age} years old`], x + 30, 444, { fontSize: 22, lineHeight: 26, fontWeight: 600, fill: '#55483a' })}
  </g>`;
}

function renderLongevity(model: ResultImageModel, measureText: TextMeasurer): string {
  if (!model.longevity.length) return '';
  const entries = model.longevity.slice(0, 2).map((entry, index) => {
    const x = index === 0 ? 120 : 560;
    const fitted = fitMeasuredText(`${entry.applicantLabel}: ${entry.label}`, {
      maxWidth: 400,
      maxLines: 2,
      fontSizes: [23, 20, 18],
      fontWeight: 700,
      measureText,
    });
    return svgText(fitted.lines, x, 987, {
      fontSize: fitted.fontSize,
      lineHeight: fitted.lineHeight,
      fontWeight: 700,
      fill: '#55483a',
    });
  });

  return `<g>
    <rect x="90" y="925" width="900" height="105" rx="13" fill="#f4ead1" stroke="#bda874" stroke-width="2"/>
    ${labelText('Longevity advisory', 120, 958)}
    ${entries.join('')}
  </g>`;
}

/** @deprecated Retained only as a visual reference for the pre-v1.2 Bureau Classic layout. */
export function createLegacyResultCardSvg(
  model: ResultImageModel,
  options: ResultImageRenderOptions = {},
): string {
  const measureText = options.measureText ?? approximateTextMeasure;
  const maturityLabel = fitMeasuredText(model.maturity.label, {
    maxWidth: 820,
    maxLines: 2,
    fontSizes: [42, 38, 34],
    fontFamily: DISPLAY_FONT,
    fontWeight: 700,
    measureText,
  });
  const maturityDescription = fitMeasuredText(model.maturity.description, {
    maxWidth: 820,
    maxLines: 3,
    fontSizes: [24, 22, 20],
    measureText,
  });
  const experienceLabel = fitMeasuredText(model.experience.label, {
    maxWidth: 820,
    maxLines: 2,
    fontSizes: [38, 34, 30],
    fontFamily: DISPLAY_FONT,
    fontWeight: 700,
    measureText,
  });
  const experienceDescription = fitMeasuredText(model.experience.description, {
    maxWidth: 820,
    maxLines: 2,
    fontSizes: [23, 21, 19],
    measureText,
  });
  const experienceFacts = model.applicants.map((applicant) => fitMeasuredText(
    `${applicant.displayName ?? applicant.label}: ${applicant.adultExperience} years`,
    {
      maxWidth: 260,
      maxLines: 2,
      fontSizes: [19, 17, 15],
      fontWeight: 700,
      lineHeightRatio: 1.18,
      measureText,
    },
  ));
  const experienceGap = fitMeasuredText(`Gap: ${model.experience.gap} years`, {
    maxWidth: 240,
    maxLines: 2,
    fontSizes: [21, 19, 17],
    fontWeight: 700,
    lineHeightRatio: 1.18,
    measureText,
  });
  const hasLongevity = model.longevity.length > 0;
  const quoteY = hasLongevity ? 1045 : 945;
  const quoteHeight = hasLongevity ? 150 : 230;
  const quote = fitMeasuredText(`“${model.maturity.quip}”`, {
    maxWidth: 800,
    maxLines: hasLongevity ? 4 : 5,
    fontSizes: [28, 25, 22],
    fontFamily: DISPLAY_FONT,
    fontStyle: 'italic',
    lineHeightRatio: 1.28,
    measureText,
  });

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${RESULT_IMAGE_WIDTH}" height="${RESULT_IMAGE_HEIGHT}" viewBox="0 0 ${RESULT_IMAGE_WIDTH} ${RESULT_IMAGE_HEIGHT}">
  <rect width="1080" height="1350" fill="#241f1a"/>
  <rect x="42" y="38" width="996" height="1274" rx="18" fill="#d8c496" stroke="#9e844d" stroke-width="4"/>
  <rect x="62" y="58" width="956" height="1234" rx="12" fill="#efe2bf" stroke="#bda874" stroke-width="2"/>
  <path d="M86 202H994" stroke="#7a2730" stroke-width="3"/>
  <g transform="translate(88 78)">
    <circle cx="42" cy="42" r="38" fill="#7a2730"/>
    <circle cx="42" cy="42" r="29" fill="none" stroke="#efe2bf" stroke-width="2"/>
    <path d="M42 18 49 34 67 35 53 47 57 65 42 55 27 65 31 47 17 35 35 34Z" fill="#efe2bf"/>
  </g>
  ${svgText(['FANTASY AGE CHECKER'], 180, 112, { fontSize: 22, lineHeight: 26, fontWeight: 700, fill: '#7a2730', letterSpacing: 3.2 })}
  ${svgText(['BUREAU RULING'], 180, 159, { fontSize: 43, lineHeight: 48, fontFamily: DISPLAY_FONT, fontWeight: 700 })}
  ${svgText([`CASE ${model.caseNumber}`], 960, 143, { fontSize: 20, lineHeight: 24, fontWeight: 700, fill: '#55483a', anchor: 'end', letterSpacing: 1.4 })}

  ${renderApplicant(model.applicants[0], 90, measureText)}
  ${renderApplicant(model.applicants[1], 560, measureText)}

  <g>
    <rect x="90" y="480" width="900" height="185" rx="13" fill="#f8efd9" stroke="#bda874" stroke-width="2"/>
    ${labelText('Maturity compatibility', 540, 510, 'middle')}
    ${svgText(maturityLabel.lines, 540, 554, { fontSize: maturityLabel.fontSize, lineHeight: maturityLabel.lineHeight, fontFamily: DISPLAY_FONT, fontWeight: 700, anchor: 'middle' })}
    ${svgText(maturityDescription.lines, 540, 612, { fontSize: maturityDescription.fontSize, lineHeight: maturityDescription.lineHeight, fill: '#55483a', anchor: 'middle' })}
  </g>

  <g>
    <rect x="90" y="685" width="900" height="220" rx="13" fill="#f8efd9" stroke="#bda874" stroke-width="2"/>
    ${labelText('Adult experience gap', 540, 719, 'middle')}
    ${svgText(experienceLabel.lines, 540, 764, { fontSize: experienceLabel.fontSize, lineHeight: experienceLabel.lineHeight, fontFamily: DISPLAY_FONT, fontWeight: 700, anchor: 'middle' })}
    ${svgText(experienceDescription.lines, 540, 820, { fontSize: experienceDescription.fontSize, lineHeight: experienceDescription.lineHeight, fill: '#55483a', anchor: 'middle' })}
    ${svgText(experienceFacts[0].lines, 120, 870, { fontSize: experienceFacts[0].fontSize, lineHeight: experienceFacts[0].lineHeight, fontWeight: 700, fill: '#55483a' })}
    ${svgText(experienceFacts[1].lines, 960, 870, { fontSize: experienceFacts[1].fontSize, lineHeight: experienceFacts[1].lineHeight, fontWeight: 700, fill: '#55483a', anchor: 'end' })}
    ${svgText(experienceGap.lines, 540, 870, { fontSize: experienceGap.fontSize, lineHeight: experienceGap.lineHeight, fontWeight: 700, fill: '#7a2730', anchor: 'middle' })}
  </g>

  ${renderLongevity(model, measureText)}

  <g>
    <rect x="90" y="${quoteY}" width="900" height="${quoteHeight}" rx="13" fill="#7a2730"/>
    ${svgText(quote.lines, 540, quoteY + 48, { fontSize: quote.fontSize, lineHeight: quote.lineHeight, fontFamily: DISPLAY_FONT, fontWeight: 600, fontStyle: 'italic', fill: '#fff8e8', anchor: 'middle' })}
  </g>

  <g transform="translate(104 1208)">
    <circle cx="40" cy="40" r="36" fill="none" stroke="#7a2730" stroke-width="3"/>
    <circle cx="40" cy="40" r="27" fill="none" stroke="#7a2730" stroke-width="1.5"/>
    <path d="M40 20 45 34 60 34 48 43 53 58 40 49 27 58 32 43 20 34 35 34Z" fill="#7a2730"/>
  </g>
  ${svgText(['BUREAU REVIEWED'], 195, 1239, { fontSize: 18, lineHeight: 22, fontWeight: 700, fill: '#7a2730', letterSpacing: 2.1 })}
  ${svgText(['FANTASY AGE CHECKER • OFFICIAL COMPATIBILITY ASSESSMENT'], 960, 1258, { fontSize: 16, lineHeight: 20, fontWeight: 700, fill: '#55483a', anchor: 'end', letterSpacing: 1.1 })}
</svg>`;
}

export function createResultCardSvg(
  model: ResultImageModel,
  options: ResultImageRenderOptions = {},
): string {
  const formatId = options.formatId ?? DEFAULT_RESULT_CARD_FORMAT_ID;
  if (formatId === 'compact') return createCompactResultCardSvg(model, options);
  if (formatId === 'full-dossier') return createFullDossierResultCardSvg(model, options);
  return createThemedResultCardSvg(model, options);
}

export function createCanvasTextMeasurer(canvas?: HTMLCanvasElement): TextMeasurer {
  if (typeof document === 'undefined' && !canvas) return approximateTextMeasure;
  const measurementCanvas = canvas ?? document.createElement('canvas');
  const context = measurementCanvas.getContext('2d');
  if (!context) return approximateTextMeasure;

  return (text, style) => {
    context.font = `${style.fontStyle ?? 'normal'} ${style.fontWeight ?? 400} ${style.fontSize}px ${style.fontFamily}`;
    return context.measureText(text).width;
  };
}

function browserImageEnvironment(): ResultImageEnvironment {
  return {
    createObjectURL: (blob) => URL.createObjectURL(blob),
    revokeObjectURL: (url) => URL.revokeObjectURL(url),
    createImage: () => new Image() as unknown as ResultImageLike,
    createCanvas: () => document.createElement('canvas') as unknown as ResultCanvasLike,
  };
}

export async function renderResultSvgToPng(
  svg: string,
  environment: ResultImageEnvironment = browserImageEnvironment(),
  dimensions = getResultCardFormat(DEFAULT_RESULT_CARD_FORMAT_ID),
): Promise<Blob> {
  const svgBlob = new Blob([svg], { type: 'image/svg+xml;charset=utf-8' });
  const objectUrl = environment.createObjectURL(svgBlob);

  try {
    const image = environment.createImage();
    await new Promise<void>((resolve, reject) => {
      image.onload = () => resolve();
      image.onerror = () => reject(new Error('The result artwork could not be loaded.'));
      image.src = objectUrl;
    });

    const canvas = environment.createCanvas();
    canvas.width = dimensions.width;
    canvas.height = dimensions.height;
    const context = canvas.getContext('2d');
    if (!context) throw new Error('A canvas drawing context is unavailable.');
    context.drawImage(image, 0, 0, dimensions.width, dimensions.height);

    const png = await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob((blob) => {
        if (blob) resolve(blob);
        else reject(new Error('The browser could not encode the result image.'));
      }, RESULT_IMAGE_MIME_TYPE);
    });
    return png;
  } finally {
    environment.revokeObjectURL(objectUrl);
  }
}

export async function createResultPng(
  source: ResultImageSource,
  environment?: ResultImageEnvironment,
  measureText: TextMeasurer = createCanvasTextMeasurer(),
  themeId: ResultImageThemeId = DEFAULT_RESULT_IMAGE_THEME_ID,
  formatId: ResultCardFormatId = DEFAULT_RESULT_CARD_FORMAT_ID,
): Promise<Blob> {
  const model = buildResultImageModel(source);
  const format = getResultCardFormat(formatId);
  const svg = createResultCardSvg(model, { measureText, themeId, formatId });
  return renderResultSvgToPng(svg, environment, format);
}

export function resultImageFilename(caseNumber: string): string {
  const safeCaseNumber = caseNumber
    .trim()
    .replace(/[^a-zA-Z0-9-]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
  return `fantasy-age-ruling-${safeCaseNumber || 'bureau-assessment'}.png`;
}

function browserDownloadEnvironment(): ResultDownloadEnvironment {
  return {
    createObjectURL: (blob) => URL.createObjectURL(blob),
    revokeObjectURL: (url) => URL.revokeObjectURL(url),
    createAnchor: () => document.createElement('a'),
    schedule: (callback) => window.setTimeout(callback, 0),
  };
}

export function downloadResultPng(
  blob: Blob,
  caseNumber: string,
  environment: ResultDownloadEnvironment = browserDownloadEnvironment(),
): string {
  const filename = resultImageFilename(caseNumber);
  const objectUrl = environment.createObjectURL(blob);
  const anchor = environment.createAnchor();
  anchor.href = objectUrl;
  anchor.download = filename;
  anchor.click();
  environment.schedule(() => environment.revokeObjectURL(objectUrl));
  return filename;
}

function defaultFileFactory(blob: Blob, name: string, type: string): File {
  return new File([blob], name, { type });
}

export function supportsImageFileSharing(
  navigatorLike: ImageShareNavigator | undefined,
  fileFactory: ResultFileFactory = defaultFileFactory,
): boolean {
  if (!navigatorLike?.share || !navigatorLike.canShare) return false;
  if (fileFactory === defaultFileFactory && typeof File === 'undefined') return false;
  try {
    const probe = fileFactory(new Blob([''], { type: RESULT_IMAGE_MIME_TYPE }), 'ruling.png', RESULT_IMAGE_MIME_TYPE);
    return navigatorLike.canShare({ files: [probe] });
  } catch {
    return false;
  }
}

export async function shareResultPng(
  blob: Blob,
  caseNumber: string,
  navigatorLike: ImageShareNavigator | undefined,
  fileFactory: ResultFileFactory = defaultFileFactory,
): Promise<ResultImageShareOutcome> {
  if (!navigatorLike?.share || !navigatorLike.canShare) return 'unsupported';
  if (fileFactory === defaultFileFactory && typeof File === 'undefined') return 'unsupported';

  try {
    const file = fileFactory(blob, resultImageFilename(caseNumber), RESULT_IMAGE_MIME_TYPE);
    const shareData: ShareData = {
      title: 'Fantasy Age Checker bureau ruling',
      text: `Bureau ruling ${caseNumber}`,
      files: [file],
    };
    if (!navigatorLike.canShare(shareData)) return 'unsupported';
    await navigatorLike.share(shareData);
    return 'shared';
  } catch (error) {
    return error instanceof DOMException && error.name === 'AbortError' ? 'cancelled' : 'failed';
  }
}
