# Fantasy Age Checker

## Website Design Document

### 1. Project Overview

**Fantasy Age Checker** is a humorous fantasy-themed website that compares the ages of two fictional fantasy characters or species.

The core joke is that chronological age becomes strange when different fantasy species mature and age at dramatically different rates. A 300-year-old elf and a 34-year-old human may occupy similar stages of their respective lifespans while having vastly different amounts of actual life experience.

The website therefore gives **two separate assessments**:

1. **Maturity Compatibility** — Are these characters at comparable stages of life for their species?
2. **Experience Gap** — How much difference exists in the amount of life and adult experience they have accumulated?

The result should feel like an absurdly serious ruling issued by an official fantasy bureaucracy.

---

# 2. Core Design Concept

## The Arcane Relationship Bureau

The website is presented as an official service operated by a fantasy government department.

Possible organisation name:

**The Arcane Relationship Bureau**
*Department of Inter-Species Affairs*

Alternative names can be considered later, but the visual and writing style should consistently suggest:

> A modern government service somehow operating inside a fantasy kingdom.

The organisation takes its responsibility extremely seriously.

The subject matter, however, is inherently ridiculous.

That contrast is the main source of humour.

---

# 3. Design Principles

The website should be:

### Funny, but not childish

Humour should primarily come from writing, bureaucracy, fantasy history and absurd comparisons rather than cartoons or exaggerated animations.

### Immediately understandable

Users should be able to enter two characters and receive a result without reading instructions first.

### Visually polished

The site should look like a genuine fantasy utility rather than a novelty generator.

### Appropriate

The site should never encourage inappropriate relationships. Characters below their species' recognised adulthood threshold should receive an automatic rejection rather than being passed through the compatibility formula.

### Replayable

Repeated calculations should produce different commentary so the site remains entertaining.

---

# 4. Core User Flow

The primary page should require almost no navigation.

```text
Header

Fantasy Age Compatibility Assessment

Character A                Character B

Species                    Species
[ Elf ▼ ]                  [ Human ▼ ]

Age                        Age
[ 300 ]                    [ 34 ]

        [ CONSULT THE ORACLE ]

                ↓

        OFFICIAL VERDICT

Maturity Compatibility

Experience Gap

Supporting calculations

Random administrative note
```

The user should be able to change either age or species and immediately perform another assessment.

---

# 5. Landing Page

The checker should appear almost immediately.

A suggested hero section:

# Is 300 too old for 34?

**In human terms: probably.
In elf terms: it's complicated.**

The Fantasy Age Checker compares maturity, lifespan and life experience across the peoples of the realm.

Then immediately present the calculator.

Avoid requiring users to scroll through a long explanation before reaching the tool.

---

# 6. Visual Style

The visual direction should combine:

* fantasy manuscripts
* heraldry
* wax seals
* government forms
* modern web design
* subtle magical details

It should **not** look like an entire website printed on an old parchment texture.

Instead, fantasy elements should decorate an otherwise clean interface.

---

# 7. Colour Palette

### Main Background

Dark charcoal-blue.

Example:

`#171A21`

This provides a modern, slightly mysterious backdrop.

### Document / Card Background

Warm ivory or parchment.

Example:

`#F2E8D5`

### Primary Accent

Antique gold.

Example:

`#B9944A`

Used for borders, insignia, headings and important details.

### Secondary Accent

Deep burgundy.

Example:

`#713B45`

Useful for official seals and stronger highlights.

### Positive Result

Muted forest green.

Example:

`#52705A`

### Warning Result

Burnt amber.

Example:

`#B87838`

### Serious Rejection

Muted dark red rather than bright alarm-red.

The overall palette should feel aged and authoritative without sacrificing readability.

---

# 8. Typography

Use two contrasting typography styles.

## Display / Fantasy Typeface

Used for:

* organisation name
* major headings
* verdict stamps
* decorative labels

Possible style:

**Cinzel**

or another readable classical serif.

## Interface Typeface

Used for:

* inputs
* descriptions
* calculations
* buttons
* supporting text

A clean sans-serif such as:

**Inter**

Fantasy fonts should never be used for large blocks of normal text.

---

# 9. Header

Suggested structure:

**⚜ The Arcane Relationship Bureau**

*Department of Inter-Species Affairs*

Navigation:

**Checker · Species Guide · How It Works · About**

The primary checker should remain accessible from every page.

Eventually, a circular bureau emblem could be created containing elements such as:

* an hourglass
* a heart
* scales
* a crown
* subtle fantasy motifs

The emblem should resemble an official government seal rather than a dating-app logo.

---

# 10. Character Cards

Each character receives a separate card.

Example:

