import { useEffect, useState } from 'react'
import { About } from './components/About'
import { Checker } from './components/Checker'
import { Header } from './components/Header'
import { Hero } from './components/Hero'
import { HowItWorks } from './components/HowItWorks'
import { SpeciesGuide } from './components/SpeciesGuide'
import { DEFAULT_RESULT_IMAGE_THEME_ID, type ResultImageThemeId } from './data/resultImageThemes'
import { getNavigationSection, type NavigationSection } from './utils/navigation'
import { applySiteTheme, getBrowserThemeStorage, saveSiteTheme } from './utils/siteTheme'

interface AppProps {
  initialSiteThemeId?: ResultImageThemeId
}

export function App({ initialSiteThemeId = DEFAULT_RESULT_IMAGE_THEME_ID }: AppProps) {
  const [siteThemeId, setSiteThemeId] = useState<ResultImageThemeId>(initialSiteThemeId)
  const [activeSection, setActiveSection] = useState<NavigationSection>(() => (
    typeof window === 'undefined' ? 'checker' : getNavigationSection(window.location.hash)
  ))

  useEffect(() => {
    const syncHash = () => setActiveSection(getNavigationSection(window.location.hash))
    window.addEventListener('hashchange', syncHash)
    return () => window.removeEventListener('hashchange', syncHash)
  }, [])

  function handleSiteThemeChange(themeId: ResultImageThemeId) {
    setSiteThemeId(themeId)
    if (typeof document !== 'undefined') applySiteTheme(themeId, document.documentElement)
    saveSiteTheme(themeId, getBrowserThemeStorage())
  }

  return (
    <>
      <Header
        activeSection={activeSection}
        siteThemeId={siteThemeId}
        onNavigate={setActiveSection}
        onThemeChange={handleSiteThemeChange}
      />
      <main>
        <Hero />
        <Checker siteThemeId={siteThemeId} />
        <SpeciesGuide />
        <HowItWorks />
        <About />
      </main>
      <footer className="site-footer">
        <strong>Fantasy Age Checker · Arcane Relationship Bureau</strong>
        <p>All rulings are legally binding in exactly zero jurisdictions. For fictional entertainment only.</p>
        <p className="footer-links">
          <a href="#how-it-works">How It Works</a>
          <span aria-hidden="true">·</span>
          <a href="#about">About</a>
        </p>
      </footer>
    </>
  )
}
