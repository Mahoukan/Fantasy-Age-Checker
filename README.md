# Fantasy Age Checker

Fantasy Age Checker is a humorous, single-page fantasy utility presented by the fictional **Arcane Relationship Bureau — Department of Inter-Species Affairs**. It compares two adult fictional characters using species-relative maturity and actual adult experience, then issues an unnecessarily official ruling.

Version 2.0 development is underway from the stable 1.3.0 release; the package remains at 1.3.0 during the staged work. It is a static React, TypeScript, and Vite application with no backend, database, accounts, analytics, runtime secrets, or required environment variables.

## Screenshot

_Release screenshot to be added when the public deployment has a final domain._

## Core features

- Thirty generic built-in fantasy species with canonical adulthood and typical-lifespan records, organised into accessible native-select groups.
- A strict adulthood safeguard that stops the normal assessment if either applicant is below their species' recognised adulthood.
- Independent maturity and adult-experience verdicts; they are never blended into an overall score.
- Longevity notices for ages beyond a typical lifespan without treating lifespan as a maximum.
- Session-only custom species with a name, adulthood age, and typical lifespan.
- Optional, session-only applicant display names that appear in rulings, copied text, and PNG exports without affecting any calculation.
- 348 reviewed fantasy-bureaucracy quips with per-slot anti-repetition history, including exact-ID commentary for every expanded-register species.
- Copyable result summaries, native sharing where supported, stable permalinks for built-in species, and downloadable 1080x1350 PNG ruling cards in ten selectable styles.
- Ten coordinated website themes with an accessible header selector, safe local preference restoration, and no effect on consultation data or rulings.
- Same-page Species Guide, calculation explanation, and entertainment disclaimer.
- Responsive, keyboard-accessible controls and reduced-motion support.

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

## Temporary custom species

Custom species are held only in React memory and disappear on refresh. They use the same calculations and safeguards as built-in species but do not enter the permanent Species Guide. Result text can be copied, but permanent links are unavailable because custom records are not persisted or serialised.

## Sharing and permalinks

Built-in consultations use four query parameters and the existing Checker anchor:

```text
/?sa=elf&aa=300&sb=human&ab=34#checker
```

Only built-in species IDs and ages are included. The hash stays in the browser; the web server receives the path and query string, serves the static page, and React restores the ruling client-side. Case numbers, quips, derived results, and custom species IDs are never included.

Applicant names are presentation-only and remain in React memory for the current page session. They are trimmed when submitted, limited to 40 characters, and deliberately excluded from URLs, browser storage, calculations, quip selection, and case numbers. Opening or refreshing a permalink restores its species and ages with both name fields blank.

Clipboard and Web Share features degrade to clear, non-fatal messages when the browser does not support them or permission is denied. Production should use HTTPS because these APIs depend on browser, platform, and secure-context support.

Approved rulings can also be saved as self-contained 1080x1350 PNG cards. The browser builds a plain-text SVG from the already-submitted result, rasterises it locally with Canvas, and downloads the PNG; no screenshot library, server renderer, upload, or network request is involved. Every card includes the submitted Maturity Compatibility quip, Experience Gap quip, and administrative Bureau Note. It keeps the displayed case number, includes submitted applicant names when present, uses custom species display names without exposing their internal IDs, and shows longevity context only when an applicant exceeds a typical lifespan.

The **Result Card Style** picker offers Bureau Classic (the default), Royal Decree, Elven Archive, Dwarven Registry, Goblin Administration, Arcane Terminal, Fae Court, Dragon Archive, Celestial Tribunal, and Obsidian Records. A theme changes image presentation only: it never changes applicants, calculations, verdicts, case numbers, longevity, or any of the three submitted commentary lines. The image theme lives only in component memory and is not stored or encoded in permalinks.

## Website themes

The header **Theme** selector applies the same ten identities to the whole interface: Bureau Classic, Royal Decree, Elven Archive, Dwarven Registry, Goblin Administration, Arcane Terminal, Fae Court, Dragon Archive, Celestial Tribunal, and Obsidian Records. Bureau Classic is the default. The selected website theme is restored before React renders and only its stable ID is saved under `fantasy-age-checker-site-theme`; missing, invalid, or blocked storage falls back safely.

