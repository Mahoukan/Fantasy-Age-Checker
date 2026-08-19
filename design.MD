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
- `#about`

The application does not require a client-side router.

Each hash displays one primary section at a time. Primary sections remain mounted but inactive sections are hidden from layout and accessibility APIs, allowing temporary Checker and Reverse Lookup state to survive navigation.

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

# 37. Future Direction

## Version 3.0 — Immortal Affairs

Immortal, ageless, undead and alternate-lifecycle models are deliberately outside the finite-lifespan v2 calculation system.

They should be treated as a separate Bureau office with a genuinely different mathematical model rather than forced into the existing finite-lifespan formula.

Future investigation may include:

- ageless-after-maturity models
- continuously maturing immortals
- created-at-maturity beings
- undeath at a known chronological age
- unknown or infinite natural lifespan

Other future ideas should be evaluated on whether they reinforce the Bureau identity rather than simply adding more controls.

---

# 38. Final Product Identity

Fantasy Age Checker is not merely an age calculator with fantasy colours.

It is an:

> **Official inter-species chronological compatibility assessment backed by fictional regulations, administrative precedent, actuarial tables and a worrying amount of paperwork.**

The mathematics gives the application enough internal consistency to make experimentation interesting.

The Bureau gives users a reason to keep experimenting.

The Bureau treats every result seriously.

The user does not have to.