## Applicant A

**Species**

`[ Elf ▼ ]`

**Age**

`[ 300 ]`

Optional contextual information may appear after selecting the species:

> Typical lifespan: 750 years
> Recognised adulthood: 100 years

Character B receives the same interface.

On desktop, the cards appear side-by-side.

On mobile, they stack vertically.

---

# 11. Species Personality

Species should share the same basic UI, but selecting one can introduce subtle decorative differences.

Examples:

### Elf

Small leaf or star ornament.

### Dwarf

Angular rune or geometric border.

### Human

Simple heraldic detailing.

### Orc

Heavy angular accent.

### Dragon

Subtle scale motif.

These differences should remain decorative and should not make each species feel like an entirely different website.

---

# 12. Main Action

The primary button should avoid generic wording such as **Calculate**.

Recommended:

# CONSULT THE ORACLE

Other possible phrases:

* Request Official Ruling
* Submit to the Council
* Assess Compatibility
* Petition the Bureau

**Consult the Oracle** is currently the preferred wording because it immediately establishes the tone.

---

# 13. Loading Sequence

A short artificial consultation period can appear before the result.

Approximately half a second to one second is enough.

During this period, randomly display a loading message.

Examples:

> Consulting ancient precedents…

> Reviewing elven census records…

> Contacting the Dwarven Ministry of Courtship…

> Adjusting for immortality…

> Locating the relevant prophecy…

> Determining whether this happened before recorded history…

> Asking the necromancers whether undeath counts…

The delay should remain short enough that the joke does not make the website frustrating to use.

---

# 14. Result Structure

Each result should look like an official ruling or certificate.

Example:

# OFFICIAL VERDICT

## ✓ MATURITY COMPATIBILITY

### Remarkably Well Matched

Both applicants occupy approximately equivalent stages of their respective lifecycles.

> The Council has reviewed the figures twice and is mildly disappointed to find no problem.

---

## ⚠ EXPERIENCE GAP

### Formidable

Applicant A has approximately 200 years of adult experience.

Applicant B has approximately 16.

> One of you calls it history. The other calls it Tuesday.

---

### Bureau Calculations

Elf relative age: **40.0%**

Human relative age: **40.5%**

Elf adult experience: **200 years**

Human adult experience: **16 years**

---

**Case No. ARB-ELF-HUM-003482**

*Issued by the Office of Chronological Compatibility.*

> This ruling is recognised in seventeen kingdoms, three republics and one disputed duchy.

---

# 15. Maturity Compatibility

Maturity represents where someone sits within the expected lifecycle of their species.

The classic human rule is:

[
Minimum = \frac{Age}{2} + 7
]

[
Maximum = 2(Age - 7)
]

Rather than using the human constants for every fantasy species, the constants scale with expected lifespan.

Using a human reference lifespan of **84 years**:

[
7 = \frac{84}{12}
]

Therefore for a species with expected lifespan (L):

[
Fantasy7 = \frac{L}{12}
]

and:

[
Fantasy14 = \frac{L}{6}
]

The species-specific rule becomes:

[
Minimum = \frac{Age}{2} + \frac{L}{12}
]

[
Maximum = 2Age - \frac{L}{6}
]

This creates an age range appropriate to the species' expected lifespan rather than blindly applying human years.

---

# 16. Cross-Species Maturity

For characters from different species, chronological age cannot be directly compared.

The system should therefore also calculate:

[
RelativeAge = \frac{CurrentAge}{ExpectedLifespan}
]

Example:

A 300-year-old elf with a 750-year lifespan:

[
300/750 = 40%
]

A 34-year-old human with an 84-year lifespan:

[
34/84 \approx 40.5%
]

Their chronological ages differ dramatically, but their relative life stages are extremely similar.

This information contributes to the **Maturity Compatibility** verdict.

The exact scoring thresholds can be refined during development.

---

# 17. Adulthood Safeguard

Every species should define a recognised age of adulthood.

Example data:

| Species  | Adulthood | Typical Lifespan |
| -------- | --------: | ---------------: |
| Human    |        18 |               84 |
| Elf      |       100 |              750 |
| Dwarf    |        40 |              300 |
| Halfling |        33 |              110 |
| Orc      |        16 |               70 |

These figures are examples and should be finalised separately.

If either entered character is below their species' adulthood age, normal compatibility calculations should stop.

Instead, display an appropriate rejection.

Example:

# APPLICATION REJECTED

One or more applicants have not reached the recognised age of adulthood for their people.

> The Council has confiscated this paperwork and would prefer not to discuss it further.

This rule should not be bypassed by relative-age calculations.

---

# 18. Experience Gap

Experience is deliberately separate from maturity.

