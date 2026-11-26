import { Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getPublicEventTypeBySlug } from "@/lib/data";
import { connection } from "next/server";
import { Button } from "@/components/ui/button";

export default function BookingPage({ params }: PageProps<"/booking/[slug]">) {
  return (
    <main className="flex min-h-full flex-col items-center bg-zinc-50 px-6 py-16 font-sans dark:bg-black">
      <Suspense fallback={<p className="text-zinc-500">Loading booking page…</p>}>
        <BookingDetails params={params} />
      </Suspense>

      <Link
        href="/dashboard"
        className="mt-8 text-sm text-zinc-500 hover:text-zinc-900 dark:hover:text-white"
      >
        ← Back to dashboard
      </Link>
    </main>
  );
}

async function BookingDetails({ params }: Pick<PageProps<"/booking/[slug]">, "params">) {
  await connection();
  const { slug } = await params;
  const event = await getPublicEventTypeBySlug(slug);

  if (!event) {
    notFound();
  }

  return (
    <div className="w-full max-w-lg rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
      <p className="text-sm text-zinc-500 dark:text-zinc-400">{event.hostName}</p>
      <h1 className="mt-2 text-3xl font-semibold tracking-tight text-black dark:text-zinc-50">
        {event.name}
      </h1>
      <p className="mt-3 text-zinc-600 dark:text-zinc-400">{event.description}</p>
      <p className="mt-4 text-sm text-zinc-500 dark:text-zinc-400">
        {event.durationMinutes} minutes
      </p>

      <div className="mt-8 border-t border-zinc-200 pt-8 dark:border-zinc-800">
        <h2 className="text-lg font-medium text-black dark:text-zinc-50">Available times</h2>
        <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
          Slot picking comes later. These are for layout only.
        </p>
        <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3">
          {["09:00", "10:30", "14:00", "15:30", "17:00", "18:30"].map((time) => (
            <Button
              key={time}
              type="button"
              disabled
              className="cursor-not-allowed rounded-lg border border-zinc-200 px-3 py-2 text-sm text-zinc-400 dark:border-zinc-800 dark:text-zinc-600"
            >
              {time}
            </Button>
          ))}
        </div>
      </div>

      <p className="mt-8 text-xs text-zinc-500 dark:text-zinc-400">
        Times will be shown in your own timezone once the booking engine lands.
      </p>
    </div>
  );
}
