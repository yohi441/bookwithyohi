import { Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { BookingForm } from "@/components/booking-form";
import { TimezoneDisplay } from "@/components/timezone-display";
import { getPublicBookingContext } from "@/lib/data";

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
  const context = await getPublicBookingContext(slug);

  if (!context) {
    notFound();
  }

  const { event } = context;

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

      <BookingForm slug={slug} slots={context.slots} />
      <TimezoneDisplay />
    </div>
  );
}
