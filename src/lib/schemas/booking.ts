import { z } from "zod";

export const bookingSchema = z.object({
  slug: z.string().min(1, "Missing booking link."),
  guestName: z
    .string()
    .trim()
    .min(2, "Enter your name.")
    .max(80, "Name must be 80 characters or fewer."),
  guestEmail: z.email("Enter a valid email address."),
  startUtc: z.iso.datetime({ offset: true, message: "Choose a time slot." }),
});

export type BookingInput = z.infer<typeof bookingSchema>;

export type BookingState = {
  status: "idle" | "error" | "success";
  message: string;
};

export const initialBookingState: BookingState = { status: "idle", message: "" };
