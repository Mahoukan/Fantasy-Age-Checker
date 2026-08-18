import type { Quip } from '../../types/quip'

export const expandedSpeciesQuips = [
  { id: 'expanded-half-elf-maturity-001', text: 'The Half-Elf lifecycle table has been filed between the human and elven volumes without favouring either shelf.', slot: 'MATURITY', species: ['half-elf'] },
  { id: 'expanded-half-elf-experience-001', text: 'The Half-Elf experience record contains both brisk decades and very patient family correspondence.', slot: 'EXPERIENCE', species: ['half-elf'] },
  { id: 'expanded-half-elf-admin-001', text: 'Both heritage registries have countersigned the Half-Elf appendix.', slot: 'ADMINISTRATIVE', species: ['half-elf'] },
  { id: 'expanded-half-elf-loading-001', text: 'Reconciling the Half-Elf lifecycle schedules...', slot: 'LOADING', species: ['half-elf'] },

  { id: 'expanded-half-orc-maturity-001', text: 'The Half-Orc maturity record has been assessed on its own figures, as Bureau policy sensibly requires.', slot: 'MATURITY', species: ['half-orc'] },
  { id: 'expanded-half-orc-experience-001', text: 'The Half-Orc adult-year ledger arrived direct, complete, and refreshingly free of ancestry footnotes.', slot: 'EXPERIENCE', species: ['half-orc'] },
  { id: 'expanded-half-orc-admin-001', text: 'The Half-Orc registry has declined the Bureau’s offer of an unnecessarily complicated supplementary form.', slot: 'ADMINISTRATIVE', species: ['half-orc'] },
  { id: 'expanded-half-orc-loading-001', text: 'Reviewing the Half-Orc registry declaration...', slot: 'LOADING', species: ['half-orc'] },

  { id: 'expanded-fae-maturity-001', text: 'The Fae lifecycle calendar recognises several seasons that ordinary almanacs have overlooked.', slot: 'MATURITY', species: ['fae'] },
  { id: 'expanded-fae-experience-001', text: 'The Fae experience ledger treats a human generation as a moderately eventful interval.', slot: 'EXPERIENCE', species: ['fae'] },
  { id: 'expanded-fae-admin-001', text: 'The Fae filing has been accepted subject to the usual moonlight and threshold clauses.', slot: 'ADMINISTRATIVE', species: ['fae'] },
  { id: 'expanded-fae-loading-001', text: 'Checking the Fae calendar for concealed seasons...', slot: 'LOADING', species: ['fae'] },

  { id: 'expanded-fairy-maturity-001', text: 'The Fairy maturity chart is compact, precise, and considerably older than its binding suggests.', slot: 'MATURITY', species: ['fairy'] },
  { id: 'expanded-fairy-experience-001', text: 'The Fairy record measures long experience without requiring a physically larger folder.', slot: 'EXPERIENCE', species: ['fairy'] },
  { id: 'expanded-fairy-admin-001', text: 'Decorative dust on the Fairy application has been classified as official embellishment.', slot: 'ADMINISTRATIVE', species: ['fairy'] },
  { id: 'expanded-fairy-loading-001', text: 'Inspecting the Fairy register under adequate light...', slot: 'LOADING', species: ['fairy'] },

  { id: 'expanded-pixie-maturity-001', text: 'The Pixie lifecycle figures occupy very little page while retaining full administrative weight.', slot: 'MATURITY', species: ['pixie'] },
  { id: 'expanded-pixie-experience-001', text: 'The Pixie experience timeline has been enlarged for the convenience of the reviewing clerk.', slot: 'EXPERIENCE', species: ['pixie'] },
  { id: 'expanded-pixie-admin-001', text: 'The Pixie registry requests that tiny handwriting not be mistaken for optional detail.', slot: 'ADMINISTRATIVE', species: ['pixie'] },
  { id: 'expanded-pixie-loading-001', text: 'Locating the Pixie-sized date columns...', slot: 'LOADING', species: ['pixie'] },

  { id: 'expanded-giant-maturity-001', text: 'The Giant maturity table required a broader desk but no alteration to the arithmetic.', slot: 'MATURITY', species: ['giant'] },
  { id: 'expanded-giant-experience-001', text: 'The Giant experience ledger is substantial in both chronology and binding.', slot: 'EXPERIENCE', species: ['giant'] },
  { id: 'expanded-giant-admin-001', text: 'Reinforced shelving has been reserved for the certified Giant record.', slot: 'ADMINISTRATIVE', species: ['giant'] },
  { id: 'expanded-giant-loading-001', text: 'Clearing sufficient desk space for the Giant file...', slot: 'LOADING', species: ['giant'] },

  { id: 'expanded-troll-maturity-001', text: 'The Troll lifecycle record remains serviceable despite conditions that ended three previous folders.', slot: 'MATURITY', species: ['troll'] },
  { id: 'expanded-troll-experience-001', text: 'The Troll experience total has survived both review and an unfortunate bridge-related filing incident.', slot: 'EXPERIENCE', species: ['troll'] },
  { id: 'expanded-troll-admin-001', text: 'The Troll registry recommends weather-resistant ink for all future correspondence.', slot: 'ADMINISTRATIVE', species: ['troll'] },
  { id: 'expanded-troll-loading-001', text: 'Recovering the Troll ledger from durable storage...', slot: 'LOADING', species: ['troll'] },

  { id: 'expanded-ogre-maturity-001', text: 'The Ogre maturity form uses generous margins and exactly the standard lifecycle formula.', slot: 'MATURITY', species: ['ogre'] },
  { id: 'expanded-ogre-experience-001', text: 'The Ogre adult-year total has been entered in firm handwriting and checked once more for emphasis.', slot: 'EXPERIENCE', species: ['ogre'] },
  { id: 'expanded-ogre-admin-001', text: 'The Ogre records office has returned the stamp in recognisably stamped condition.', slot: 'ADMINISTRATIVE', species: ['ogre'] },
  { id: 'expanded-ogre-loading-001', text: 'Opening the large-print Ogre register...', slot: 'LOADING', species: ['ogre'] },

  { id: 'expanded-kobold-maturity-001', text: 'The Kobold lifecycle table was retrieved from a remarkably efficient subterranean archive.', slot: 'MATURITY', species: ['kobold'] },
  { id: 'expanded-kobold-experience-001', text: 'The Kobold experience record fits many active years into a comparatively short timeline.', slot: 'EXPERIENCE', species: ['kobold'] },
  { id: 'expanded-kobold-admin-001', text: 'The Kobold registry has filed a duplicate in a compartment the Bureau cannot relocate.', slot: 'ADMINISTRATIVE', species: ['kobold'] },
  { id: 'expanded-kobold-loading-001', text: 'Following the Kobold archive index underground...', slot: 'LOADING', species: ['kobold'] },

  { id: 'expanded-centaur-maturity-001', text: 'The Centaur maturity review proceeded normally after the furniture was rearranged.', slot: 'MATURITY', species: ['centaur'] },
  { id: 'expanded-centaur-experience-001', text: 'The Centaur adult timeline covers considerable ground while remaining chronologically precise.', slot: 'EXPERIENCE', species: ['centaur'] },
  { id: 'expanded-centaur-admin-001', text: 'The Centaur registry has approved the accessible-width service counter.', slot: 'ADMINISTRATIVE', species: ['centaur'] },
  { id: 'expanded-centaur-loading-001', text: 'Making room for the Centaur registry folio...', slot: 'LOADING', species: ['centaur'] },

  { id: 'expanded-satyr-maturity-001', text: 'The Satyr lifecycle figures arrived after a lengthy recess and remain mathematically sound.', slot: 'MATURITY', species: ['satyr'] },
  { id: 'expanded-satyr-experience-001', text: 'The Satyr experience ledger includes more festivals than the standard index anticipated.', slot: 'EXPERIENCE', species: ['satyr'] },
  { id: 'expanded-satyr-admin-001', text: 'Refreshments accompanying the Satyr filing have been declared separately from the evidence.', slot: 'ADMINISTRATIVE', species: ['satyr'] },
  { id: 'expanded-satyr-loading-001', text: 'Waiting for the Satyr registrar to conclude the interlude...', slot: 'LOADING', species: ['satyr'] },

  { id: 'expanded-minotaur-maturity-001', text: 'The Minotaur maturity table is straightforward even if the route to its filing cabinet is not.', slot: 'MATURITY', species: ['minotaur'] },
  { id: 'expanded-minotaur-experience-001', text: 'The Minotaur timeline contains several turns but arrives at a defensible total.', slot: 'EXPERIENCE', species: ['minotaur'] },
  { id: 'expanded-minotaur-admin-001', text: 'The Minotaur archive index includes a map, a compass, and an apology.', slot: 'ADMINISTRATIVE', species: ['minotaur'] },
  { id: 'expanded-minotaur-loading-001', text: 'Navigating the Minotaur records annex...', slot: 'LOADING', species: ['minotaur'] },

  { id: 'expanded-merfolk-maturity-001', text: 'The Merfolk lifecycle chart remains legible above and below the official waterline.', slot: 'MATURITY', species: ['merfolk'] },
  { id: 'expanded-merfolk-experience-001', text: 'The Merfolk experience ledger accounts for tides without confusing them with years.', slot: 'EXPERIENCE', species: ['merfolk'] },
  { id: 'expanded-merfolk-admin-001', text: 'A waterproof copy of the Merfolk ruling has been dispatched through aquatic channels.', slot: 'ADMINISTRATIVE', species: ['merfolk'] },
  { id: 'expanded-merfolk-loading-001', text: 'Drying the edges of the Merfolk register...', slot: 'LOADING', species: ['merfolk'] },

  { id: 'expanded-harpy-maturity-001', text: 'The Harpy maturity figures passed review without requiring an aerial perspective.', slot: 'MATURITY', species: ['harpy'] },
  { id: 'expanded-harpy-experience-001', text: 'The Harpy adult timeline has been surveyed from start to present altitude.', slot: 'EXPERIENCE', species: ['harpy'] },
  { id: 'expanded-harpy-admin-001', text: 'The Harpy registry delivered its copy directly to the upper correspondence window.', slot: 'ADMINISTRATIVE', species: ['harpy'] },
  { id: 'expanded-harpy-loading-001', text: 'Checking the upper shelves for the Harpy file...', slot: 'LOADING', species: ['harpy'] },

  { id: 'expanded-dryad-maturity-001', text: 'The Dryad lifecycle chart distinguishes carefully between calendar years and growing seasons.', slot: 'MATURITY', species: ['dryad'] },
  { id: 'expanded-dryad-experience-001', text: 'The Dryad experience record includes firsthand notes from several generations of woodland management.', slot: 'EXPERIENCE', species: ['dryad'] },
  { id: 'expanded-dryad-admin-001', text: 'The Dryad registry has requested recycled paper and a less alarming choice of filing cabinet.', slot: 'ADMINISTRATIVE', species: ['dryad'] },
  { id: 'expanded-dryad-loading-001', text: 'Counting the Dryad record’s documented growing seasons...', slot: 'LOADING', species: ['dryad'] },

  { id: 'expanded-nymph-maturity-001', text: 'The Nymph lifecycle schedule is indexed by both calendar date and local natural feature.', slot: 'MATURITY', species: ['nymph'] },
  { id: 'expanded-nymph-experience-001', text: 'The Nymph experience ledger spans enough seasons to challenge the ordinary archive tabs.', slot: 'EXPERIENCE', species: ['nymph'] },
  { id: 'expanded-nymph-admin-001', text: 'The Nymph registry has redirected all correspondence to the appropriate grove or watercourse.', slot: 'ADMINISTRATIVE', species: ['nymph'] },
  { id: 'expanded-nymph-loading-001', text: 'Cross-referencing the Nymph district register...', slot: 'LOADING', species: ['nymph'] },

  { id: 'expanded-kitsune-maturity-001', text: 'The Kitsune maturity record remains consistent across every declared alias.', slot: 'MATURITY', species: ['kitsune'] },
  { id: 'expanded-kitsune-experience-001', text: 'The Kitsune experience ledger has more names than columns but only one adult-year total.', slot: 'EXPERIENCE', species: ['kitsune'] },
  { id: 'expanded-kitsune-admin-001', text: 'The Kitsune registry confirms that an alias is not a separate applicant.', slot: 'ADMINISTRATIVE', species: ['kitsune'] },
  { id: 'expanded-kitsune-loading-001', text: 'Reconciling the Kitsune alias index...', slot: 'LOADING', species: ['kitsune'] },

  { id: 'expanded-oni-maturity-001', text: 'The Oni maturity declaration bears a seal substantial enough to settle most procedural questions.', slot: 'MATURITY', species: ['oni'] },
  { id: 'expanded-oni-experience-001', text: 'The Oni adult timeline has accumulated considerable authority along with its years.', slot: 'EXPERIENCE', species: ['oni'] },
  { id: 'expanded-oni-admin-001', text: 'The Oni registry’s embossed approval has left a lasting impression on three forms beneath it.', slot: 'ADMINISTRATIVE', species: ['oni'] },
  { id: 'expanded-oni-loading-001', text: 'Lifting the official Oni seal for inspection...', slot: 'LOADING', species: ['oni'] },

  { id: 'expanded-djinn-maturity-001', text: 'The Djinn maturity scale regards several human generations as a comparatively modest interval.', slot: 'MATURITY', species: ['djinn'] },
  { id: 'expanded-djinn-experience-001', text: 'The Djinn experience ledger is organised by century to conserve index cards.', slot: 'EXPERIENCE', species: ['djinn'] },
  { id: 'expanded-djinn-admin-001', text: 'The Djinn registry has waived the usual three-wishes disclosure as irrelevant to chronology.', slot: 'ADMINISTRATIVE', species: ['djinn'] },
  { id: 'expanded-djinn-loading-001', text: 'Unsealing the millennial Djinn register...', slot: 'LOADING', species: ['djinn'] },

  { id: 'expanded-gargoyle-maturity-001', text: 'The Gargoyle maturity chart rewards a patient and structurally sound reading.', slot: 'MATURITY', species: ['gargoyle'] },
  { id: 'expanded-gargoyle-experience-001', text: 'The Gargoyle experience record includes lengthy periods of exceptionally attentive observation.', slot: 'EXPERIENCE', species: ['gargoyle'] },
  { id: 'expanded-gargoyle-admin-001', text: 'The Gargoyle registry copy has been placed where it can supervise the archive.', slot: 'ADMINISTRATIVE', species: ['gargoyle'] },
  { id: 'expanded-gargoyle-loading-001', text: 'Waiting for the Gargoyle registrar to finish observing...', slot: 'LOADING', species: ['gargoyle'] },

  { id: 'expanded-sphinx-maturity-001', text: 'The Sphinx maturity calculation arrived disguised as a question but resolved to ordinary arithmetic.', slot: 'MATURITY', species: ['sphinx'] },
  { id: 'expanded-sphinx-experience-001', text: 'The Sphinx experience ledger contains answers to questions the Bureau has not yet filed.', slot: 'EXPERIENCE', species: ['sphinx'] },
  { id: 'expanded-sphinx-admin-001', text: 'The Sphinx registry will release the certified copy upon receipt of one satisfactory answer.', slot: 'ADMINISTRATIVE', species: ['sphinx'] },
  { id: 'expanded-sphinx-loading-001', text: 'Determining which Sphinx question constitutes the file number...', slot: 'LOADING', species: ['sphinx'] },
] as const satisfies readonly Quip[]
