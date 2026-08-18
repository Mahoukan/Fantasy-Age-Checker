import { ThemeOrnament } from './ThemeOrnament'

export function Hero() {
  return (
    <section className="hero" aria-labelledby="hero-title">
      <p className="eyebrow">Official chronological guidance · Form ARB-01</p>
      <h1 id="hero-title">Is 300 too old for 34?</h1>
      <p className="hero-lead">In human terms: probably. In elf terms: it&apos;s complicated.</p>
      <p className="hero-support">
        The Fantasy Age Checker compares maturity, lifespan and life experience across the peoples of the realm.
      </p>
      <ThemeOrnament location="hero" />
    </section>
  )
}
