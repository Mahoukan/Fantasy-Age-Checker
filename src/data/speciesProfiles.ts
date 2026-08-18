import { curatedBureauCases, type CuratedBureauCaseId } from './bureauCases'
import { species, type SpeciesId } from './species'

export interface SpeciesProfile {
  speciesId: SpeciesId
  classification: string
  lifecycleSummary: string
  bureauObservation: string
  commonFilingIssue: string
  chronologicalPeculiarity: string
  archivalNotes: readonly [string, string]
  relatedCaseIds?: readonly CuratedBureauCaseId[]
}

type SpeciesProfileRegistry = { readonly [Id in SpeciesId]: SpeciesProfile & { speciesId: Id } }

export const speciesProfiles = {
  human: {
    speciesId: 'human', classification: 'Standard-Lived Humanoid',
    lifecycleSummary: 'Humans reach recognised adulthood relatively early and complete a typical lifecycle within a span used informally as the Bureau reference scale. Their familiar calendar makes records easy to read, though it encourages applicants to mistake Human expectations for universal ones.',
    bureauObservation: 'Human applicants remain the Bureau’s most common source of complaints about everyone else’s age system.',
    commonFilingIssue: 'Assuming chronological age means the same thing for every species.',
    chronologicalPeculiarity: 'Often serves as the informal reference point, despite repeated objections from everyone else.',
    archivalNotes: ['Forms usually fit within one lifetime.', 'Historical attachments are normally written after the event.'],
    relatedCaseIds: ['classic-elf-problem', 'archive-has-questions', 'bureaucratically-unremarkable', 'borderline-filing', 'dwarven-misunderstanding', 'documentary-territory'],
  },
  elf: {
    speciesId: 'elf', classification: 'Long-Lived Humanoid',
    lifecycleSummary: 'Elves reach recognised adulthood much later than most peoples and commonly retain several centuries of adult life. Raw chronological differences can therefore look enormous beside shorter-lived records while representing only modest differences in relative lifecycle position.',
    bureauObservation: 'Elven filings cause a disproportionate number of statements beginning, “Yes, but two hundred is still young.”',
    commonFilingIssue: 'Describing anyone under 150 as young without specifying the relevant species.',
    chronologicalPeculiarity: 'A century of chronological difference may represent a comparatively modest lifecycle interval.',
    archivalNotes: ['Frequently cross-referenced with Human filings.', 'Clerks advise against writing “only 120”.'],
    relatedCaseIds: ['classic-elf-problem', 'identical-number-different-meaning', 'short-lived-filing'],
  },
  dwarf: {
    speciesId: 'dwarf', classification: 'Long-Lived Subterranean Humanoid',
    lifecycleSummary: 'Dwarves enter recognised adulthood later than Humans and ordinarily maintain a long adult period. A Dwarven age that appears advanced on a Human calendar may occupy an entirely routine lifecycle position while still carrying decades of additional adult experience.',
    bureauObservation: 'Supporting documentation is frequently engraved on materials unsuitable for standard filing cabinets.',
    commonFilingIssue: 'Submitting a complete clan chronology instead of the requested date of birth.',
    chronologicalPeculiarity: 'Comparable relative maturity can conceal several Human careers of adult experience.',
    archivalNotes: ['Records commonly arrive in excellent condition.', 'Weight limits apply to stone attachments.'],
    relatedCaseIds: ['dwarven-misunderstanding', 'unexpectedly-compatible'],
  },
  halfling: {
    speciesId: 'halfling', classification: 'Standard-Lived Small Humanoid',
    lifecycleSummary: 'Halflings reach recognised adulthood later than Humans but have only a moderately longer typical lifespan. Their adult period is therefore compact enough for familiar comparisons while remaining distinct enough to make early-adult filings particularly sensitive to lifecycle position.',
    bureauObservation: 'Halfling records are impeccably hosted and generally accompanied by refreshments not listed on Form ARB-01.',
    commonFilingIssue: 'Using family meal anniversaries where the form requests calendar years.',
    chronologicalPeculiarity: 'A modest chronological difference near adulthood can occupy a substantial portion of adult life.',
    archivalNotes: ['Household witnesses are unusually punctual.', 'Supplementary snack receipts are not evidence.'],
  },
  orc: {
    speciesId: 'orc', classification: 'Standard-Lived Humanoid',
    lifecycleSummary: 'Orcs reach recognised adulthood early and have a somewhat shorter typical lifecycle than Humans. Their records can show considerable adult experience at ages that longer-lived peoples still describe as youthful, making raw-number assumptions especially unreliable.',
    bureauObservation: 'Orc applicants generally complete the form correctly and ask why everyone expected otherwise.',
    commonFilingIssue: 'Long-lived clerks treating an ordinary adult age as unexpectedly early.',
    chronologicalPeculiarity: 'Adult experience accumulates quickly relative to many longer-lived Bureau populations.',
    archivalNotes: ['Declarations favour concise calendar notation.', 'Corrections are usually direct and legible.'],
  },
  gnome: {
    speciesId: 'gnome', classification: 'Long-Lived Small Humanoid',
    lifecycleSummary: 'Gnomes reach adulthood on a schedule similar to Dwarves but typically remain active across an even longer lifecycle. Close proportional matches with shorter-lived peoples can therefore produce surprisingly large differences in accumulated adult years.',
    bureauObservation: 'Gnomish applicants routinely improve the date field and attach seventeen pages explaining the revision.',
    commonFilingIssue: 'Replacing the approved calendar with a more precise personal system.',
    chronologicalPeculiarity: 'Ordinary relative maturity may correspond to centuries of practical adult experience.',
    archivalNotes: ['Mechanical attachments must be switched off.', 'Diagrams are accepted when labelled.'],
  },
  dragonborn: {
    speciesId: 'dragonborn', classification: 'Standard-Lived Draconic Humanoid',
    lifecycleSummary: 'Dragonborn enter recognised adulthood early and follow a lifespan broadly comparable to Humans. Their lifecycle is straightforward within the model, though the title often leads clerks to apply ancient Draconic expectations that the actual record does not support.',
    bureauObservation: 'The Draconic Records Desk has issued repeated reminders that ancestry is not a unit of time.',
    commonFilingIssue: 'Being routed to the ancient-record queue on the strength of the name alone.',
    chronologicalPeculiarity: 'Draconic classification does not imply a Dragon-length lifecycle.',
    archivalNotes: ['Use the ordinary year field.', 'Ancestral seals are optional attachments.'],
  },
  goblin: {
    speciesId: 'goblin', classification: 'Short-Lived Humanoid',
    lifecycleSummary: 'Goblins enter recognised adulthood early and have comparatively short typical lifespans. A gap that seems modest to an Elf can represent a large share of a Goblin’s adult life, so both proportional maturity and actual experience deserve careful reading.',
    bureauObservation: 'Goblin records are usually complete, although rarely in the order requested.',
    commonFilingIssue: 'Providing three conflicting dates, all bearing apparently valid stamps.',
    chronologicalPeculiarity: 'Small raw age differences can represent a large fraction of total adult experience.',
    archivalNotes: ['Duplicate forms are normal.', 'Triplicate forms are suspicious.'],
    relatedCaseIds: ['identical-number-different-meaning', 'short-lived-filing'],
  },
  dragon: {
    speciesId: 'dragon', classification: 'Ancient Draconic',
    lifecycleSummary: 'Dragons reach recognised adulthood late and may remain adults across many ordinary lifetimes. Similar proportional maturity can still conceal centuries of experience, while unusually old records remain valid because typical lifespan is a reference rather than a maximum.',
    bureauObservation: 'Original documents often exist, but retrieval may require entering the applicant’s archive hoard.',
    commonFilingIssue: 'Using historical eras, dynasties, or reigns instead of calendar years.',
    chronologicalPeculiarity: 'Even modest proportional differences may correspond to centuries of lived experience.',
    archivalNotes: ['Century fields require careful checking.', 'Keep forms away from combustible exhibits.'],
    relatedCaseIds: ['documentary-territory', 'long-lived-peers'],
  },
  'half-elf': {
    speciesId: 'half-elf', classification: 'Extended-Lived Humanoid',
    lifecycleSummary: 'Half-Elves reach recognised adulthood near the Human schedule but ordinarily continue through a substantially longer lifecycle. Their records often look familiar at first glance while producing maturity positions that differ from both Human and Elven assumptions.',
    bureauObservation: 'Half-Elven applicants are frequently sent two contradictory forms and return the correct third one.',
    commonFilingIssue: 'Applying either Human or Elven expectations without consulting the actual lifecycle record.',
    chronologicalPeculiarity: 'Early adulthood resembles Human timing while later lifecycle comparisons diverge considerably.',
    archivalNotes: ['Cross-department filing is unnecessary.', 'Use the declared registry entry as written.'],
  },
  'half-orc': {
    speciesId: 'half-orc', classification: 'Standard-Lived Humanoid',
    lifecycleSummary: 'Half-Orcs reach recognised adulthood early and have a typical lifespan close to the Human reference. Their comparisons are usually arithmetically straightforward, although inherited assumptions about either parent population regularly complicate otherwise ordinary paperwork.',
    bureauObservation: 'Most processing delays arise before the Half-Orc applicant reaches the counter.',
    commonFilingIssue: 'Clerks substituting ancestry assumptions for the registered lifecycle values.',
    chronologicalPeculiarity: 'A familiar lifespan can obscure the significance of an earlier adulthood threshold.',
    archivalNotes: ['No ancestry appendix is required.', 'Registered values take precedence over guesses.'],
  },
  fae: {
    speciesId: 'fae', classification: 'Long-Lived Enchanted Humanoid',
    lifecycleSummary: 'Fae reach recognised adulthood later than most common peoples and retain a long adult lifecycle. Their chronological comparisons often remain proportional across centuries, provided all parties agree that the submitted years occurred in the same sequence.',
    bureauObservation: 'Fae filings are technically complete, subject to several conditions printed in invisible seasonal ink.',
    commonFilingIssue: 'Counting festivals, seasons, and promises as interchangeable calendar units.',
    chronologicalPeculiarity: 'Long adult spans make large raw gaps appear smaller in lifecycle terms than expected.',
    archivalNotes: ['Read all marginal conditions.', 'Do not accept “after midsummer” as a year.'],
  },
  fairy: {
    speciesId: 'fairy', classification: 'Long-Lived Fey',
    lifecycleSummary: 'Fairies reach adulthood on a roughly Human timetable but typically remain within a much longer lifecycle. This creates familiar early records followed by increasingly large chronological gaps that may still represent similar proportional maturity.',
    bureauObservation: 'Fairy documentation is compact, legible, and visible only when held at the correct angle.',
    commonFilingIssue: 'Decorating the numeric field until the original number can no longer be identified.',
    chronologicalPeculiarity: 'Human-like adulthood combines with a substantially extended adult period.',
    archivalNotes: ['Glitter is not an official seal.', 'Magnification lenses are available at reception.'],
  },
  pixie: {
    speciesId: 'pixie', classification: 'Extended-Lived Fey',
    lifecycleSummary: 'Pixies enter recognised adulthood early but commonly live well beyond the Human reference scale. Their records accumulate adult experience quickly while leaving ample lifecycle ahead, producing comparisons that can look young proportionally and seasoned chronologically.',
    bureauObservation: 'Pixie applicants are reminded that “I lost count after forty” is not a recognised date format.',
    commonFilingIssue: 'Entering a wingbeat count in the field reserved for years.',
    chronologicalPeculiarity: 'Early adulthood and extended lifespan separate maturity position from adult-year totals.',
    archivalNotes: ['Small-form editions remain valid.', 'Secure loose pages before opening windows.'],
  },
  giant: {
    speciesId: 'giant', classification: 'Long-Lived Giantkin',
    lifecycleSummary: 'Giants reach recognised adulthood later than Humans and ordinarily retain a long adult lifecycle. Their proportional comparisons resemble other long-lived peoples, although the physical scale of submitted records has no mathematical relevance despite repeated claims.',
    bureauObservation: 'The Giant Records Counter is structurally reinforced and still considered temporary.',
    commonFilingIssue: 'Submitting dates in handwriting sized for monumental inscriptions.',
    chronologicalPeculiarity: 'Several Human generations may fit inside an otherwise routine Giant adult period.',
    archivalNotes: ['Oversized forms may be folded once.', 'Desk clearance is marked on the floor.'],
  },
  troll: {
    speciesId: 'troll', classification: 'Extended-Lived Giantkin',
    lifecycleSummary: 'Trolls reach adulthood on a familiar schedule but ordinarily continue through a longer lifecycle. Their age comparisons can appear Human-like at the threshold and then diverge steadily as additional decades accumulate without the same proportional advance.',
    bureauObservation: 'Troll records survive most archival incidents, including several that did not spare the archive.',
    commonFilingIssue: 'Treating document durability as proof that every handwritten date is original.',
    chronologicalPeculiarity: 'A familiar adulthood threshold leads into a substantially extended adult span.',
    archivalNotes: ['Water damage is rarely decisive.', 'Bridge district forms use the same calendar.'],
  },
  ogre: {
    speciesId: 'ogre', classification: 'Standard-Lived Giantkin',
    lifecycleSummary: 'Ogres enter recognised adulthood early and follow a lifecycle only moderately longer than Humans. Their records are generally easy to compare, but early adulthood means equal chronological ages can still represent different quantities of adult experience.',
    bureauObservation: 'Ogre applicants appreciate forms with adequate writing space and instructions with inadequate ambiguity.',
    commonFilingIssue: 'Receiving a form designed for a larger hand but a smaller answer box.',
    chronologicalPeculiarity: 'Earlier adulthood can produce more adult experience at otherwise familiar ages.',
    archivalNotes: ['Large-print forms are standard issue.', 'Blunt answers remain valid answers.'],
  },
  kobold: {
    speciesId: 'kobold', classification: 'Short-Lived Draconic Humanoid',
    lifecycleSummary: 'Kobolds reach recognised adulthood very early and have a short typical lifespan. Adult experience therefore begins accumulating quickly, and small chronological intervals can carry substantial lifecycle weight even when compared with similarly short-lived peoples.',
    bureauObservation: 'Kobold archivists can fit a complete decade of files into space allocated for one Human quarter.',
    commonFilingIssue: 'Using tunnel survey notation in place of the calendar date.',
    chronologicalPeculiarity: 'A few years may represent a significant share of both adulthood and total lifespan.',
    archivalNotes: ['Compact filing is encouraged.', 'Do not mistake scale diagrams for date tables.'],
    relatedCaseIds: ['unexpectedly-compatible'],
  },
  centaur: {
    speciesId: 'centaur', classification: 'Standard-Lived Beastfolk',
    lifecycleSummary: 'Centaurs reach recognised adulthood on a Human-like schedule and have a moderately longer typical lifespan. Comparisons are usually intuitive, although the extra adult decades can become meaningful when paired with shorter-lived applicants.',
    bureauObservation: 'Centaur interviews require ordinary arithmetic and above-average clearance around the records desk.',
    commonFilingIssue: 'Entering travel seasons where the form requests completed calendar years.',
    chronologicalPeculiarity: 'Human-like adulthood is followed by a somewhat broader adult lifecycle.',
    archivalNotes: ['Standing counters are available.', 'Route maps belong in supporting exhibits.'],
  },
  satyr: {
    speciesId: 'satyr', classification: 'Extended-Lived Fey Humanoid',
    lifecycleSummary: 'Satyrs reach recognised adulthood on a familiar schedule but typically live beyond the Human reference span. Their early comparisons can look ordinary while later records accumulate additional adult decades that alter experience without proportionally extreme maturity.',
    bureauObservation: 'Satyr appointments begin punctually, then acquire refreshments and an unofficial musical adjournment.',
    commonFilingIssue: 'Dating forms by festivals whose occurrence is disputed by three neighbouring districts.',
    chronologicalPeculiarity: 'Familiar early adulthood develops into a longer-than-expected adult record.',
    archivalNotes: ['Festival calendars require an appendix.', 'Musical notation is not a date stamp.'],
  },
  minotaur: {
    speciesId: 'minotaur', classification: 'Extended-Lived Beastfolk',
    lifecycleSummary: 'Minotaurs share an early adulthood threshold with several common peoples but ordinarily remain adults for longer. Their records can align closely at younger ages and separate gradually in lifecycle position and accumulated experience over later decades.',
    bureauObservation: 'Minotaur files are impeccably indexed despite persistent criticism of the archive floor plan.',
    commonFilingIssue: 'Following obsolete directional instructions to the correct records counter.',
    chronologicalPeculiarity: 'Matching early milestones do not guarantee matching later lifecycle positions.',
    archivalNotes: ['Index references are exceptionally reliable.', 'Archive maps remain under review.'],
  },
  merfolk: {
    speciesId: 'merfolk', classification: 'Extended-Lived Aquatic Humanoid',
    lifecycleSummary: 'Merfolk reach recognised adulthood slightly later than Humans and retain a notably longer adult lifecycle. Their comparisons can appear familiar near adulthood while producing growing chronological and experience differences across later life.',
    bureauObservation: 'Waterproof correspondence reaches the Bureau reliably, though often after the ink has reconsidered its placement.',
    commonFilingIssue: 'Using tidal cycles without supplying the approved conversion schedule.',
    chronologicalPeculiarity: 'A modestly later adulthood opens into nearly twice the Human reference lifespan.',
    archivalNotes: ['Waterproof sleeves are provided.', 'Tide tables are supporting evidence only.'],
  },
  harpy: {
    speciesId: 'harpy', classification: 'Standard-Lived Aerial Humanoid',
    lifecycleSummary: 'Harpies reach recognised adulthood early and have a typical lifespan close to Humans. Their lifecycle comparisons are usually straightforward, with the main distinction arising from the additional adult experience accumulated before an equal-aged Human reaches adulthood.',
    bureauObservation: 'Harpy filings reach the upper archive shelves without clerical assistance or prior warning.',
    commonFilingIssue: 'Submitting wind-season markers instead of a conventional date.',
    chronologicalPeculiarity: 'Earlier adulthood modestly increases adult experience at matching chronological ages.',
    archivalNotes: ['Secure pages with approved clips.', 'Upper-shelf delivery is not priority processing.'],
  },
  dryad: {
    speciesId: 'dryad', classification: 'Long-Lived Arboreal Fey',
    lifecycleSummary: 'Dryads reach adulthood later than common peoples and ordinarily remain within a long, slow lifecycle. Large chronological gaps can represent modest proportional differences, while centuries of adult experience accumulate beneath otherwise comparable maturity results.',
    bureauObservation: 'Dryad records may reference both birthdays and growing seasons; only one belongs in the age field.',
    commonFilingIssue: 'Counting rings, seasons, and calendar years as though the terms were interchangeable.',
    chronologicalPeculiarity: 'Slow proportional ageing can coexist with extensive accumulated adult history.',
    archivalNotes: ['Pressed leaves are not date certificates.', 'Archive humidity is carefully regulated.'],
  },
  nymph: {
    speciesId: 'nymph', classification: 'Long-Lived Elemental Fey',
    lifecycleSummary: 'Nymphs reach recognised adulthood later than Humans and ordinarily continue through several centuries. Their lifecycle position advances slowly on ordinary calendars, making cross-species records especially prone to confusing raw age with comparable maturity.',
    bureauObservation: 'Nymph records are catalogued by spring, grove, and district before anyone remembers to ask for the year.',
    commonFilingIssue: 'Providing a location of origin where the form requests a date.',
    chronologicalPeculiarity: 'Centuries may pass while relative lifecycle movement remains comparatively gradual.',
    archivalNotes: ['Geographic indexes are cross-referenced.', 'Seasonal names require calendar equivalents.'],
  },
  kitsune: {
    speciesId: 'kitsune', classification: 'Long-Lived Shapeshifter',
    lifecycleSummary: 'Kitsune reach recognised adulthood near the Human schedule but ordinarily retain a long adult lifecycle. This creates substantial adult experience at proportional ages that may still appear moderate, particularly beside shorter-lived applicants.',
    bureauObservation: 'Kitsune records are accurate; determining which declared name owns the appointment takes longer.',
    commonFilingIssue: 'Attaching an alias schedule while omitting the requested chronological age.',
    chronologicalPeculiarity: 'Early adulthood paired with long life produces unusually extended adult experience.',
    archivalNotes: ['Aliases share one lifecycle record.', 'Tail counts are not accepted as age evidence.'],
  },
  oni: {
    speciesId: 'oni', classification: 'Long-Lived Mythic Humanoid',
    lifecycleSummary: 'Oni reach recognised adulthood later than Humans and maintain a long adult span. Their proportional maturity can align with much younger short-lived applicants while their accumulated adult experience remains separated by many decades.',
    bureauObservation: 'Oni age declarations arrive with seals substantial enough to authenticate the desk beneath them.',
    commonFilingIssue: 'Treating the weight of an official seal as a substitute for the missing date.',
    chronologicalPeculiarity: 'Moderate proportional ages can already contain extensive adult experience.',
    archivalNotes: ['Reinforced stamp pads are available.', 'Seal dimensions do not affect priority.'],
  },
  djinn: {
    speciesId: 'djinn', classification: 'Ancient Elemental Intelligence',
    lifecycleSummary: 'Djinn reach recognised adulthood late and commonly remain adults across many Human generations. Relative maturity can align neatly with other ancient peoples while chronological and experience values extend far beyond ordinary administrative planning horizons.',
    bureauObservation: 'Djinn applicants occasionally offer to revise the deadline; the Bureau prefers the original calendar.',
    commonFilingIssue: 'Describing a birth date as occurring several wishes ago.',
    chronologicalPeculiarity: 'Comparable maturity with ancient peoples may still involve centuries of experience difference.',
    archivalNotes: ['Wish clauses are legally irrelevant here.', 'Use fire-resistant document sleeves when requested.'],
    relatedCaseIds: ['long-lived-peers'],
  },
  gargoyle: {
    speciesId: 'gargoyle', classification: 'Long-Lived Stone Humanoid',
    lifecycleSummary: 'Gargoyles reach recognised adulthood later than Humans and ordinarily remain in a long adult lifecycle. Their slow proportional progression allows extensive chronological history to accumulate without necessarily producing an extreme maturity position.',
    bureauObservation: 'Gargoyle applicants display exemplary patience and alarming success at remaining unnoticed in the queue.',
    commonFilingIssue: 'Listing the building’s completion date without confirming the applicant’s own date.',
    chronologicalPeculiarity: 'Long periods of apparent stability may contain substantial adult experience.',
    archivalNotes: ['Architectural records require identity confirmation.', 'Stone dust is not evidence of antiquity.'],
  },
  sphinx: {
    speciesId: 'sphinx', classification: 'Ancient Mythic Intelligence',
    lifecycleSummary: 'Sphinxes reach recognised adulthood later than common peoples and retain a lifecycle spanning many ordinary generations. Their comparisons frequently combine large calendar values, substantial adult experience, and questions about whether the submitted answer was ever intended to be straightforward.',
    bureauObservation: 'The Sphinx Records Desk has stopped asking why every completed form contains another question.',
    commonFilingIssue: 'Responding to the age field with a question whose answer is allegedly the date.',
    chronologicalPeculiarity: 'Ancient-scale ages magnify small proportional differences into long historical intervals.',
    archivalNotes: ['Riddles require plain-language attachments.', 'Answers should be written outside the question field.'],
    relatedCaseIds: ['archive-has-questions'],
  },
} as const satisfies SpeciesProfileRegistry

const canonicalIds = new Set(species.map((entry) => entry.id))
const profileIds = Object.keys(speciesProfiles) as SpeciesId[]
const curatedIds = new Set(curatedBureauCases.map((entry) => entry.id))

if (profileIds.length !== canonicalIds.size || profileIds.some((id) => !canonicalIds.has(id))) {
  throw new Error('Every canonical built-in species must have exactly one Bureau Species Profile.')
}

for (const profile of Object.values(speciesProfiles) as readonly SpeciesProfile[]) {
  if (profile.relatedCaseIds?.some((id) => !curatedIds.has(id))) {
    throw new Error(`Species Profile ${profile.speciesId} references an unknown curated Bureau Case.`)
  }
}

export function getSpeciesProfile(speciesId: SpeciesId): SpeciesProfile {
  const profile = speciesProfiles[speciesId]
  if (!profile) throw new Error(`Missing Bureau Species Profile for ${speciesId}.`)
  return profile
}