Two characters might be equally mature relative to their species while having dramatically different amounts of lived experience.

The primary value should be:

[
AdultExperience = Age - AdulthoodAge
]

Example:

### Human

Age: 34
Adult at: 18

Adult experience:

**16 years**

### Elf

Age: 300
Adult at: 100

Adult experience:

**200 years**

This creates an entirely different comparison from maturity.

---

# 19. Experience Categories

Potential categories include:

### Basically Peers

The characters have accumulated similar amounts of adult experience.

### Noticeable

There is a difference, but nothing extraordinary.

### Considerable

One partner has substantially more adult experience.

### Formidable

The difference represents decades or centuries.

### Historical Documentary Territory

One partner's adult life substantially exceeds the other's entire lifespan.

### Civilisations Have Risen and Fallen

Reserved for extreme immortal or ancient-species situations.

The final thresholds should be calculated proportionally rather than relying solely on fixed year differences.

---

# 20. Deliberately Contradictory Results

One of the site's most entertaining features should be situations where the two verdicts disagree.

Example:

## MATURITY

**Excellent Match**

You're almost exactly equivalent in terms of species-relative maturity.

## EXPERIENCE

**Catastrophic Gap**

One applicant has been an adult for 240 years.

The other has been an adult for eleven.

> Mathematically appropriate. Conversationally complicated.

These contradictions should be treated as a feature rather than a problem.

---

# 21. Quip System

The site should contain a **large reusable humour database**.

Quips should not be stored directly inside calculation code.

Instead they should exist as structured content.

Possible categories:

* loading
* maturityExcellent
* maturityGood
* maturityBorderline
* maturityBad
* experienceTiny
* experienceModerate
* experienceLarge
* experienceExtreme
* rejectedMinor
* sameSpecies
* crossSpecies
* elf
* dwarf
* human
* orc
* halfling
* dragon
* immortal
* administrativeNote
* legalDisclaimer
* historicalComparison
* verdictHeading

---

# 22. Quip Tags

Each quip can have optional tags.

Example:

```json
{
  "text": "One of you calls it history. The other calls it Tuesday.",
  "category": "experienceExtreme",
  "tags": [
    "crossSpecies",
    "ancient"
  ]
}
```

Another:

```json
{
  "text": "The Council has reviewed the figures twice and is mildly disappointed to find no problem.",
  "category": "maturityExcellent",
  "tags": [
    "bureaucracy"
  ]
}
```

The result generator can prioritise quips that match the current situation.

---

# 23. Species-Specific Quips

Some humour should reference the selected species.

### Elf

> The elven representative insists three centuries is still "quite young."

> Applicant A remembers when this kingdom was mostly trees.

### Dwarf

> The Dwarven Registry considers both applicants old enough to know better.

### Human

> Humans continue to age at an administratively inconvenient rate.

### Dragon

> The Bureau would like to remind dragons that "I lost track after 900" is not a valid date of birth.

These should supplement the generic pool rather than appearing every time.

---

# 24. Anti-Repetition System

The website should prevent repeated quips from becoming stale.

For each category, remember recently displayed quips locally in the browser.

For example:

**Do not repeat the last 10–20 quips from that category unless the available pool has been exhausted.**

Once most of the pool has been shown, older entries can gradually become eligible again.

This does not require user accounts.

Browser `localStorage` should be sufficient.

---

# 25. Scale of Humour Library

The long-term target should be approximately:

**200–300+ quips**

Because each entry is short, maintaining a large pool is practical.

The library can grow over time without altering the compatibility calculation.

A mature version of the site could easily contain considerably more.

---

# 26. Stable Information vs Random Humour

The mathematical result should never randomly change.

For identical inputs:

* maturity calculations remain identical
* experience calculations remain identical
* verdict category remains identical

Only presentation elements change:

* quip
* administrative note
* loading message
* minor verdict wording
* case-file flavour text

This ensures the tool remains understandable and consistent.

---

# 27. Bureaucratic Details

Random administrative details can appear beneath results.

Examples:

> This ruling supersedes the Dwarven Courtship Guidance of 843.

> Filed under Regulation VII: Chronologically Complicated Relationships.

> Approved by three members of the Council and one extremely tired wizard.

> This assessment is not legally recognised in Mordor.

> Appeals must be submitted before the next full moon.

> Copies of this ruling have been forwarded to the relevant covens.

These details do not affect the calculation.

---

# 28. Case Numbers

Every result can receive a fake case identifier.

Example:

**ARB-ELF-HUM-003482**

Possible structure:

`ARB-[SPECIES A]-[SPECIES B]-[RANDOM NUMBER]`

