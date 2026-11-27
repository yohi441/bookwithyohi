import { z } from "zod";

export const weeklySlotSchema = z.object({
  dayOfWeek: z.number().int().min(0).max(6),
  enabled: z.boolean(),
  start: z.string(),
  end: z.string(),
});

export const availabilityExceptionSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Choose a valid date."),
  start: z.string(),
  end: z.string(),
});

export const availabilitySchema = z.object({
  weekly: z.array(weeklySlotSchema).length(7),
  exceptions: z.array(availabilityExceptionSchema),
});

export type AvailabilityInput = z.infer<typeof availabilitySchema>;
