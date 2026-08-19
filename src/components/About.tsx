import { ThemeOrnament } from './ThemeOrnament'

export function About() {
  return (
    <section className="information-section about-section" id="about" aria-labelledby="about-title">
      <ThemeOrnament location="information" />
      <header className="information-header">
        <p className="eyebrow dark">Public information notice</p>
        <h1 id="about-title">About</h1>
      </header>
      <div className="about-copy">
        <p>
          Fantasy Age Checker is a fictional entertainment project exploring how age comparisons become strange
          when fantasy peoples have radically different lifespans and adulthood conventions.
        </p>
        <p>
          Built-in lifecycle values are generic assumptions created for this tool, not statements about any
          particular fantasy setting. Users may register a temporary species name, adulthood age, and typical
          lifespan; it uses the same calculations, lasts until refresh, and never enters the permanent Species Guide.
        </p>
        <p>
          The two verdicts deliberately remain separate. The app provides no overall compatibility score and is not
          relationship, legal, or personal advice.
        </p>
      </div>
      <aside className="about-disclaimer">
        <strong>Jurisdictional status</strong>
        <p>
          The Arcane Relationship Bureau is fictional and has recognised authority in exactly zero known kingdoms.
          Its calculations are invented for fantasy-world humour and should not be treated as real guidance.
        </p>
      </aside>
    </section>
  )
}
