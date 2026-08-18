export const APPLICANT_NAME_MAX_LENGTH = 40

export function limitApplicantName(value: string): string {
  return Array.from(value).slice(0, APPLICANT_NAME_MAX_LENGTH).join('')
}

export function normalizeApplicantName(value?: string): string | undefined {
  const trimmed = value?.trim() ?? ''
  return trimmed ? limitApplicantName(trimmed) : undefined
}

export function applicantDisplayName(
  applicant: { label: 'A' | 'B'; name?: string },
): string {
  return applicant.name ?? `Applicant ${applicant.label}`
}
