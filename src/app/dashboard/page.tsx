import Link from "next/link";
import { Suspense } from "react";
import { connection } from "next/server";
import { SignOutButton } from "@/components/sign-out-button";
import { getAvailabilityForUser, getEventTypesForUser } from "@/lib/data";
import { requireUser } from "@/lib/auth-session";
import { EventTypeList } from "@/components/event-type-list";
import { AvailabilityEditor } from "@/components/availability-editor";

export const metadata = {
  title: "Dashboard | BookWithYohi",
};

async function EventList({ userId }: { userId: number }) {
  await connection(); // await for a real visitor, not build time
  const eventTypes = await getEventTypesForUser(userId);
  return (
    <EventTypeList
      eventTypes={eventTypes.map((event) => ({
        id: event.id,
        name: event.name,
        description: event.description,
        durationMinutes: event.durationMinutes,
        slug: event.slug,
      }))}
    />
  );
}

async function AvailabilitySection({ userId }: { userId: number }) {
  await connection();
  const { weekly, exceptions } = await getAvailabilityForUser(userId);
  return <AvailabilityEditor weekly={weekly} exceptions={exceptions} />;
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
        </div>
        <Suspense fallback={<div>Loading event types...</div>}>
          <EventList userId={Number(user.id)} />
        </Suspense>

        <div className="mt-12">
          <h2 className="text-2xl font-semibold tracking-tight text-black dark:text-zinc-50">
            Your weekly availability
          </h2>
          <p className="mt-2 text-zinc-600 dark:text-zinc-400">
            Guests can only book inside these hours. All your event types share them.
          </p>
          <Suspense fallback={<div>Loading availability...</div>}>
            <AvailabilitySection userId={Number(user.id)} />
          </Suspense>
        </div>
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
