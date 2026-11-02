# CampusFind - Vercel TypeScript Build Fix

## Error fixed

File: `app/account/security/page.tsx`

Supabase may return `null` for `currentLevel` in `getAuthenticatorAssuranceLevel()`. Previously this nullable value was passed directly to a React string state setter, causing the Vercel `next build` type-check step to fail.

Before:

```tsx
if(level.data)setAal(level.data.currentLevel);
```

After:

```tsx
if(level.data)setAal(level.data.currentLevel ?? 'unknown');
```

The fallback is **not** the privileged `aal2` level; MFA is not bypassed by this change.

## Update an existing GitHub repository

1. Replace the file `app/account/security/page.tsx` in the existing repository with the patched file, or make the one-line change shown above.
2. Commit the change to the `main` branch.
3. Vercel automatically redeploys if Git integration is enabled. If necessary, use Vercel Deployments > Redeploy.
4. Review the new build log. This package was checked structurally, but a full dependency-backed `next build` could not be run here.

## Fresh deployment

Extract `CampusFind_Vercel_TypeScript_Fix.zip` and upload its contents to the **repository root** (not an extra folder). Configure your existing Supabase environment variables as directed in README.md. Do not run the original schema over a populated database.

The `npm warn Unknown env config "cache-dir"` message is a warning, not the cause of the build failure described above.
