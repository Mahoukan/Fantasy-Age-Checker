# Fantasy Age Checker

## Design & Architecture Document — Version 2.0

> **Core identity:** A completely unnecessary government service that fantasy civilisation has somehow decided is essential.

**Fantasy Age Checker** is a humorous fantasy-themed web application presented as an official service of the **Arcane Relationship Bureau — Department of Inter-Species Affairs**.

The site compares fictional characters whose species may mature and age at radically different rates. Its central joke is that chronological age becomes administratively difficult when one species may live for decades and another for centuries.

The application treats this ridiculous problem with complete bureaucratic seriousness.

---

# 1. Product Principles

## Funny, but not childish

Humour should come primarily from:

- fantasy bureaucracy
- chronological absurdity
- historical scale
- paperwork
- actuarial expectations
- councils, registries, archives and tribunals
- contradictions between lifecycle maturity and lived experience

Avoid:

- sexual humour
- jokes involving minors
- crude language
- mean-spirited humour
- stereotypes of real-world groups
- direct use of copyrighted fantasy settings

## Immediately understandable

The main Checker remains the primary experience.

A new user should be able to:

1. choose two species,
2. enter two ages,
3. optionally enter names,
4. press **Consult the Oracle**,
5. understand the result without reading documentation first.

Supporting tools must never obscure the main Checker.

## Internally consistent

The mathematics is intentionally fictional, but it must be deterministic and explainable.

Presentation may vary.

Calculations must not.

## Appropriate

If either applicant is below the recognised adulthood age for their species, the normal consultation stops immediately.

Rejected underage submissions do not receive:

- maturity analysis
- experience analysis
- consultation theatre
- case numbers
- normal rotating humour
- Longevity Theatre
- Rare Bureau Findings

## Replayable

Repeated use is encouraged through:

- a large rotating quip library
- anti-repetition logic
- random Bureau Cases
- three Daily Bureau Files
- curated archive cases
- ten website themes
- ten result-card themes
- three result-card formats
- rare deterministic findings

---

# 2. Fictional Institution

## The Arcane Relationship Bureau

**Department of Inter-Species Affairs**

The visual and writing style should suggest:

> A modern government service somehow operating inside a fantasy civilisation.

The Bureau is:

- formal
- confident
- bureaucratic
- slightly weary
- completely convinced this paperwork is necessary

The Bureau does not “approve relationships”.

It issues fictional chronological and lifecycle assessments.

---

# 3. Main Information Architecture

The primary hash navigation is:

1. **Checker**
2. **Reverse Lookup**
3. **Bureau Cases**
4. **Species Guide**
5. **How It Works**
6. **About**

Stable anchors:

- `#checker`
- `#reverse-lookup`
- `#bureau-cases`
- `#species-guide`
- `#how-it-works`
- `#immortal-affairs`
- `#about`

The application does not require a client-side router.

Each hash displays one primary section at a time. Primary sections remain mounted but inactive sections are hidden from layout and accessibility APIs, allowing temporary Checker and Reverse Lookup state to survive navigation.

## Fictional agency structure

The **ARB — Arcane Relationship Bureau**, Department of Inter-Species Affairs, is the umbrella organisation. Its agencies are:

- **DMV — Department of Maturity Verification:** Checker and normal compatibility assessments.
- **CIA — Chronological Intelligence Agency:** Reverse Lookup and the Chronological Equivalence Office.
- **CASE — Chronological Assessment & Scenario Exchange:** random assignments, Daily Bureau Files, and archive cases.
- **IRS — Inter-Species Registry Service:** Species Guide and Bureau Species Register.
- **MATH — Maturity & Age Technical Handbook:** How It Works and the Bureau's technical explanations.
- **FOIA — Fantasy Office of Institutional Affairs:** About and institutional information.
- **FBI — Fantasy Bureau of Immortality:** Immortal Affairs and the separate v3 indefinite-lifecycle model.

The agency names describe the fictional presentation hierarchy. DMV, CIA, CASE, IRS, MATH, and FOIA retain their existing systems; FBI is deliberately a separate lifecycle-calculation jurisdiction and does not alter the mortal Checker.

---

# 4. Main Checker

The Checker compares two applicants.

Each applicant may provide:

- optional name
- species
- chronological age

Built-in and temporary custom species are supported.

The primary action remains:

# CONSULT THE ORACLE

A valid adult submission enters a short consultation sequence before revealing the result.

The Checker produces two independent primary assessments:

1. **Maturity Compatibility**
2. **Experience Gap**

It may also show:

- longevity context
- Bureau calculations
- Bureau Note
- Longevity Theatre
- Rare Bureau Findings
- case number
- sharing controls
- image-export controls

There is deliberately **no combined score or overall compatibility percentage**.

Contradictory maturity and experience results are a feature.

---

# 5. Canonical Species Data

All calculation-relevant species data lives in one canonical registry.

Each built-in species has:

