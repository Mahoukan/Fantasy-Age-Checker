import { useEffect, useState } from 'react'
import { About } from './components/About'
import { Checker } from './components/Checker'
import { Header } from './components/Header'
import { Hero } from './components/Hero'
import { HowItWorks } from './components/HowItWorks'
import { SpeciesGuide } from './components/SpeciesGuide'
import { getNavigationSection, type NavigationSection } from './utils/navigation'

export function App() {
  const [activeSection, setActiveSection] = useState<NavigationSection>(() => (
    typeof window === 'undefined' ? 'checker' : getNavigationSection(window.location.hash)
  ))

  useEffect(() => {
    const syncHash = () => setActiveSection(getNavigationSection(window.location.hash))
    window.addEventListener('hashchange', syncHash)
    return () => window.removeEventListener('hashchange', syncHash)
  }, [])

  return (
    <>
      <Header activeSection={activeSection} onNavigate={setActiveSection} />
      <main>
        <Hero />
        <Checker />
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
