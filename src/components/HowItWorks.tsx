import { experienceVerdicts, maturityVerdicts } from '../data/verdicts'
import { EXPERIENCE_GAP_THRESHOLDS } from '../utils/experience'
import { formatEquivalentYears, formatYears } from '../utils/format'
import { getWorkedExample } from '../utils/information'
import { LONGEVITY_THRESHOLDS } from '../utils/longevity'
import {
  EXCELLENT_DIFFERENCE_THRESHOLD,
  GOOD_DIFFERENCE_THRESHOLD,
  HUMAN_REFERENCE_LIFESPAN,
  TRADITIONAL_MAXIMUM_OFFSET,
  TRADITIONAL_MINIMUM_OFFSET,
} from '../utils/maturity'
import { ThemeOrnament } from './ThemeOrnament'

export function HowItWorks() {
  const example = getWorkedExample()

  return (
    <section className="information-section" id="how-it-works" aria-labelledby="how-it-works-title">
      <ThemeOrnament location="information" />
      <header className="information-header">
        <p className="eyebrow dark">Procedural manual ARB-02</p>
        <h1 id="how-it-works-title">How It Works</h1>
        <p>
          The Bureau issues two independent assessments and one contextual longevity record. The arithmetic is
          fictional, but it remains consistent from one filing to the next.
        </p>
      </header>

      <div className="method-stack">
        <article className="method-card" id="adulthood-method">
          <span className="method-number">Procedure 1</span>
          <h3>Adulthood Safeguard</h3>
          <p>
            Every species has a recognised adulthood age. If either applicant has not reached that threshold,
            the Bureau refuses to issue a compatibility assessment; maturity and experience assessments do not run.
          </p>
        </article>

        <article className="method-card" id="maturity-method">
          <span className="method-number">Procedure 2</span>
          <h3>Maturity Compatibility</h3>
          <p>
            The familiar human guideline gives a minimum of <code>age / 2 + {TRADITIONAL_MINIMUM_OFFSET}</code> and
            a maximum of <code>age x 2 - {TRADITIONAL_MAXIMUM_OFFSET}</code>. The constants are fractions of the
            {` ${HUMAN_REFERENCE_LIFESPAN}`}-year human reference lifespan: 7 is one twelfth and 14 is one sixth.
          </p>
          <div className="formula-panel" aria-label="Species maturity formulas">
            <code>speciesSeven = typicalLifespan / 12</code>
            <code>speciesFourteen = typicalLifespan / 6</code>
            <code>humanEquivalentAge = (age / typicalLifespan) x {HUMAN_REFERENCE_LIFESPAN}</code>
          </div>
          <p>
            Both ages are converted to that shared scale. Each applicant must fall inside the other's allowed
            range, so compatibility must work in both directions.
          </p>
          <dl className="category-list">
            <div><dt>{maturityVerdicts.EXCELLENT.label}</dt><dd>Equivalent ages differ by no more than {EXCELLENT_DIFFERENCE_THRESHOLD * 100}% of the older age.</dd></div>
            <div><dt>{maturityVerdicts.GOOD.label}</dt><dd>The difference is above 10% but no more than {GOOD_DIFFERENCE_THRESHOLD * 100}%.</dd></div>
            <div><dt>{maturityVerdicts.BORDERLINE.label}</dt><dd>The pair remains mutually compatible, with a difference above 25%.</dd></div>
            <div><dt>{maturityVerdicts.INCOMPATIBLE.label}</dt><dd>At least one applicant falls outside the other's allowed range.</dd></div>
          </dl>
        </article>

        <article className="method-card" id="experience-method">
          <span className="method-number">Procedure 3</span>
          <h3>Experience Gap</h3>
          <div className="formula-panel"><code>adultExperience = age - recognisedAdulthoodAge</code></div>
          <p>
            Experience uses actual adult years and is deliberately not normalised by lifespan. This is why two
            applicants can be maturity peers while having lived through very different amounts of history.
          </p>
          <dl className="category-list compact-ranges">
            <div><dt>0-{EXPERIENCE_GAP_THRESHOLDS.basicallyPeersMaximum} years</dt><dd>{experienceVerdicts.BASICALLY_PEERS.label}</dd></div>
            <div><dt>&gt;{EXPERIENCE_GAP_THRESHOLDS.basicallyPeersMaximum}-{EXPERIENCE_GAP_THRESHOLDS.noticeableMaximum} years</dt><dd>{experienceVerdicts.NOTICEABLE.label}</dd></div>
            <div><dt>&gt;{EXPERIENCE_GAP_THRESHOLDS.noticeableMaximum}-{EXPERIENCE_GAP_THRESHOLDS.considerableMaximum} years</dt><dd>{experienceVerdicts.CONSIDERABLE.label}</dd></div>
            <div><dt>&gt;{EXPERIENCE_GAP_THRESHOLDS.considerableMaximum}-{EXPERIENCE_GAP_THRESHOLDS.formidableMaximum} years</dt><dd>{experienceVerdicts.FORMIDABLE.label}</dd></div>
            <div><dt>&gt;{EXPERIENCE_GAP_THRESHOLDS.formidableMaximum}-{EXPERIENCE_GAP_THRESHOLDS.historicalMaximum} years</dt><dd>{experienceVerdicts.HISTORICAL.label}</dd></div>
            <div><dt>&gt;{EXPERIENCE_GAP_THRESHOLDS.historicalMaximum} years</dt><dd>{experienceVerdicts.CIVILIZATIONS.label}</dd></div>
          </dl>
        </article>

        <article className="method-card" id="longevity-method">
          <span className="method-number">Context record</span>
          <h3>Longevity Context</h3>
          <div className="formula-panel"><code>longevityRatio = age / typicalLifespan</code></div>
          <p>
            Typical lifespan is not a maximum. Ages above it remain valid, and longevity neither rejects an
            applicant nor changes maturity or experience. It supplies factual context and eligible Bureau humour.
          </p>
          <dl className="category-list compact-ranges">
            <div><dt>&lt;={LONGEVITY_THRESHOLDS.normalMaximum * 100}%</dt><dd>Within Typical Lifespan</dd></div>
            <div><dt>&gt;100%-{LONGEVITY_THRESHOLDS.exceptionalMaximum * 100}%</dt><dd>Exceptionally Old</dd></div>
            <div><dt>&gt;125%-{LONGEVITY_THRESHOLDS.ancientMaximum * 100}%</dt><dd>Ancient</dd></div>
            <div><dt>&gt;200%-{LONGEVITY_THRESHOLDS.legendaryMaximum * 100}%</dt><dd>Legendary Longevity</dd></div>
            <div><dt>&gt;500%</dt><dd>Chronological Anomaly</dd></div>
          </dl>
        </article>
      </div>

      <article className="worked-example" aria-labelledby="worked-example-title">
        <p className="eyebrow dark">Worked filing</p>
        <h3 id="worked-example-title">Elf 300 + Human 34</h3>
        <div className="worked-example-grid">
          <div>
            <h4>Maturity</h4>
            <p><strong>Elf:</strong> 300 / {example.elf.typicalLifespan} x 84 = {formatEquivalentYears(example.maturity.applicantAEquivalentAge)}</p>
            <p><strong>Human:</strong> 34 / {example.human.typicalLifespan} x 84 = {formatEquivalentYears(example.maturity.applicantBEquivalentAge)}</p>
            <strong className="worked-result">{example.maturityLabel}</strong>
          </div>
          <div>
            <h4>Adult experience</h4>
            <p><strong>Elf:</strong> 300 - {example.elf.adulthoodAge} = {formatYears(example.experience.applicantAAdultExperience)} years</p>
            <p><strong>Human:</strong> 34 - {example.human.adulthoodAge} = {formatYears(example.experience.applicantBAdultExperience)} years</p>
            <p><strong>Gap:</strong> {formatYears(example.experience.adultExperienceGap)} years</p>
            <strong className="worked-result">{example.experienceLabel}</strong>
          </div>
        </div>
        <p className="worked-conclusion">
          Similar lifecycle position, very different adult history: disagreement between the verdicts is an intended feature.
        </p>
      </article>
    </section>
  )
}