This provides another small detail that makes the fictional bureaucracy feel real.

---

# 29. Species Guide

A secondary page can explain each species.

Example:

# Elf

**Recognised adulthood:** 100
**Typical lifespan:** 750 years

### Bureau Notes

Elves mature slowly and may remain physically stable for centuries.

> The Bureau strongly discourages asking an elf whether 400 is "old."

The page can explain where the site's numbers come from and eventually allow different interpretations of fantasy species.

---

# 30. How It Works Page

The site should be transparent about its fictional calculations.

Explain:

* the traditional half-age-plus-seven rule
* species lifespan scaling
* relative maturity
* adulthood safeguards
* adult experience
* the fact that this is a humorous fictional tool

The explanation itself can retain the bureaucratic voice while keeping the mathematics clear.

---

# 31. Mobile Design

Desktop layout:

```text
[ Applicant A ]    ↔    [ Applicant B ]
```

Mobile layout:

```text
[ Applicant A ]

       ✦

[ Applicant B ]

[ CONSULT THE ORACLE ]
```

Result cards should stack vertically.

Buttons and inputs should be comfortable to use with a thumb.

Decorative elements should simplify automatically on small screens.

---

# 32. Animation

Animations should remain subtle.

Possible effects:

* wax seal appearing when ruling is issued
* verdict stamp dropping onto the page
* brief shimmer around the Oracle button
* gentle card transition when species changes
* loading rune rotating during consultation

Avoid:

* constant floating particles
* intrusive sound
* bouncing fantasy characters
* long result animations
* excessive magical effects

The bureaucracy should remain the dominant aesthetic.

---

# 33. Accessibility

Fantasy aesthetics should never reduce usability.

Requirements should include:

* strong text contrast
* keyboard-accessible controls
* clearly labelled form fields
* visible focus indicators
* no information communicated by colour alone
* readable font sizes
* reduced-motion support
* appropriate screen-reader labels

Decorative runes and icons should generally be hidden from assistive technology.

---

# 34. Content Tone

The bureau speaks:

* formally
* confidently
* bureaucratically
* slightly wearily
* as though fantasy relationship disputes are an ordinary administrative inconvenience

Good:

> The Council finds no significant maturity discrepancy.

Better:

> The Council finds no significant maturity discrepancy and regrets having convened an emergency session.

Avoid humour that becomes:

* sexually explicit
* derogatory toward real groups
* mean-spirited
* centred on minors
* dependent on offensive stereotypes

---

# 35. MVP

The first usable version should contain:

### Core

* one-page checker
* two species selectors
* two age inputs
* adulthood validation
* maturity calculation
* experience calculation
* two verdicts
* responsive layout

### Initial Species

Approximately 6–10 common fantasy peoples.

Potential starting set:

* Human
* Elf
* Dwarf
* Halfling
* Orc
* Gnome
* Dragonborn
* Goblin
* Dragon

Exact values should be decided before implementation.

### Humour

Initial target:

**75–100 quips**

Enough to make repetition uncommon from the beginning.

---

# 36. Later Features

Possible future additions include:

### Custom Species

Users enter:

* species name
* adulthood age
* expected lifespan

### Fantasy Settings

Different presets could provide different values.

Example:

* Generic Fantasy
* High Fantasy
* Custom Setting

Avoid using copyrighted setting-specific data unless appropriate.

### Shareable Results

Generate a clean card:

> **Elf, 300 + Human, 34**
> Maturity: Excellent
> Experience: Historical Problem

Suitable for sharing without requiring screenshots of the entire page.

### Result Permalinks

Encode the two species and ages in the URL.

### Expanded Species Lore

More detailed species pages with lifecycle explanations and additional jokes.

### Rare Special Results

Extremely unusual inputs could trigger hidden responses or easter eggs.

---

# 37. Overall Experience

The ideal user experience is:

1. User discovers the website.
2. Immediately understands the premise.
3. Enters two ridiculous fantasy ages.
4. Receives a surprisingly logical result.
5. Laughs at the commentary.
6. Changes the numbers to see what happens.
7. Notices that the jokes change.
8. Tries increasingly absurd species combinations.
9. Shares the result with someone else.

The mathematics gives the site enough internal consistency to make experimentation interesting.

The writing gives users a reason to keep experimenting.

---

# 38. Core Identity

The site should ultimately feel like:

> **A completely unnecessary government service that fantasy civilisation has somehow decided is essential.**

It is not merely an age calculator with fantasy colours.

It is an **official inter-species chronological compatibility assessment**, backed by fictional regulations, administrative precedent, arbitrary council rulings and a worrying amount of paperwork.

The bureau treats every result seriously.

The user does not have to.