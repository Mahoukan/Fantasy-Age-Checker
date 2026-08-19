import { useEffect, useMemo, useState } from 'react'
import { About } from './components/About'
import { BureauCases } from './components/BureauCases'
import { Checker } from './components/Checker'
import { Header } from './components/Header'
import { HowItWorks } from './components/HowItWorks'
import { ImmortalAffairs } from './components/ImmortalAffairs'
import { SpeciesGuide } from './components/SpeciesGuide'
import { DEFAULT_RESULT_IMAGE_THEME_ID, type ResultImageThemeId } from './data/resultImageThemes'
import { getNavigationSection, type NavigationSection } from './utils/navigation'
import { applySiteTheme, getBrowserThemeStorage, saveSiteTheme } from './utils/siteTheme'
import { ThemeOrnament } from './components/ThemeOrnament'
import type { BureauCaseInput, BureauCaseLoadRequest } from './data/bureauCases'
import { species as builtInSpecies, type CustomSpecies } from './data/species'

interface AppProps {
  initialSiteThemeId?: ResultImageThemeId
  initialNavigationSection?: NavigationSection
}

export function App({
  initialSiteThemeId = DEFAULT_RESULT_IMAGE_THEME_ID,
  initialNavigationSection = 'checker',
}: AppProps) {
  const [siteThemeId, setSiteThemeId] = useState<ResultImageThemeId>(initialSiteThemeId)
  const [bureauCaseRequest, setBureauCaseRequest] = useState<BureauCaseLoadRequest>()
  const [customSpecies, setCustomSpecies] = useState<CustomSpecies[]>([])
  const availableSpecies = useMemo(() => [...builtInSpecies, ...customSpecies], [customSpecies])
  const [activeSection, setActiveSection] = useState<NavigationSection>(() => (
    typeof window === 'undefined' ? initialNavigationSection : getNavigationSection(window.location.hash)
  ))

  useEffect(() => {
    const syncHash = () => {
      const section = getNavigationSection(window.location.hash)
      const canonicalHash = `#${section}`
      if (window.location.hash !== canonicalHash) {
        window.history.replaceState(null, '', `${window.location.pathname}${window.location.search}${canonicalHash}`)
      }
      setActiveSection(section)
      window.scrollTo({ top: 0, left: 0, behavior: 'auto' })
    }
    syncHash()
    window.addEventListener('hashchange', syncHash)
    return () => window.removeEventListener('hashchange', syncHash)
  }, [])

  function handleSiteThemeChange(themeId: ResultImageThemeId) {
    setSiteThemeId(themeId)
    if (typeof document !== 'undefined') applySiteTheme(themeId, document.documentElement)
    saveSiteTheme(themeId, getBrowserThemeStorage())
  }

  function handleLoadBureauCase(caseData: BureauCaseInput, announcement: string) {
    setBureauCaseRequest((current) => ({ id: (current?.id ?? 0) + 1, caseData, announcement }))
    window.location.hash = 'checker'
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
        <Checker
          activeSection={activeSection}
          siteThemeId={siteThemeId}
          bureauCaseRequest={bureauCaseRequest}
          customSpecies={customSpecies}
          onCustomSpeciesChange={setCustomSpecies}
        />
        <div className="primary-view" data-primary-view="bureau-cases" hidden={activeSection !== 'bureau-cases'}>
          <BureauCases onLoadCase={handleLoadBureauCase} />
        </div>
        <div className="primary-view" data-primary-view="species-guide" hidden={activeSection !== 'species-guide'}>
          <SpeciesGuide onLoadCase={handleLoadBureauCase} />
        </div>
        <div className="primary-view" data-primary-view="how-it-works" hidden={activeSection !== 'how-it-works'}>
          <HowItWorks />
        </div>
        <div className="primary-view" data-primary-view="immortal-affairs" hidden={activeSection !== 'immortal-affairs'}>
          <ImmortalAffairs availableSpecies={availableSpecies} siteThemeId={siteThemeId} />
        </div>
        <div className="primary-view" data-primary-view="about" hidden={activeSection !== 'about'}>
          <About />
        </div>
      </main>
      <footer className="site-footer">
        <ThemeOrnament location="footer" />
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
