# Fantasy Age Checker

Fantasy Age Checker is a humorous, single-page fantasy utility presented by the fictional **Arcane Relationship Bureau — Department of Inter-Species Affairs**. It compares two adult fictional characters using species-relative maturity and actual adult experience, then issues an unnecessarily official ruling.

Fantasy Age Checker 3.0.0 is the current release. It includes the normal finite-lifespan Checker and the separate **FBI — Fantasy Bureau of Immortality** workflow for mortal and immortal lifecycle records. The app is static React, TypeScript, and Vite with no backend, database, accounts, analytics, runtime secrets, or required environment variables.

## Screenshot

_Release screenshot to be added when the public deployment has a final domain._

## Core features

- Thirty generic built-in fantasy species with canonical lifecycle facts and complete presentation-only Bureau Species Profiles, organised into the existing registry groups.
- A strict adulthood safeguard that stops the normal assessment if either applicant is below their species' recognised adulthood.
- Independent maturity and adult-experience verdicts; they are never blended into an overall score.
- A one-directional Chronological Equivalence Office for converting one adult lifecycle position into another species' age scale without creating a consultation.
- Longevity notices for ages beyond a typical lifespan without treating lifespan as a maximum.
- Session-only custom species with a name, adulthood age, and typical lifespan.
- Optional, session-only applicant display names that appear in rulings, copied text, and PNG exports without affecting any calculation.
- 348 reviewed fantasy-bureaucracy quips with per-slot anti-repetition history, including exact-ID commentary for every expanded-register species.
- Copyable result summaries, native sharing where supported, stable permalinks for built-in species, and downloadable PNG ruling cards in three formats and ten selectable styles.
- Ten coordinated website themes with an accessible header selector, safe local preference restoration, and no effect on consultation data or rulings.
- Built-in Bureau Case discovery with profile-aware random assignments, three deterministic daily files, and a ten-case curated archive.
- Same-page Species Guide, calculation explanation, and entertainment disclaimer.
- Responsive, keyboard-accessible controls and reduced-motion support.
- A complete Immortal Affairs workflow with four lifecycle families, built-in and custom immortal records, factual FBI dossiers, permanent links for supported records, and themed PNG exports.

## How the ruling works

Every species defines a recognised adulthood age and a typical lifespan. Under-adulthood applications are rejected before either assessment runs.

All 30 built-in lifecycle profiles are setting-neutral fictional assumptions created for this website. They do not represent the canon of any established fantasy setting.

Maturity converts each age to an 84-year human-equivalent scale and applies the familiar scaled range in both directions:

```text
humanEquivalentAge = age / typicalLifespan * 84
minimum = humanEquivalentAge / 2 + 7
maximum = humanEquivalentAge * 2 - 14
```

Experience uses actual adult years and is deliberately not normalised by lifespan:

```text
adultExperience = age - recognisedAdulthoodAge
gap = abs(applicantAAdultExperience - applicantBAdultExperience)
```

Longevity is separate context based on `age / typicalLifespan`. A typical lifespan is a reference, not a validation limit, so even unusually large finite ages remain valid.

In v2.0, non-normal longevity receives richer, deterministic Bureau presentation, and mathematically unusual approved consultations may receive up to two Rare Bureau Findings. These additions are selected after the existing consultation has been calculated and remain presentation-only: they never alter compatibility, calculations, verdicts, quips, case numbers, or permalinks.

## Immortal Affairs / Fantasy Bureau of Immortality

Immortal Affairs handles records that cannot be represented by a finite typical lifespan. Each subject may be Mortal or Immortal, and immortal records use one of four calculation families: Acquired, Naturally Immortal, Created/Manifested, or Transferred/Cyclical. Built-in presets include vampires, liches, ascended immortals, angels, demons, divine beings, primordials, manifested beings, reincarnating beings, and possessing spirits. Custom Immortal exposes only the parameters supported by its selected family; the fixed maturity ceiling and formulas are never user-editable.

