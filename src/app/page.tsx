export default function Home() {
  return (
    <div className="flex flex-1 items-center justify-center bg-zinc-50 px-6 font-sans dark:bg-black">
      <main className="w-full max-w-2xl text-center">
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
      </main>
    </div>
  );
}