- stable species ID
- display name
- recognised adulthood age
- typical lifespan
- grouping
- case code

Typical lifespan is a **reference value, not a maximum age**.

## Built-in species

| Species | Adulthood | Typical lifespan |
|---|---:|---:|
| Human | 18 | 84 |
| Elf | 100 | 750 |
| Dwarf | 40 | 300 |
| Halfling | 33 | 110 |
| Orc | 16 | 70 |
| Gnome | 40 | 350 |
| Dragonborn | 15 | 80 |
| Goblin | 12 | 60 |
| Dragon | 100 | 1500 |
| Half-Elf | 20 | 180 |
| Half-Orc | 16 | 75 |
| Fae | 50 | 500 |
| Fairy | 18 | 250 |
| Pixie | 12 | 120 |
| Giant | 40 | 350 |
| Troll | 18 | 140 |
| Ogre | 16 | 95 |
| Kobold | 10 | 60 |
| Centaur | 18 | 100 |
| Satyr | 18 | 120 |
| Minotaur | 18 | 120 |
| Merfolk | 20 | 160 |
| Harpy | 16 | 90 |
| Dryad | 40 | 500 |
| Nymph | 30 | 400 |
| Kitsune | 20 | 500 |
| Oni | 25 | 300 |
| Djinn | 80 | 1000 |
| Gargoyle | 30 | 450 |
| Sphinx | 40 | 600 |

Built-in selector groups remain:

- Common Peoples
- Fey & Enchanted
- Beastfolk & Mythic Peoples
- Giants & Monstrous Peoples
- Ancient Peoples

Presentation-only registries must not duplicate or override canonical lifecycle values.

---

# 6. Adulthood Safeguard

Every species defines a recognised adulthood age.

If:

```text
age < adulthoodAge
```

the normal consultation is rejected.

A character exactly at their adulthood threshold is treated as an adult by the model.

The adulthood safeguard always takes precedence over:

- maturity analysis
- experience analysis
- longevity presentation
- humour
- case generation

Rejection wording should remain restrained and appropriate.

---

# 7. Maturity Compatibility

Maturity represents where a character sits within the expected lifecycle of their species.

The application converts chronological age into a human-equivalent maturity age using a human reference lifespan of 84 years:

```text
humanEquivalentAge = age / typicalLifespan × 84
```

The traditional half-age-plus-seven rule is then applied in equivalent-age space.

For equivalent age `E`:

```text
minimum = E / 2 + 7
maximum = E × 2 - 14
```

Compatibility is **mutual**.

Both applicants must fall within each other's accepted equivalent-age range.

## Stable maturity categories

### Excellent
**Remarkably Well Matched**

Relative maturity difference ≤ 10%.

### Good
**Well Matched**

Relative maturity difference ≤ 25%.

### Borderline
**Within Accepted Bounds**

The pair remains mutually compatible, but relative maturity difference is greater than 25%.

### Incompatible
**Maturity Mismatch**

The pair falls outside the mutual compatible range.

These categories and thresholds are canonical calculation logic and must not vary by theme, discovery tool or image format.

---

# 8. Experience Gap

Experience is intentionally separate from maturity.

For adults:

```text
adultExperience = age - adulthoodAge
```

The experience gap is:

```text
abs(adultExperienceA - adultExperienceB)
```

Experience is deliberately **not lifespan-normalised**.

A long-lived character may therefore have a maturity position similar to a shorter-lived character while possessing centuries more lived adult experience.

## Stable experience categories

| Adult-experience gap | Category |
|---:|---|
| 0–5 | Basically Peers |
| >5–15 | Noticeable |
| >15–50 | Considerable |
| >50–100 | Formidable |
| >100–500 | Historical Documentary Territory |
| >500 | Civilisations Have Risen and Fallen |

Additional factual context may include:

- which applicant is more experienced
- safe experience ratio
- one applicant having been an adult longer than the other has been alive
- one applicant's adult experience exceeding the partner species' typical lifespan

---

# 9. Longevity Context

Longevity is a secondary context layer only.

It does **not** alter Maturity Compatibility or Experience Gap.

For each applicant:

```text
longevityRatio = age / typicalLifespan
```

## Stable longevity categories

| Ratio | Category |
|---:|---|
| ≤ 1.0 | Within Typical Lifespan |
| >1.0–1.25 | Exceptionally Old |
| >1.25–2.0 | Ancient |
| >2.0–5.0 | Legendary Longevity |
| >5.0 | Chronological Anomaly |

Normal longevity remains visually quiet.

Ages beyond typical lifespan are valid.

The application must never treat typical lifespan as a hard maximum.

---

# 10. Longevity Theatre

Approved results with non-normal longevity may receive deterministic Bureau presentation.

Examples include:

- **Actuarial Expectations Exceeded**
- **Archival Verification Advised**
- **Suspected of Overliving**
- **Chronological Anomaly Confirmed**
- **Office of Chronological Irregularities Notified**

Longevity Theatre:

