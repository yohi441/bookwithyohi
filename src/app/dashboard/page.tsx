import Link from "next/link";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Suspense } from "react";
import { connection } from "next/server";
import { SignOutButton } from "@/components/sign-out-button";
import { getEventTypesForUser } from "@/lib/data";
import { requireUser } from "@/lib/auth-session";

export const metadata = {
  title: "Dashboard | BookWithYohi",
};

async function EventList({ userId }: { userId: number }) {
  await connection(); // await for a real visitor, not build time
  const eventTypes = await getEventTypesForUser(userId);
  return (
    <div className="mt-10 grid gap-4 sm:grid-cols-2">
      {eventTypes.map((event) => (
        <Card
          key={event.id}
          className="rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950"
        >
          <CardHeader className="text-xl font-medium text-black dark:text-zinc-50">
            <CardTitle>{event.name}</CardTitle>
          </CardHeader>
          <CardContent className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
            {event.description}
          </CardContent>
          <CardFooter className="mt-6 flex items-center justify-between gap-4">
            <span className="rounded-full bg-zinc-100 px-3 py-1 text-xs text-zinc-600 dark:bg-zinc-900 dark:text-zinc-400">
              {event.durationMinutes} min
            </span>
            <Link
              href={`/booking/${event.slug}`}
              className="text-sm font-medium text-zinc-900 underline underline-offset-4 dark:text-zinc-100"
            >
              View booking page →
            </Link>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}

async function DashboardContent() {
  const user = await requireUser();
  return (
    <main className="min-h-full bg-zinc-50 px-6 py-16 font-sans dark:bg-black">
      <div className="mx-auto w-full max-w-4xl">
        <Link href="/" className="text-sm text-zinc-500 hover:text-zinc-900 dark:hover:text-white">
          ← Home
        </Link>
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm dark:border-zinc-800 dark:bg-zinc-950">
          <span className="text-zinc-600 dark:text-zinc-400">
            Signed in as{" "}
            <span className="font-medium text-black dark:text-zinc-50">{user.email}</span>
          </span>
          <SignOutButton />
        </div>

        <div className="mt-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight text-black dark:text-zinc-50">
              Your event types
            </h1>
            <p className="mt-2 text-zinc-600 dark:text-zinc-400">
              Manage the slots people can book with you.
            </p>
          </div>
          <Button
            type="button"
            disabled
            className="cursor-not-allowed rounded-full border border-zinc-200 px-4 py-2 text-sm text-zinc-400 dark:border-zinc-800 dark:text-zinc-600"
          >
            + New event (soon)
          </Button>
        </div>
        <Suspense fallback={<div>Loading event types...</div>}>
          <EventList userId={Number(user.id)} />
        </Suspense>
      </div>
    </main>
  );
}

export default function DashboardPage() {
  return (
    <Suspense
      fallback={<div className="p-10 text-center text-sm text-zinc-500">Loading dashboard...</div>}
    >
      <DashboardContent />
    </Suspense>
  );
}
