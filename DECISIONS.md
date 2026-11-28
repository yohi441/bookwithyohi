# Decision log

Running record of choices made in this project — why they were made, and what was rejected. Update this when a decision changes.

---

## 2026-11-27 — Project rename: YohiSlot → BookWithYohi

**Decision:** Rename the project to **BookWithYohi**; repo `yohi441/bookwithyohi`; package `bookwithyohi`.
**Why:** "YohiSlot" is easy to mishear as "Yohi-slut" because of the _slot_ sound. "BookWithYohi" reads naturally, keeps your handle, and says what the app does.
**Rejected:** YohiBook, YohiTime, YohiCalendar (all decent, but less personal and descriptive).
**Note:** The 2026-11-06 entry below is kept as history.

## 2026-11-28 — Timezone handling: date-fns-tz + Vitest

**Decision:** Use `date-fns-tz` (with `date-fns` v4) for wall-clock ↔ UTC conversion in slot generation, and Vitest for the scheduling test suite.
**Why:** `date-fns-tz` delegates DST rules to the platform IANA database via Intl, keeps the slot generator pure, and makes nonexistent local times detectable by round-tripping the formatted wall time. Vitest is the planned test runner and needs no extra config here.
**Guardrail:** Callers pass IANA timezone names; all stored slot times are UTC. Offsets are derived from `formatInTimeZone` at explicit instants and verified by a round-trip, so ambiguous fall-back times resolve identically on developer machines and in UTC-based CI; nonexistent spring-forward times are skipped.
**Rejected:** Luxon (larger API for one conversion), raw Intl alone (the plan calls for a timezone library).

## 2026-11-28 — Booking writes: Server Action + rechecked slots

**Decision:** The public booking form posts to a Server Action using React `useActionState`; the action recomputes the slot set on the server and writes the booking inside a Prisma transaction.
**Why:** It keeps validation and the write together, follows the Next 16 forms pattern, and means a crafted client cannot invent a slot. UTC strings are the only slot data sent to the browser, which formats them for display.
**Guardrail:** Step 39 must add the database uniqueness constraint; the transaction alone cannot prevent simultaneous double bookings.
**Rejected:** A separate REST route handler for this form (extra surface for no MVP benefit).

## 2026-11-06 — Project name: YohiSlot

**Decision:** Name the project **YohiSlot**; repo `yohi441/yohislot`; local folder `~/projects/yohislot`.
**Why:** "Slotwise" is an existing company in the same booking/scheduling space (slotwise.xyz), so using it would look like a clone. "YohiSlot" keeps the root word _slot_, is tied to your handle, and had no existing product or DNS record.
**Rejected:** Slotwise (collision), OpenSlot / Bookend (multiple existing products), Slotly (generic).

## 2026-11-06 — Project shape: one real app, not a tutorial

**Decision:** Build a booking/scheduling SaaS with genuine backend difficulty (timezone slot generation, double-booking prevention) rather than a todo/blog/e-commerce clone.
**Why:** Needs to teach the stack _and_ be a portfolio piece with something substantive to discuss in interviews.

## 2026-11-06 — Backend: Next.js full-stack

**Decision:** Route handlers + server actions in a single Next.js app. No separate API service in MVP.
**Why:** Matches the job listings you're targeting, and avoids the overhead of a second server at 5–8 hrs/week.
**Rejected:** Separate NestJS API, separate Fastify API (both deferred; possible stretch).

## 2026-11-06 — Language: TypeScript, strict

**Decision:** TypeScript with `strict` enabled from day one.
**Why:** TypeScript is the actual hiring filter in the listings; retrofitting strictness later is painful.

## 2026-11-06 — Database: Postgres + Prisma

**Decision:** Neon Postgres with Prisma.
**Why:** Neon's free tier is permanent and serverless-friendly (connection pooling matters with Vercel). Prisma gives the fastest path to a working schema for a learner.
**Rejected:** Drizzle — worth considering if you want to learn raw SQL more deeply, but slower to ship.

## 2026-11-06 — Package manager: npm

**Decision:** Use npm 11, not pnpm.
**Why:** Fewer moving parts at this pace. Corepack is available if pnpm is needed later (e.g., a monorepo).

## 2026-11-06 — Node version: 24

**Decision:** Pin Node 24 in `.nvmrc`.
**Why:** Current LTS; satisfies Next.js requirements. Already installed and working.

## 2026-11-06 — Scheduled jobs: Vercel Cron, not BullMQ

**Decision:** Reminders via Vercel Cron hitting a route that finds due bookings. Idempotency tracked in the DB.
**Why:** Vercel serverless can't host a long-lived worker; Redis + a worker host is a side-quest at this pace.
**Rejected (for MVP):** BullMQ + Redis — moved to stretch backlog.

## 2026-11-06 — Time storage: UTC everywhere

**Decision:** Store all timestamps in UTC; store the host's timezone separately; convert only at the edges.
**Why:** DST bugs are the classic failure mode of scheduling apps. Keeping UTC canonical makes the slot logic testable as pure functions.

## 2026-11-06 — Concurrency: enforce at the database

**Decision:** Unique constraint on (event type, start time) plus a transaction; handle conflict errors in the UI.
**Why:** Application-level checks alone have a race condition. The DB constraint is the source of truth and gives us a strong interview story.

## 2026-11-06 — Budget: $0

**Decision:** Free tiers only. Optional domain (~$10–15/year) at Week 11 if arbitrary recipients need email.
**Why:** No card on file means no accidental charges; free tiers are far above this project's usage.

## 2026-11-06 — Scope control

**Decision:** 60 numbered steps, 7 MVP features, 8 stretch items, and an explicit non-goals list in `SCOPE.md`. A new feature must replace an MVP item or go to Stretch.
**Why:** At 5–8 hrs/week, scope creep is the main risk to finishing.

## 2026-11-24 — Work rhythm: flexible

**Decision:** No fixed weekdays. Work whenever time is available; aim for two sittings of roughly 3–4 hours per week, but don't force a schedule.
**Why:** You prefer flexibility and want to move faster whenever time opens up.
**Guardrail:** Keep the 5–8 hours/week pace in mind. One long session is fine; many scattered 20-minute sessions are not.

---

## Template for future entries

```
## YYYY-MM-DD — Short title

**Decision:** What you chose.
**Why:** The reasoning and constraints at the time.
**Rejected:** Alternatives considered (optional).
```