- consumes existing longevity results
- is selected deterministically for the approved consultation
- does not change the longevity category
- does not alter compatibility
- does not imply wrongdoing
- does not appear for underage rejections

Twenty reusable procedural labels provide additional archival flavour.

---

# 11. Rare Bureau Findings

Approved consultations may trigger deterministic special observations when mathematically unusual conditions occur.

The system contains stable finding IDs, priorities, conflict groups and presentation copy.

A maximum of **two** findings may be selected.

Examples include:

- identical adult experience
- same species and exact same age
- both applicants exactly at adulthood
- both applicants exactly at typical lifespan
- identical chronological age but meaningfully different lifecycle maturity
- excellent maturity with an extreme experience gap
- both applicants being chronological anomalies
- four-digit or five-digit ages
- exact century or millennium gaps
- exactly two typical lifespans
- very large raw age gap with close maturity

Rare Bureau Findings:

- never replace the primary verdicts
- never alter calculations
- never influence normal quip selection
- never change case numbers
- never enter permalinks
- never appear for rejected underage submissions

They are intentionally uncommon.

---

# 12. Consultation Theatre

Valid adult submissions use a short artificial consultation state of approximately **900 ms**.

During consultation:

- controls are appropriately locked
- one loading message is selected
- stale pending consultations are cancelled
- only the latest valid consultation may complete

Invalid and underage submissions bypass the consultation sequence.

The delay exists for tone, not to simulate server work.

---

# 13. Submitted Consultation State

A successful consultation captures an immutable submitted result.

The submitted result contains factual calculation results plus the selected presentation state needed to keep the ruling stable.

Changing:

- website theme
- result-card theme
- result-card format

must not:

- recalculate the consultation
- change the case number
- reselect quips
- reselect Rare Bureau Findings
- reselect Longevity Theatre

---

# 14. Case Numbers

Approved consultations receive fictional case identifiers.

Format:

```text
ARB-[SPECIES A CODE]-[SPECIES B CODE]-[NUMBER]
```

Example:

```text
ARB-ELF-HUM-123456
```

Temporary custom species use:

```text
CUS
```

Applicant names never influence case-number generation.

Case numbers are filing identifiers, not relationship approvals.

---

# 15. Quip System

Humour content is stored separately from calculation code.

Quips use stable IDs and structured slot/tag/restriction metadata.

Major slots include:

- Maturity commentary
- Experience commentary
- Bureau Note
- Loading message

Selection may consider:

- maturity category
- experience category
- species IDs
- same-species vs cross-species status
- factual context flags

Species matching is ID-based.

Temporary custom species must not inherit built-in species quips merely because their names resemble built-in species.

## Anti-repetition

Recent selected IDs are remembered locally per relevant slot.

The anti-repetition system must fail safely if browser storage is unavailable, blocked or malformed.

The mathematical result must never change because of humour selection.

---

# 16. Optional Applicant Names

Applicant A and Applicant B may each have an optional name.

Rules:

- trim whitespace
- whitespace-only input becomes unnamed
- maximum 40 Unicode characters
- punctuation, apostrophes and hyphens are permitted

Names may appear in:

- live results
- copied result text
- native share text
- generated images
- readable Bureau Findings

Names do not affect:

- calculations
- quip selection
- case numbers
- permalinks

Names are never persisted.

---

# 17. Temporary Custom Species

Users may create temporary session-only species.

Required fields:

- name
- recognised adulthood age
- typical lifespan

Validation requires:

- trimmed name
- 2–40 characters
- case-insensitive uniqueness against built-ins and current custom species
- positive finite adulthood
- positive finite lifespan
- lifespan > adulthood

Temporary species:

- use the same maturity, experience and longevity logic
- may be used in Reverse Lookup
- may appear in generated images
- are not persisted
- are not encoded in permanent permalinks
- receive no automatically generated Species Register lore

Internal runtime custom IDs must never leak into user-facing output.

---

# 18. Bureau Cases

The **Bureau Cases** section provides discovery inputs for the normal Checker.

All Bureau Cases populate the Checker but do **not** auto-submit.

## Assign Me a Case

Random cases use a typed generator with injectable/testable randomness.

Profiles include:

- Routine
- Cross-Species
- Experience Gap
- Borderline
- Longevity
- Extraordinary

Generated cases use built-in species only and valid adult ages.

## Today's Bureau Files

Exactly three deterministic daily cases are derived from the user's local calendar date (`YYYY-MM-DD`) with a lightweight seeded PRNG:

1. Routine Filing
2. Complicated Filing
3. Extraordinary Filing

No backend, persistence or midnight timer is required.

## Notable Cases from the Archive

A permanent curated archive contains representative educational and humorous examples.

Examples include:

- The Classic Elf Problem
- The Dwarven Misunderstanding
- Borderline Filing
- Archive Has Questions
- Documentary Territory

Curated claims must remain consistent with the real calculation utilities.

---

# 19. Bureau Species Register

