import type { Quip } from '../../types/quip'

const exceptional = ['EXCEEDS_TYPICAL_LIFESPAN'] as const
const ancient = ['EXCEEDS_TYPICAL_LIFESPAN', 'ANCIENT_BEYOND_TYPICAL_LIFESPAN'] as const
const legendary = [
  'EXCEEDS_TYPICAL_LIFESPAN',
  'ANCIENT_BEYOND_TYPICAL_LIFESPAN',
  'MULTIPLE_TYPICAL_LIFESPANS_OLD',
] as const
const anomalous = [
  'EXCEEDS_TYPICAL_LIFESPAN',
  'ANCIENT_BEYOND_TYPICAL_LIFESPAN',
  'MULTIPLE_TYPICAL_LIFESPANS_OLD',
  'EXTREME_CHRONOLOGICAL_ANOMALY',
] as const

export const longevityQuips = [
  { id: 'longevity-exceptional-maturity-001', text: 'The Bureau notes that ordinary actuarial expectations have been exceeded.', slot: 'MATURITY', flags: exceptional },
  { id: 'longevity-exceptional-maturity-002', text: 'The lifecycle chart continues beyond this point in cautiously pencilled annotations.', slot: 'MATURITY', flags: exceptional },
  { id: 'longevity-exceptional-maturity-003', text: 'Relative maturity remains calculable, though the lifespan table has become less confident.', slot: 'MATURITY', flags: exceptional },
  { id: 'longevity-exceptional-experience-001', text: 'The applicant has outlived the statistical guidance supplied to the clerk.', slot: 'EXPERIENCE', flags: exceptional },
  { id: 'longevity-exceptional-experience-002', text: 'The experience ledger has entered its supplementary pages.', slot: 'EXPERIENCE', flags: exceptional },
  { id: 'longevity-exceptional-experience-003', text: 'The recorded years extend beyond the Bureau actuarial department\'s favourite estimate.', slot: 'EXPERIENCE', flags: exceptional },
  { id: 'longevity-exceptional-admin-001', text: 'A longevity notice has been attached without affecting the ruling.', slot: 'ADMINISTRATIVE', flags: exceptional },
  { id: 'longevity-exceptional-admin-002', text: 'The typical lifespan figure is hereby acknowledged as guidance rather than a deadline.', slot: 'ADMINISTRATIVE', flags: exceptional },
  { id: 'longevity-exceptional-admin-003', text: 'The records office has opened the folder marked statistically uncommon but entirely valid.', slot: 'ADMINISTRATIVE', flags: exceptional },
  { id: 'longevity-exceptional-loading-001', text: 'Requesting the supplementary actuarial pages...', slot: 'LOADING', flags: exceptional },

  { id: 'longevity-ancient-maturity-001', text: 'The applicant has reached an age at which historical records become personally relevant.', slot: 'MATURITY', flags: ancient },
  { id: 'longevity-ancient-maturity-002', text: 'The maturity calculation remains valid well beyond the tidy edge of the chart.', slot: 'MATURITY', flags: ancient },
  { id: 'longevity-ancient-experience-001', text: 'Several clerks initially assumed the date of birth contained a transcription error.', slot: 'EXPERIENCE', flags: ancient },
  { id: 'longevity-ancient-experience-002', text: 'The applicant can provide firsthand context for more than one archival dispute.', slot: 'EXPERIENCE', flags: ancient },
  { id: 'longevity-ancient-experience-003', text: 'The experience record now requires the older catalogue system.', slot: 'EXPERIENCE', flags: ancient },
  { id: 'longevity-ancient-admin-001', text: 'The Bureau has requested additional documentary evidence from the archives.', slot: 'ADMINISTRATIVE', flags: ancient },
  { id: 'longevity-ancient-admin-002', text: 'This file has been cross-referenced with the Department of Long Institutional Memory.', slot: 'ADMINISTRATIVE', flags: ancient },
  { id: 'longevity-ancient-admin-003', text: 'The birth record predates the current filing convention but remains administratively acceptable.', slot: 'ADMINISTRATIVE', flags: ancient },
  { id: 'longevity-ancient-loading-001', text: 'Requesting older census volumes...', slot: 'LOADING', flags: ancient },
  { id: 'longevity-ancient-loading-002', text: 'Locating the archival annex...', slot: 'LOADING', flags: ancient },

  { id: 'longevity-legendary-maturity-001', text: 'The standard lifecycle diagram has been replaced with a longer sheet of paper.', slot: 'MATURITY', flags: legendary },
  { id: 'longevity-legendary-maturity-002', text: 'The applicant remains mathematically classifiable despite exceeding several copies of the scale.', slot: 'MATURITY', flags: legendary },
  { id: 'longevity-legendary-experience-001', text: 'The applicant\'s biography overlaps several distinct historical periods.', slot: 'EXPERIENCE', flags: legendary },
  { id: 'longevity-legendary-experience-002', text: 'More than one calendar reform may be relevant to this date of birth.', slot: 'EXPERIENCE', flags: legendary },
  { id: 'longevity-legendary-experience-003', text: 'The experience ledger is now organised by era rather than page number.', slot: 'EXPERIENCE', flags: legendary },
  { id: 'longevity-legendary-admin-001', text: 'The Bureau has stopped pretending the standard actuarial tables are useful here.', slot: 'ADMINISTRATIVE', flags: legendary },
  { id: 'longevity-legendary-admin-002', text: 'This record has been granted additional shelf space and a reinforced index tab.', slot: 'ADMINISTRATIVE', flags: legendary },
  { id: 'longevity-legendary-admin-003', text: 'Multiple typical lifespans have been accepted into evidence without prejudice.', slot: 'ADMINISTRATIVE', flags: legendary },
  { id: 'longevity-legendary-loading-001', text: 'Checking whether this birth date predates the current calendar...', slot: 'LOADING', flags: legendary },
  { id: 'longevity-legendary-loading-002', text: 'Unrolling the extended chronology forms...', slot: 'LOADING', flags: legendary },

  { id: 'longevity-anomalous-maturity-001', text: 'The calculation remains finite; the actuarial department has nevertheless left the room.', slot: 'MATURITY', flags: anomalous },
  { id: 'longevity-anomalous-maturity-002', text: 'The shared maturity scale has been extended into territory normally reserved for legends.', slot: 'MATURITY', flags: anomalous },
  { id: 'longevity-anomalous-experience-001', text: 'The date of birth predates several systems currently used to record dates.', slot: 'EXPERIENCE', flags: anomalous },
  { id: 'longevity-anomalous-experience-002', text: 'Applicant records have been temporarily cross-filed with Archaeology.', slot: 'EXPERIENCE', flags: anomalous },
  { id: 'longevity-anomalous-experience-003', text: 'The autobiography has been assigned its own historical periodisation committee.', slot: 'EXPERIENCE', flags: anomalous },
  { id: 'longevity-anomalous-admin-001', text: 'The Bureau has referred the age declaration to the Office of Chronological Irregularities.', slot: 'ADMINISTRATIVE', flags: anomalous },
  { id: 'longevity-anomalous-admin-002', text: 'A clerk has requested clarification on temporal displacement, divine intervention, or unusually durable paperwork.', slot: 'ADMINISTRATIVE', flags: anomalous },
  { id: 'longevity-anomalous-admin-003', text: 'The age declaration is valid; the filing system is simply reconsidering its assumptions.', slot: 'ADMINISTRATIVE', flags: anomalous },
  { id: 'longevity-anomalous-loading-001', text: 'Verifying that the age field contains the intended number of digits...', slot: 'LOADING', flags: anomalous },
  { id: 'longevity-anomalous-loading-002', text: 'Contacting the Office of Chronological Irregularities...', slot: 'LOADING', flags: anomalous },

  { id: 'longevity-direction-a-exceptional-001', text: 'Applicant A has continued beyond the confident portion of their species lifecycle table.', slot: 'MATURITY', flags: [...exceptional, 'APPLICANT_A_EXCEEDS_TYPICAL_LIFESPAN'] },
  { id: 'longevity-direction-b-exceptional-001', text: 'Applicant B has continued beyond the confident portion of their species lifecycle table.', slot: 'MATURITY', flags: [...exceptional, 'APPLICANT_B_EXCEEDS_TYPICAL_LIFESPAN'] },
  { id: 'longevity-direction-a-multiple-001', text: 'Applicant A has accumulated more than two typical lifespans of chronological record.', slot: 'EXPERIENCE', flags: [...legendary, 'APPLICANT_A_MULTIPLE_TYPICAL_LIFESPANS_OLD'] },
  { id: 'longevity-direction-b-multiple-001', text: 'Applicant B has accumulated more than two typical lifespans of chronological record.', slot: 'EXPERIENCE', flags: [...legendary, 'APPLICANT_B_MULTIPLE_TYPICAL_LIFESPANS_OLD'] },
  { id: 'longevity-both-exceptional-001', text: 'Both applicants have exceeded the point at which the Bureau\'s actuarial tables remain reassuring.', slot: 'ADMINISTRATIVE', flags: [...exceptional, 'APPLICANT_A_EXCEEDS_TYPICAL_LIFESPAN', 'APPLICANT_B_EXCEEDS_TYPICAL_LIFESPAN'] },
  { id: 'longevity-both-multiple-001', text: 'Both applicant timelines require multiple copies of their respective lifespan charts.', slot: 'ADMINISTRATIVE', flags: [...legendary, 'APPLICANT_A_MULTIPLE_TYPICAL_LIFESPANS_OLD', 'APPLICANT_B_MULTIPLE_TYPICAL_LIFESPANS_OLD'] },
  { id: 'longevity-direction-a-anomalous-001', text: 'Applicant A\'s chronology has been assigned a dedicated archival trolley.', slot: 'ADMINISTRATIVE', flags: [...anomalous, 'APPLICANT_A_EXTREME_CHRONOLOGICAL_ANOMALY'] },
  { id: 'longevity-direction-b-anomalous-001', text: 'Applicant B\'s chronology has been assigned a dedicated archival trolley.', slot: 'ADMINISTRATIVE', flags: [...anomalous, 'APPLICANT_B_EXTREME_CHRONOLOGICAL_ANOMALY'] },
] as const satisfies readonly Quip[]
