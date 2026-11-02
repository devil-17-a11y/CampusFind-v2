# CampusFind – Super Admin setup

## Existing deployed Supabase project

1. Back up the database.
2. Supabase Dashboard > SQL Editor: run `supabase/super_admin_upgrade.sql`. **Do not rerun the original schema.sql on an existing database.**
3. Register or invite the intended account through Supabase Authentication, if it does not exist yet.
4. Edit `supabase/super_admin_assign.sql` to replace both `your-email@example.com` occurrences with the target email. Run in Supabase SQL Editor.
5. Upload the revised website files to GitHub and redeploy in Vercel.
6. Sign out, sign back in and complete authenticator TOTP verification (`/account/security` or `/mfa`).
7. Open `/admin` (all admin functions) and `/admin/users` (Super Admin-only roles).

**Permissions:** `student`: normal site; `admin`: current staff tools, including claim review; `super_admin`: all staff tools plus changing ordinary users between student/admin. Super Admin grants and revocations can only be made in the trusted SQL Editor. Passwords are never changed with this script.

**Security:** Supabase RLS and security-definer RPCs enforce the roles; the frontend visibility is only a convenience. The role-management RPC additionally requires an authenticated Super Admin session with AAL2 (verified TOTP). Never expose `service_role` or other Supabase secret keys in Next.js client environment variables.

**Verification:** Confirm the assigned role with the SELECT query in `super_admin_assign.sql`; the account must already exist. Next.js build/live database tests remain to be completed on the real deployment.