FBI reviews keep effective human-equivalent maturity and actual adult experience independent. Current bodies/forms control maturity and adulthood for reincarnating and possessing records, while remembered experience remains separate. Underage mortal, transformation, natural-immortal, and current-form records receive a factual ineligibility explanation with no verdict, case theatre, filing humour, findings, or exports. Created-mature manifested records use a fictional Bureau convention of equivalent maturity 25 from manifestation.

Approved reviews produce a stable session dossier with an FBI case number, lifecycle-specific chronology, up to two deterministic special findings, and a filing note. Copy Result, native sharing, and three PNG formats use that stored dossier. Permanent FBI links support built-in presets and built-in species, encode input facts only, omit names and all generated results, and restore through the current canonical builders at `#immortal-affairs`. Custom Immortal and temporary species remain exportable as text and images but do not receive permanent links.

## Reverse Lookup / Chronological Equivalence Office

Reverse Lookup answers a narrower, one-directional question: given one species and age, what chronological age and maturity-compatible adult range occupy the corresponding lifecycle position in another species? It reuses the Checker's existing human-equivalent maturity conversion and range utilities, but it does not compare adult experience or create a relationship consultation. A normal consultation still checks maturity compatibility in both directions.

The source record must have reached its species' recognised adulthood. Target ranges are intersected with the selected target species' adulthood threshold, and below-adulthood mathematical equivalents are labelled as context rather than adult recommendations. Built-in and current-session temporary custom species are supported as both source and target. Reverse Lookup state is independent from the Checker, is not persisted, and is not added to URLs; its optional Checker action only populates two unnamed applicant records for review without submitting them.

## Temporary custom species

Custom species are held only in React memory and disappear on refresh. They use the same calculations and safeguards as built-in species but do not enter the permanent Species Guide. Result text can be copied, but permanent links are unavailable because custom records are not persisted or serialised.

## Bureau Cases

The same-page **Bureau Cases** desk provides three ways to explore the Checker without creating a separate calculation path:

- **Assign Me a Case** chooses a profile-aware random adult pairing, ranging from routine and cross-species files to experience-gap, borderline, longevity, and extraordinary cases.
- **Today's Bureau Files** contains exactly three locally generated Routine, Complicated, and Extraordinary files. A lightweight seeded generator makes the same local calendar date reproduce the same three cases without storage or a server.
- **Notable Cases from the Archive** contains ten permanent examples, including the Classic Elf Problem, a verified Borderline filing, an ordinary same-species case, and the deliberately excessive Archive Has Questions longevity file.

All Bureau Cases use built-in species only. Opening a file clears applicant names and any stale ruling, then populates the existing Checker without submitting it. Users can inspect or edit the values before pressing **Consult the Oracle**. Existing temporary custom-species definitions remain available for the session. Case classifications and archive IDs are presentation-only: they are not stored, added to copied results, or encoded in permalinks. Random and daily generation happens entirely in the browser; no account, analytics, backend, or network request is involved.

## Bureau Species Register

The expanded **Bureau Species Register** provides an accessible native disclosure record for each of the 30 built-in species. Collapsed records retain the useful adulthood and typical-lifespan facts; expanded records add a concise lifecycle summary, Bureau observation, common filing issue, chronological peculiarity, two archival notes, existing lifespan-derived maturity constants, and links to relevant permanent Bureau Cases.

Lifecycle facts remain owned exclusively by the canonical species registry. The separate species-profile registry contains presentation and worldbuilding copy only, so it cannot override adulthood ages, typical lifespans, species IDs, grouping, case codes, or calculations. Typical lifespan remains a reference rather than a maximum age. Custom species stay temporary and factual in the Checker and do not receive generated lore or permanent Register entries.

## Sharing and permalinks

Built-in consultations use four query parameters and the existing Checker anchor:

```text
/?sa=elf&aa=300&sb=human&ab=34#checker
```

