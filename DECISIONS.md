# Decision log

Running record of choices made in this project — why they were made, and what was rejected. Update this when a decision changes.

---

## 2026-11-06 — Project name: YohiSlot

**Decision:** Name the project **YohiSlot**; repo `yohi441/yohislot`; local folder `~/projects/yohislot`.
**Why:** "Slotwise" is an existing company in the same booking/scheduling space (slotwise.xyz), so using it would look like a clone. "YohiSlot" keeps the root word *slot*, is tied to your handle, and had no existing product or DNS record.
**Rejected:** Slotwise (collision), OpenSlot / Bookend (multiple existing products), Slotly (generic).

## 2026-11-06 — Project shape: one real app, not a tutorial

**Decision:** Build a booking/scheduling SaaS with genuine backend difficulty (timezone slot generation, double-booking prevention) rather than a todo/blog/e-commerce clone.
**Why:** Needs to teach the stack *and* be a portfolio piece with something substantive to discuss in interviews.

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
