import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error("DATABASE_URL is not set in .env");
}

const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

async function main() {
  // One test host. upsert = "create if missing, otherwise leave it alone".
  const user = await prisma.user.upsert({
    where: { email: "test@example.com" },
    update: {},
    create: {
      email: "test@example.com",
      name: "Test Host",
      timezone: "Asia/Manila",
    },
  });

  const eventTypes = [
    {
      slug: "intro-chat",
      name: "Intro Chat",
      description: "A quick 30-minute introduction call.",
      durationMinutes: 30,
    },
    {
      slug: "deep-dive",
      name: "Deep Dive",
      description: "A longer 60-minute working session.",
      durationMinutes: 60,
    },
  ];

  for (const eventType of eventTypes) {
    await prisma.eventType.upsert({
      where: { slug: eventType.slug },
      update: {},
      create: {
        ...eventType,
        userId: user.id,
      },
    });
  }

  console.log(`Seeded ${user.email} with ${eventTypes.length} event types.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