Only built-in species IDs and ages are included. The hash stays in the browser; the web server receives the path and query string, serves the static page, and React restores the ruling client-side. Case numbers, quips, derived results, and custom species IDs are never included.

Applicant names are presentation-only and remain in React memory for the current page session. They are trimmed when submitted, limited to 40 characters, and deliberately excluded from URLs, browser storage, calculations, quip selection, and case numbers. Opening or refreshing a permalink restores its species and ages with both name fields blank.

FBI links use their own `fbi=1` query namespace and `#immortal-affairs` anchor. They do not alter or share parameters with the normal `sa/aa/sb/ab#checker` format.

Clipboard and Web Share features degrade to clear, non-fatal messages when the browser does not support them or permission is denied. Production should use HTTPS because these APIs depend on browser, platform, and secure-context support.

Approved rulings can also be saved as self-contained PNG cards. The browser builds a plain-text SVG from the already-submitted result, rasterises it locally with Canvas, and downloads the PNG; no screenshot library, server renderer, upload, or network request is involved. Every format keeps the submitted case number and factual ruling. Optional applicant names are included when present, custom species use their display names without exposing internal IDs, and existing longevity context is shown where the selected format calls for it.

The session-only **Result Card Format** control is independent from **Result Card Theme**:

- **Compact** (1080x1080) keeps applicant identity, ages, both verdicts, one already-submitted headline quip, relevant longevity flags, and Bureau status for quick sharing.
- **Standard** (1080x1350) is the default and preserves the complete familiar ruling with both assessment quips, factual experience values, longevity notices, and Bureau Note.
- **Full Dossier** (1080x1920) adds lifecycle records, maturity ranges, experience analysis, factual Bureau Findings, expanded longevity data, and filing details while retaining all three commentary sections.

Format affects PNG generation only. It is reset to Standard for each newly mounted consultation result, is not stored in `localStorage`, and never enters copied text or permalinks. Card theme and format can be combined independently across all 30 supported combinations.

The **Result Card Theme** picker offers Bureau Classic (the default), Royal Decree, Elven Archive, Dwarven Registry, Goblin Administration, Arcane Terminal, Fae Court, Dragon Archive, Celestial Tribunal, and Obsidian Records. A theme changes image presentation only: it never changes applicants, calculations, verdicts, case numbers, longevity, or any submitted commentary. The image theme lives only in component memory and is not stored or encoded in permalinks.

## Website themes

The header **Theme** selector applies the same ten identities to the whole interface: Bureau Classic, Royal Decree, Elven Archive, Dwarven Registry, Goblin Administration, Arcane Terminal, Fae Court, Dragon Archive, Celestial Tribunal, and Obsidian Records. Bureau Classic is the default. The selected website theme is restored before React renders and only its stable ID is saved under `fantasy-age-checker-site-theme`; missing, invalid, or blocked storage falls back safely.

Website and result-card themes are deliberately independent. A newly submitted consultation starts its image card with the website theme active at submission time, after which either theme can be changed without changing the other. Existing results, applicant inputs, calculations, verdicts, quips, Bureau notes, case numbers, and longevity context survive website-theme changes unchanged. Neither theme is included in a permalink.

The ten website themes share a registry describing structural presentation: document geometry, panel and divider treatment, heading and label systems, controls, seals, consultation indicators, result framing, density, and footer treatment. A single assistive-technology-hidden ornament component supplies lightweight CSS geometry and decorative departmental microcopy at a small set of shared locations. Themes remain one component architecture rather than ten page implementations.

Each identity now represents a distinct fictional department: Bureau Classic uses registered forms and filing rules; Royal Decree uses ceremonial double frames; Elven Archive uses folio margins and fine archival entries; Dwarven Registry uses angular inset plates; Goblin Administration uses deliberately offset files and layered stamps; Arcane Terminal uses system bars and data panels; Fae Court uses asymmetric petitions; Dragon Archive uses fortified vault framing; Celestial Tribunal uses symmetrical orbital dockets; and Obsidian Records uses spacious editorial indexing. These differences affect presentation only. All factual content, calculations, lifecycle records, applicant data, selected commentary, case numbers, sharing text, and permalink behaviour remain common and unchanged.

