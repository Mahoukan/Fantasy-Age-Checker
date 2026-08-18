# Changelog

## 1.2.0

- Added ten selectable result-card themes and an accessible, session-only theme picker, with Bureau Classic remaining the default.
- Exported cards now include the complete three-part Bureau commentary: the Maturity Compatibility quip, Experience Gap quip, and dedicated Bureau Note.
- Kept theme choice presentation-only and private to the current page: calculations, lifecycle data, case numbers, quip selection, and permalink behaviour are unchanged.

## 1.1.1

- Added optional, 40-character applicant display names to the checker and submitted web rulings.
- Included submitted names in copied/native-share text and locally generated PNG cards, with safe wrapping and XML escaping.
- Kept names session-only and presentation-only: they are excluded from calculations, quip matching, case numbers, storage, and the unchanged four-field permalink format.

## 1.1.0

- Expanded the permanent lifecycle register from 9 to 30 setting-neutral fantasy species, with grouped selectors, matching Species Guide records, and species-aware Bureau commentary.
- Added locally generated 1080x1350 PNG ruling cards that preserve the submitted case number, verdicts, selected quip, custom display names, and relevant longevity notices.
- Added **Save Image** for approved results and capability-gated **Share Image** support when the browser explicitly accepts file shares.
- Added safe XML escaping, measured text wrapping, graceful image-generation failures, and focused coverage for the SVG, PNG, download, and file-sharing pipeline.

## 1.0.0

- Initial public release of the responsive Fantasy Age Checker.
- Includes 30 built-in species, temporary custom species, adulthood safeguards, independent maturity and experience rulings, longevity context, rotating Bureau commentary, and shareable built-in-species permalinks.
- Includes production Docker/nginx packaging for self-hosted deployment.