Website and result-card themes are deliberately independent. A newly submitted consultation starts its image card with the website theme active at submission time, after which either theme can be changed without changing the other. Existing results, applicant inputs, calculations, verdicts, quips, Bureau notes, case numbers, and longevity context survive website-theme changes unchanged. Neither theme is included in a permalink.

Stage 15 begins the v2 presentation overhaul. The ten website themes now share a richer registry describing structural presentation: document geometry, panel and divider treatment, heading and label systems, controls, seals, consultation indicators, result framing, density, and footer treatment. A single assistive-technology-hidden ornament component supplies lightweight CSS geometry and decorative departmental microcopy at a small set of shared locations. Themes remain one component architecture rather than ten page implementations.

Each identity now represents a distinct fictional department: Bureau Classic uses registered forms and filing rules; Royal Decree uses ceremonial double frames; Elven Archive uses folio margins and fine archival entries; Dwarven Registry uses angular inset plates; Goblin Administration uses deliberately offset files and layered stamps; Arcane Terminal uses system bars and data panels; Fae Court uses asymmetric petitions; Dragon Archive uses fortified vault framing; Celestial Tribunal uses symmetrical orbital dockets; and Obsidian Records uses spacious editorial indexing. These differences affect presentation only. All factual content, calculations, lifecycle records, applicant data, selected commentary, case numbers, sharing text, and permalink behaviour remain common and unchanged.

The theme layer retains visible focus, hover, disabled, and error states and simplifies dense or offset ornamentation on narrow screens. Theme decoration is CSS-generated, non-interactive, hidden from assistive technology, and motion-free; the existing reduced-motion behaviour remains in place. Website themes and generated-image themes remain independent after a consultation, and Stage 15 deliberately leaves exported image-card layouts visually stable for the Stage 16 result-card-format work.

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
docker build -t fantasy-age-checker:1.3.0 .
docker run --rm -p 8080:8080 fantasy-age-checker:1.3.0
```

Open `http://localhost:8080/`. The image health check performs `GET /`; a healthy deployment returns HTTP 200. Hashed Vite assets receive long-lived immutable caching, while `index.html` uses revalidation-friendly `no-cache` behaviour.

## Coolify deployment

1. Create a Coolify application from the Git repository.
2. Select **Dockerfile** as the build method; the repository-root `Dockerfile` requires no custom path.
3. Set the internal/exposed container port to `8080`.
4. Leave environment variables empty; none are required.
5. Attach the desired domain and enable HTTPS through Coolify's reverse proxy.
6. Configure the health check path as `/` and expect HTTP 200.
7. Deploy, then verify the main checker and `/?sa=elf&aa=300&sb=human&ab=34#checker`.
8. Over HTTPS, verify Copy Result, Copy Link, Save Image, and native text/file sharing on supported browsers. The checker remains usable when optional APIs are unavailable.

## Privacy and security

No consultation data is transmitted by the application. There are no network requests, analytics, backend services, user accounts, or bundled secrets. Result images are constructed and encoded entirely in the browser and are transmitted only if the user explicitly invokes the platform share sheet. Temporary species, applicant names, and image-theme choice remain in memory only. Browser persistence is limited to recent quip IDs and the selected website-theme ID in `localStorage`; blocked or malformed storage is ignored safely. Share links contain only built-in species IDs and entered ages; applicant names, website themes, and image themes are never serialized into them.

The nginx configuration adds conservative content-type, referrer, and framing headers without a restrictive untested Content Security Policy.

## Current limitations and post-v1 ideas

- Lifecycle figures are generic fictional assumptions, not canon for any setting.
- Truly immortal or ageless species are not yet modelled because the current calculation requires a finite typical lifespan.
- Results are entertainment, not relationship, legal, or personal advice.
- Native text sharing and native image-file sharing vary by browser, platform, secure-context status, and installed share targets; PNG download remains the fallback.
- Dynamic server-generated social preview images are not included in this static release.
- Custom species persistence/editing, user accounts, saved consultation history, backend storage, additional presets, analytics, and localisation remain deferred.

[`design.MD`](./design.MD) remains the product and design source of truth.
