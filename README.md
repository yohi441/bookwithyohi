# YohiSlot

A booking/scheduling SaaS: hosts publish event types and availability, guests book timezone-correct slots through a public link.

**Status:** Phase 0 → 1 (setup and foundations). See [SCOPE.md](SCOPE.md) for the MVP scope, acceptance criteria, and non-goals.

---

## About

This is a learning project for the Node.js / TypeScript / React / Next.js stack. The goal is one substantial, deployable app rather than a collection of tutorials. The hard parts are deliberate: timezone-correct slot generation and double-booking prevention.

## Features (MVP)

- Host auth (sign up, log in, protected dashboard)
- Event types CRUD with public booking links
- Weekly availability and date exceptions
- Public booking page with guest timezone display
- Double-booking prevention (transaction + DB constraint)
- Confirmation email
- Deployed URL with unit and e2e tests

## Stack

| Layer      | Choice                                 |
| ---------- | -------------------------------------- |
| Language   | TypeScript (strict)                    |
| Framework  | Next.js (App Router), React            |
| Backend    | Next route handlers + server actions   |
| Database   | Postgres (Neon) + Prisma               |
| Validation | Zod                                    |
| Auth       | better-auth                            |
| UI         | Tailwind + shadcn/ui + react-hook-form |
| Email      | Resend                                 |
| Jobs       | Vercel Cron                            |
| Tests      | Vitest + Playwright                    |
| Hosting    | Vercel                                 |
| CI         | GitHub Actions                         |
| Monitoring | Sentry                                 |

## Getting started

### Prerequisites

- Node.js **24** (see `.nvmrc`; use `nvm use`)
- npm 11
- A Postgres database (Neon free tier works)
- A Resend API key for email (Week 11)

### Setup

```bash
nvm use
npm install
cp .env.example .env.local   # create this in Week 1
npm run dev
```

Open <http://localhost:3000>.

### Environment variables

To be added as features land:

| Variable                 | Purpose                    | Phase   |
| ------------------------ | -------------------------- | ------- |
| `DATABASE_URL`           | Postgres connection string | Week 3  |
| `BETTER_AUTH_SECRET`     | Auth signing secret        | Week 4  |
| `RESEND_API_KEY`         | Transactional email        | Week 11 |
| `NEXT_PUBLIC_SENTRY_DSN` | Error monitoring           | Week 15 |
| `SENTRY_AUTH_TOKEN`      | Source map upload (secret) | Week 15 |

## Project structure

```
src/
  app/          # App Router pages and route handlers
  components/   # UI components
  lib/          # Shared utilities, validation schemas, DB client
prisma/         # Schema and migrations (Week 3)
tests/          # Unit and e2e tests (Week 8+)
```

## Roadmap

The full 16-week plan lives in the project plan file. `SCOPE.md` is the source of truth for what is in and out of MVP scope.

## License

TBD — add once the project is public and ready to share.
