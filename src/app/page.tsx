import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-1 items-center justify-center bg-zinc-50 px-6 font-sans dark:bg-black">
      <main className="w-full max-w-2xl text-center">
        <Link href="/login" className="text-sm font-medium underline underline-offset-4">
          Log in
        </Link>
        <p className="mb-4 text-sm font-semibold tracking-widest text-zinc-500 uppercase dark:text-zinc-400">
          YohiSlot
        </p>
        <h1 className="text-4xl font-semibold tracking-tight text-balance text-black sm:text-5xl dark:text-zinc-50">
          Booking that fits everyone&apos;s timezone.
        </h1>
        <p className="mx-auto mt-6 max-w-lg text-lg leading-8 text-zinc-600 dark:text-zinc-400">
          Share one link, let guests pick a time, and never double-book again. The app is under
          construction — week by week.
        </p>

        <div className="mt-10 flex flex-wrap items-center justify-center gap-4 text-sm font-medium">
          <Link
            href="/dashboard"
            className="rounded-full bg-zinc-900 px-5 py-2.5 text-white transition-colors hover:bg-zinc-700 dark:bg-white dark:text-black dark:hover:bg-zinc-300"
          >
            Host dashboard →
          </Link>
          <Link
            href="/booking/intro-chat"
            className="rounded-full border border-zinc-300 px-5 py-2.5 text-zinc-900 transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-100 dark:hover:bg-zinc-900"
          >
            Sample booking page →
          </Link>
        </div>
      </main>
    </div>
  );
}
