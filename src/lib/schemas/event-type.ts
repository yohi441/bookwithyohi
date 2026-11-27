import { z } from "zod";

export const eventTypeSchema = z.object({
  name: z
    .string()
    .trim()
    .min(3, "Name must be at least 3 characters.")
    .max(80, "Name must be 80 characters or fewer."),
  description: z
    .string()
    .trim()
    .min(10, "Description must be at least 10 characters.")
    .max(500, "Description must be 500 characters or fewer."),
  durationMinutes: z.coerce
    .number()
    .int("Duration must be a whole number.")
    .min(15, "Minimum duration is 15 minutes.")
    .max(480, "Maximum duration is 8 hours."),
});

export type EventTypeInput = z.infer<typeof eventTypeSchema>;
