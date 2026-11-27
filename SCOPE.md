# BookWithYohi — MVP Scope

**Status:** Draft v1
**Owner:** yohi
**Created:** 2026-11-06
**Project:** booking/scheduling SaaS ("BookWithYohi")

---

## One-liner

A scheduling SaaS where a host publishes event types and availability, and guests book timezone-correct slots through a public link — with double-booking prevented at the database level.

---

## Why this project

Scheduling across timezones is error-prone. Naive implementations allow double bookings and miscalculate slots around daylight-saving transitions. Building this correctly is a genuine backend exercise, not a tutorial CRUD app — and it doubles as a portfolio piece.

---

## Target users

- **Host:** a freelancer or consultant who wants a shareable booking link.
- **Guest:** anyone booking a slot, with no account required.

---

## MVP user stories

1. As a host, I can sign up, log in, and log out.
2. As a host, I can create, edit, and delete event types (name, duration, slug).
3. As a host, I can set weekly availability and date-specific exceptions.
4. As a host, I can copy a public booking link for an event type.
5. As a guest, I can open the public link without logging in.
6. As a guest, I see available slots in my own timezone.
7. As a guest, I can book a slot with my name and email.
8. As a guest, I can cancel a booking through a secure management link.
9. As a guest, I receive a confirmation email after booking.
10. The system prevents two guests from booking the same slot.
11. As a host, I can see my upcoming bookings.

---

## Acceptance criteria (non-negotiable)

- [ ] Slots are computed from the host's timezone and displayed in the guest's timezone.
- [ ] DST transitions produce correct slots — proven by unit tests.
- [ ] Two concurrent bookings for the same slot result in exactly one booking — proven by a concurrency test.
- [ ] Cancelling a booking frees the slot for others.
- [ ] All timestamps are stored in UTC; timezone conversion happens only at the edges.
- [ ] The public booking page works while logged out.
- [ ] The app is deployed at a public URL with CI green.
- [ ] Unit tests cover slot generation; one end-to-end test covers the full booking flow.

---

## Explicit non-goals (MVP)

Do **not** build these now:

- Payments / Stripe
- Teams, organizations, or multi-tenancy
- Google / Outlook calendar sync
- Real-time updates or WebSockets
- A mobile app
- SMS notifications
- Analytics dashboards
- Custom authentication from scratch
- Microservices or a monorepo
- Redis / BullMQ queues
- Internationalization / multi-language
- Drag-and-drop calendar UI

These are tracked as the **Stretch backlog** below, not silently added.

---

## Stretch backlog (only if ahead of schedule)

1. Rescheduling
2. BullMQ + Redis reminders
3. Stripe payments
4. Google Calendar sync
5. A small Go service for slot computation
6. Teams / multi-tenant support

---

## Constraints

- **Solo project**, 5–8 hours/week, 16 weeks with buffers.
- **$0 budget** — free tiers only; optional domain (~$10–15/year) at Week 11.
- **Stack:** Next.js (App Router) full-stack, Postgres (Neon), Prisma, Zod, better-auth, Tailwind + shadcn/ui, Resend, Vercel, Vitest + Playwright, GitHub Actions.
- **Single Next.js app** — no premature splitting.
- **Package manager:** npm.

---

## Definition of done (whole project)

- [ ] Live public URL
- [ ] Public GitHub repo with README and architecture diagram
- [ ] CI green (lint + typecheck + tests)
- [ ] Unit and e2e tests passing
- [ ] 2–3 minute demo video
- [ ] Short write-up on the hardest problem (likely slot generation or double-booking)

---

## Risks and mitigations

| Risk                    | Mitigation                                                                             |
| ----------------------- | -------------------------------------------------------------------------------------- |
| Scope creep             | The non-goals list is binding; a new feature must replace an MVP item or go to Stretch |
| Timezone/DST complexity | Write slot generation as pure functions and test first                                 |
| Concurrency bugs        | Enforce uniqueness at the database level, not in application code                      |
| Free-tier limits        | Project is far below every limit; no card on file                                      |
| Motivation dip          | Ship a demo every 3–4 weeks (weeks 3, 6, 9, 14)                                        |
| Over-engineering        | Single app, one framework, no queues in MVP                                            |

---

## Change control

Any addition to scope must either **replace an existing MVP item** or be moved to the **Stretch backlog**. No silent additions. Update this document when scope changes.