The Species Guide is presented as the **Bureau Species Register**.

All 30 built-in species have presentation-only flavour profiles stored separately from canonical lifecycle data.

Each profile includes:

- Bureau classification
- lifecycle summary
- Bureau observation
- common filing issue
- chronological peculiarity
- exactly two archival notes
- optional related curated Bureau Case IDs

The Register uses native `<details>/<summary>` disclosure behaviour.

Collapsed records prioritise:

- species name
- Bureau classification
- adulthood
- typical lifespan

Expanded records reveal flavour and archival context.

Temporary custom species do not receive generated lore.

---

# 20. Reverse Lookup

The **Chronological Equivalence Office** is a separate, one-directional tool.

It answers:

> Given one species and age, what age or adult age range in another species occupies an equivalent lifecycle position?

Inputs:

- source species
- source age
- target species

Outputs may include:

- source human-equivalent maturity
- closest target-species equivalent age
- target-species maturity-compatible adult range
- concise lifecycle explanation
- restrained lifespan-reference context

Reverse Lookup reuses the same shared maturity conversion and maturity-range utilities as the main Checker.

It does **not** create:

- normal consultations
- Experience Gap results
- quips
- case numbers
- Rare Bureau Findings
- Longevity Theatre
- permalink state

## Adulthood handling

An underage source cannot be looked up.

Target compatible ranges are intersected with the target species' recognised adulthood threshold.

If the exact mathematical target equivalent is below adulthood, it may be displayed only as clearly labelled mathematical context.

## Use This Pair in Checker

When the closest target equivalent is adult, the user may populate the normal Checker with the source and equivalent target pair.

This action:

- clears applicant names
- clears stale Checker results
- preserves temporary custom species
- does not auto-submit

---

# 21. Website Theme System

The website supports ten stable themes:

1. Bureau Classic
2. Royal Decree
3. Elven Archive
4. Dwarven Registry
5. Goblin Administration
6. Arcane Terminal
7. Fae Court
8. Dragon Archive
9. Celestial Tribunal
10. Obsidian Records

Stable IDs:

- `bureau-classic`
- `royal-decree`
- `elven-archive`
- `dwarven-registry`
- `goblin-administration`
- `arcane-terminal`
- `fae-court`
- `dragon-archive`
- `celestial-tribunal`
- `obsidian-records`

Bureau Classic is the default.

Themes share:

- one typed identity registry
- semantic CSS variables
- structural presentation metadata
- reusable decorative ornaments
- shared application components

The themes are not ten separate website implementations.

---

# 22. Theme Identities

## Bureau Classic
Formal government forms, registration lines, numbered assessments and official seals.

## Royal Decree
Ceremonial decree framing, heraldic geometry, court records and gold rules.

## Elven Archive
Folio identifiers, fine archival rules, delicate geometry and meticulous record keeping.

## Dwarven Registry
Angular registry plates, heavy borders, serial identifiers and engineered paperwork.

## Goblin Administration
Offset filings, stamps, corrections and surprisingly functional administrative chaos.

## Arcane Terminal
Magical information-system panels, structured status rows, technical grids and terminal framing.

## Fae Court
Elegant petitions, asymmetric court records, decorative technicalities and restrained flourishes.

## Dragon Archive
Fortified vault records, treasury-ledger structure, heavy seals and scale-inspired geometry.

## Celestial Tribunal
Symmetrical docket framing, orbital geometry, formal tribunal records and celestial indexing.

## Obsidian Records
Minimal premium dark records, sharp typography, restrained markers and editorial spacing.

Theme differences go beyond colour, while accessibility and behaviour remain consistent.

---

# 23. Theme Persistence and Independence

Website theme:

- persists locally by stable ID
- restores before React mounts where practical
- safely falls back to Bureau Classic

Result-card theme:

- belongs to current consultation/image state
- initially defaults to the website theme when a new successful consultation is created
- may then diverge independently
- is not persisted
- never enters permalink state

Changing website theme after an image-theme override must not overwrite the selected image theme for the existing result.

---

# 24. Generated Result Cards

Image generation is entirely client-side:

```text
Submitted Consultation
→ Result Image Model
→ Format Renderer
→ Theme Presentation
→ Self-contained SVG
→ Canvas
→ PNG Blob
```

The image system uses no:

- backend
- upload service
- screenshot service
- html2canvas
- external font dependency

User-provided text must be XML-escaped before SVG insertion.

Wrapping utilities must safely handle long names, custom-species names, long quips and large numeric values.

---

# 25. Result Card Formats

Three stable image formats exist.

## Compact

ID:

`compact`

Dimensions:

`1080 × 1080`

Purpose:

Quick sharing.

Contains essential applicant information, both verdicts, one existing quip, applicable longevity context, case number and Bureau status.

Rare Bureau Findings are omitted by default.

## Standard

ID:

`standard`

Dimensions:

`1080 × 1350`

The default result-card format.

