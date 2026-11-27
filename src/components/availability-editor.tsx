"use client";

import { useState, useTransition } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { saveAvailability } from "@/app/dashboard/actions";
import { Button } from "@/components/ui/button";
import { availabilitySchema, type AvailabilityInput } from "@/lib/schemas/availability";
import { minutesToTime } from "@/lib/time";

const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

const inputClass =
  "mt-1 w-full rounded-md border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900";

type WeeklyRow = { dayOfWeek: number; startMinute: number; endMinute: number };
type ExceptionRow = { date: string; startMinute: number | null; endMinute: number | null };
type Feedback = { kind: "success" | "error"; text: string };

export function AvailabilityEditor({
  weekly,
  exceptions,
}: {
  weekly: WeeklyRow[];
  exceptions: ExceptionRow[];
}) {
  const [pending, startTransition] = useTransition();
  const [feedback, setFeedback] = useState<Feedback | null>(null);

  const weeklyDefaults = Array.from({ length: 7 }, (_, dayOfWeek) => {
    const row = weekly.find((item) => item.dayOfWeek === dayOfWeek);

    return {
      dayOfWeek,
      enabled: Boolean(row),
      start: row ? minutesToTime(row.startMinute) : "09:00",
      end: row ? minutesToTime(row.endMinute) : "17:00",
    };
  });

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<AvailabilityInput>({
    resolver: zodResolver(availabilitySchema),
    defaultValues: {
      weekly: weeklyDefaults,
      exceptions: exceptions.map((item) => ({
        date: item.date,
        start: item.startMinute === null ? "" : minutesToTime(item.startMinute),
        end: item.endMinute === null ? "" : minutesToTime(item.endMinute),
      })),
    },
  });

  const { fields, append, remove } = useFieldArray({ control, name: "exceptions" });

  const onSubmit = handleSubmit((values) => {
    startTransition(async () => {
      const result = await saveAvailability(values);

      if (result.ok) {
        setFeedback({ kind: "success", text: "Availability saved." });
        reset(values);
      } else {
        setFeedback({ kind: "error", text: result.error });
      }
    });
  });

  return (
    <form
      onSubmit={onSubmit}
      className="mt-6 space-y-6 rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950"
    >
      <div className="space-y-3">
        <h3 className="text-sm font-medium text-black dark:text-zinc-50">Weekly hours</h3>
        {weeklyDefaults.map((slot, index) => (
          <div
            key={slot.dayOfWeek}
            className="grid grid-cols-[1fr_7rem_7rem] items-center gap-3 sm:grid-cols-[10rem_1fr_1fr]"
          >
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" {...register(`weekly.${index}.enabled`)} />
              {DAYS[slot.dayOfWeek]}
            </label>
            <input
              type="number"
              className="hidden"
              {...register(`weekly.${index}.dayOfWeek`, { valueAsNumber: true })}
            />
            <input
              type="time"
              aria-label={`${DAYS[slot.dayOfWeek]} start`}
              className={inputClass}
              {...register(`weekly.${index}.start`)}
            />
            <input
              type="time"
              aria-label={`${DAYS[slot.dayOfWeek]} end`}
              className={inputClass}
              {...register(`weekly.${index}.end`)}
            />
          </div>
        ))}
        {errors.weekly && (
          <p className="text-xs text-red-600">
            {errors.weekly.message ?? "Check the weekly hours."}
          </p>
        )}
      </div>

      <div className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-medium text-black dark:text-zinc-50">Date exceptions</h3>
            <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
              Leave both times blank for a day off.
            </p>
          </div>
          <Button
            type="button"
            variant="outline"
            onClick={() => append({ date: "", start: "", end: "" })}
            className="rounded-full px-4 py-2 text-sm"
          >
            + Add exception
          </Button>
        </div>
        {fields.length === 0 && (
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            No exceptions yet. Use these for holidays or shortened days.
          </p>
        )}
        {fields.map((field, index) => (
          <div key={field.id} className="grid gap-3 sm:grid-cols-[1fr_8rem_8rem_auto]">
            <input
              type="date"
              aria-label={`Exception ${index + 1} date`}
              className={inputClass}
              {...register(`exceptions.${index}.date`)}
            />
            <input
              type="time"
              aria-label={`Exception ${index + 1} start`}
              className={inputClass}
              {...register(`exceptions.${index}.start`)}
            />
            <input
              type="time"
              aria-label={`Exception ${index + 1} end`}
              className={inputClass}
              {...register(`exceptions.${index}.end`)}
            />
            <Button
              type="button"
              variant="ghost"
              onClick={() => remove(index)}
              className="self-center"
            >
              Remove
            </Button>
          </div>
        ))}
        {errors.exceptions && (
          <p className="text-xs text-red-600">
            {errors.exceptions.message ?? "Check the exception dates."}
          </p>
        )}
      </div>

      {feedback && (
        <p
          aria-live="polite"
          className={`text-sm ${feedback.kind === "error" ? "text-red-600" : "text-green-600"}`}
        >
          {feedback.text}
        </p>
      )}

      <Button type="submit" disabled={pending} className="rounded-full px-4 py-2 text-sm">
        {pending ? "Saving..." : "Save availability"}
      </Button>
    </form>
  );
}
