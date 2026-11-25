export interface EventType {
  id: string;
  name: string;
  slug: string;
  description: string;
  durationMinutes: number;
  hostName: string;
}

// Placeholder data only. Week 3 replaces this with Postgres via Prisma.
const eventTypes: EventType[] = [
  {
    id: "evt_intro",
    name: "Intro chat",
    slug: "intro-chat",
    description: "A quick hello to see if we're a good fit.",
    durationMinutes: 30,
    hostName: "Yohi",
  },
  {
    id: "evt_deep_dive",
    name: "Deep dive",
    slug: "deep-dive",
    description: "An hour to work through a problem together.",
    durationMinutes: 60,
    hostName: "Yohi",
  },
];

export function getEventTypes(): EventType[] {
  return eventTypes;
}

export function getEventTypeBySlug(slug: string): EventType | undefined {
  return eventTypes.find((event) => event.slug === slug);
}
