# Deploy — EmoCognitrack (off Base44)

Vite + React SPA. Data and auth: Supabase. Hosting: Vercel.

## CODE

- [ ] No `@base44` packages
- [ ] No `base44Client` / `base44.entities` / `base44.auth` / `media.base44`
- [ ] One `src/api/supabaseClient.js`
- [ ] Façade modules: `src/api/entities.js`, `src/api/auth.js`
- [ ] AuthContext shape unchanged for pages (`user`, `isAuthenticated`, `logout`, `checkUserAuth`, …)
- [ ] No file-upload call sites in this app (no Storage bucket required for v1)
- [ ] `supabase/schema.sql` matches the façade
- [ ] `vercel.json` SPA rewrites
- [ ] `.env.example` only; no secrets in git
- [ ] Lockfile does not pin Base44
- [ ] `src/pages/OAuthConsent.jsx` is Base44 MCP leftover and is **not** in the router
- [ ] Language: built-in `src/lib/i18n.jsx` + `STRINGS` only (no GTranslate)

## GITHUB

- [ ] Empty repo, source only, no `node_modules`
- [ ] `main` contains `package.json`, `index.html`, `src/`, `supabase/schema.sql`, `vercel.json`

## SUPABASE

- [ ] Run `supabase/schema.sql` **once** in the SQL Editor
- [ ] Do not replay `CREATE TABLE` blindly; reset the project or use a clean schema if you must re-run
- [ ] Auth URL config: production Vercel URL + `http://localhost:5173`
- [ ] Enable Email + Google (same providers the Base44 app used)
- [ ] OAuth callback: `https://<project>.supabase.co/auth/v1/callback`
- [ ] Confirm email / OTP: enable email confirmations if you want the Register OTP step to work; otherwise sign-up returns a session immediately
- [ ] No Storage bucket needed unless you add uploads later (suggested name: `media`)
- [ ] Realtime is unused by the current UI; enable later only if you add subscriptions
- [ ] Copy Project URL + anon key into Vercel as `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`
- [ ] Service role key never in Vite
- [ ] Confirm `profiles` row appears on first signup (trigger `on_auth_user_created`)
- [ ] Promote at least one clinician:  
  `update public.profiles set role = 'admin' where email = 'you@clinic.example';`
- [ ] Old Base44 rows are **not** imported by schema.sql

## Invite patients

`users.inviteUser` writes `pending_invites`. It does **not** send email (Base44 hosted email is gone).

Options:

1. Share `/register` with the patient (manual).
2. Add a Supabase Edge Function that calls `auth.admin.inviteUserByEmail` with the service role key.

## VERCEL

- [ ] Import GitHub repo
- [ ] Framework: Vite; build: `vite build`; output: `dist`
- [ ] Env: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`
- [ ] Redeploy after adding env (Vite inlines env at build time)
- [ ] Production domain added to Supabase Auth allow-list

## SMOKE TEST

- [ ] Register / login / logout / refresh stays logged in
- [ ] Password reset returns to Vercel `/reset-password`
- [ ] Google OAuth if enabled
- [ ] Patient home + notes + questionnaire runner
- [ ] Clinician: problem types, questionnaires, task library, assign task, patient detail
- [ ] Invite writes a `pending_invites` row
- [ ] Patient A cannot edit patient B
- [ ] Deep links do not 404 (`vercel.json` rewrites)
- [ ] Language switcher (ES/EN/FR/EU) stays in sync with `profiles.language_preference`
