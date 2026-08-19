export const navigationItems = [
  { id: 'checker', label: 'Checker' },
  { id: 'reverse-lookup', label: 'Reverse Lookup' },
  { id: 'bureau-cases', label: 'Bureau Cases' },
  { id: 'species-guide', label: 'Species Guide' },
  { id: 'how-it-works', label: 'How It Works' },
  { id: 'immortal-affairs', label: 'Immortal Affairs' },
  { id: 'about', label: 'About' },
] as const

export type NavigationSection = (typeof navigationItems)[number]['id']

export function getNavigationSection(hash: string): NavigationSection {
  const candidate = hash.replace(/^#/, '')
  return navigationItems.some((item) => item.id === candidate)
    ? candidate as NavigationSection
    : 'checker'
}
