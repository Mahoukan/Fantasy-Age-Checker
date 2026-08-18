import { BureauInsignia } from './BureauInsignia'
import { navigationItems, type NavigationSection } from '../utils/navigation'

interface HeaderProps {
  activeSection: NavigationSection
  onNavigate: (section: NavigationSection) => void
}

export function Header({ activeSection, onNavigate }: HeaderProps) {
  return (
    <header className="site-header">
      <div className="header-inner">
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
      </div>
    </header>
  )
}
