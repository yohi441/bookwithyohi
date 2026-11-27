import { z } from "zod";
import { timeToMinutes } from "../time";

const TIME_PATTERN = /^([01]\d|2[0-3]):[0-5]\d$/;

function isValidTime(value: string) {
  return TIME_PATTERN.test(value);
}

function overlaps(aStart: number, aEnd: number, bStart: number, bEnd: number) {
  return aStart < bEnd && bStart < aEnd;
}

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

export const availabilitySchema = z
  .object({
    weekly: z.array(weeklySlotSchema).length(7),
    exceptions: z.array(availabilityExceptionSchema),
  })
  .superRefine((value, ctx) => {
    const weeklyProblems: string[] = [];
    const rangesByDay = new Map<number, Array<{ start: number; end: number }>>();

    value.weekly.forEach((slot, index) => {
      if (!slot.enabled) return;

      const start = timeToMinutes(slot.start);
      const end = timeToMinutes(slot.end);

      if (!isValidTime(slot.start) || !isValidTime(slot.end)) {
        weeklyProblems.push(`Day ${index + 1}: use a valid HH:MM time.`);
        return;
      }
      if (start >= end) {
        weeklyProblems.push(`Day ${index + 1}: end time must be after start time.`);
        return;
      }

      const ranges = rangesByDay.get(slot.dayOfWeek) ?? [];
      if (ranges.some((range) => overlaps(start, end, range.start, range.end))) {
        weeklyProblems.push(`Day ${index + 1}: overlaps another range on the same day.`);
        return;
      }

      ranges.push({ start, end });
      rangesByDay.set(slot.dayOfWeek, ranges);
    });

    if (weeklyProblems.length > 0) {
      ctx.addIssue({ code: "custom", path: ["weekly"], message: weeklyProblems[0] });
    }

    const exceptionProblems: string[] = [];
    const seenDates = new Set<string>();
    const rangesByDate = new Map<string, Array<{ start: number; end: number }>>();

    value.exceptions.forEach((item, index) => {
      if (seenDates.has(item.date)) {
        exceptionProblems.push(`Exception ${index + 1}: use only one entry per date.`);
        return;
      }
      seenDates.add(item.date);

      const hasStart = item.start !== "";
      const hasEnd = item.end !== "";

      if (hasStart !== hasEnd) {
        exceptionProblems.push(`Exception ${index + 1}: set both times, or leave both blank.`);
        return;
      }
      if (!hasStart) return;

      const start = timeToMinutes(item.start);
      const end = timeToMinutes(item.end);

      if (!isValidTime(item.start) || !isValidTime(item.end)) {
        exceptionProblems.push(`Exception ${index + 1}: use a valid HH:MM time.`);
        return;
      }
      if (start >= end) {
        exceptionProblems.push(`Exception ${index + 1}: end time must be after start time.`);
        return;
      }

      const ranges = rangesByDate.get(item.date) ?? [];
      if (ranges.some((range) => overlaps(start, end, range.start, range.end))) {
        exceptionProblems.push(`Exception ${index + 1}: overlaps another range on that date.`);
        return;
      }

      ranges.push({ start, end });
      rangesByDate.set(item.date, ranges);
    });

    if (exceptionProblems.length > 0) {
      ctx.addIssue({ code: "custom", path: ["exceptions"], message: exceptionProblems[0] });
    }
  });

export type AvailabilityInput = z.infer<typeof availabilitySchema>;
