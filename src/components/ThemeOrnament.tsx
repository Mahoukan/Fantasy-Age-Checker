export type ThemeOrnamentLocation =
  | 'header'
  | 'hero'
  | 'checker'
  | 'applicant'
  | 'consultation'
  | 'result'
  | 'assessment'
  | 'calculations'
  | 'information'
  | 'footer'

interface ThemeOrnamentProps {
  location: ThemeOrnamentLocation
}

/** Shared, presentation-only geometry. Its meaning and shape come from theme CSS. */
export function ThemeOrnament({ location }: ThemeOrnamentProps) {
  return (
    <span
      className={`theme-ornament theme-ornament-${location}`}
      data-theme-ornament={location}
      aria-hidden="true"
    >
      <i />
      <b />
      <i />
    </span>
  )
}
