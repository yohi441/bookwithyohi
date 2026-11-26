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
