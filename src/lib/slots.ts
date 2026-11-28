/**
 * Pure slot generation. This module has no database, network, or framework
 * dependencies so the scheduling logic can be tested in isolation.
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

type TimeParts = DateParts & {
  hour: number;
  minute: number;
  second: number;
};

type MinuteRange = {
  startMinute: number;
  endMinute: number;
};

const formatters = new Map<string, Intl.DateTimeFormat>();

function getFormatter(timeZone: string): Intl.DateTimeFormat {
  let formatter = formatters.get(timeZone);

  if (!formatter) {
    formatter = new Intl.DateTimeFormat("en-US", {
      timeZone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hourCycle: "h23",
    });
    formatters.set(timeZone, formatter);
  }

  return formatter;
}

function localPartsAt(instant: number, timeZone: string): TimeParts {
  const values = new Map<string, number>();

  for (const part of getFormatter(timeZone).formatToParts(new Date(instant))) {
    if (part.type !== "literal") values.set(part.type, Number(part.value));
  }

  return {
    year: values.get("year") ?? 0,
    month: values.get("month") ?? 0,
    day: values.get("day") ?? 0,
    hour: values.get("hour") ?? 0,
    minute: values.get("minute") ?? 0,
    second: values.get("second") ?? 0,
  };
}

/** Difference between the wall clock in `timeZone` and UTC at an instant. */
function wallOffsetAt(instant: number, timeZone: string): number {
  const local = localPartsAt(instant, timeZone);
  const wallAsUtc = Date.UTC(
    local.year,
    local.month - 1,
    local.day,
    local.hour,
    local.minute,
    local.second,
  );

  return wallAsUtc - instant;
}

function parseDateKey(dateKey: string): DateParts {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dateKey);

  if (!match) throw new RangeError(`Invalid date: ${dateKey}`);

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const parsed = new Date(Date.UTC(year, month - 1, day));

  if (
    parsed.getUTCFullYear() !== year ||
    parsed.getUTCMonth() !== month - 1 ||
    parsed.getUTCDate() !== day
  ) {
    throw new RangeError(`Invalid date: ${dateKey}`);
  }

  return { year, month, day };
}

function dateKey(parts: DateParts): string {
  return `${String(parts.year).padStart(4, "0")}-${String(parts.month).padStart(2, "0")}-${String(
    parts.day,
  ).padStart(2, "0")}`;
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

/**
 * Convert a host-local wall time to a UTC instant. Returns null when the wall
 * time does not exist because of a daylight-saving jump.
 */
function toUtcMillis(parts: DateParts, minute: number, timeZone: string): number | null {
  const wallAsUtc = Date.UTC(parts.year, parts.month - 1, parts.day) + minute * 60_000;
  const expected = new Date(wallAsUtc);
  let candidate = wallAsUtc;

  for (let attempt = 0; attempt < 4; attempt += 1) {
    const next = wallAsUtc - wallOffsetAt(candidate, timeZone);
    if (next === candidate) break;
    candidate = next;
  }

  const actual = localPartsAt(candidate, timeZone);
  if (
    actual.year !== expected.getUTCFullYear() ||
    actual.month !== expected.getUTCMonth() + 1 ||
    actual.day !== expected.getUTCDate() ||
    actual.hour !== expected.getUTCHours() ||
    actual.minute !== expected.getUTCMinutes()
  ) {
    return null;
  }

  return candidate;
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
  const { durationMinutes, timeZone } = input;

  if (!Number.isInteger(durationMinutes) || durationMinutes <= 0) {
    throw new RangeError("durationMinutes must be a positive integer.");
  }

  const firstDay = parseDateKey(input.range.startDate);
  const lastDay = parseDateKey(input.range.endDate);

  if (compareDates(firstDay, lastDay) > 0) {
    throw new RangeError("range.startDate must be on or before range.endDate.");
  }

  const exceptionsByDate = new Map((input.exceptions ?? []).map((item) => [item.date, item]));
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
        if (busy.some((item) => start < item.end && item.start < end)) continue;

        slots.push({ startUtc: new Date(start), endUtc: new Date(end) });
      }
    }
  }

  return slots.sort((left, right) => left.startUtc.getTime() - right.startUtc.getTime());
}
