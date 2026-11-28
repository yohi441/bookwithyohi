"use server";

import { revalidatePath } from "next/cache";
import { getPublicBookingContext } from "@/lib/data";
import { getPrisma } from "@/lib/prisma";
import { bookingSchema, type BookingState } from "@/lib/schemas/booking";

export async function createBooking(
  _previousState: BookingState,
  formData: FormData,
): Promise<BookingState> {
  const parsed = bookingSchema.safeParse({
    slug: formData.get("slug"),
    guestName: formData.get("guestName"),
    guestEmail: formData.get("guestEmail"),
    startUtc: formData.get("startUtc"),
  });

  if (!parsed.success) {
    return { status: "error", message: "Check your name, email, and selected time." };
  }

  const { slug, guestName, guestEmail, startUtc } = parsed.data;
  const context = await getPublicBookingContext(slug);

  if (!context) {
    return { status: "error", message: "This booking link is no longer available." };
  }

  // The browser only suggests a slot; the server recomputes the valid set.
  if (!context.slots.some((slot) => slot.startUtc === startUtc)) {
    return { status: "error", message: "That time is no longer available. Pick another slot." };
  }

  const start = new Date(startUtc);
  const end = new Date(start.getTime() + context.event.durationMinutes * 60_000);

  await getPrisma().$transaction(async (tx) => {
    // Step 39 adds a DB unique constraint on (eventTypeId, startUtc) and
    // handles the conflict error. This transaction alone cannot stop a race.
    await tx.booking.create({
      data: {
        eventTypeId: context.event.id,
        guestName,
        guestEmail,
        startUtc: start,
        endUtc: end,
      },
    });
  });

  revalidatePath(`/booking/${slug}`);
  revalidatePath("/dashboard");

  return { status: "success", message: "Booking confirmed. Details are on the way." };
}
