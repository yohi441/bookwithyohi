import { formatInTimeZone } from "date-fns-tz";
import { getPrisma } from "./prisma";
import { generateSlots, type DateException, type SlotRange, type WeeklyRule } from "./slots";

type PublicEventType = {
  id: number;
  slug: string;
  name: string;
  description: string;
  durationMinutes: number;
  hostName: string;
};

export type PublicBookingSlot = {
  startUtc: string;
  endUtc: string;
};

export type PublicBookingContext = {
  event: PublicEventType;
  timeZone: string;
  range: SlotRange;
  slots: PublicBookingSlot[];
};

const DAY_MS = 86_400_000;

function shiftDateKey(value: string, days: number): string {
  return new Date(Date.parse(`${value}T00:00:00Z`) + days * DAY_MS).toISOString().slice(0, 10);
}

export async function getEventTypesForUser(userId: number) {
  return getPrisma().eventType.findMany({
    where: { userId },
    orderBy: { id: "asc" },
  });
}

export async function getEventTypeForUser(userId: number, id: number) {
  return getPrisma().eventType.findFirst({ where: { id, userId } });
}

export async function getAvailabilityForUser(userId: number) {
  const prisma = getPrisma();
  const [weekly, exceptions] = await Promise.all([
    prisma.availability.findMany({
      where: { userId },
      orderBy: { dayOfWeek: "asc" },
      select: { dayOfWeek: true, startMinute: true, endMinute: true },
    }),
    prisma.availabilityException.findMany({
      where: { userId },
      orderBy: { date: "asc" },
      select: { date: true, startMinute: true, endMinute: true },
    }),
  ]);

  return {
    weekly,
    exceptions: exceptions.map((row) => ({
      date: row.date.toISOString().slice(0, 10),
      startMinute: row.startMinute,
      endMinute: row.endMinute,
    })),
  };
}

export async function getPublicEventTypeBySlug(slug: string): Promise<PublicEventType | null> {
  const event = await getPrisma().eventType.findUnique({
    where: { slug },
    include: { user: { select: { name: true } } },
  });

  if (!event) return null;

  return {
    id: event.id,
    slug: event.slug,
    name: event.name,
    description: event.description,
    durationMinutes: event.durationMinutes,
    hostName: event.user.name,
  };
}

/**
 * Everything the public booking page needs: event details, the host's
 * timezone, and UTC slots generated from availability minus existing bookings.
 */
export async function getPublicBookingContext(
  slug: string,
  days = 14,
): Promise<PublicBookingContext | null> {
  const prisma = getPrisma();
  const event = await prisma.eventType.findUnique({
    where: { slug },
    include: { user: { select: { name: true, timezone: true } } },
  });

  if (!event) return null;

  const timeZone = event.user.timezone;
  const startDate = formatInTimeZone(new Date(), timeZone, "yyyy-MM-dd");
  const range: SlotRange = {
    startDate,
    endDate: shiftDateKey(startDate, Math.max(1, days) - 1),
  };
  const fromUtc = new Date(Date.parse(`${range.startDate}T00:00:00Z`) - DAY_MS);
  const toUtc = new Date(Date.parse(`${range.endDate}T00:00:00Z`) + 2 * DAY_MS);

  const [weekly, exceptions, bookings] = await Promise.all([
    prisma.availability.findMany({
      where: { userId: event.userId },
      orderBy: { dayOfWeek: "asc" },
      select: { dayOfWeek: true, startMinute: true, endMinute: true },
    }),
    prisma.availabilityException.findMany({
      where: { userId: event.userId },
      orderBy: { date: "asc" },
      select: { date: true, startMinute: true, endMinute: true },
    }),
    prisma.booking.findMany({
      where: { eventTypeId: event.id, startUtc: { gte: fromUtc, lte: toUtc } },
      orderBy: { startUtc: "asc" },
      select: { startUtc: true, endUtc: true },
    }),
  ]);

  const weeklyRules: WeeklyRule[] = weekly;
  const exceptionRules: DateException[] = exceptions.map((row) => ({
    date: row.date.toISOString().slice(0, 10),
    startMinute: row.startMinute,
    endMinute: row.endMinute,
  }));
  const slots = generateSlots({
    weekly: weeklyRules,
    exceptions: exceptionRules,
    durationMinutes: event.durationMinutes,
    timeZone,
    range,
    bookings,
  }).map((slot) => ({
    startUtc: slot.startUtc.toISOString(),
    endUtc: slot.endUtc.toISOString(),
  }));

  return {
    event: {
      id: event.id,
      slug: event.slug,
      name: event.name,
      description: event.description,
      durationMinutes: event.durationMinutes,
      hostName: event.user.name,
    },
    timeZone,
    range,
    slots,
  };
}
