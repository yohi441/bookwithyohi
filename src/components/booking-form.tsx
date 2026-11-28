"use client";

import { useActionState, useMemo, useState, useSyncExternalStore } from "react";
import { formatInTimeZone } from "date-fns-tz";
import { createBooking } from "@/app/booking/[slug]/actions";
import { Button } from "@/components/ui/button";
import { initialBookingState } from "@/lib/schemas/booking";

type SlotOption = {
  startUtc: string;
  endUtc: string;
};

const inputClass =
  "mt-1 w-full rounded-md border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900";

function subscribe() {
  return () => {};
}

function getTimezone() {
  return Intl.DateTimeFormat().resolvedOptions().timeZone;
}

export function BookingForm({ slug, slots }: { slug: string; slots: SlotOption[] }) {
  const [state, formAction, pending] = useActionState(createBooking, initialBookingState);
  const [selected, setSelected] = useState("");
  const timezone = useSyncExternalStore<string | null>(subscribe, getTimezone, () => null);

  const groupedSlots = useMemo(() => {
    if (!timezone) return [];

    const groups = new Map<string, Array<{ label: string; value: string }>>();

    for (const slot of slots) {
      const start = new Date(slot.startUtc);
      const day = formatInTimeZone(start, timezone, "EEE, MMM d");
      const label = formatInTimeZone(start, timezone, "h:mm a");
      const options = groups.get(day) ?? [];

      options.push({ label, value: slot.startUtc });
      groups.set(day, options);
    }

    return [...groups.entries()];
  }, [slots, timezone]);

  return (
    <form
      action={formAction}
      className="mt-8 space-y-6 border-t border-zinc-200 pt-8 dark:border-zinc-800"
    >
      <input type="hidden" name="slug" value={slug} />
      <input type="hidden" name="startUtc" value={selected} />

      <div>
        <h2 className="text-lg font-medium text-black dark:text-zinc-50">Available times</h2>
        {!timezone ? (
          <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">Detecting your timezone…</p>
        ) : groupedSlots.length === 0 ? (
          <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
            No open slots in the next two weeks.
          </p>
        ) : (
          <div className="mt-4 space-y-5">
            {groupedSlots.map(([day, options]) => (
              <div key={day}>
                <p className="text-sm font-medium text-zinc-700 dark:text-zinc-200">{day}</p>
                <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-3">
                  {options.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setSelected(option.value)}
                      aria-pressed={selected === option.value}
                      className={`rounded-lg border px-3 py-2 text-sm transition-colors ${
                        selected === option.value
                          ? "border-zinc-900 bg-zinc-900 text-white dark:border-zinc-100 dark:bg-zinc-100 dark:text-black"
                          : "border-zinc-200 text-zinc-700 hover:border-zinc-400 dark:border-zinc-800 dark:text-zinc-200 dark:hover:border-zinc-500"
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="space-y-3">
        <label className="block text-sm">
          Your name
          <input name="guestName" required autoComplete="name" className={inputClass} />
        </label>
        <label className="block text-sm">
          Your email
          <input
            name="guestEmail"
            type="email"
            required
            autoComplete="email"
            className={inputClass}
          />
        </label>
      </div>

      {state.status !== "idle" && (
        <p
          aria-live="polite"
          className={`text-sm ${state.status === "error" ? "text-red-600" : "text-green-600"}`}
        >
          {state.message}
        </p>
      )}

      <Button
        type="submit"
        disabled={pending || !selected}
        className="rounded-full px-5 py-2 text-sm"
      >
        {pending ? "Confirming…" : "Confirm booking"}
      </Button>
    </form>
  );
}
