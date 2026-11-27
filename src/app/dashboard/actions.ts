"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/auth-session";
import { getPrisma } from "@/lib/prisma";
import { eventTypeSchema, type EventTypeInput } from "@/lib/schemas/event-type";
import { uniqueSlug } from "@/lib/slug";
import { availabilitySchema, type AvailabilityInput } from "@/lib/schemas/availability";
import { timeToMinutes } from "@/lib/time";

type ActionResult = { ok: true } | { ok: false; error: string };

export async function createEventType(input: EventTypeInput): Promise<ActionResult> {
  const parsed = eventTypeSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "Please check the highlighted fields." };

  const user = await requireUser();
  await getPrisma().eventType.create({
    data: {
      ...parsed.data,
      slug: await uniqueSlug(parsed.data.name),
      userId: Number(user.id),
    },
  });

  revalidatePath("/dashboard");
  return { ok: true };
}

export async function updateEventType(id: number, input: EventTypeInput): Promise<ActionResult> {
  const parsed = eventTypeSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "Please check the highlighted fields." };

  const user = await requireUser();
  const result = await getPrisma().eventType.updateMany({
    where: { id, userId: Number(user.id) },
    data: parsed.data,
  });
  if (result.count === 0) return { ok: false, error: "Event type not found." };

  revalidatePath("/dashboard");
  return { ok: true };
}

export async function deleteEventType(id: number): Promise<ActionResult> {
  const user = await requireUser();
  const result = await getPrisma().eventType.deleteMany({
    where: { id, userId: Number(user.id) },
  });
  if (result.count === 0) return { ok: false, error: "Event type not found." };

  revalidatePath("/dashboard");
  return { ok: true };
}

export async function saveAvailability(input: AvailabilityInput): Promise<ActionResult> {
  const parsed = availabilitySchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "Please check the highlighted fields." };

  const user = await requireUser();
  const userId = Number(user.id);

  await getPrisma().$transaction(async (tx) => {
    await tx.availability.deleteMany({ where: { userId } });
    await tx.availabilityException.deleteMany({ where: { userId } });

    const weeklyRows = parsed.data.weekly
      .filter((slot) => slot.enabled)
      .map((slot) => ({
        userId,
        dayOfWeek: slot.dayOfWeek,
        startMinute: timeToMinutes(slot.start),
        endMinute: timeToMinutes(slot.end),
      }));

    if (weeklyRows.length > 0) {
      await tx.availability.createMany({ data: weeklyRows });
    }

    const exceptionRows = parsed.data.exceptions.map((item) => ({
      userId,
      date: new Date(`${item.date}T00:00:00Z`),
      startMinute: item.start ? timeToMinutes(item.start) : null,
      endMinute: item.end ? timeToMinutes(item.end) : null,
    }));

    if (exceptionRows.length > 0) {
      await tx.availabilityException.createMany({ data: exceptionRows });
    }
  });

  revalidatePath("/dashboard");
  return { ok: true };
}
