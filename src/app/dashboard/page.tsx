import Link from "next/link";
import { getEventTypes } from "@/lib/data";

export const metadata = {
  title: "Dashboard | YohiSlot",
};

export default function DashboardPage() {
  const eventTypes = getEventTypes();

  return (
    <main className="min-h-full bg-zinc-50 px-6 py-16 font-sans dark:bg-black">
      <div className="mx-auto w-full max-w-4xl">
        <Link href="/" className="text-sm text-zinc-500 hover:text-zinc-900 dark:hover:text-white">
          ← Home
        </Link>

        <div className="mt-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight text-black dark:text-zinc-50">
              Your event types
            </h1>
            <p className="mt-2 text-zinc-600 dark:text-zinc-400">
              Placeholder data for now — real data arrives in Week 3.
            </p>
          </div>
          <button
            type="button"
            disabled
            className="cursor-not-allowed rounded-full border border-zinc-200 px-4 py-2 text-sm text-zinc-400 dark:border-zinc-800 dark:text-zinc-600"
          >
            + New event (soon)
          </button>
        </div>

        <ul className="mt-10 grid gap-4 sm:grid-cols-2">
          {eventTypes.map((event) => (
            <li
              key={event.id}
              className="rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950"
            >
              <h2 className="text-xl font-medium text-black dark:text-zinc-50">{event.name}</h2>
              <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">{event.description}</p>
              <div className="mt-6 flex items-center justify-between gap-4">
                <span className="rounded-full bg-zinc-100 px-3 py-1 text-xs text-zinc-600 dark:bg-zinc-900 dark:text-zinc-400">
                  {event.durationMinutes} min
                </span>
                <Link
                  href={`/booking/${event.slug}`}
                  className="text-sm font-medium text-zinc-900 underline underline-offset-4 dark:text-zinc-100"
                >
                  View booking page →
                </Link>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </main>
  );
}
