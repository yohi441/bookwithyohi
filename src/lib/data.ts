import { getPrisma } from "./prisma";

type PublicEventType = {
  id: number;
  slug: string;
  name: string;
  description: string;
  durationMinutes: number;
  hostName: string;
};

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
