import {
  DEFAULT_RESULT_IMAGE_THEME_ID,
  resultImageThemeIds,
  type ResultImageThemeId,
} from '../data/resultImageThemes'
import { getWebsiteTheme, type SiteThemePalette } from '../data/siteThemes'
import type { StorageLike } from './quipSelector'

export const SITE_THEME_STORAGE_KEY = 'fantasy-age-checker-site-theme'
export const DEFAULT_SITE_THEME_ID = DEFAULT_RESULT_IMAGE_THEME_ID

export function isThemeId(value: unknown): value is ResultImageThemeId {
  return typeof value === 'string' && resultImageThemeIds.some((id) => id === value)
}

export function readSiteTheme(storage?: StorageLike): ResultImageThemeId {
  if (!storage) return DEFAULT_SITE_THEME_ID
  try {
    const stored = storage.getItem(SITE_THEME_STORAGE_KEY)
    return isThemeId(stored) ? stored : DEFAULT_SITE_THEME_ID
  } catch {
    return DEFAULT_SITE_THEME_ID
  }
}

export function saveSiteTheme(themeId: ResultImageThemeId, storage?: StorageLike): boolean {
  if (!storage) return false
  try {
    storage.setItem(SITE_THEME_STORAGE_KEY, themeId)
    return true
  } catch {
    return false
  }
}

export function getBrowserThemeStorage(): StorageLike | undefined {
  try {
    return typeof window === 'undefined' ? undefined : window.localStorage
  } catch {
    return undefined
  }
}

export interface ThemeRootLike {
  dataset: Record<string, string | undefined>
  style: { setProperty(name: string, value: string): void }
}

const paletteProperties: Record<keyof SiteThemePalette, string> = {
  background: '--site-bg',
  backgroundAlt: '--site-bg-alt',
  headerBackground: '--header-bg',
  surface: '--surface',
  surfaceRaised: '--surface-raised',
  surfaceInset: '--surface-inset',
  textPrimary: '--text-primary',
  textSecondary: '--text-secondary',
  heading: '--heading-color',
  accent: '--accent',
  secondaryAccent: '--accent-secondary',
  border: '--border',
  borderStrong: '--border-strong',
  focus: '--focus',
  positive: '--positive',
  warning: '--warning',
  danger: '--danger',
  inputBackground: '--input-bg',
  inputText: '--input-text',
  buttonBackground: '--button-bg',
  buttonText: '--button-text',
  shadow: '--shadow',
}

export function applySiteTheme(themeId: string, root: ThemeRootLike): void {
  const theme = getWebsiteTheme(themeId)
  root.dataset.theme = theme.id
  root.dataset.presentation = theme.site.presentation.strategy
  root.dataset.decorativeStyle = theme.site.decorativeStyle
  for (const [key, property] of Object.entries(paletteProperties)) {
    root.style.setProperty(property, theme.site.palette[key as keyof SiteThemePalette])
  }
  root.style.setProperty('--heading-font', theme.site.headingFont)
  root.style.setProperty('--body-font', theme.site.bodyFont)
  root.style.setProperty('--panel-radius', theme.site.presentation.panelRadius)
  root.style.setProperty('--panel-border-width', theme.site.presentation.panelBorderWidth)
  root.style.setProperty('--panel-shadow', theme.site.presentation.panelShadow)
  root.style.setProperty('--heading-letter-spacing', theme.site.presentation.headingLetterSpacing)
  for (const [location, label] of Object.entries(theme.site.presentation.labels)) {
    root.style.setProperty(`--theme-label-${location}`, JSON.stringify(label))
  }
}
