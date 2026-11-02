# CampusFind — Deployment & Validation Checklist

1. Back up any existing Supabase database, Storage and Auth configuration.
2. For a new Supabase project, run `supabase/schema.sql` then `supabase/feature_upgrade.sql`. For an existing matching project, only apply the feature migration after backup.
3. Configure auth email provider, password reset redirect and Vercel site URLs.
4. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY (or PUBLISHABLE_KEY) environment values.
5. Run `npm install`, `npm run typecheck`, `npm run build`.
6. Deploy via GitHub -> Vercel; check production routes and browser console.
7. Verify a student can register/login, reset password, report an item and upload a sample photo.
8. Verify filters, saved reports, related candidates and claim submission.
9. Verify other students cannot read private proof; staff MFA and admin review function correctly.
10. Verify analytics opt-in and opt-out, staff insights, settings, export and health checks.
11. Complete 30 test cases in the supplied execution record with actual results, screenshots and defects.
12. Fill institute, guide and signatures in project documents before submission.

**No success results are presumed.** The source requires independent build and deployment testing.
