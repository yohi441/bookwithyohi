"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { z } from "zod";
import { createEventType, deleteEventType, updateEventType } from "@/app/dashboard/actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { eventTypeSchema, type EventTypeInput } from "@/lib/schemas/event-type";

type EventTypeItem = {
  id: number;
  name: string;
  description: string;
  durationMinutes: number;
  slug: string;
};

type Feedback = { kind: "success" | "error"; text: string };
type FormValues = z.input<typeof eventTypeSchema>;
type FormOutput = z.output<typeof eventTypeSchema>;

function EventTypeForm({
  eventType,
  onSaved,
  onCancel,
}: {
  eventType?: EventTypeItem;
  onSaved?: () => void;
  onCancel?: () => void;
}) {
  const [pending, startTransition] = useTransition();
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues, unknown, FormOutput>({
    resolver: zodResolver(eventTypeSchema),
    defaultValues: eventType ?? { name: "", description: "", durationMinutes: 30 },
  });

  const onSubmit = handleSubmit((values) => {
    startTransition(async () => {
      const result: EventTypeInput = values;
      const actionResult = eventType
        ? await updateEventType(eventType.id, result)
        : await createEventType(result);
      if (actionResult.ok) {
        setFeedback({
          kind: "success",
          text: eventType ? "Event type updated." : "Event type created.",
        });
        if (!eventType) reset();
        onSaved?.();
      } else {
        setFeedback({ kind: "error", text: actionResult.error });
      }
    });
  });

  const suffix = eventType?.id ?? "new";

  return (
    <form
      onSubmit={onSubmit}
      className="mt-6 space-y-4 rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-950"
    >
      <div>
        <label htmlFor={`name-${suffix}`} className="block text-sm font-medium">
          Name
        </label>
        <input
          id={`name-${suffix}`}
          {...register("name")}
          className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
        />
        {errors.name && <p className="mt-1 text-xs text-red-600">{errors.name.message}</p>}
      </div>
      <div>
        <label htmlFor={`description-${suffix}`} className="block text-sm font-medium">
          Description
        </label>
        <textarea
          id={`description-${suffix}`}
          rows={3}
          {...register("description")}
          className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
        />
        {errors.description && (
          <p className="mt-1 text-xs text-red-600">{errors.description.message}</p>
        )}
      </div>
      <div>
        <label htmlFor={`duration-${suffix}`} className="block text-sm font-medium">
          Duration (minutes)
        </label>
        <input
          id={`duration-${suffix}`}
          type="number"
          {...register("durationMinutes", { valueAsNumber: true })}
          className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
        />
        {errors.durationMinutes && (
          <p className="mt-1 text-xs text-red-600">{errors.durationMinutes.message}</p>
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
      <div className="flex gap-3">
        <Button type="submit" disabled={pending} className="rounded-full px-4 py-2 text-sm">
          {pending ? "Saving..." : eventType ? "Save changes" : "Create event type"}
        </Button>
        {onCancel && (
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={pending}
            className="rounded-full px-4 py-2 text-sm"
          >
            Cancel
          </Button>
        )}
      </div>
    </form>
  );
}

function EventCard({ eventType }: { eventType: EventTypeItem }) {
  const [editing, setEditing] = useState(false);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function onDelete() {
    if (!window.confirm(`Delete "${eventType.name}"?`)) return;
    startTransition(async () => {
      const result = await deleteEventType(eventType.id);
      if (!result.ok) setError(result.error);
    });
  }

  return (
    <Card className="rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950">
      <CardHeader className="text-xl font-medium text-black dark:text-zinc-50">
        <CardTitle>{eventType.name}</CardTitle>
      </CardHeader>
      <CardContent className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
        {eventType.description}
      </CardContent>
      <CardFooter className="mt-6 flex flex-wrap items-center justify-between gap-4">
        <span className="rounded-full bg-zinc-100 px-3 py-1 text-xs text-zinc-600 dark:bg-zinc-900 dark:text-zinc-400">
          {eventType.durationMinutes} min
        </span>
        <div className="flex flex-wrap gap-3 text-sm font-medium">
          <Link
            href={`/booking/${eventType.slug}`}
            className="text-zinc-900 underline underline-offset-4 dark:text-zinc-100"
          >
            View booking page →
          </Link>
          <button type="button" onClick={() => setEditing((value) => !value)}>
            Edit
          </button>
          <button type="button" onClick={onDelete} disabled={pending}>
            {pending ? "Deleting..." : "Delete"}
          </button>
        </div>
      </CardFooter>
      {error && <p className="mt-2 text-xs text-red-600">{error}</p>}
      {editing && (
        <div className="px-6 pb-6">
          <EventTypeForm
            eventType={eventType}
            onSaved={() => setEditing(false)}
            onCancel={() => setEditing(false)}
          />
        </div>
      )}
    </Card>
  );
}

export function EventTypeList({ eventTypes }: { eventTypes: EventTypeItem[] }) {
  const [creating, setCreating] = useState(false);

  return (
    <>
      <div className="mt-6 flex justify-end">
        <Button
          type="button"
          onClick={() => setCreating(true)}
          className="rounded-full px-4 py-2 text-sm"
        >
          + New event
        </Button>
      </div>
      {creating && (
        <EventTypeForm onSaved={() => setCreating(false)} onCancel={() => setCreating(false)} />
      )}
      <div className="mt-10 grid gap-4 sm:grid-cols-2">
        {eventTypes.map((eventType) => (
          <EventCard key={eventType.id} eventType={eventType} />
        ))}
      </div>
    </>
  );
}