Contains the complete familiar ruling:

- applicants
- maturity assessment and quip
- experience assessment and quip
- longevity context
- Bureau Note
- case number
- Bureau status

It may show at most one Rare Bureau Finding.

## Full Dossier

ID:

`full-dossier`

Dimensions:

`1080 × 1920`

Adds detailed:

- applicant lifecycle records
- human-equivalent maturity values
- accepted maturity ranges
- relative maturity difference
- adult experience
- chronological and experience gaps
- experience ratio where defined
- longevity analysis
- readable Bureau Findings

It supports up to two Rare Bureau Findings.

Theme and format are independent, yielding 30 supported visual combinations without 30 separate renderers.

---

# 26. Sharing and Permalinks

## Stable permalink format

Built-in species consultations use:

```text
?sa=elf&aa=300&sb=human&ab=34#checker
```

Permalinks encode only:

- Applicant A built-in species ID
- Applicant A unrounded age
- Applicant B built-in species ID
- Applicant B unrounded age

They do **not** encode:

- names
- website theme
- result-card theme
- result-card format
- case numbers
- quips
- calculations
- Rare Bureau Findings
- Longevity Theatre
- custom species
- Reverse Lookup state

Temporary custom-species consultations cannot create permanent result links.

## Copy Result

Copied result text remains independent from website theme and result-card format.

It may include applicant names, species/ages, verdicts, concise calculations, exceptional longevity, case number and submitted quips.

## Save / Share Image

Image generation uses the selected result-card theme and selected card format.

Native file sharing is offered only when the browser supports the required Web Share capability.

Failures remain nonfatal.

---

# 27. Visual Design

The application should feel like a polished fantasy utility, not a novelty generator.

Fantasy detail should decorate a clean interactive interface.

Prefer:

- semantic CSS variables
- CSS gradients
- borders
- pseudo-elements
- small original SVG geometry
- system/local font stacks

Avoid:

- large texture assets
- external fantasy-font downloads
- copyrighted heraldry
- heavy animation libraries
- decorative clutter that interferes with controls

---

# 28. Responsive Design

The application must remain usable at approximately:

- 320 px
- 375 px
- 768 px
- 1024 px
- 1440 px

On narrow screens:

- applicant cards stack
- Bureau Case cards stack
- Reverse Lookup controls stack
- Species Register disclosures remain readable
- image controls remain usable
- elaborate ornaments simplify
- horizontal overflow is avoided

Generated image dimensions are independent of viewport width.

---

# 29. Accessibility

Fantasy aesthetics must never reduce usability.

Requirements include:

- semantic HTML
- clearly labelled form fields
- keyboard-accessible controls
- visible focus states
- strong colour contrast
- errors not communicated by colour alone
- proper radio/select/disclosure semantics
- reduced-motion support
- decorative ornaments hidden from assistive technology when redundant
- clear underage-rejection wording

Decorative stamps must never be the only source of status information.

---

# 30. Animation

Animation remains subtle.

Acceptable:

- consultation-state indicators
- restrained result reveal
- small hover/focus transitions
- theme-sensitive brief procedural effects

Avoid:

- continuous scanline animation
- floating particles or sparkles
- intrusive sound
- bouncing fantasy characters
- flashing alerts
- long reveal sequences

Always respect `prefers-reduced-motion`.

---

# 31. Privacy and Persistence

The application has no user accounts and no backend.

No applicant data is transmitted by the application.

Session-only state includes:

- temporary custom species
- applicant names
- Checker inputs
- Reverse Lookup inputs
- current consultation
- result-card theme
- result-card format
- Rare Bureau Findings
- Longevity Theatre selections

Local persistence is intentionally limited.

Persisted locally:

- website theme ID
- recent quip IDs for anti-repetition

Do not persist:

- applicant names
- ages
- species selections
- custom species
- consultation results
- Reverse Lookup records

---

# 32. Technical Architecture

The application is a client-side React/Vite application.

Important architectural boundaries:

## Canonical factual layer

Owns:

- species lifecycle data
- adulthood validation
- maturity calculation
- experience calculation
- longevity calculation
- case codes

## Content layer

Owns:

- quips
- species flavour profiles
- curated Bureau Cases
- theme identity metadata

## Discovery layer

Owns:

- random Bureau Cases
- Daily Bureau Files
- curated case selection
- Reverse Lookup inputs

## Submitted consultation layer

Captures stable calculated and selected presentation state.

## Post-calculation presentation layer

Owns:

- Longevity Theatre
- Rare Bureau Findings

## Image presentation layer

Owns:

- result-card themes
- Compact / Standard / Full Dossier layouts
- SVG / PNG generation

Presentation and discovery layers must not create alternate factual calculation systems.

---

# 33. Deployment Architecture

Production deployment is static.

Build flow:

```text
Git repository
→ Docker multi-stage build
→ Vite production build
→ nginx:alpine runtime
```

Internal application port:

`8080`

Production requirements:

