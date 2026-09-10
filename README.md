# Converse Bank - Booking Call (Investment Consultation Scheduling)

Implements BRD-2026-001 / FRD-2026-001 / NFR-2026-001: a public "book a call"
page for the Investment Department plus a separate broker back-office
(admin panel), built with Next.js (App Router), TypeScript, Tailwind CSS
and Prisma (SQLite by default).

## What's here

- **Public booking page** - `/booking-call`
  Day/slot picker (rolling 3-day horizon, Tue/Wed/Thu, 16:00-17:00 Yerevan
  time, 10-min slots + 5-min buffer), a 10-minute atomic slot hold, a
  booking form (name, phone, email, interest area, consent), SMS OTP
  verification, and a confirmation screen with a Booking ID and an .ics
  download. Available in Armenian (default), Russian and English.
- **Admin back-office** - `/admin`
  Username/password sign-in, a bookings list with date/status filters,
  inline status/notes/broker editing, and a settings page for public
  holidays and the current business-rule configuration.
- **Business rules engine** - `src/lib/slots.ts`, `src/lib/config.ts`
  Working-days calendar, lead-time and hold-duration checks, all
  overridable via env vars without a code change.
- **Notifications** - `src/lib/notifications.ts`
  Email/SMS confirmation, .ics invite, Investments@ mailbox notice, 24h
  reminder, cancellation notice - all through a small provider-adapter
  interface (see "Connecting real providers" below).
- **Cron endpoints** - `/api/cron/reminders`, `/api/cron/cleanup`
  For the 24h reminder dispatch and the 1-year retention purge; also
  runnable directly via `npm run cron:reminders` / `npm run cron:cleanup`.

## Getting started

```bash
npm install
cp .env.example .env        # then edit ADMIN_USERNAME / ADMIN_PASSWORD / secrets
npx prisma db push          # creates prisma/dev.db (SQLite)
npm run dev
```

- Public site: http://localhost:3000/booking-call
- Admin panel: http://localhost:3000/admin/login

In development, OTP codes and all outbound "emails"/"SMS" are logged to
the server console instead of actually being sent (see below).

## Connecting real providers

Nothing in this repo talks to a real SMS gateway, SMTP server, or Outlook
calendar yet - those integrations were still "Fill in" / open dependencies
in BRD-2026-001 §9 at the time this was built. Everything is wired through
two small adapters so plugging in the real thing later is a local change,
not a rewrite:

- `src/lib/notifications.ts` - `sendSms` / `sendEmail`. Replace the
  `console` branch with a real HTTP call to the bank's SMS gateway / SMTP
  or Graph API, gated by `SMS_PROVIDER` / `NOTIFICATIONS_PROVIDER`.
- `src/app/api/booking/otp/send/route.ts` - `sendOtpSms`, same idea for
  the OTP code itself.

## Configuration

All business rules live in `.env` (see `.env.example`) - window, slot
length, buffer, horizon, lead time, hold duration, per-contact cap, and
retention. Public holidays / short days are managed from `/admin/settings`
(stored in the `Holiday` table) rather than in env vars, since those change
often, per BR-007.

## Known gaps / things to resolve before a real go-live

This was built end-to-end and manually verified (build, full booking flow,
admin flow, holiday exclusion, double-booking rejection), but a few things
are explicitly out of this repo's scope and called out in the source docs
as open at BRD sign-off:

- **Real SMS/email/Outlook gateways** - see "Connecting real providers".
- **Admin authentication** is a single shared username/password from env
  vars for the MVP. Replace with the bank's real IAM/SSO before launch
  (BRD lists per-broker accountability as a stated concern).
- **Personal-data consent wording and retention** were still pending
  Compliance sign-off in the BRD (§11, §12) - the current consent text is
  a placeholder; replace it with Compliance-approved copy per locale.
- **Dependency security**: `next@14.2.35` is the latest patch on the 14.x
  line, but several Next.js advisories are only fixed in later major
  versions. This app doesn't use the specific features most of those
  advisories target (no `next/image` remote patterns, no custom server,
  no Pages-Router i18n middleware, no Server Actions), but a major-version
  upgrade is worth planning before production go-live.
- **Single instance / in-memory rate limiting** - acceptable per
  NFR-2026-001 §3/§4 given the low, predictable volume; move to a shared
  store if the service is ever scaled horizontally.
- No automated test suite yet - flows were verified manually end-to-end
  (curl + a Playwright smoke pass) during development.
