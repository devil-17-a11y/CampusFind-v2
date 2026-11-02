# CampusFind — Feature Enhancements

## Scope

This project expands basic lost-and-found reporting into a more interactive discovery, verification and administrative workflow.

### Discovery and usability
- Campus location filters and sorting
- Browser-local bookmarked reports
- Transparent related-report suggestions based on category, location and title
- Improved modular routes, feedback states, mobile navigation and labels

### Administration, privacy and operations
- Separate staff dashboard and navigation
- Consent-based page-view summaries and optional GA4 settings
- Account security, TOTP MFA and administrative action records
- On-demand connectivity checks and JSON export of allowed application data

### Implementation notes
For a fresh Supabase project, use `schema.sql` followed by `feature_upgrade.sql`. For an existing project, back up first and apply only the optional feature migration. Test with representative student and staff accounts. Do not treat a JSON export as a full backup.

### Verification
Source packaging and document generation are complete. Production builds, live database tests and user interviews still require actual execution and recorded evidence.