The theme layer retains visible focus, hover, disabled, and error states and simplifies dense or offset ornamentation on narrow screens. Theme decoration is CSS-generated, non-interactive, hidden from assistive technology, and motion-free; the existing reduced-motion behaviour remains in place. Website themes and generated-image themes remain independent after a consultation.

**Save Image** uses the selected style. **Share Image** also uses it and appears only when the browser reports support for sharing actual files through `navigator.canShare({ files })`; otherwise **Save Image** remains available. Image generation and sharing failures leave the ruling intact and are announced in the result controls.

## Local development

Use a current Node.js release and install the locked dependencies:

```bash
npm ci
npm run dev
```

Available commands:

```bash
npm run dev        # Vite development server
npm run test       # Vitest suite
npm run lint       # ESLint
npm run typecheck  # TypeScript project checks
npm run build      # typecheck and production Vite build
npm run preview    # locally preview dist/
npm run check      # tests, lint, typecheck, and build
```

## Production build

```bash
npm ci
npm run build
```

The deployable static output is written to `dist/`.

## Docker

The multi-stage image builds the Vite project with Node and serves only the generated static files from nginx on port `8080`:

```bash
docker build -t fantasy-age-checker:3.0.0 .
docker run --rm -p 8080:8080 fantasy-age-checker:3.0.0
```

Open `http://localhost:8080/`. The image health check performs `GET /`; a healthy deployment returns HTTP 200. Hashed Vite assets receive long-lived immutable caching, while `index.html` uses revalidation-friendly `no-cache` behaviour.

## Coolify deployment

1. Create a Coolify application from the Git repository.
2. Select **Dockerfile** as the build method; the repository-root `Dockerfile` requires no custom path.
3. Set the internal/exposed container port to `8080`.
4. Leave environment variables empty; none are required.
5. Do not provision a database or persistent volume; the application is fully static.
6. Attach the desired domain and enable HTTPS through Coolify's reverse proxy.
7. Configure the health check path as `/` and expect HTTP 200.
8. Deploy, then verify the main checker, `/?sa=elf&aa=300&sb=human&ab=34#checker`, and a supported `?fbi=1&...#immortal-affairs` link.
9. Over HTTPS, verify Copy Result, Copy Link, Save Image, and native text/file sharing on supported browsers. The checker remains usable when optional APIs are unavailable.

## Privacy and security

No consultation data is transmitted by the application. There are no network requests, analytics, backend services, user accounts, or bundled secrets. Result images are constructed and encoded entirely in the browser and are transmitted only if the user explicitly invokes the platform share sheet. Temporary species, applicant names, image-theme choice, and card-format choice remain in memory only. Browser persistence is limited to recent quip IDs and the selected website-theme ID in `localStorage`; blocked or malformed storage is ignored safely. Normal links contain only built-in species IDs and ages; FBI links contain only supported built-in draft inputs. Names, generated results, case numbers, notes, findings, and theme/format choices are never serialized.

The nginx configuration adds conservative content-type, referrer, and framing headers without a restrictive untested Content Security Policy.

## Known limitations

- Lifecycle figures are generic fictional assumptions, not canon for any setting.
- Custom Immortal configurations and records using temporary custom species cannot be represented by permanent FBI links; copied text and PNG export remain available.
- Results are entertainment, not relationship, legal, or personal advice.
- Native text sharing and native image-file sharing vary by browser, platform, secure-context status, and installed share targets; PNG download remains the fallback.
- Dynamic server-generated social preview images are not included in this static release.
- Custom species persistence/editing, user accounts, saved consultation history, backend storage, additional presets, analytics, and localisation remain deferred.

[`design.MD`](./design.MD) remains the product and design source of truth.