- SPA fallback
- appropriate caching for hashed Vite assets
- non-aggressive caching for the application shell
- safe headers
- health endpoint `/`
- HTTPS through the deployment platform/reverse proxy

No environment variables are required.

No database is required.

No persistent volume is required.

The intended self-hosted deployment platform is **Coolify**.

---

# 34. Development and Verification Philosophy

Core calculation changes require strong regression protection.

For ordinary intermediate non-core work:

- add only a very small number of focused tests for genuinely new or risky logic
- run ESLint
- run TypeScript
- run the production build

Full regression testing is appropriate for:

- changes to canonical calculations
- suspected regressions
- major integration milestones
- release candidates

Version 2.0 release verification included the complete automated regression suite alongside lint, TypeScript, production build, responsive review and accessibility review.

---

# 35. Stable Invariants

Unless deliberately changed as part of a future versioned behavioural update, preserve:

- adulthood values
- typical lifespans
- species IDs
- species case codes
- maturity formula
- maturity thresholds
- experience thresholds
- longevity thresholds
- quip-selection independence from presentation themes
- case-number behaviour
- stable permalink format
- temporary custom-species behaviour
- applicant-name session-only behaviour
- website/result-card theme independence
- result-card format independence
- separation between factual calculations and presentation

---

# 36. Version 2.0 Feature Set

Version 2.0 includes:

- core two-verdict Checker
- 30 built-in species
- temporary custom species
- optional applicant names
- adulthood safeguard
- Maturity Compatibility
- Experience Gap
- longevity context
- large rotating quip system
- consultation theatre
- case numbers
- ten richer website themes
- ten result-card themes
- Compact, Standard and Full Dossier image formats
- Random Bureau Case generator
- three Daily Bureau Files
- curated Bureau archive
- Bureau Species Register with profiles for all built-in species
- deterministic Longevity Theatre
- 20 Rare Bureau Findings
- Reverse Lookup / Chronological Equivalence Office
- Copy Result
- permanent links for built-in species
- client-side Save Image / Share Image

There is still no overall compatibility score.

---

# 37. Version 3.0 Development — Immortal Affairs

## Stage 22 FBI foundation

The **FBI — Fantasy Bureau of Immortality** handles lifecycles that cannot be represented by the finite-lifespan Checker. Immortal Affairs shares the human-equivalent maturity scale for future comparisons, but owns separate types and calculation utilities. Indefinite beings never receive a fake `typicalLifespan`, and the mortal longevity ratio is not applied to them.

The four calculation families are:

- `ACQUIRED`: a mortal origin species, age at transformation, years since transformation, and `FROZEN` or `CONTINUING` maturation.
- `NATURALLY_IMMORTAL`: recognised adulthood age, maturation half-life, and current chronological age, with no mortal origin species.
- `MANIFESTED`: a created being whose fully mature convention begins at human-equivalent maturity 25 and whose experience begins at manifestation.
- `TRANSFERRED_CYCLICAL`: a continuing consciousness with explicitly separate `CURRENT_BODY_MATURITY` and `CONSCIOUSNESS_EXPERIENCE` sources.

Continuing immortal maturation uses the pure exponential approach:

`H(t) = C - (C - H0) * (1/2)^(t/T)`

- `C = 100`, the fixed Bureau maturity ceiling.
- Natural immortals begin at `H0 = 18` upon recognised adulthood.
- Fully mature manifested beings begin at `H0 = 25` upon manifestation. This is a fictional design convention, not a scientific claim about human development.
- Continuing acquired immortals begin from their human-equivalent maturity at transformation.
- Frozen acquired immortals retain their transformation maturity.

For finite elapsed time, continuing maturity approaches but does not reach 100. Inputs must be finite; elapsed time cannot be negative; half-life must be positive; and starting maturity must remain below the ceiling. Values remain unrounded within calculation utilities.

Adulthood eligibility remains a hard boundary:

- A natural immortal below recognised adulthood is not eligible for an adult comparison.
- An acquired immortal transformed below origin-species adulthood cannot use later immortal years to bypass that state; frozen cases remain below adulthood, and continuing cases still fail the transformation safeguard.
- A preset explicitly created mature is adult from manifestation at the maturity-25 convention.
- A transferred or cyclical being's current body must independently satisfy adulthood rules; ancient consciousness experience cannot override an underage form.

Future experience calculations use actual adult time rather than lifespan normalisation:

- Acquired: `(ageAtTransformation - originAdulthoodAge) + yearsSinceTransformation`.
- Naturally immortal: `currentAge - recognisedAdulthoodAge`.
- Manifested mature: `yearsSinceManifestation`.
- Reincarnating: current-life adult experience plus remembered previous adult experience.
- Possessing or body-hopping: remembered conscious experience, while current-body maturity remains separate.

Stage 22 supplies the mathematical and type foundation. Comparison verdicts, chronological theatre, result cards, sharing, and FBI permalinks belong to later stages.

