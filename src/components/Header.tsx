import { BureauInsignia } from './BureauInsignia'
import { navigationItems, type NavigationSection } from '../utils/navigation'
import {
  DEFAULT_RESULT_IMAGE_THEME_ID,
  resultImageThemes,
  type ResultImageThemeId,
} from '../data/resultImageThemes'
import { ThemeOrnament } from './ThemeOrnament'

interface HeaderProps {
  activeSection: NavigationSection
  siteThemeId?: ResultImageThemeId
  onNavigate: (section: NavigationSection) => void
  onThemeChange?: (themeId: ResultImageThemeId) => void
}

export function Header({
  activeSection,
  siteThemeId = DEFAULT_RESULT_IMAGE_THEME_ID,
  onNavigate,
  onThemeChange = () => undefined,
}: HeaderProps) {
  return (
    <header className="site-header">
      <div className="header-inner">
        <ThemeOrnament location="header" />
        <a
          className="bureau-brand"
          href="#checker"
          aria-label="Arcane Relationship Bureau checker"
          onClick={() => onNavigate('checker')}
        >
          <BureauInsignia />
          <span>
            <strong>The Arcane Relationship Bureau</strong>
            <small>Department of Inter-Species Affairs</small>
          </span>
        </a>

        <div className="header-actions">
          <nav aria-label="Main navigation">
            {navigationItems.map((item) => (
              <a
                className={`nav-link${activeSection === item.id ? ' active' : ''}`}
                href={`#${item.id}`}
                aria-current={activeSection === item.id ? 'location' : undefined}
                onClick={() => onNavigate(item.id)}
                key={item.id}
              >
                {item.label}
              </a>
            ))}
          </nav>
          <label className="site-theme-control">
            <span>Theme</span>
            <select
              aria-label="Website theme"
              value={siteThemeId}
              onChange={(event) => onThemeChange(event.target.value as ResultImageThemeId)}
            >
              {resultImageThemes.map((theme) => (
                <option value={theme.id} key={theme.id}>{theme.name}</option>
              ))}
            </select>
          </label>
        </div>
      </div>
    </header>
  )
}
