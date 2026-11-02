# CampusFind — Campus Lost and Found Portal

**Design Engineering project** | Enrollment no. **221173107008**

CampusFind is a responsive Next.js website for campus lost-and-found reports, search, bookmarks, ownership claims and staff review. The application also includes optional usage insights, privacy settings, account security and administrative tools.

## Current source features

- Student signup, login, logout and password recovery through Supabase Auth
- Lost/found item reports, image uploads, personal dashboard and claim status
- Browse by search term, item category, campus location and sort order
- Browser-local saved items and rule-based possible-related-report suggestions
- Protected ownership claims and administrator approval/rejection
- Admin navigation: claim review, usage insights, privacy settings, security records, JSON export and connectivity checks
- Optional analytics collection only after visitor consent; protected admin MFA

## Stack

Next.js 15, React 19, TypeScript, Tailwind CSS, Supabase Auth, PostgreSQL, Supabase Storage, GitHub and Vercel. Supabase manages the database; XAMPP/MySQL is not used.

## Local setup

1. Install Node.js and run `npm install` in the website source root.
2. Create a Supabase project. For a **new database**, run `supabase/schema.sql` followed by `supabase/feature_upgrade.sql` in Supabase SQL Editor. For an **existing matching database**, back up data and run only `supabase/feature_upgrade.sql` (do not blindly rerun the base schema).
3. Create `.env.local` using `.env.example`, with `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` (or `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`). Never expose service-role or secret keys in public variables.
4. Configure Supabase Authentication provider email and redirect URLs for the eventual Vercel domain. Password-reset emails depend on the email provider / SMTP setup.
5. Run `npm run typecheck`, `npm run build`, and `npm run dev` to open `http://localhost:3000`.
6. For staff features, assign the correct admin role through a controlled database operation, enroll a TOTP authenticator via `/account/security`, then verify the MFA session before visiting `/admin`.

## Deploy to GitHub and Vercel

1. Push **the contents of this Website_Source folder** to the GitHub repository root, not the enclosing submission ZIP.
2. Import the repository into Vercel as a Next.js project.
3. Add the Supabase URL and public key environment variables in Vercel, then deploy.
4. Add the deployed domain to Supabase allowed Auth redirect URLs, verify email recovery and test each module.
5. Complete the test cases in `../Documents/08_Test_Case_Execution_Record` and insert observed results and screenshots into the project report.

## Source layout

- `app/` Next.js routes (home, reporting, search, dashboard, claims, staff and account pages)
- `components/` reusable UI, site shell and consent management
- `contexts/` authentication and browser-local saved-list state
- `hooks/` listing data hook
- `lib/` Supabase client configuration
- `supabase/schema.sql` initial schema
- `supabase/feature_upgrade.sql` incremental settings, analytics and staff-security migration

## Security and limits

A browser-local saved list does not sync between devices. Related reports are heuristic suggestions, not proof of ownership. Optional analytics are not audited traffic data. Administrative JSON export does not back up Supabase Auth users, Storage files or the whole database. Treat claim evidence and exports as sensitive.

**Verification status:** The source has not been independently built or end-to-end tested against the user's live Supabase and Vercel environment. Complete the deployment and test matrix before claiming finished or approved functionality.