## Stage 23 presets and immortal record builders

The typed preset registry is a configuration layer over the four lifecycle families. Presets contain stable IDs and only their calculation-relevant defaults; they call the shared Stage 22 maturity utilities rather than reproducing the exponential formula. Naturally immortal ages are Bureau defaults for this tool, not setting canon.

Initial presets:

- Acquired: Vampire (`FROZEN`), Lich (`FROZEN`), Ageless / Cursed Immortal (`FROZEN`), and Ascended Immortal (`CONTINUING`, 1,000-year default half-life).
- Naturally immortal: Angel (adulthood 100, half-life 500), Demon (100, 750), God / Divine Being (250, 2,000), and Primordial (1,000, 10,000).
- Manifested: Manifested Being, created mature at 25 with a 1,000-year half-life.
- Transferred / cyclical: Reincarnating Being and Possessing Spirit.
- Custom Immortal: one selected existing family with only that family's supported parameters; the ceiling remains fixed at 100 and arbitrary equations are not accepted.

Record builders validate finite non-negative ages and experience, positive half-lives, required species, preset-family/subtype agreement, and numeric overflow. They accept the existing `Species` interface, so both built-in and current-session custom species can serve as mortal origins or current forms without a second registry or new persistence.

Acquired records derive current age, origin adulthood and lifespan, human-equivalent maturity at transformation using the existing mortal conversion utility, effective maturity, experience, eligibility, and maturation mode. Frozen records retain transformation maturity. Continuing records pass that maturity and elapsed transformation years to the shared immortal curve. Adult experience is `(ageAtTransformation - originAdulthoodAge) + yearsSinceTransformation`; transformations below origin adulthood return explicit ineligibility with no adult maturity or experience result.

Natural records use preset adulthood and half-life. Eligible records begin at maturity 18 at adulthood, then use elapsed adult years in the shared curve; adult experience is the same elapsed interval. Underage records are explicitly ineligible and do not receive adult-result fields.

Manifested records are adult from creation, begin at maturity 25, mature through the shared curve, and use years since manifestation as adult experience. Zero elapsed years validly produces maturity 25 and experience 0.

Reincarnating records derive maturity and eligibility from the current form. Experience is current-life adult experience plus remembered previous adult experience only when memories are retained. Possessing records derive maturity and eligibility from the current host, but experience is remembered conscious experience alone; the host's pre-possession adult years are never added automatically. In both cases an underage current form remains ineligible regardless of accumulated consciousness experience.

The Immortal Affairs UI exposes the registry as an informational classification catalogue. Stage 23 does not add a two-applicant form or any FBI verdict/result system.

## Stage 24 two-applicant FBI intake

Immortal Affairs owns two persistent applicant drafts inside its existing hash view. Each applicant independently selects `MORTAL` or `IMMORTAL`; switching sections hides rather than unmounts the view, so drafts and factual previews survive navigation. FBI drafts remain session-only and are never written to local storage, query strings, or share links.

Mortal mode collects an optional name, existing species, and age. Its adapter reuses the existing species model, adulthood check, adult-experience helper, and human-equivalent maturity conversion. It does not modify or share applicant/result state with the normal Checker.

Immortal mode selects from the Stage 23 registry, then renders only the selected family's fields:

- Acquired: origin species, transformation age, and elapsed transformation years. Built-in continuing presets supply their half-life; Custom Acquired additionally chooses Frozen/Continuing and requests half-life only for Continuing.
- Naturally immortal: current age. Built-in presets supply adulthood and half-life; Custom Natural requests both values.
- Manifested: years since manifestation, plus half-life for Custom Manifested. Starting maturity remains fixed at 25.
- Reincarnating: current-form species and age, memory continuity, and remembered previous adult experience only when memories are retained.
- Possessing: current-host species and age plus remembered conscious experience; host years before possession are not added.
- Custom Transferred/Cyclical first chooses Reincarnating or Possessing and then follows that subtype's fields. No custom flow exposes equations or the fixed ceiling.

The intake adapter returns a typed `FbiApplicantRecord`: a mortal record or a named wrapper around one of the five Stage 23 immortal record shapes. Names use the existing trim and 40-Unicode-character rules and remain presentation-only. React gathers draft values; pure adapters and builders perform all validation and derivation.

Blank, non-finite, negative, and invalid family-specific values receive associated field errors. Underage states are factual records rather than malformed inputs: their compact previews explicitly show `Adult FBI comparison: Ineligible`, and experience can never override the relevant origin/current-form adulthood safeguard.

Each valid draft displays a compact record preview containing classification, effective maturity, adult experience, eligibility, and relevant family context. The shared readiness area reports whether both records are configured but deliberately performs no comparison and issues no verdict.

Temporary custom species state now lives at the persistent application parent and is passed to both the unchanged Checker workflow and FBI intake. It remains in memory only and continues using the single existing species model and registration interface.

## Stage 25 FBI comparison engine

