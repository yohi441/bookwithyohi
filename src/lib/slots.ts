import { formatInTimeZone, fromZonedTime } from "date-fns-tz";

/**
 * Pure slot generation. This module has no database, network, or framework
 * dependencies so the scheduling logic can be tested in isolation.
 *
 * Wall-clock availability is interpreted in the host's IANA timezone; every
 * slot returned here is a UTC instant. Conversions use `date-fns-tz` (which
 * reads the IANA DST database via Intl), and local times that do not exist
 * because of a daylight-saving jump are skipped.
 */

export type WeeklyRule = {
  dayOfWeek: number;
  startMinute: number;
  endMinute: number;
};

export type DateException = {
  /** Host-local date in YYYY-MM-DD format. */
  date: string;
  /** Both null means the entire day is closed. */
  startMinute: number | null;
  endMinute: number | null;
};

export type BusyInterval = {
  startUtc: Date | string;
  endUtc: Date | string;
};

export type SlotRange = {
  /** Inclusive host-local dates in YYYY-MM-DD format. */
  startDate: string;
  endDate: string;
};

export type GenerateSlotsInput = {
  weekly: readonly WeeklyRule[];
  exceptions?: readonly DateException[];
  durationMinutes: number;
  /** IANA timezone name, e.g. "Asia/Manila". */
  timeZone: string;
  range: SlotRange;
  bookings?: readonly BusyInterval[];
  /** Required separation around existing bookings. Defaults to 0. */
  bufferMinutes?: number;
};

export type Slot = {
  startUtc: Date;
  endUtc: Date;
};

type DateParts = {
  year: number;
  month: number;
  day: number;
};

type MinuteRange = {
  startMinute: number;
  endMinute: number;
};

function pad(value: number, width = 2): string {
  return String(value).padStart(width, "0");
}

function parseDateKey(value: string): DateParts {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);

  if (!match) throw new RangeError(`Invalid date: ${value}`);

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const parsed = new Date(Date.UTC(year, month - 1, day));

  if (
    parsed.getUTCFullYear() !== year ||
    parsed.getUTCMonth() !== month - 1 ||
    parsed.getUTCDate() !== day
  ) {
    throw new RangeError(`Invalid date: ${value}`);
  }

  return { year, month, day };
}

function dateKey(parts: DateParts): string {
  return `${pad(parts.year, 4)}-${pad(parts.month)}-${pad(parts.day)}`;
}

function addDays(parts: DateParts, days: number): DateParts {
  const date = new Date(Date.UTC(parts.year, parts.month - 1, parts.day + days));

  return {
    year: date.getUTCFullYear(),
    month: date.getUTCMonth() + 1,
    day: date.getUTCDate(),
  };
}

function compareDates(left: DateParts, right: DateParts): number {
  return (
    Date.UTC(left.year, left.month - 1, left.day) - Date.UTC(right.year, right.month - 1, right.day)
  );
}

/** Builds a timezone-free wall time from a host-local date and minute offset. */
function wallTime(parts: DateParts, minute: number): string {
  const wall = new Date(Date.UTC(parts.year, parts.month - 1, parts.day) + minute * 60_000);

  return `${pad(wall.getUTCFullYear(), 4)}-${pad(wall.getUTCMonth() + 1)}-${pad(
    wall.getUTCDate(),
  )}T${pad(wall.getUTCHours())}:${pad(wall.getUTCMinutes())}:00`;
}

/**
 * Convert a host-local wall time to a UTC instant. Returns null when the wall
 * time does not exist because of a daylight-saving jump. Repeated wall times
 * (fall-back) resolve to the library's single deterministic instant.
 */
function toUtcMillis(parts: DateParts, minute: number, timeZone: string): number | null {
  const local = wallTime(parts, minute);
  const candidate = fromZonedTime(local, timeZone);
  const roundTrip = formatInTimeZone(candidate, timeZone, "yyyy-MM-dd'T'HH:mm:ss");

  if (roundTrip !== local) return null;

  return candidate.getTime();
}

function rangesForDate(
  parts: DateParts,
  weekly: readonly WeeklyRule[],
  exceptionsByDate: ReadonlyMap<string, DateException>,
): MinuteRange[] {
  const exception = exceptionsByDate.get(dateKey(parts));

  if (exception) {
    if (exception.startMinute === null || exception.endMinute === null) return [];
    return [{ startMinute: exception.startMinute, endMinute: exception.endMinute }];
  }

  const weekday = new Date(Date.UTC(parts.year, parts.month - 1, parts.day)).getUTCDay();

  return weekly
    .filter((rule) => rule.dayOfWeek === weekday)
    .map((rule) => ({ startMinute: rule.startMinute, endMinute: rule.endMinute }));
}

function toMillis(value: Date | string): number {
  const millis = value instanceof Date ? value.getTime() : Date.parse(value);

  if (Number.isNaN(millis)) throw new RangeError(`Invalid timestamp: ${String(value)}`);

  return millis;
}

export function generateSlots(input: GenerateSlotsInput): Slot[] {
  const { durationMinutes, timeZone, bufferMinutes = 0 } = input;

  if (!Number.isInteger(durationMinutes) || durationMinutes <= 0) {
    throw new RangeError("durationMinutes must be a positive integer.");
  }
  if (!Number.isInteger(bufferMinutes) || bufferMinutes < 0) {
    throw new RangeError("bufferMinutes must be a non-negative integer.");
  }

  const firstDay = parseDateKey(input.range.startDate);
  const lastDay = parseDateKey(input.range.endDate);

  if (compareDates(firstDay, lastDay) > 0) {
    throw new RangeError("range.startDate must be on or before range.endDate.");
  }

  const exceptionsByDate = new Map((input.exceptions ?? []).map((item) => [item.date, item]));
  const bufferMs = bufferMinutes * 60_000;
  const busy = (input.bookings ?? []).map((booking) => ({
    start: toMillis(booking.startUtc),
    end: toMillis(booking.endUtc),
  }));
  const slots: Slot[] = [];

  for (let day = firstDay; compareDates(day, lastDay) <= 0; day = addDays(day, 1)) {
    for (const window of rangesForDate(day, input.weekly, exceptionsByDate)) {
      for (
        let minute = window.startMinute;
        minute + durationMinutes <= window.endMinute;
        minute += durationMinutes
      ) {
        const start = toUtcMillis(day, minute, timeZone);

        if (start === null) continue;

        const end = start + durationMinutes * 60_000;
        if (busy.some((item) => start < item.end + bufferMs && item.start - bufferMs < end)) {
          continue;
        }

        slots.push({ startUtc: new Date(start), endUtc: new Date(end) });
      }
    }
  }

  return slots.sort((left, right) => left.startUtc.getTime() - right.startUtc.getTime());
}
