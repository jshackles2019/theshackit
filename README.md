# The Shack - IT Solutions

MVP website and business portal for **The Shack - IT Solutions** built with Next.js, TypeScript, App Router, Tailwind CSS, Supabase, and Vercel.

## Stack
- Next.js 16 + App Router
- TypeScript
- Tailwind CSS
- Supabase Auth, Postgres, Storage, RLS
- Resend for email notifications
- Calendly for consultation booking

## Local setup
1. Install dependencies:
   ```bash
   npm install
   ```
2. Copy `.env.example` to `.env.local`.
3. Fill in the Supabase, Resend, and Calendly values.
4. Run the app:
   ```bash
   npm run dev
   ```

## Required accounts and secrets
You will need to provide these manually:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` (or `NEXT_PUBLIC_SUPABASE_ANON_KEY` for older setups)
- `RESEND_API_KEY`
- `RESEND_FROM_EMAIL`
- `NEXT_PUBLIC_CALENDLY_BOOKING_URL`
- `NEXT_PUBLIC_SITE_URL` for production links

## Supabase setup
1. Create a Supabase project.
2. Run the migration in `supabase/migrations/20260801170000_initial.sql`.
3. Optionally load `supabase/seed.sql` for preview data.
4. Enable email auth and confirm your redirect URLs in Supabase Auth.

## Deployment to Vercel
1. Import the GitHub repo into Vercel.
2. Add the production environment variables above.
3. Deploy the project.
4. Confirm the Supabase auth redirect URLs use your Vercel domain.

## GoDaddy DNS notes
Point the domain to Vercel:
- `A` record for apex: `76.76.21.21`
- `CNAME` for `www`: `cname.vercel-dns.com`

Then add `theshackit.com` and `www.theshackit.com` in Vercel and let it manage the SSL cert.

## Architecture summary
- Public marketing pages live at `/`, `/services`, `/about`, `/book`, and `/contact`.
- Auth pages live under `/auth/*`.
- Dashboard routes split into admin and client surfaces under `/dashboard/*`.
- Supabase RLS is used to separate public, user, client, and admin access.
- Internal cost and markup are stored in Postgres and only shown in admin surfaces.

## Known limitations
- The client estimate builder is MVP-level, not a full quoting system.
- Calendar automation is scaffolded around Calendly, but deeper sync will need account/API setup.
- Payments, invoicing, inventory, and analytics are intentionally out of scope.
- Public pages currently use seeded content and can later be wired to `site_settings`.

## Phase 2 recommendations
- Add fully dynamic estimate line-item editing.
- Add a stronger CRM pipeline with tasks, reminders, and assignments.
- Add invoice generation and payment collection.
- Add richer website customization backed by `site_settings`.
- Add Calendly webhooks or calendar sync when the account is ready.