The pure FBI engine accepts any two validated Stage 24 `FbiApplicantRecord` values. It first normalizes each record into shared factual fields: identity/display context, lifecycle family and classification, effective human-equivalent maturity, actual adult experience, adult-comparison eligibility, meaningful chronological age where available, and finite typical lifespan only for genuinely mortal records. Original records are never mutated.

Adult eligibility is a centralized gate. If either normalized record is ineligible, the result is `INELIGIBLE` with applicant-specific reasons and contains no maturity or experience categories. Mortal underage records, underage transformations, underage natural immortals, and underage transferred current forms therefore cannot be rescued by accumulated experience. Created-mature manifested records remain eligible even at zero adult-experience years.

Eligible effective maturities are passed through the existing normal `getMaturityCompatibility` engine on the shared 84-year human-equivalent scale. This preserves mutual range checking, relative-difference logic, thresholds, and `EXCELLENT`, `GOOD`, `BORDERLINE`, and `INCOMPATIBLE` categories without an FBI-specific formula. Mortal-to-mortal FBI inputs therefore agree with the normal Checker for the same species and ages.

Eligible adult-experience values use the existing `getExperienceCategory` classifier and its unchanged thresholds. The FBI engine derives only lifecycle-neutral factual context: experience gap, more-experienced applicant, safe ratio, whether experience exceeds a meaningful partner chronological age, and extreme disparity. Partner-lifespan flags are nullable and evaluated only when that partner is a mortal record with a finite typical lifespan.

Chronological age is retained for mortal, acquired, natural, and manifested records. Transferred/cyclical records intentionally expose no comparable whole-applicant chronological age, so pair chronology and its absolute gap become `null` when either side lacks one. Chronology is context only and never changes maturity compatibility.

The approved result contains independent maturity, experience, and chronology sections. It has no combined score, overall relationship approval, longevity verdict, random content, case number, quips, or presentation selection. Reincarnating and possessing rules are consumed from their already-built maturity, experience, and eligibility values; the comparison engine never reruns family-specific derivation or immortal maturation.

Immortal Affairs now provides an explicit `Open FBI Review` action. It submits the two current validated records to the pure engine and displays a restrained factual review or an ineligibility explanation. Editing either draft clears the submitted review; hash navigation preserves it because the primary view remains mounted. Review state is never persisted or serialized.

## Stage 26 FBI dossier presentation

Stage 26 wraps an approved Stage 25 result in a typed, session-only presentation model. It does not recalculate eligibility, maturity, experience, chronology gaps, or category thresholds. The presentation is created once when `Open FBI Review` succeeds and is stored with the submitted comparison; rerenders, theme changes, and hash navigation therefore cannot replace its case number, filing note, or findings. Editing either intake still clears the whole submitted review.

Approved cases use `FBI-[CLASS A]-[CLASS B]-######`. Built-in mortal records reuse their stable species codes, custom mortal species use `CUS`, and immortal presets use stable classification codes (`VAM`, `LIC`, `AGE`, `ASC`, `ANG`, `DEM`, `GOD`, `PRI`, `MAN`, `REI`, and `POS`); Custom Immortal uses `CUS`. The six-digit serial and filing-note choice are deterministic hashes of the submitted factual records and unchanged Stage 25 result. Names do not drive calculations.

Chronology presentation uses six exact bands: 0–99 recent, 100–499 century-scale, 500–999 deep-century, 1,000–9,999 millennial, 10,000–99,999 deep historical, and 100,000+ primordial. The classified basis is explicit for each family. Mortal and natural records use current age; acquired records show current age plus transformation timing; manifested records use years since manifestation. Reincarnating records show current-form age separately and use remembered adult experience as historical context only when memories are retained. Possessing records keep current-host age separate from remembered consciousness experience. These labels are presentation context and never alter either comparison category.

The filing-note register contains 24 restrained, deterministic administrative notes. A fixed-priority register evaluates ten special findings and emits no more than two. Findings can call out near-asymptotic maturity, civilisation-scale experience gaps, ancient remembered experience in a current body, centuries of frozen maturity, mortal/immortal jurisdiction, dual immortal jurisdiction, identical effective maturity, recent manifestation, continuing ascension, or millennial file scale. A separate contradiction note may state when close maturity alignment coexists with a large experience gap; no combined verdict is inferred.

Ineligible submissions receive only the Stage 25 factual explanation. They receive no FBI case identifier, chronology theatre, filing note, or special findings. Stage 26 adds no card generation, sharing, permalink, persistence, or new theme system.

---

# 38. Final Product Identity

Fantasy Age Checker is not merely an age calculator with fantasy colours.

It is an:

> **Official inter-species chronological compatibility assessment backed by fictional regulations, administrative precedent, actuarial tables and a worrying amount of paperwork.**

The mathematics gives the application enough internal consistency to make experimentation interesting.

The Bureau gives users a reason to keep experimenting.

The Bureau treats every result seriously.

The user does not have to.
