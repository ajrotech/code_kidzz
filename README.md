# CodeKidzz

A platform teaching kids ages 6-16 real digital skills — **Scratch programming, AI, robotics, and adaptive learning** — built for parents, kids, and schools.

## Features

- Home, Services (course catalog with STEM Camps / Personalized Classes filter), Projects, and a standalone Demo-request page (for schools) pages
- Enrollment form (pre-selects a course via `/enroll?course=<id>`) and a Contact form
- Admin dashboard (sidebar layout) covering:
  - Enrollment verification, with bulk approve/contact actions and CSV export
  - Per-enrollment quote tracking (amount + sent/accepted/declined status)
  - Student progress tracking, course/schedule/resource management
  - School inquiries, staff accounts (Admin/Tutor roles)
  - **Audit log** of every login attempt (success, failure, lockout, account changes)
  - **Password reset** flow (works today via a logged "Outbox"; one config swap from real email)
  - Notifications with a real send action (same pluggable Outbox pattern)
  - Backend connection status indicator
- Salted password hashing (Web Crypto SHA-256), login rate-limiting (no bypass), code-split admin bundle, error boundary, real 404 page
- Unit tests (Vitest) for the core auth/data logic + GitHub Actions CI
- Fully responsive, no external UI framework

## Tech Stack

- React 19, TypeScript, Vite, React Router
- Vitest + Testing Library for tests
- Optional backend: Postgres + Prisma + Vercel serverless functions (bcrypt, JWT-style sessions, Zod validation) in `/api`

## How data storage works

**Out of the box, this site runs entirely client-side** — no database, no environment variables, no setup. All enrollments, contacts, school inquiries, and admin accounts are stored in the browser's `localStorage`. This is genuinely functional and fine for getting started, demos, or a single-admin operation, but it has one real limitation worth understanding: **data doesn't sync across devices or browsers.** If a parent submits the enrollment form on their phone, that submission only exists in their phone's browser storage — you'd need to check from that same browser to see it.

The Settings tab shows a live "Backend Connection" indicator so it's always visible which mode you're running in.

### Upgrading to a real, multi-device backend (optional)

A complete backend already exists in `/api` and `/prisma` — bcrypt password hashing, signed session cookies, Zod-validated endpoints, and a full Postgres schema (`prisma/schema.prisma`). To turn it on:

1. Provision a Postgres database (Neon, Supabase, Vercel Postgres, etc.)
2. Copy `.env.example` to `.env` and fill in `DATABASE_URL` and `JWT_SECRET`
3. Run `npm run db:generate && npm run db:migrate`
4. Replace the `lib/storage.ts` calls in the page components with `fetch()` calls to the matching `/api` routes (`/api/auth/login`, `/api/courses`, `/api/enrollments`, `/api/students`)
5. Note: `SchoolInquiry`, `LoginHistory`-in-app, quote tracking, and the Outbox don't have matching Prisma models/routes yet — add these alongside the migration above if you need them server-side too.

This is a deliberate, incremental step rather than something flipped on silently — connecting real user data to a database is worth doing with your own review.

## Sending real email / WhatsApp

Password resets and Notifications both go through `lib/notify.ts`. Today it logs to the console and saves to a local Outbox — the full UX works with zero setup. To send for real: implement `sendViaProvider()` in that file with a server-side call to Resend, SendGrid, or Twilio (API keys must live in a server route, e.g. `/api/notify`, never in frontend code — there's a sketch of this in the file's comments).

## Real analytics & error monitoring (optional)

- `lib/analytics.ts` — set `VITE_PLAUSIBLE_DOMAIN` or `VITE_GA4_ID` as env vars to activate. Inert until then.
- `lib/monitoring.ts` — set `VITE_SENTRY_DSN` and `npm install @sentry/react` to activate Sentry crash reporting.

These are separate from the dashboard's own "Analytics" tab, which reports on your enrollment/student data, not website traffic.

## Admin Login

Visit `/admin` and create the first Admin account with your own email and password. Admin users can create additional Admin or Tutor accounts from Settings. Failed logins lock out for 10 minutes after 5 attempts (no bypass). Forgot password links to a reset-code flow (see "Sending real email" above for how codes are delivered).

## Before you launch

Update the placeholder values in `data.ts` (`CONTACT` object) with your real email, phone, WhatsApp number, address, and social links — they're all in one place.

## Development

- Install dependencies: `npm install`
- Start development server: `npm run dev`
- Run tests: `npm run test`
- Build for production: `npm run build`
- Preview production build: `npm run preview`

## CI

`.github/workflows/ci.yml` runs tests and a full build on every push/PR to `main`.

## Deployment

Ready for Vercel (`vercel.json` included) or any static host for the frontend. The optional `/api` backend deploys automatically on Vercel once `DATABASE_URL`/`JWT_SECRET` are set as environment variables.
