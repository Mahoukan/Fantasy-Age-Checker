import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { App } from './App'
import { applySiteTheme, getBrowserThemeStorage, readSiteTheme } from './utils/siteTheme'
import './styles/global.css'

const initialSiteThemeId = readSiteTheme(getBrowserThemeStorage())
applySiteTheme(initialSiteThemeId, document.documentElement)

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App initialSiteThemeId={initialSiteThemeId} />
  </StrictMode>,
)
